import "server-only"
import { requireVerifiedUser } from "@/server/auth/guards"
import { InvitationError, publishInvitation } from "@/server/invitation/invitation-service"
import { handleApiError, jsonError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(_req: Request, ctx: Params): Promise<Response> {
  try {
    const { id } = await ctx.params
    const session = await requireVerifiedUser()
    const updated = await publishInvitation(session.user, id)
    return jsonOk({ invitation: { id: updated.id, slug: updated.slug, status: updated.status } })
  } catch (err) {
    if (err instanceof InvitationError) {
      const map: Record<string, number> = {
        NOT_FOUND: 404,
        FORBIDDEN: 403,
        EMAIL_NOT_VERIFIED: 403,
        NO_ACTIVE_SUBSCRIPTION: 402, // Payment Required
        LIMIT_REACHED: 402,
        ALREADY_PUBLISHED: 409,
        ARCHIVED: 409,
      }
      return jsonError(map[err.code] ?? 422, { code: err.code, message: err.message })
    }
    return handleApiError(err)
  }
}
