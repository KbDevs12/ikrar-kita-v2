import { z } from "zod"
import { emailSchema } from "./email"

/**
 * Auth schemas shared by client form (TanStack Form) and server action /
 * route handler. Keeping them in one place is the only way the spec's "no
 * client-only validation" rule stays enforced.
 */

const passwordSchema = z
  .string({ required_error: "Password wajib diisi" })
  .min(8, "Password minimal 8 karakter")
  .max(128, "Password terlalu panjang")
  // Must contain at least one letter and one number - keeps things friendly
  // while preventing the worst common passwords.
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), {
    message: "Password harus mengandung huruf dan angka",
  })

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Nama wajib diisi" })
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(80, "Nama terlalu panjang"),
  email: emailSchema,
  password: passwordSchema,
  // Honeypot - real users never see or fill this. Bots often do.
  website: z.string().max(0, "Permintaan ditolak").optional().default(""),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password wajib diisi"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const resendVerificationSchema = z.object({
  email: emailSchema,
})

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>

export const verifyEmailSchema = z.object({
  token: z.string().min(20, "Token tidak valid").max(256, "Token tidak valid"),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, "Password wajib diisi"),
})

export type ChangeEmailInput = z.infer<typeof changeEmailSchema>

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(20),
  password: passwordSchema,
})
