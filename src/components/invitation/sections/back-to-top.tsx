"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackToTopProps {
  /** Pixel threshold before the floating button shows up. */
  threshold?: number
  /** Tailwind tone override - defaults to white/stone for soft templates. */
  tone?: "light" | "dark"
  className?: string
}

/**
 * Floating "back to top" pill. Renders a static anchor for users without JS,
 * upgrades to a smooth-scroll button after hydration. Templates are
 * encouraged to also expose an inline link in their closing footer for
 * users on desktop who don't move the mouse to the bottom corner.
 */
export function BackToTop({ threshold = 600, tone = "light", className }: BackToTopProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Kembali ke atas"
      className={cn(
        "fixed bottom-5 right-5 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full shadow-md transition hover:-translate-y-0.5",
        tone === "dark"
          ? "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur"
          : "bg-white text-stone-900 ring-1 ring-stone-200",
        className
      )}
    >
      <ArrowUp className="h-4 w-4" aria-hidden />
    </button>
  )
}
