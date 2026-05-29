/**
 * Tripay callback handler.
 *
 * Idempotency strategy:
 *   1. Always persist a PaymentEvent row (even on bad signatures), with
 *      isValidSignature flagged.
 *   2. For PAID events, the invoice update + subscription activation happen
 *      in a single Prisma transaction. We re-read the invoice inside the
 *      transaction and short-circuit if it's already PAID, so a duplicate
 *      callback cannot create a second subscription extension.
 */
import "server-only"
import { Prisma } from "@prisma/client"
import { prisma } from "@/server/db/prisma"
import { activateOrExtendSubscription, invalidateSubscriptionCache } from "@/server/subscription/subscription-service"
import { invalidatePublicInvitationsForUser } from "@/server/invitation/cache"
import {
  sendInvoiceExpiredEmailToUser,
  sendInvoiceFailedEmailToUser,
  sendInvoicePaidEmailToAdmin,
  sendInvoicePaidEmailToUser,
} from "@/server/email/email-service"
import {
  parseCallback,
  type ParsedCallback,
} from "@/server/payment/tripay"

const TRIPAY_TO_INVOICE_STATUS = {
  PAID: "PAID",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
  REFUND: "REFUND",
} as const

export interface CallbackResult {
  status: "ACCEPTED" | "DUPLICATE" | "INVALID_SIGNATURE" | "INVALID_EVENT" | "UNKNOWN_INVOICE" | "PARSE_ERROR"
}

export async function handleTripayCallback(
  rawBody: string,
  headers: { signature: string | null; event: string | null }
): Promise<CallbackResult> {
  const parsed = parseCallback(rawBody, headers)

  // Persist the raw event no matter what so we can audit forgeries.
  await persistEvent(parsed, rawBody, headers.signature)

  if (!parsed.signatureValid) return { status: "INVALID_SIGNATURE" }
  if (parsed.event !== "payment_status") return { status: "INVALID_EVENT" }
  if (!parsed.payload) return { status: "PARSE_ERROR" }

  const tripayStatus = parsed.payload.status.toUpperCase() as keyof typeof TRIPAY_TO_INVOICE_STATUS
  const newStatus = TRIPAY_TO_INVOICE_STATUS[tripayStatus]
  if (!newStatus) {
    return { status: "PARSE_ERROR" }
  }

  // Process inside a transaction so duplicate callbacks cannot race.
  const outcome = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { merchantRef: parsed.payload!.merchant_ref },
      include: { plan: true, user: true },
    })
    if (!invoice) return { kind: "UNKNOWN_INVOICE" as const }

    // Already terminal? duplicate
    if (
      invoice.status === "PAID" ||
      invoice.status === "EXPIRED" ||
      invoice.status === "FAILED" ||
      invoice.status === "REFUND" ||
      invoice.status === "CANCELLED"
    ) {
      // Still update the callback payload for audit, but don't re-activate.
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { tripayCallbackPayload: parsed.payload as unknown as Prisma.JsonObject },
      })
      return { kind: "DUPLICATE" as const, invoice }
    }

    const now = new Date()
    const paidAt = parsed.payload!.paid_at ? new Date(parsed.payload!.paid_at * 1000) : now

    if (newStatus === "PAID") {
      const updated = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "PAID",
          paidAt,
          processedAt: now,
          tripayCallbackPayload: parsed.payload as unknown as Prisma.JsonObject,
        },
      })
      await activateOrExtendSubscription(tx, {
        userId: invoice.userId,
        plan: invoice.plan,
        paymentTime: paidAt,
      })
      await tx.auditLog.create({
        data: {
          userId: invoice.userId,
          action: "invoice.paid",
          entityType: "Invoice",
          entityId: invoice.id,
          metadata: {
            merchantRef: invoice.merchantRef,
            tripayReference: invoice.tripayReference,
            amount: invoice.amount,
          },
        },
      })
      return { kind: "PAID" as const, invoice: updated, plan: invoice.plan, user: invoice.user }
    }

    // Non-paid terminal status (EXPIRED / FAILED / REFUND)
    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: newStatus,
        processedAt: now,
        tripayCallbackPayload: parsed.payload as unknown as Prisma.JsonObject,
      },
    })
    return { kind: newStatus as "EXPIRED" | "FAILED" | "REFUND", invoice: updated, plan: invoice.plan, user: invoice.user }
  })

  if (outcome.kind === "UNKNOWN_INVOICE") return { status: "UNKNOWN_INVOICE" }
  if (outcome.kind === "DUPLICATE") return { status: "DUPLICATE" }

  // Side effects (post-commit): cache invalidation + emails. None of these
  // should roll back the payment if they fail.
  if (outcome.kind === "PAID") {
    await invalidateSubscriptionCache(outcome.invoice.userId)
    await invalidatePublicInvitationsForUser(outcome.invoice.userId)
    const ctx = {
      invoice: outcome.invoice,
      user: outcome.user,
      planName: outcome.plan.name,
    }
    await Promise.allSettled([
      sendInvoicePaidEmailToUser(ctx),
      sendInvoicePaidEmailToAdmin(ctx),
    ])
  } else if (outcome.kind === "EXPIRED") {
    await sendInvoiceExpiredEmailToUser({
      invoice: outcome.invoice,
      user: outcome.user,
      planName: outcome.plan.name,
    }).catch(() => undefined)
  } else if (outcome.kind === "FAILED") {
    await sendInvoiceFailedEmailToUser({
      invoice: outcome.invoice,
      user: outcome.user,
      planName: outcome.plan.name,
    }).catch(() => undefined)
  }

  return { status: "ACCEPTED" }
}

async function persistEvent(
  parsed: ParsedCallback,
  rawBody: string,
  signature: string | null
): Promise<void> {
  // Try to attach to invoice if we can parse merchant_ref
  let invoiceId: string | null = null
  if (parsed.payload?.merchant_ref) {
    const inv = await prisma.invoice
      .findUnique({
        where: { merchantRef: parsed.payload.merchant_ref },
        select: { id: true },
      })
      .catch(() => null)
    invoiceId = inv?.id ?? null
  }

  await prisma.paymentEvent
    .create({
      data: {
        invoiceId,
        provider: "TRIPAY",
        eventType: parsed.event || "unknown",
        status: parsed.payload?.status ?? "UNKNOWN",
        rawPayload: parsed.payload
          ? (parsed.payload as unknown as Prisma.JsonObject)
          : { rawBody: rawBody.slice(0, 4000), parseError: parsed.parseError },
        signature: signature ?? null,
        isValidSignature: parsed.signatureValid,
      },
    })
    .catch((e) => {
      console.error("[tripay] failed to persist PaymentEvent:", e)
    })
}
