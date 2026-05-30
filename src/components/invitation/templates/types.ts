import type { PublicInvitationView } from "@/server/invitation/cache"

/**
 * Common props shared by every invitation template.
 *
 * Each template owns its own visual language - layout, typography, spacing,
 * accent shapes, and motion. Reusable bits live in `../sections/` but a
 * template is free to ignore them and roll its own.
 */
export interface InvitationTemplateProps {
  invitation: PublicInvitationView
  recipient: string
  /**
   * Set true when the invitation should be rendered without `?to=` audio
   * autoplay attempts (e.g. dashboard preview). Music control still appears
   * but does not trigger user-gesture-required APIs.
   */
  staticPreview?: boolean
}

/**
 * Canonical shape for the JSON `content` blob attached to every invitation.
 *
 * Every template parses its own field subset out of `invitation.content`,
 * which is typed `unknown` at the database layer. Centralising the shape
 * here means a new template only re-uses the type, and the multi-step
 * builder Zod schema in `src/lib/validators/invitation.ts` stays the source
 * of truth for what callers actually persist.
 */
export interface InvitationContent {
  schedule?: Array<{
    label: string
    startsAt: string
    endsAt?: string
    notes?: string
  }>
  groomFatherName?: string
  groomMotherName?: string
  brideFatherName?: string
  brideMotherName?: string
  coupleStory?: string
  openingQuote?: string
  galleryUrls?: string[]
  giftEnabled?: boolean
  giftAccounts?: Array<{
    bankName: string
    accountNumber: string
    accountHolder: string
  }>
  rsvpEnabled?: boolean
  guestMessageEnabled?: boolean
  mapsUrl?: string
}

/**
 * Defensive narrowing of `invitation.content`. Returns the typed view; any
 * shape mismatch falls back to an empty object so the template never crashes
 * on bad data shipped from a previous schema version.
 */
export function readContent(value: unknown): InvitationContent {
  if (!value || typeof value !== "object") return {}
  return value as InvitationContent
}
