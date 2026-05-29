/**
 * Email verification token lifecycle.
 *
 * - Generate cryptographically random token (32 bytes), store SHA-256 hash.
 * - Single-use: setting `usedAt` once consumed.
 * - Expiry from EMAIL_VERIFICATION_TOKEN_TTL_MINUTES (default 60).
 * - Resend cooldown via Redis to prevent abuse.
 * - Lookups MUST NOT reveal whether an email is registered (anti-enumeration).
 */
import "server-only"
import { createHash, randomBytes } from "node:crypto"
import { prisma } from "@/server/db/prisma"
import { redis, cacheKeys } from "@/server/cache/redis"
import { getServerEnv } from "@/lib/env"
import {
  sendVerificationEmail,
  sendVerificationSuccessEmail,
} from "./email-service"
import { EmailVerificationStatus, type User } from "@prisma/client"

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

function generateToken(): string {
  return randomBytes(32).toString("base64url")
}

/**
 * Issue a fresh verification token, invalidating any pending tokens for the
 * same user. Returns the raw token only - it is never persisted.
 */
async function issueToken(userId: string): Promise<string> {
  const env = getServerEnv()
  const ttlMs = env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES * 60 * 1000

  const token = generateToken()
  const tokenHash = hashToken(token)

  await prisma.$transaction([
    // Mark all unused tokens as used so they can't race the new one.
    prisma.emailVerificationToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + ttlMs),
      },
    }),
  ])

  return token
}

/**
 * Initial verification email - called right after register.
 */
export async function sendInitialVerification(
  user: Pick<User, "id" | "name" | "email">
): Promise<void> {
  const token = await issueToken(user.id)
  await sendVerificationEmail(user, token)
}

export type ResendResult =
  | { ok: true }
  | { ok: false; reason: "COOLDOWN"; retryAfterSeconds: number }
  | { ok: false; reason: "ALREADY_VERIFIED" }
  | { ok: false; reason: "UNKNOWN" } // also returned when email doesn't exist

/**
 * Resend verification email.
 *
 * IMPORTANT: returns the same shape regardless of whether the email exists
 * or is already verified. The CALLER decides what to surface to the user
 * for anti-enumeration. Today we always show "Jika email terdaftar..."
 */
export async function resendVerification(
  email: string,
  options: { skipSendIfVerified?: boolean } = {}
): Promise<ResendResult> {
  const env = getServerEnv()
  const cooldownKey = cacheKeys.verificationCooldown(email)
  const cooldown = await redis.get(cooldownKey)
  if (cooldown) {
    const ttl = await redis.ttl(cooldownKey)
    return {
      ok: false,
      reason: "COOLDOWN",
      retryAfterSeconds: ttl > 0 ? ttl : env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
    }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Don't reveal absence. Still set cooldown to slow enumeration via timing.
    await redis.set(cooldownKey, "1", "EX", env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS)
    return { ok: false, reason: "UNKNOWN" }
  }

  if (user.emailVerifiedAt) {
    if (options.skipSendIfVerified) return { ok: false, reason: "ALREADY_VERIFIED" }
    return { ok: false, reason: "ALREADY_VERIFIED" }
  }

  const token = await issueToken(user.id)
  await sendVerificationEmail(user, token)
  await redis.set(cooldownKey, "1", "EX", env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS)
  return { ok: true }
}

export type VerifyResult =
  | { ok: true; user: User }
  | { ok: false; reason: "INVALID" | "EXPIRED" | "USED" }

/**
 * Consume a verification token. Idempotent in the sense that re-using a
 * spent token returns USED, not a second VERIFIED email.
 */
export async function verifyEmailToken(rawToken: string): Promise<VerifyResult> {
  const tokenHash = hashToken(rawToken)
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })
  if (!record) return { ok: false, reason: "INVALID" }
  if (record.usedAt) return { ok: false, reason: "USED" }
  if (record.expiresAt.getTime() <= Date.now()) {
    return { ok: false, reason: "EXPIRED" }
  }

  const now = new Date()
  const [, updatedUser] = await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        emailVerifiedAt: now,
        emailVerificationStatus: EmailVerificationStatus.VERIFIED,
      },
    }),
  ])

  // Best-effort confirmation email; never fail the verify flow on SMTP.
  await sendVerificationSuccessEmail(updatedUser).catch(() => undefined)

  return { ok: true, user: updatedUser }
}
