import "server-only"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/server/db/prisma"
import { getTransactionDetail } from "@/server/payment/tripay"
import {
  activateOrExtendSubscription,
  invalidateSubscriptionCache,
} from "@/server/subscription/subscription-service"
import { invalidatePublicInvitationsForUser } from "@/server/invitation/cache"
import {
  requireInternalApiKey,
  UnauthorizedError,
  unauthorizedResponse,
} from "@/server/security/api-key"
import { handleApiError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TRIPAY_TO_INVOICE_STATUS = {
  PAID: "PAID",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
  REFUND: "REFUND",
  UNPAID: "PENDING",
} as const

const bodySchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
})

/**
 * Internal: batch reconcile PENDING invoices with Tripay. Useful when many
 * callbacks were missed during an outage.
 *
 * Idempotent. Tolerates per-invoice failures (logs and continues).
 */
export async function POST(req: Request): Promise<Response> {
  try {
    requireInternalApiKey(req)
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    throw e
  }

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = bodySchema.parse(body)

    const pending = await prisma.invoice.findMany({
      where: { status: "PENDING", tripayReference: { not: null } },
      orderBy: { createdAt: "asc" },
      take: parsed.limit,
      include: { plan: true },
    })

    let updated = 0
    let failed = 0
    for (const invoice of pending) {
      try {
        const tripay = await getTransactionDetail(invoice.tripayReference!)
        const newStatus =
          TRIPAY_TO_INVOICE_STATUS[
            tripay.status.toUpperCase() as keyof typeof TRIPAY_TO_INVOICE_STATUS
          ] ?? null
        if (!newStatus || newStatus === invoice.status) continue

        await prisma.$transaction(async (tx) => {
          const fresh = await tx.invoice.findUnique({
            where: { id: invoice.id },
            include: { plan: true },
          })
          if (!fresh || fresh.status !== "PENDING") return

          const now = new Date()
          if (newStatus === "PAID") {
            const paidAt = tripay.paid_at ? new Date(tripay.paid_at * 1000) : now
            await tx.invoice.update({
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
                userId: fresh.userId,
                action: "invoice.batch_sync_paid",
                entityType: "Invoice",
                entityId: fresh.id,
                metadata: { reference: fresh.tripayReference } as Prisma.JsonObject,
              },
            })
            await invalidateSubscriptionCache(fresh.userId)
            await invalidatePublicInvitationsForUser(fresh.userId)
          } else {
            await tx.invoice.update({
              where: { id: fresh.id },
              data: { status: newStatus, processedAt: now },
            })
          }
        })
        updated++
      } catch (err) {
        console.error(`[batch-sync] invoice ${invoice.id} failed:`, err)
        failed++
      }
    }

    return jsonOk({ checked: pending.length, updated, failed })
  } catch (err) {
    return handleApiError(err)
  }
}
