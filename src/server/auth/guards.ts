/**
 * Auth guards used by server actions, route handlers, and server components.
 *
 * Each guard either returns the resolved session or throws an HttpError that
 * the route handler converts to a Response. Server components use the
 * redirect-throwing variants so the user is bounced to /login or /verify-email.
 */
import "server-only"
import { redirect } from "next/navigation"
import { getSession, type ResolvedSession } from "./session"
import { Role } from "@prisma/client"

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "HttpError"
  }
}

/**
 * Throw if not signed in. Used by API routes / server actions.
 */
export async function requireSession(): Promise<ResolvedSession> {
  const session = await getSession()
  if (!session) throw new HttpError(401, "Unauthorized")
  return session
}

/**
 * Redirect to /login if not signed in. Used by server components.
 */
export async function requireSessionOrRedirect(
  redirectTo = "/login"
): Promise<ResolvedSession> {
  const session = await getSession()
  if (!session) redirect(redirectTo)
  return session
}

/**
 * Throw 403 if email is not verified. Used by feature endpoints.
 *
 * Per spec: unverified users may sign in but are locked from creating /
 * editing / publishing invitations, uploading media, and checking out.
 */
export async function requireVerifiedUser(): Promise<ResolvedSession> {
  const session = await requireSession()
  if (session.user.emailVerifiedAt === null) {
    throw new HttpError(403, "Email belum diverifikasi")
  }
  return session
}

/**
 * Redirect unverified users to the verify-email screen.
 */
export async function requireVerifiedUserOrRedirect(): Promise<ResolvedSession> {
  const session = await requireSessionOrRedirect()
  if (session.user.emailVerifiedAt === null) {
    redirect("/verify-email/pending")
  }
  return session
}

/**
 * Throw 403 if the user is not an admin.
 */
export async function requireAdmin(): Promise<ResolvedSession> {
  const session = await requireSession()
  if (session.user.role !== Role.ADMIN) {
    throw new HttpError(403, "Forbidden")
  }
  return session
}

export async function requireAdminOrRedirect(): Promise<ResolvedSession> {
  const session = await requireSessionOrRedirect()
  if (session.user.role !== Role.ADMIN) redirect("/dashboard")
  return session
}
