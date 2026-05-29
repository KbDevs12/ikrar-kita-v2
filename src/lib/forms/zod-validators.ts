/**
 * Adapter helpers between Zod and TanStack Form.
 *
 * TanStack Form expects validator functions of shape:
 *   ({ value }) => string | undefined
 * for sync validation, and the same returning Promise for async.
 *
 * We use Zod schemas as the source of truth and translate parse errors
 * to either:
 *   - first-issue string (for field-level)
 *   - record of fieldPath -> messages (for form-level)
 */
import type { ZodError, ZodTypeAny, z } from "zod"

export interface FieldValidatorContext<T> {
  value: T
}

/**
 * Per-field validator. Returns the first issue's message or undefined when ok.
 */
export function zodFieldValidator<S extends ZodTypeAny>(schema: S) {
  return ({ value }: FieldValidatorContext<z.infer<S>>): string | undefined => {
    const result = schema.safeParse(value)
    if (result.success) return undefined
    return result.error.issues[0]?.message
  }
}

/**
 * Form-level validator. Returns a string (first error) or undefined.
 * For multi-field error mapping, prefer `flattenZodErrors` on the server.
 */
export function zodFormValidator<S extends ZodTypeAny>(schema: S) {
  return ({ value }: FieldValidatorContext<z.infer<S>>): string | undefined => {
    const result = schema.safeParse(value)
    if (result.success) return undefined
    return result.error.issues[0]?.message ?? "Periksa kembali isian Anda."
  }
}

/**
 * Convert a ZodError into the same `{ field: [messages] }` shape that the
 * server returns from `handleApiError`. Useful when both client and server
 * surface field-level errors and the form needs to merge them.
 */
export function flattenZodErrors(err: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of err.issues) {
    const path = issue.path.join(".")
    const list = out[path] ?? []
    list.push(issue.message)
    out[path] = list
  }
  return out
}
