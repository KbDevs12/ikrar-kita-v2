import "server-only"
import { clearSessionCookie, destroySession, getSession } from "@/server/auth/session"
import { jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(): Promise<Response> {
  const session = await getSession()
  if (session) {
    await destroySession(session.sessionId)
  }
  await clearSessionCookie()
  return jsonOk({ ok: true })
}
