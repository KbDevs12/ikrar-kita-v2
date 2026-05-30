"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Brand button. Pill-shaped to match the soft / floral identity.
 * Anchored on rose-500 / rose-200 / stone-200 - no gradient, no drop shadow,
 * no token salad. Variants are deliberately few:
 *   - primary  rose fill, used for the single action that matters per screen
 *   - outline  rose hairline, secondary intent
 *   - ghost    no chrome, used inline
 *   - quiet    stone fill for admin / data-dense screens that shouldn't pop
 *   - link     literal anchor styling
 *   - danger   used only for destructive confirmations
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-rose-500 text-white hover:bg-rose-600",
        outline:
          "border border-rose-200 text-stone-900 hover:bg-rose-50",
        ghost: "text-stone-700 hover:bg-rose-50 hover:text-stone-900",
        quiet: "bg-stone-100 text-stone-900 hover:bg-stone-200",
        link: "h-auto rounded-none px-0 text-rose-500 underline-offset-4 hover:underline",
        danger: "bg-stone-900 text-white hover:bg-stone-800",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
