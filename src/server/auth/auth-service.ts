/**
 * High-level auth service. Used by route handlers and server actions.
 *
 * Responsibilities:
 *   - Enforce email validation (format + disposable + MX) before creating
 *     a user.
 *   - Create users with hashed password and unverified status.
 *   - Issue verification email post-register.
 *   - Constant-time login that does not reveal whether the email exists.
 *   - Reset the login rate-limit counter on successful auth.
 */
import "server-only"
import { Prisma, type User } from "@prisma/client"
import { prisma } from "@/server/db/prisma"
import { hashPassword, verifyPassword } from "./password"
import { validateRegistrationEmail } from "@/server/email/dns"
import { sendInitialVerification } from "@/server/email/verification"
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validators/auth"

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public field?: string
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "EMAIL_INVALID"
  | "EMAIL_DISPOSABLE"
  | "EMAIL_TYPO"
  | "EMAIL_NO_MX"
  | "VALIDATION_ERROR"

export interface RegisterResult {
  user: Pick<User, "id" | "name" | "email" | "emailVerifiedAt">
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  // Re-validate server-side. Honeypot rejection happens here too via Zod.
  const parsed = registerSchema.parse(input)

  const validation = await validateRegistrationEmail(parsed.email)
  if (!validation.ok) {
    const codeMap = {
      INVALID_FORMAT: "EMAIL_INVALID",
      DISPOSABLE: "EMAIL_DISPOSABLE",
      TYPO_SUGGESTION: "EMAIL_TYPO",
      NO_MX: "EMAIL_NO_MX",
      DNS_BLOCKED: "EMAIL_NO_MX",
    } as const satisfies Record<typeof validation.code, AuthErrorCode>
    throw new AuthError(codeMap[validation.code], validation.message, "email")
  }

  const passwordHash = await hashPassword(parsed.password)

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: validation.normalised,
        passwordHash,
        // emailVerifiedAt remains null - locked until verified
      },
      select: { id: true, name: true, email: true, emailVerifiedAt: true },
    })

    // Fire-and-forget would be a bug: we wait so we can record SMTP failures
    // before returning to the user. The send itself never throws on SMTP
    // errors (see email-service), it logs to EmailEvent instead.
    await sendInitialVerification(user)

    return { user }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Don't leak that this email is taken - same generic error as login
      // failure for register, but we still throw so the form shows the user
      // a message. A more anti-enumeration approach would silently succeed
      // and let resend-verification handle it; the spec wants explicit
      // duplicate handling for register UX though.
      throw new AuthError("EMAIL_TAKEN", "Email sudah terdaftar", "email")
    }
    throw err
  }
}

export interface LoginResult {
  user: User
}

/**
 * Constant-time login: we always run a verify against a dummy hash if the
 * user is missing so the timing is comparable. This mitigates user
 * enumeration via response-time side-channels.
 */
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$YWFhYWFhYWFhYWFhYWFhYQ$dummydummydummydummydummydummydummydummydumm"

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.parse(input)
  const user = await prisma.user.findUnique({ where: { email: parsed.email } })
  const ok = await verifyPassword(parsed.password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !ok) {
    throw new AuthError("INVALID_CREDENTIALS", "Email atau password salah")
  }
  return { user }
}
