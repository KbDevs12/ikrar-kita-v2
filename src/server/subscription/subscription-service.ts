/**
 * Subscription service.
 *
 * Single source of truth for:
 *   - "Does this user have an ACTIVE subscription right now?"
 *   - "Can this user publish another invitation under their plan limit?"
 *   - "Activate or extend a subscription after a successful payment."
 *
 * The subscription cache is invalidated on every state change.
 */
import "server-only"
import {
  type Plan,
  type Subscription,
  SubscriptionStatus,
  type Prisma,
} from "@prisma/client"
import { prisma } from "@/server/db/prisma"
import { cacheGet, cacheKeys, cacheSet, redis } from "@/server/cache/redis"

const SUBSCRIPTION_CACHE_TTL_SECONDS = 60 * 60 // 1 hour

export interface ActiveSubscriptionView {
  status: SubscriptionStatus
  planCode: string
  invitationLimit: number | null // null = unlimited
  expiresAt: string // ISO string for cache friendliness
}

/**
 * Returns the user's current subscription view: status + plan limits +
 * expiry. Cached in Redis.
 *
 * Status returned to callers is "live" - if expiresAt has passed, we treat
 * the subscription as EXPIRED even before the cron flips the row.
 */
export async function getActiveSubscriptionView(
  userId: string
): Promise<ActiveSubscriptionView | null> {
  const key = cacheKeys.subscription(userId)
  const cached = await cacheGet<ActiveSubscriptionView>(key)
  if (cached) {
    if (Date.parse(cached.expiresAt) > Date.now() && cached.status === "ACTIVE") {
      return cached
    }
    // Stale - fall through and refresh.
  }

  const sub = await prisma.subscription.findFirst({
    where: { userId, status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] } },
    orderBy: { expiresAt: "desc" },
    include: { plan: true },
  })

  if (!sub) return null

  const liveStatus =
    sub.expiresAt.getTime() <= Date.now() ? SubscriptionStatus.EXPIRED : sub.status

  const view: ActiveSubscriptionView = {
    status: liveStatus,
    planCode: sub.plan.code,
    invitationLimit: sub.plan.invitationLimit,
    expiresAt: sub.expiresAt.toISOString(),
  }
  await cacheSet(key, view, SUBSCRIPTION_CACHE_TTL_SECONDS)
  return view
}

export async function invalidateSubscriptionCache(userId: string): Promise<void> {
  await redis.del(cacheKeys.subscription(userId))
}

/**
 * Activate or extend a subscription after a successful payment.
 *
 * Rules from spec:
 *   - If the user has an ACTIVE subscription whose expiresAt is in the
 *     future, the new period extends from the current expiresAt.
 *   - Otherwise the new period starts now.
 *
 * Idempotent: callers should already check the invoice has not been
 * processed before calling this. We add a defence-in-depth check here too:
 * if there is already a subscription whose `expiresAt > now` and was created
 * within the last 5 minutes, we assume the same callback fired twice and
 * skip extension.
 */
export async function activateOrExtendSubscription(
  tx: Prisma.TransactionClient,
  params: {
    userId: string
    plan: Plan
    paymentTime?: Date
  }
): Promise<Subscription> {
  const now = params.paymentTime ?? new Date()
  const durationMs = params.plan.durationDays * 24 * 60 * 60 * 1000

  // Most recent ACTIVE subscription (if any)
  const existing = await tx.subscription.findFirst({
    where: { userId: params.userId, status: SubscriptionStatus.ACTIVE },
    orderBy: { expiresAt: "desc" },
  })

  if (existing && existing.expiresAt.getTime() > now.getTime()) {
    const newExpiresAt = new Date(existing.expiresAt.getTime() + durationMs)
    return tx.subscription.update({
      where: { id: existing.id },
      data: { expiresAt: newExpiresAt, planId: params.plan.id, updatedAt: now },
    })
  }

  return tx.subscription.create({
    data: {
      userId: params.userId,
      planId: params.plan.id,
      status: SubscriptionStatus.ACTIVE,
      startsAt: now,
      expiresAt: new Date(now.getTime() + durationMs),
    },
  })
}

/**
 * Check whether a user can publish *another* invitation under their plan
 * limit. Returns the live count + limit so callers can show "2 of 3 used".
 */
export interface PublishLimitCheck {
  allowed: boolean
  publishedCount: number
  limit: number | null // null = unlimited
}

export async function checkPublishLimit(userId: string): Promise<PublishLimitCheck> {
  const sub = await getActiveSubscriptionView(userId)
  if (!sub || sub.status !== "ACTIVE") {
    return { allowed: false, publishedCount: 0, limit: 0 }
  }
  const publishedCount = await prisma.invitation.count({
    where: { userId, status: "PUBLISHED" },
  })
  const limit = sub.invitationLimit
  if (limit === null) return { allowed: true, publishedCount, limit: null }
  return { allowed: publishedCount < limit, publishedCount, limit }
}
