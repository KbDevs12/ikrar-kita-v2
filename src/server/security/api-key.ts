/**
 * Internal API key + cron secret guards.
 *
 * - Server-only. Never imported from client components.
 * - Uses crypto.timingSafeEqual to avoid leaking key length / position via
 *   timing differences.
 * - Returns generic 'Unauthorized' - never reveals whether the header was
 *   missing, malformed, or simply wrong.
 */
import "server-only"
import { timingSafeEqual } from "node:crypto"
import { getServerEnv } from "@/lib/env"

const BEARER_PREFIX = "Bearer "
const HEADER_NAMES = {
  authorization: "authorization",
  internalApiKey: "x-internal-api-key",
  cronSecret: "x-cron-secret",
} as const

/**
 * Constant-time comparison that handles unequal-length inputs without
 * revealing the difference. Both sides are encoded as UTF-8 bytes.
 */
function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8")
  const bBuf = Buffer.from(b, "utf8")
  if (aBuf.length !== bBuf.length) {
    // Still do a comparison against itself to keep timing similar for
    // attackers that supply mismatched lengths.
    timingSafeEqual(aBuf, aBuf)
    return false
  }
  return timingSafeEqual(aBuf, bBuf)
}

function readHeader(req: Request, name: string): string | null {
  const v = req.headers.get(name)
  return v && v.length > 0 ? v : null
}

function readToken(req: Request): string | null {
  const auth = readHeader(req, HEADER_NAMES.authorization)
  if (auth?.startsWith(BEARER_PREFIX)) {
    const token = auth.slice(BEARER_PREFIX.length).trim()
    if (token) return token
  }
  return readHeader(req, HEADER_NAMES.internalApiKey)
}

export function getInternalApiKey(): string {
  return getServerEnv().INTERNAL_API_KEY
}

export function verifyInternalApiKey(req: Request): boolean {
  const provided = readToken(req)
  if (!provided) return false
  const expected = getInternalApiKey()
  return safeEqual(provided, expected)
}

/**
 * Throws a `Response`-shaped error for the route handler to bubble up.
 * Use in a try/catch or simply `if (!verify...) return new Response(...)`.
 */
export function requireInternalApiKey(req: Request): void {
  if (!verifyInternalApiKey(req)) {
    throw new UnauthorizedError()
  }
}

export function verifyCronSecret(req: Request): boolean {
  // Cron jobs may use either dedicated header or Bearer token.
  const expected = getServerEnv().CRON_SECRET
  const fromBearer = (() => {
    const auth = readHeader(req, HEADER_NAMES.authorization)
    if (auth?.startsWith(BEARER_PREFIX)) return auth.slice(BEARER_PREFIX.length).trim()
    return null
  })()
  const fromHeader = readHeader(req, HEADER_NAMES.cronSecret)
  const provided = fromBearer ?? fromHeader
  if (!provided) return false
  return safeEqual(provided, expected)
}

export function requireCronSecret(req: Request): void {
  if (!verifyCronSecret(req)) {
    throw new UnauthorizedError()
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "UnauthorizedError"
  }
}

/**
 * Convenience helper: convert UnauthorizedError to a 401 JSON response.
 * Other errors bubble up as 500 to the framework.
 */
export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  })
}
