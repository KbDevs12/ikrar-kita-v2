import { cn } from "@/lib/utils"

/**
 * Loading skeleton in rose-100 tone, intended for dashboard/admin tables
 * while data is in flight. Uses an inline keyframe via Tailwind's animate
 * utility so we do not need extra global CSS.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-rose-100/70", className)}
      {...props}
    />
  )
}
