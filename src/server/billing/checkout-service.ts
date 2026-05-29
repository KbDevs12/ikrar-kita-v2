/**
 * Checkout service.
 *
 * Builds a Tripay closed-payment transaction for the chosen plan, persists
 * a local Invoice (PENDING) with the merchant_ref + reference + raw response,
 * and dispatches notification emails to user + admin.
 *
 * NOTE: this service does NOT activate a subscription. Activation happens
 * on the Tripay callback, see src/server/billing/callback-service.ts.
 */
import "server-only"
import { nanoid } from "nanoid"
import { prisma } from "@/server/db/prisma"
import {
  createClosedPaymentTransaction,
  type CreatedTransaction,
} from "@/server/payment/tripay"
import {
  sendInvoiceCreatedEmailToAdmin,
  sendInvoiceCreatedEmailToUser,
} from "@/server/email/email-service"
import type { CheckoutInput } from "@/lib/validators/billing"
import type { Invoice, Plan, User } from "@prisma/client"

export class CheckoutError extends Error {
  constructor(
    public code: "PLAN_NOT_FOUND" | "EMAIL_NOT_VERIFIED" | "TRIPAY_FAILED",
    message: string
  ) {
    super(message)
    this.name = "CheckoutError"
  }
}

/**
 * Generate a merchant reference unique per checkout. Format:
 *   IK-<yyyymmdd>-<8 char nanoid>
 * Length = 20 chars, well under Tripay's limit and easy to grep in logs.
 */
function generateMerchantRef(): string {
  const d = new Date()
  const yyyymmdd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}${String(d.getUTCDate()).padStart(2, "0")}`
  return `IK-${yyyymmdd}-${nanoid(8).toUpperCase()}`
}

export interface CheckoutResult {
  invoice: Invoice
  tripay: CreatedTransaction
}

export async function createCheckout(
  user: User,
  input: CheckoutInput
): Promise<CheckoutResult> {
  if (user.emailVerifiedAt === null) {
    throw new CheckoutError("EMAIL_NOT_VERIFIED", "Email belum diverifikasi")
  }

  const plan = await prisma.plan.findUnique({ where: { code: input.planCode } })
  if (!plan || !plan.isActive) {
    throw new CheckoutError("PLAN_NOT_FOUND", "Paket tidak ditemukan")
  }

  const merchantRef = generateMerchantRef()

  // 1. Create Tripay transaction first - if this fails we never persist a
  //    half-baked invoice.
  let tripay: CreatedTransaction
  try {
    tripay = await createClosedPaymentTransaction({
      method: input.paymentMethodCode,
      merchantRef,
      amount: plan.price,
      customerName: user.name,
      customerEmail: user.email,
      orderItems: [
        {
          name: `${plan.name} (30 hari)`,
          price: plan.price,
          quantity: 1,
        },
      ],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tripay error"
    throw new CheckoutError("TRIPAY_FAILED", message)
  }

  // 2. Persist invoice with everything we know.
  const expiredAt = tripay.expired_time
    ? new Date(tripay.expired_time * 1000)
    : null

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      planId: plan.id,
      amount: plan.price,
      status: "PENDING",
      paymentProvider: "TRIPAY",
      paymentMethodCode: tripay.payment_method_code,
      paymentMethodName: tripay.payment_name,
      merchantRef,
      tripayReference: tripay.reference,
      tripayCheckoutUrl: tripay.checkout_url,
      tripayPayCode: tripay.pay_code ?? null,
      tripayQrUrl: tripay.qr_url ?? null,
      tripayRawResponse: tripay as unknown as object,
      expiredAt,
    },
  })

  // 3. Notify user + admin. Email failures never roll back the invoice.
  const ctx = {
    invoice,
    user,
    planName: plan.name,
  }
  await Promise.allSettled([
    sendInvoiceCreatedEmailToUser(ctx),
    sendInvoiceCreatedEmailToAdmin(ctx),
  ])

  return { invoice, tripay }
}

export interface InvoiceWithPlan extends Invoice {
  plan: Plan
}

export async function getInvoiceForUser(
  userId: string,
  invoiceId: string
): Promise<InvoiceWithPlan | null> {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: { plan: true },
  })
}
