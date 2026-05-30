import { FloralCorner } from "@/components/auth/floral-corner"

/**
 * Two-column auth shell. The card sits on the right; the left side carries
 * decorative type and a soft botanical SVG so the form never feels centred
 * and isolated. On mobile the type collapses to a slim header above the
 * card.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50">
      <FloralCorner className="pointer-events-none absolute -left-12 -top-16 h-72 w-72 rotate-[-12deg] text-rose-200/70" />
      <FloralCorner className="pointer-events-none absolute -bottom-24 -right-12 h-80 w-80 rotate-[170deg] text-rose-200/60" />
      {children}
    </div>
  )
}
