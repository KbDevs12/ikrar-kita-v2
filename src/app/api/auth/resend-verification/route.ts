import "server-only"
import { resendVerificationSchema } from "@/lib/validators/auth"
import { resendVerification } from "@/server/email/verification"
import { rateLimit, RATE_LIMITS } from "@/server/cache/rate-limit"
import { handleApiError, jsonError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Resend the email verification token.
 *
 * Anti-enumeration: the response is uniform regardless of whether the email
 * exists or is already verified. Only the rate limit might differ, but it's
 * applied first per IP so timing leaks are minimal.
 */
export async function POST(req: Request): Promise<Response> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  const rlIp = await rateLimit({
    identifier: ip,
    action: "resend-verification",
    ...RATE_LIMITS.resendVerification,
  })
  if (!rlIp.ok) {
    return jsonError(429, {
      code: "RATE_LIMITED",
      message: "Terlalu banyak permintaan. Coba lagi sebentar.",
    })
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body) return jsonError(400, { code: "BAD_REQUEST", message: "Body tidak valid" })

    const parsed = resendVerificationSchema.parse(body)
    await resendVerification(parsed.email)

    // Always return the same message - anti-enumeration.
    return jsonOk({
      message:
        "Jika email tersebut terdaftar dan belum diverifikasi, kami sudah mengirim ulang tautannya.",
    })
  } catch (err) {
    return handleApiError(err)
  }
}
