/**
 * JSON response helpers.
 *
 * Keeps route handlers tiny and consistent. Errors are mapped to safe
 * messages - we never echo Zod stack traces or Prisma internals to clients.
 */
import "server-only"
import { ZodError } from "zod"
import { HttpError } from "@/server/auth/guards"
import { UnauthorizedError } from "@/server/security/api-key"

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ ok: true, data }, { status: 200, ...init })
}

export function jsonCreated<T>(data: T): Response {
  return Response.json({ ok: true, data }, { status: 201 })
}

export interface ApiError {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
}

export function jsonError(status: number, error: ApiError): Response {
  return Response.json({ ok: false, error }, { status })
}

/**
 * Convert any thrown error into a safe JSON response.
 *
 * Order matters - check the typed errors first, then fall back to a generic
 * 500 that does NOT include the underlying message.
 */
export function handleApiError(err: unknown): Response {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of err.issues) {
      const path = issue.path.join(".")
      const list = fieldErrors[path] ?? []
      list.push(issue.message)
      fieldErrors[path] = list
    }
    return jsonError(422, {
      code: "VALIDATION_ERROR",
      message: "Periksa kembali isian Anda.",
      fieldErrors,
    })
  }

  if (err instanceof UnauthorizedError) {
    return jsonError(401, { code: "UNAUTHORIZED", message: "Unauthorized" })
  }

  if (err instanceof HttpError) {
    return jsonError(err.status, {
      code:
        err.status === 401 ? "UNAUTHORIZED" : err.status === 403 ? "FORBIDDEN" : "ERROR",
      message: err.message,
    })
  }

  // Don't leak internals.
  console.error("[api] unhandled error:", err)
  return jsonError(500, {
    code: "INTERNAL_ERROR",
    message: "Terjadi kesalahan. Silakan coba lagi.",
  })
}
