/**
 * Sliding-window-ish rate limiter using Redis INCR + EXPIRE.
 *
 * We use the simpler fixed-window counter since most endpoints have small
 * limits (5/min, 20/min) and the variance is acceptable. For higher
 * accuracy in the future we can switch to a Lua-based sliding log.
 */
import { redis, cacheKeys } from "./redis"

export interface RateLimitOptions {
  /** Identifier - user id, ip, or email */
  identifier: string
  /** Action name - distinguishes per-endpoint counters */
  action: string
  /** Max number of requests allowed in the window */
  limit: number
  /** Window in seconds */
  windowSeconds: number
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetInSeconds: number
}

export async function rateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  const key = cacheKeys.rateLimit(opts.identifier, opts.action)

  const pipeline = redis.multi()
  pipeline.incr(key)
  pipeline.ttl(key)
  const [incrRes, ttlRes] = (await pipeline.exec()) ?? []

  // ioredis returns [err, result] tuples
  const count = (incrRes?.[1] as number) ?? 1
  let ttl = (ttlRes?.[1] as number) ?? -1

  if (ttl < 0) {
    await redis.expire(key, opts.windowSeconds)
    ttl = opts.windowSeconds
  }

  return {
    ok: count <= opts.limit,
    remaining: Math.max(0, opts.limit - count),
    resetInSeconds: ttl > 0 ? ttl : opts.windowSeconds,
  }
}

/** Reset a counter manually. Useful after a successful login wipes failures. */
export async function rateLimitReset(identifier: string, action: string): Promise<void> {
  await redis.del(cacheKeys.rateLimit(identifier, action))
}

// Common preset configurations
export const RATE_LIMITS = {
  login: { limit: 8, windowSeconds: 60 * 5 },
  register: { limit: 5, windowSeconds: 60 * 5 },
  resendVerification: { limit: 3, windowSeconds: 60 * 5 },
  checkout: { limit: 10, windowSeconds: 60 * 60 },
  invoiceSync: { limit: 20, windowSeconds: 60 },
  rsvpSubmit: { limit: 10, windowSeconds: 60 },
  guestMessage: { limit: 10, windowSeconds: 60 },
  internalApi: { limit: 60, windowSeconds: 60 },
} as const
