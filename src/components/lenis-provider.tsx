"use client"

import { useEffect } from "react"
import Lenis from "lenis"

/**
 * Smooth-scroll wrapper for marketing pages.
 *
 * The dashboard, public invitation pages, and any in-page modal flows
 * (e.g. preview banner, gallery lightbox) are all happy with native scroll
 * because they need precise control over scroll position. Lenis is opt-in
 * and only mounted by routes that explicitly request it via this provider.
 *
 * Mounted in src/app/(marketing)/layout.tsx and src/app/page.tsx; never
 * inside dashboard/[slug]/auth layouts.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
