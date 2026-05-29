import { z } from "zod"

export const rsvpSchema = z.object({
  invitationId: z.string().cuid(),
  guestName: z
    .string({ required_error: "Nama wajib diisi" })
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(80, "Nama terlalu panjang"),
  attendanceStatus: z.enum(["YES", "NO", "MAYBE"], {
    errorMap: () => ({ message: "Pilih kehadiran" }),
  }),
  guestCount: z.coerce
    .number({ invalid_type_error: "Jumlah harus angka" })
    .int()
    .min(1, "Minimal 1 orang")
    .max(10, "Maksimal 10 orang"),
  message: z.string().trim().max(500, "Pesan terlalu panjang").optional().or(z.literal("")),
  // Honeypot
  website: z.string().max(0, "Permintaan ditolak").optional().default(""),
})

export type RsvpInput = z.infer<typeof rsvpSchema>
