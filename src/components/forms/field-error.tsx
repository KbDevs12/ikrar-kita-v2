"use client"

import { cn } from "@/lib/utils"

interface FieldErrorProps {
  message?: string | string[] | null
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
