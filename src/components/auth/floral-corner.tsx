/**
 * Hand-drawn-feel floral spray for the auth corners.
 *
 * Single-colour line art so the parent can tint via `text-rose-200` and the
 * fill stays inert. Kept inline (no imported asset) so we don't ship an
 * extra HTTP round-trip for what is fundamentally decoration.
 */
export function FloralCorner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      aria-hidden
    >
      <path d="M100 30 C 70 60, 60 100, 80 150" />
      <path d="M100 30 C 130 60, 140 100, 120 150" />
      <ellipse cx="80" cy="60" rx="14" ry="6" transform="rotate(-30 80 60)" />
      <ellipse cx="120" cy="60" rx="14" ry="6" transform="rotate(30 120 60)" />
      <ellipse cx="70" cy="95" rx="12" ry="5" transform="rotate(-50 70 95)" />
      <ellipse cx="130" cy="95" rx="12" ry="5" transform="rotate(50 130 95)" />
      <ellipse cx="60" cy="135" rx="10" ry="4" transform="rotate(-65 60 135)" />
      <ellipse cx="140" cy="135" rx="10" ry="4" transform="rotate(65 140 135)" />
      <circle cx="100" cy="35" r="6" />
      <circle cx="100" cy="35" r="2" fill="currentColor" />
      <circle cx="105" cy="170" r="4" />
      <circle cx="95" cy="170" r="3" />
    </svg>
  )
}
