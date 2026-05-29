import { z } from "zod"

/**
 * Billing / checkout / Tripay-facing validators.
 */

// PlanCode mirrors the Prisma enum but kept as a pure Zod string so this
// module stays usable on the client without importing @prisma/client.
export const planCodeSchema = z.enum(["BASIC", "PRO", "RESELLER"])
export type PlanCodeInput = z.infer<typeof planCodeSchema>

/**
 * Tripay payment method codes (e.g. "BRIVA", "QRIS", "OVO"). We don't bake
 * the entire registry in code because Tripay can add channels server-side.
 * Format: uppercase 2-16 chars.
 */
export const paymentMethodCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{2,16}$/, "Metode pembayaran tidak valid")

export const checkoutSchema = z.object({
  planCode: planCodeSchema,
  paymentMethodCode: paymentMethodCodeSchema,
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

export const invoiceSyncSchema = z.object({
  invoiceId: z.string().cuid(),
})

export type InvoiceSyncInput = z.infer<typeof invoiceSyncSchema>

// Tripay callback shape - we keep it permissive (passthrough) because
// Tripay may evolve the payload, but require the fields the system uses.
export const tripayCallbackSchema = z
  .object({
    reference: z.string().min(1),
    merchant_ref: z.string().min(1),
    payment_method: z.string().optional(),
    payment_method_code: z.string().optional(),
    total_amount: z.coerce.number().int().nonnegative(),
    fee_merchant: z.coerce.number().int().nonnegative().optional(),
    fee_customer: z.coerce.number().int().nonnegative().optional(),
    total_fee: z.coerce.number().int().nonnegative().optional(),
    amount_received: z.coerce.number().int().nonnegative().optional(),
    is_closed_payment: z.union([z.literal(0), z.literal(1)]).optional(),
    status: z.string().min(1), // "PAID", "EXPIRED", "FAILED", "REFUND", ...
    paid_at: z.coerce.number().int().optional(),
    note: z.string().optional(),
  })
  .passthrough()

export type TripayCallbackPayload = z.infer<typeof tripayCallbackSchema>
