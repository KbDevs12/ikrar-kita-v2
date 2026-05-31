import { z } from "zod"

/**
 * Admin actions. These schemas are also used by the admin form components
 * that show a "Are you sure?" dialog, so error messages are tuned to the
 * admin audience and stay in Bahasa Indonesia.
 */

export const adminManualApproveSchema = z.object({
  invoiceId: z.string().cuid(),
  note: z
    .string({ required_error: "Alasan/catatan wajib diisi" })
    .trim()
    .min(10, "Catatan minimal 10 karakter")
    .max(1000, "Catatan terlalu panjang"),
})

export type AdminManualApproveInput = z.infer<typeof adminManualApproveSchema>

export const adminCancelInvoiceSchema = z.object({
  invoiceId: z.string().cuid(),
  reason: z.string().trim().min(5).max(500).optional().or(z.literal("")),
})

export type AdminCancelInvoiceInput = z.infer<typeof adminCancelInvoiceSchema>

export const adminInvoiceSyncSchema = z.object({
  invoiceId: z.string().cuid(),
})

export const adminToggleInvitationSchema = z.object({
  invitationId: z.string().cuid(),
  archived: z.boolean(),
  reason: z.string().trim().min(5).max(500).optional().or(z.literal("")),
})
