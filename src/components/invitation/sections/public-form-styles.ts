/**
 * Tone-aware class strings for the public RSVP and guest-message forms.
 *
 * Each invitation template carries its own visual language, but the input
 * controls inside its forms must (a) stay readable on whatever ground the
 * template chose, and (b) not break the typographic rhythm.
 *
 * We keep the colour decisions here so the templates only have to pass
 * `tone="light"` or `tone="dark"` and an `accent` colour. No ad-hoc class
 * juggling inside the form components.
 */
export type FormTone = "light" | "dark"

export interface ToneClasses {
  field: string
  label: string
  error: string
  okBubble: string
  errorBubble: string
  helper: string
  divider: string
  cardBg: string
}

export function toneClasses(tone: FormTone): ToneClasses {
  if (tone === "dark") {
    return {
      field:
        "w-full rounded-md border border-white/20 bg-white/[0.04] px-3 py-2.5 text-sm text-current placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30",
      label: "text-xs uppercase tracking-[0.32em] text-current/70",
      error: "mt-1.5 text-xs text-rose-300",
      okBubble: "rounded-md bg-white/10 px-3 py-2 text-xs text-current/90",
      errorBubble: "rounded-md bg-rose-500/15 px-3 py-2 text-xs text-rose-200",
      helper: "mt-1 text-[11px] text-current/55",
      divider: "border-white/10",
      cardBg: "bg-white/[0.03]",
    }
  }
  return {
    field:
      "w-full rounded-md border border-current/20 bg-white/70 px-3 py-2.5 text-sm text-current placeholder:text-current/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30",
    label: "text-xs uppercase tracking-[0.32em] text-current/70",
    error: "mt-1.5 text-xs text-rose-700",
    okBubble: "rounded-md bg-current/5 px-3 py-2 text-xs text-current/90",
    errorBubble: "rounded-md bg-rose-100 px-3 py-2 text-xs text-rose-700",
    helper: "mt-1 text-[11px] text-current/55",
    divider: "border-current/15",
    cardBg: "bg-white/60",
  }
}
