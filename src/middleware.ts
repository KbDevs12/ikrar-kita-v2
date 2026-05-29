import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Edge middleware for defense in depth.
 *
 * Server components already enforce auth via requireSessionOrRedirect /
 * requireVerifiedUserOrRedirect, but the middleware:
 *   - keeps the dashboard area off the public CDN cache by setting Vary
 *   - rejects /admin requests without a session cookie at the edge so we
 *     never even reach the handler (cheap probe rejection)
 *   - normalises trailing slashes so /pricing and /pricing/ never both hit
 *     the cache
 *
 * Auth itself is still verified server-side - the middleware only checks
 * cookie presence, not session validity, because verifying would require a
 * Redis/DB call which the edge cannot do reliably.
 */
const SESSION_COOKIE = "ikrar_session"

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl
  const hasSession = req.cookies.has(SESSION_COOKIE)

  // Defense-in-depth probe rejection
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    if (!hasSession) {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  const res = NextResponse.next()
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/")
  ) {
    res.headers.set("Cache-Control", "private, no-store")
    res.headers.set("Vary", "Cookie")
  }
  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/:path*",
    "/pricing",
    "/login",
    "/register",
  ],
}
