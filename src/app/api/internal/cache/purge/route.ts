import "server-only"
import { z } from "zod"
import { redis, cacheKeys } from "@/server/cache/redis"
import { invalidateSubscriptionCache } from "@/server/subscription/subscription-service"
import { invalidatePublicInvitation, invalidatePublicInvitationsForUser } from "@/server/invitation/cache"
import {
  requireInternalApiKey,
  UnauthorizedError,
  unauthorizedResponse,
} from "@/server/security/api-key"
import { handleApiError, jsonError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const purgeSchema = z.object({
  scope: z.enum(["invitation", "subscription", "user-invitations", "all-public"]),
  slug: z.string().optional(),
  userId: z.string().cuid().optional(),
})

/**
 * Internal cache purge endpoint.
 *
 * Used by:
 *   - admin tools that have made out-of-band DB edits and need the cache to
 *     reflect them immediately
 *   - migration scripts that change cached field shapes
 *
 * Protected by INTERNAL_API_KEY. The action and identifier are returned in
 * the response so the caller can verify the purge target.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    requireInternalApiKey(req)
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    throw e
  }

  try {
    const body = await req.json().catch(() => null)
    const parsed = purgeSchema.parse(body ?? {})

    if (parsed.scope === "invitation") {
      if (!parsed.slug) {
        return jsonError(400, { code: "BAD_REQUEST", message: "slug wajib untuk scope=invitation" })
      }
      await invalidatePublicInvitation(parsed.slug)
      return jsonOk({ purged: "invitation", slug: parsed.slug })
    }

    if (parsed.scope === "subscription") {
      if (!parsed.userId) {
        return jsonError(400, {
          code: "BAD_REQUEST",
          message: "userId wajib untuk scope=subscription",
        })
      }
      await invalidateSubscriptionCache(parsed.userId)
      return jsonOk({ purged: "subscription", userId: parsed.userId })
    }

    if (parsed.scope === "user-invitations") {
      if (!parsed.userId) {
        return jsonError(400, {
          code: "BAD_REQUEST",
          message: "userId wajib untuk scope=user-invitations",
        })
      }
      await invalidatePublicInvitationsForUser(parsed.userId)
      return jsonOk({ purged: "user-invitations", userId: parsed.userId })
    }

    // scope=all-public - sweeping but bounded by SCAN
    let cursor = "0"
    const matched: string[] = []
    do {
      const [next, keys] = await redis.scan(cursor, "MATCH", cacheKeys.publicInvitation("*"), "COUNT", 200)
      cursor = next
      if (keys.length > 0) matched.push(...keys)
    } while (cursor !== "0" && matched.length < 5_000)
    if (matched.length > 0) await redis.del(...matched)
    return jsonOk({ purged: "all-public", count: matched.length })
  } catch (err) {
    return handleApiError(err)
  }
}
