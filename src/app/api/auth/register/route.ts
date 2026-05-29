import "server-only"
import { NextResponse } from "next/server"
import {
  AuthError,
  registerUser,
} from "@/server/auth/auth-service"
import { registerSchema } from "@/lib/validators/auth"
import { rateLimit, RATE_LIMITS } from "@/server/cache/rate-limit"
import {
  createSession,
  readSessionContextFromRequest,
  setSessionCookie,
} from "@/server/auth/session"
import { handleApiError, jsonCreated, jsonError } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request): Promise<Response> {
  // Rate limit by IP - register is a high-abuse target
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  const rl = await rateLimit({
    identifier: ip,
    action: "register",
    ...RATE_LIMITS.register,
  })
  if (!rl.ok) {
    return jsonError(429, {
      code: "RATE_LIMITED",
      message: "Terlalu banyak percobaan. Coba lagi nanti.",
    })
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body) return jsonError(400, { code: "BAD_REQUEST", message: "Body tidak valid" })

    const parsed = registerSchema.parse(body)
    const { user } = await registerUser(parsed)

    // Auto-login after register so the user lands on /verify-email/pending
    // signed in. They cannot do anything destructive until verified.
    const ctx = readSessionContextFromRequest(req)
    const token = await createSession(user.id, ctx)
    await setSessionCookie(token)

    return jsonCreated({
      user: { id: user.id, name: user.name, email: user.email },
      verifyEmailRequired: true,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.code === "EMAIL_TAKEN" ? 409 : 422
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: err.code,
            message: err.message,
            fieldErrors: err.field
              ? { [err.field]: [err.message] }
              : undefined,
          },
        },
        { status }
      )
    }
    return handleApiError(err)
  }
}
