import "server-only"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Lightweight health check used by Docker/Kubernetes/Nginx.
 *
 * Intentionally does NOT touch Postgres or Redis - those failures are
 * expected to be reported by their own healthchecks. The point of this
 * endpoint is "is the Next.js process alive and serving?".
 */
export async function GET(): Promise<Response> {
  return Response.json({ ok: true, ts: Date.now() })
}
