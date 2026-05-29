import { z } from "zod"

export const guestMessageSchema = z.object({
  invitationId: z.string().cuid(),
  name: z
    .string({ required_error: "Nama wajib diisi" })
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(80, "Nama terlalu panjang"),
  message: z
    .string({ required_error: "Pesan wajib diisi" })
    .trim()
    .min(3, "Pesan minimal 3 karakter")
    .max(1000, "Pesan terlalu panjang"),
  website: z.string().max(0).optional().default(""),
})

export type GuestMessageInput = z.infer<typeof guestMessageSchema>
