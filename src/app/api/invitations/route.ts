import "server-only"
import { requireVerifiedUser } from "@/server/auth/guards"
import {
  InvitationError,
  createInvitation,
  listInvitationsForUser,
} from "@/server/invitation/invitation-service"
import { handleApiError, jsonCreated, jsonError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(): Promise<Response> {
  try {
    const session = await requireVerifiedUser()
    const items = await listInvitationsForUser(session.user.id)
    return jsonOk({
      items: items.map((i) => ({
        id: i.id,
        slug: i.slug,
        status: i.status,
        title: i.title,
        groomName: i.groomName,
        brideName: i.brideName,
        eventDate: i.eventDate,
        theme: i.theme,
        coverImageUrl: i.coverImageUrl,
        publishedAt: i.publishedAt,
        updatedAt: i.updatedAt,
      })),
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await requireVerifiedUser()
    const body = await req.json().catch(() => null)
    if (!body) return jsonError(400, { code: "BAD_REQUEST", message: "Body tidak valid" })

    const created = await createInvitation(session.user, body)
    return jsonCreated({ invitation: { id: created.id, slug: created.slug, status: created.status } })
  } catch (err) {
    if (err instanceof InvitationError) {
      const status = err.code === "SLUG_TAKEN" ? 409 : err.code === "FORBIDDEN" ? 403 : 422
      return jsonError(status, { code: err.code, message: err.message })
    }
    return handleApiError(err)
  }
}
