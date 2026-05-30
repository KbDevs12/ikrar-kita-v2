import type { PublicInvitationView } from "@/server/invitation/cache"
import type { TemplateId } from "@/lib/constants/invitation-templates"

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

/**
 * Fallback opening quote per template.
 *
 * Templates use this when the user did not write their own openingQuote -
 * each line is hand-written to fit the template's mood (heritage line for
 * traditional-indonesian, Quranic blessing for islamic-elegant, cinematic
 * voice for cinematic-story, etc) so the fallback never reads as a generic
 * filler.
 */
export const DEFAULT_OPENING_QUOTES: Record<TemplateId, string> = {
  "classic-elegant":
    "Sebab cinta yang sederhana, dirayakan dengan tenang, akan tetap utuh sepanjang waktu.",
  "modern-minimalist":
    "Dua orang. Satu hari. Satu janji yang ditulis dengan kata-kata kami sendiri.",
  "rustic-garden":
    "Seperti pohon yang akarnya saling melingkar di bawah tanah, kami pun bertumbuh diam-diam.",
  "luxury-gold":
    "Diiringi syukur kepada Yang Maha Pengasih, kami merangkai hari yang sudah lama kami nantikan.",
  "soft-pastel":
    "Di antara hari-hari yang berlalu cepat, kami memilih hari ini untuk berhenti dan saling berjanji.",
  "traditional-indonesian":
    "Sirih kuning bertangkai gading, kasih bersambut tak ada tandingnya. Mohon datang membawa restu.",
  "islamic-elegant":
    "Dan di antara tanda-tanda kekuasaan-Nya, Dia ciptakan untukmu pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya. — QS Ar-Rum: 21",
  "dark-romance":
    "Malam-malam paling tenang sering kali membawa kabar paling besar. Hari ini salah satunya.",
  "floral-watercolor":
    "Bunga-bunga ini kami kumpulkan satu per satu dari hari-hari yang panjang menjadi kami berdua.",
  "cinematic-story":
    "Setiap pasangan punya cerita. Ini bagian yang ingin kami bagi dengan Anda.",
}

export function getDefaultOpeningQuote(theme: string): string {
  if (theme in DEFAULT_OPENING_QUOTES) {
    return DEFAULT_OPENING_QUOTES[theme as TemplateId]
  }
  return DEFAULT_OPENING_QUOTES["classic-elegant"]
}
