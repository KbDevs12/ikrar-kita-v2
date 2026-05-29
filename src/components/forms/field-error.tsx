"use client"

import { cn } from "@/lib/utils"

interface FieldErrorProps {
  /**
   * Accepts the shapes TanStack Form / our custom validators commonly
   * return: a single string, an array of strings, `null`, `undefined`, or
   * the literal `false` (some validator types in TanStack Form widen to
   * include `false` as a "no error" marker). All falsy variants render
   * nothing, mirroring the runtime check below.
   */
  message?: string | string[] | null | false
  className?: string
}

/**
 * Inline error message under a form field. Renders nothing when there is
 * no error so layout shifts are minimal.
 */
export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null
  const text = Array.isArray(message) ? message[0] : message
  if (!text) return null
  return (
    <p className={cn("mt-1.5 text-xs text-destructive", className)} role="alert">
      {text}
    </p>
  )
}
