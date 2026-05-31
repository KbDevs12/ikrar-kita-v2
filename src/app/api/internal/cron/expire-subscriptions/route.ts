import "server-only"
import { prisma } from "@/server/db/prisma"
import { invalidateSubscriptionCache } from "@/server/subscription/subscription-service"
import { invalidatePublicInvitationsForUser } from "@/server/invitation/cache"
import { requireCronSecret, UnauthorizedError, unauthorizedResponse } from "@/server/security/api-key"
import { jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Cron: flip ACTIVE subscriptions whose expiresAt has passed to EXPIRED.
 *
 * Public invitations belonging to those users go inactive immediately
 * because the live status check in resolvePublicInvitation already treats
 * `expiresAt < now` as EXPIRED, but we still flush the public-invitation
 * cache so any cached PUBLISHED snapshot is dropped.
 *
 * Idempotent. Safe to run multiple times. Suggested cadence: every 5
 * minutes.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    requireCronSecret(req)
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    throw e
  }

  const now = new Date()
  const expiring = await prisma.subscription.findMany({
    where: { status: "ACTIVE", expiresAt: { lt: now } },
    select: { id: true, userId: true },
  })

  if (expiring.length === 0) {
    return jsonOk({ expired: 0 })
  }

  await prisma.subscription.updateMany({
    where: { id: { in: expiring.map((s) => s.id) } },
    data: { status: "EXPIRED" },
  })

  // Invalidate per-user caches in parallel
  const userIds = Array.from(new Set(expiring.map((s) => s.userId)))
  await Promise.allSettled(
    userIds.flatMap((u) => [
      invalidateSubscriptionCache(u),
      invalidatePublicInvitationsForUser(u),
    ])
  )

  return jsonOk({ expired: expiring.length, users: userIds.length })
}
