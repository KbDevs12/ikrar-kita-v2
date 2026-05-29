import "server-only"
import { requireVerifiedUser } from "@/server/auth/guards"
import {
  InvitationError,
  getInvitationForUser,
  updateInvitation,
} from "@/server/invitation/invitation-service"
import { invalidatePublicInvitation } from "@/server/invitation/cache"
import { prisma } from "@/server/db/prisma"
import { handleApiError, jsonError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, ctx: Params): Promise<Response> {
  try {
    const { id } = await ctx.params
    const session = await requireVerifiedUser()
    const inv = await getInvitationForUser(session.user.id, id)
    return jsonOk({ invitation: inv })
  } catch (err) {
    if (err instanceof InvitationError) {
      const status = err.code === "NOT_FOUND" ? 404 : err.code === "FORBIDDEN" ? 403 : 400
      return jsonError(status, { code: err.code, message: err.message })
    }
    return handleApiError(err)
  }
}

export async function PATCH(req: Request, ctx: Params): Promise<Response> {
  try {
    const { id } = await ctx.params
    const session = await requireVerifiedUser()
    const body = await req.json().catch(() => null)
    if (!body) return jsonError(400, { code: "BAD_REQUEST", message: "Body tidak valid" })
    const updated = await updateInvitation(session.user, id, body)
    return jsonOk({ invitation: { id: updated.id, slug: updated.slug, status: updated.status } })
  } catch (err) {
    if (err instanceof InvitationError) {
      const status =
        err.code === "NOT_FOUND"
          ? 404
          : err.code === "FORBIDDEN"
            ? 403
            : err.code === "SLUG_TAKEN"
              ? 409
              : 422
      return jsonError(status, { code: err.code, message: err.message })
    }
    return handleApiError(err)
  }
}

export async function DELETE(_req: Request, ctx: Params): Promise<Response> {
  try {
    const { id } = await ctx.params
    const session = await requireVerifiedUser()
    const inv = await getInvitationForUser(session.user.id, id)
    await prisma.invitation.delete({ where: { id: inv.id } })
    await invalidatePublicInvitation(inv.slug)
    return jsonOk({ deleted: true })
  } catch (err) {
    if (err instanceof InvitationError) {
      const status = err.code === "NOT_FOUND" ? 404 : err.code === "FORBIDDEN" ? 403 : 422
      return jsonError(status, { code: err.code, message: err.message })
    }
    return handleApiError(err)
  }
}
