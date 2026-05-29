import "server-only"
import { createHash } from "node:crypto"
import { prisma } from "@/server/db/prisma"
import { rsvpSchema } from "@/lib/validators/rsvp"
import { rateLimit, RATE_LIMITS } from "@/server/cache/rate-limit"
import { handleApiError, jsonCreated, jsonError } from "@/server/http/response"
import { resolvePublicInvitation } from "@/server/invitation/invitation-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Public RSVP submission. The endpoint is visible to anyone who has a
 * valid slug, so we:
 *   - rate-limit per IP (10/min) to slow scripts
 *   - require the invitation to be live (PUBLISHED + active subscription)
 *   - reject the honeypot field
 *   - hash the IP before storing for future-dedupe
 */
export async function POST(req: Request): Promise<Response> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  const rl = await rateLimit({ identifier: ip, action: "rsvp", ...RATE_LIMITS.rsvpSubmit })
  if (!rl.ok) {
    return jsonError(429, { code: "RATE_LIMITED", message: "Terlalu banyak pengiriman." })
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body) return jsonError(400, { code: "BAD_REQUEST", message: "Body tidak valid" })

    const parsed = rsvpSchema.parse(body)

    // Verify the invitation is live - we resolve it the same way the public
    // page does so an archived/expired invitation cannot collect RSVPs.
    const invitation = await prisma.invitation.findUnique({
      where: { id: parsed.invitationId },
      select: { id: true, slug: true },
    })
    if (!invitation) {
      return jsonError(404, { code: "NOT_FOUND", message: "Undangan tidak ditemukan" })
    }
    const live = await resolvePublicInvitation(invitation.slug)
    if (!live) {
      return jsonError(403, { code: "INACTIVE", message: "Undangan tidak aktif" })
    }

    const ipHash = createHash("sha256").update(`${ip}|${invitation.id}`).digest("hex")

    const created = await prisma.rsvp.create({
      data: {
        invitationId: invitation.id,
        guestName: parsed.guestName,
        attendanceStatus: parsed.attendanceStatus,
        guestCount: parsed.guestCount,
        message: parsed.message || null,
        ipHash,
      },
    })

    return jsonCreated({ rsvp: { id: created.id } })
  } catch (err) {
    return handleApiError(err)
  }
}
