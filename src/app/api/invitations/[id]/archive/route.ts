import "server-only"
import { requireVerifiedUser } from "@/server/auth/guards"
import { InvitationError, archiveInvitation } from "@/server/invitation/invitation-service"
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
    const updated = await archiveInvitation(session.user, id)
    return jsonOk({ invitation: { id: updated.id, slug: updated.slug, status: updated.status } })
  } catch (err) {
    if (err instanceof InvitationError) {
      const status = err.code === "NOT_FOUND" ? 404 : err.code === "FORBIDDEN" ? 403 : 422
      return jsonError(status, { code: err.code, message: err.message })
    }
    return handleApiError(err)
  }
}
