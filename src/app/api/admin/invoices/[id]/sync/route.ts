import "server-only"
import { Prisma } from "@prisma/client"
import { adminInvoiceSyncSchema } from "@/lib/validators/admin"
import { requireAdmin } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { getTransactionDetail } from "@/server/payment/tripay"
import { activateOrExtendSubscription, invalidateSubscriptionCache } from "@/server/subscription/subscription-service"
import { invalidatePublicInvitationsForUser } from "@/server/invitation/cache"
import { handleApiError, jsonError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface Params {
  params: Promise<{ id: string }>
}

const TRIPAY_TO_INVOICE_STATUS = {
  PAID: "PAID",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
  REFUND: "REFUND",
  UNPAID: "PENDING",
} as const

/**
 * Pull latest status from Tripay for a given invoice and reconcile locally.
 *
 * Used by admin when a callback was missed or the invoice looks stuck. Same
 * idempotency rules as the webhook handler: re-reads invoice in transaction.
 */
export async function POST(_req: Request, ctx: Params): Promise<Response> {
  try {
    const session = await requireAdmin()
    const { id } = await ctx.params
    const parsed = adminInvoiceSyncSchema.parse({ invoiceId: id })

    const invoice = await prisma.invoice.findUnique({
      where: { id: parsed.invoiceId },
      include: { plan: true },
    })
    if (!invoice) return jsonError(404, { code: "NOT_FOUND", message: "Invoice tidak ditemukan" })
    if (!invoice.tripayReference) {
      return jsonError(400, {
        code: "NO_TRIPAY_REFERENCE",
        message: "Invoice belum punya referensi Tripay",
      })
    }

    const tripay = await getTransactionDetail(invoice.tripayReference)
    const newStatus =
      TRIPAY_TO_INVOICE_STATUS[
        tripay.status.toUpperCase() as keyof typeof TRIPAY_TO_INVOICE_STATUS
      ] ?? null
    if (!newStatus || newStatus === invoice.status) {
      return jsonOk({
        invoice: { id: invoice.id, status: invoice.status, tripayStatus: tripay.status },
      })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const fresh = await tx.invoice.findUnique({
        where: { id: invoice.id },
        include: { plan: true },
      })
      if (!fresh) return null

      const now = new Date()
      if (newStatus === "PAID" && fresh.status !== "PAID") {
        const paidAt = tripay.paid_at ? new Date(tripay.paid_at * 1000) : now
        const u = await tx.invoice.update({
          where: { id: fresh.id },
          data: {
            status: "PAID",
            paidAt,
            processedAt: now,
            tripayCallbackPayload: tripay as unknown as Prisma.JsonObject,
          },
        })
        await activateOrExtendSubscription(tx, {
          userId: fresh.userId,
          plan: fresh.plan,
          paymentTime: paidAt,
        })
        await tx.auditLog.create({
          data: {
            adminId: session.user.id,
            userId: fresh.userId,
            action: "invoice.sync_paid",
            entityType: "Invoice",
            entityId: fresh.id,
            metadata: { reference: fresh.tripayReference } as Prisma.JsonObject,
          },
        })
        return u
      }
      return tx.invoice.update({
        where: { id: fresh.id },
        data: { status: newStatus, processedAt: now },
      })
    })

    if (updated && updated.status === "PAID") {
      await invalidateSubscriptionCache(updated.userId)
      await invalidatePublicInvitationsForUser(updated.userId)
    }

    return jsonOk({
      invoice: { id: updated?.id ?? invoice.id, status: updated?.status ?? invoice.status },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
