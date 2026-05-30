import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      tone: {
        rose: "bg-rose-100 text-rose-700",
        sage: "bg-emerald-100 text-emerald-800",
        stone: "bg-stone-100 text-stone-700",
        amber: "bg-amber-100 text-amber-800",
        ink: "bg-stone-900 text-white",
        outline: "border border-rose-200 text-rose-600",
      },
    },
    defaultVariants: { tone: "rose" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
