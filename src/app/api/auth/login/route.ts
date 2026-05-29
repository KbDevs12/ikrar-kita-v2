import "server-only"
import { AuthError, loginUser } from "@/server/auth/auth-service"
import { loginSchema } from "@/lib/validators/auth"
import { rateLimit, rateLimitReset, RATE_LIMITS } from "@/server/cache/rate-limit"
import {
  createSession,
  readSessionContextFromRequest,
  setSessionCookie,
} from "@/server/auth/session"
import { handleApiError, jsonError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request): Promise<Response> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  // Two counters: per IP (DDOS) and per email (credential stuffing).
  const rlIp = await rateLimit({ identifier: ip, action: "login", ...RATE_LIMITS.login })
  if (!rlIp.ok) {
    return jsonError(429, {
      code: "RATE_LIMITED",
      message: "Terlalu banyak percobaan. Coba lagi nanti.",
    })
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body) return jsonError(400, { code: "BAD_REQUEST", message: "Body tidak valid" })

    const parsed = loginSchema.parse(body)

    const rlEmail = await rateLimit({
      identifier: parsed.email,
      action: "login",
      ...RATE_LIMITS.login,
    })
    if (!rlEmail.ok) {
      return jsonError(429, {
        code: "RATE_LIMITED",
        message: "Terlalu banyak percobaan. Coba lagi nanti.",
      })
    }

    const { user } = await loginUser(parsed)

    const ctx = readSessionContextFromRequest(req)
    const token = await createSession(user.id, ctx)
    await setSessionCookie(token)

    // Reset login counter on success so a single bad night doesn't lock the user out
    await rateLimitReset(parsed.email, "login").catch(() => undefined)

    return jsonOk({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerifiedAt !== null,
        role: user.role,
      },
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return jsonError(401, { code: err.code, message: err.message })
    }
    return handleApiError(err)
  }
}
