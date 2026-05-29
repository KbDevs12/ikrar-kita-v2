/**
 * Singleton Redis client (ioredis).
 *
 * Used for caching public invitations, subscription status, rate limiting,
 * and email-verification resend cooldowns. We avoid creating a second client
 * per hot reload by attaching to globalThis in development.
 */
import IORedis, { type Redis } from "ioredis"

declare global {
  // eslint-disable-next-line no-var
  var __redis__: Redis | undefined
}

function createRedis(): Redis {
  const url = process.env.REDIS_URL
  if (!url) {
    throw new Error("REDIS_URL is not set")
  }

  const client = new IORedis(url, {
    // Don't crash the process on transient outages - retry with backoff.
    retryStrategy: (times) => Math.min(times * 200, 2_000),
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: false,
    keyPrefix: "", // we manage keys ourselves to keep them readable
  })

  client.on("error", (err) => {
    // Avoid spamming logs - ioredis re-emits on every retry tick.
    if (process.env.NODE_ENV !== "test") {
      console.error("[redis] error:", err.message)
    }
  })

  return client
}

export const redis: Redis = global.__redis__ ?? createRedis()

if (process.env.NODE_ENV !== "production") {
  global.__redis__ = redis
}

// ─── Cache key helpers ───────────────────────────────────────────────────────

export const cacheKeys = {
  publicInvitation: (slug: string) => `invitation:public:${slug}`,
  subscription: (userId: string) => `subscription:user:${userId}`,
  rateLimit: (identifier: string, action: string) =>
    `rate-limit:${identifier}:${action}`,
  verificationCooldown: (email: string) =>
    `email-verify-cooldown:${email.toLowerCase()}`,
} as const

// ─── Generic get/set with JSON ───────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds)
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return
  await redis.del(...keys)
}

/**
 * Invalidate every public invitation cache for a given user. Used after the
 * user's subscription status changes.
 */
export async function invalidateAllInvitationsForUser(
  slugs: readonly string[]
): Promise<void> {
  if (slugs.length === 0) return
  await redis.del(...slugs.map(cacheKeys.publicInvitation))
}
