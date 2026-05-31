import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps {
  /** Display name - used for the visible initial when no src is given. */
  name: string
  src?: string | null
  /** Tailwind size token. 8|10|12 cover most layouts. */
  size?: 8 | 10 | 12 | 14 | 16
  className?: string
}

const SIZE_MAP: Record<NonNullable<AvatarProps["size"]>, string> = {
  8: "h-8 w-8 text-xs",
  10: "h-10 w-10 text-sm",
  12: "h-12 w-12 text-base",
  14: "h-14 w-14 text-lg",
  16: "h-16 w-16 text-xl",
}

/**
 * Initial-only avatar in the brand rose tone. Deliberately not the
 * SaaS-standard round photo - this product is about wedding sites where the
 * couple's photos belong on the templates, not in the dashboard chrome.
 */
export function Avatar({ name, src, size = 10, className }: AvatarProps) {
  const initial = (name?.trim()?.charAt(0) ?? "?").toUpperCase()
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-rose-100 font-medium text-rose-700",
        SIZE_MAP[size],
        className
      )}
      aria-hidden={Boolean(src)}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        initial
      )}
    </span>
  )
}
