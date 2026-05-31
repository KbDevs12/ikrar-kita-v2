import "server-only"
import type { Prisma } from "@prisma/client"
import { adminManualApproveSchema } from "@/lib/validators/admin"
import { requireAdmin } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { activateOrExtendSubscription, invalidateSubscriptionCache } from "@/server/subscription/subscription-service"
import { invalidatePublicInvitationsForUser } from "@/server/invitation/cache"
import {
  sendInvoicePaidEmailToAdmin,
  sendInvoicePaidEmailToUser,
} from "@/server/email/email-service"
import { handleApiError, jsonError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface Params {
  params: Promise<{ id: string }>
}

/**
 * Admin-only fallback that marks an invoice as PAID without a Tripay callback.
 * Used for manual bank transfers, debugging stuck transactions, or recovery
 * when a callback is missed permanently.
 *
 * Always writes an AuditLog entry tagged `invoice.manual_approve` and
 * stamps the invoice with `approvedByAdminId` + `manualApprovalNote` so the
 * row is visibly different from a normal Tripay PAID.
 */
export async function POST(req: Request, ctx: Params): Promise<Response> {
  try {
    const session = await requireAdmin()
    const { id } = await ctx.params

    const body = await req.json().catch(() => null)
    if (!body) return jsonError(400, { code: "BAD_REQUEST", message: "Body tidak valid" })
    const parsed = adminManualApproveSchema.parse({ ...body, invoiceId: id })

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: parsed.invoiceId },
        include: { plan: true, user: true },
      })
      if (!invoice) return { kind: "NOT_FOUND" as const }
      if (invoice.status === "PAID") return { kind: "ALREADY_PAID" as const, invoice }
      if (invoice.status === "CANCELLED" || invoice.status === "REFUND") {
        return { kind: "BAD_STATE" as const, invoice }
      }

      const now = new Date()
      const updated = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "PAID",
          paidAt: now,
          processedAt: now,
          approvedAt: now,
          approvedByAdminId: session.user.id,
          manualApprovalNote: parsed.note,
          paymentProvider: "MANUAL",
        },
      })
      await activateOrExtendSubscription(tx, {
        userId: invoice.userId,
        plan: invoice.plan,
        paymentTime: now,
      })
      await tx.auditLog.create({
        data: {
          adminId: session.user.id,
          userId: invoice.userId,
          action: "invoice.manual_approve",
          entityType: "Invoice",
          entityId: invoice.id,
          metadata: {
            merchantRef: invoice.merchantRef,
            note: parsed.note,
          } as Prisma.JsonObject,
        },
      })
      return { kind: "OK" as const, invoice: updated, plan: invoice.plan, user: invoice.user }
    })

    if (result.kind === "NOT_FOUND") {
      return jsonError(404, { code: "NOT_FOUND", message: "Invoice tidak ditemukan" })
    }
    if (result.kind === "ALREADY_PAID") {
      return jsonError(409, { code: "ALREADY_PAID", message: "Invoice sudah lunas" })
    }
    if (result.kind === "BAD_STATE") {
      return jsonError(409, {
        code: "BAD_STATE",
        message: `Invoice dalam status ${result.invoice.status} tidak bisa di-approve`,
      })
    }

    await invalidateSubscriptionCache(result.invoice.userId)
    await invalidatePublicInvitationsForUser(result.invoice.userId)
    await Promise.allSettled([
      sendInvoicePaidEmailToUser({
        invoice: result.invoice,
        user: result.user,
        planName: result.plan.name,
      }),
      sendInvoicePaidEmailToAdmin({
        invoice: result.invoice,
        user: result.user,
        planName: result.plan.name,
      }),
    ])

    return jsonOk({ invoice: { id: result.invoice.id, status: result.invoice.status } })
  } catch (err) {
    return handleApiError(err)
  }
}
