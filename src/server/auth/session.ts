/**
 * Session management.
 *
 * Strategy:
 *   - Random 32-byte token, stored as base64url in an HTTP-only cookie.
 *   - Hashed (SHA-256) before persistence so a DB compromise does not
 *     immediately expose live sessions.
 *   - Server-side row in `Session` table allows revocation by id.
 *   - Sliding expiry: 30 days, refreshed on read if older than 1 day.
 */
import "server-only"
import { cookies } from "next/headers"
import { createHash, randomBytes } from "node:crypto"
import { prisma } from "@/server/db/prisma"
import { getServerEnv } from "@/lib/env"
import type { User } from "@prisma/client"

export const SESSION_COOKIE_NAME = "ikrar_session"
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days
export const SESSION_REFRESH_THRESHOLD_MS = 1000 * 60 * 60 * 24 // 1 day

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

function generateToken(): string {
  // 32 bytes = 256 bits of entropy -> base64url (~43 chars)
  return randomBytes(32).toString("base64url")
}

export interface SessionContext {
  userAgent?: string | undefined
  ipAddress?: string | undefined
}

export async function createSession(
  userId: string,
  ctx: SessionContext = {}
): Promise<string> {
  const token = generateToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: ctx.userAgent ?? null,
      ipAddress: ctx.ipAddress ?? null,
    },
  })

  return token
}

export async function setSessionCookie(token: string): Promise<void> {
  const env = getServerEnv()
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE_NAME)
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(SESSION_COOKIE_NAME)?.value ?? null
}

export interface ResolvedSession {
  user: User
  sessionId: string
}

/**
 * Look up the current session + user. Returns null if missing/expired/
 * revoked. Refreshes the expiry sliding-style when stale.
 */
export async function getSession(): Promise<ResolvedSession | null> {
  const token = await getSessionToken()
  if (!token) return null

  const tokenHash = hashToken(token)
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!session) return null
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }

  // Sliding expiry refresh
  const newExpires = new Date(Date.now() + SESSION_TTL_MS)
  const lastSeenStale =
    Date.now() - session.lastSeenAt.getTime() > SESSION_REFRESH_THRESHOLD_MS
  if (lastSeenStale) {
    await prisma.session
      .update({
        where: { id: session.id },
        data: { lastSeenAt: new Date(), expiresAt: newExpires },
      })
      .catch(() => undefined)
  }

  return { user: session.user, sessionId: session.id }
}

export async function destroySession(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined)
}

export async function destroyAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } })
}

// ─── Helpers used by route handlers ─────────────────────────────────────────

export function readSessionContextFromRequest(req: Request): SessionContext {
  const userAgent = req.headers.get("user-agent") ?? undefined
  const xff = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const ipAddress = xff?.split(",")[0]?.trim() || realIp || undefined
  return { userAgent, ipAddress }
}
