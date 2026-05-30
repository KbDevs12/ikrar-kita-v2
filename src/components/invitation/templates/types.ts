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
  "javanese-royal":
    "Sinambungan tresna ingkang luhur, kawiwitan saking pangestu. Sugeng rawuh ngestreni dhauping putra-putri kami.",
  "sundanese-nature":
    "Sapertos cai nu ngalir tina hulu ka muara, kanyaah kami tumuwuh lirih dina sapoé-poé.",
  "balinese-temple":
    "Om Swastiastu. Atas asung kerta wara nugraha Ida Sang Hyang Widhi Wasa, kami menyatukan dua hati dalam satu rasa.",
  "minang-adat":
    "Adat basandi syarak, syarak basandi Kitabullah. Dengan iringan doa, kami menjalin dua kaum menjadi satu ikatan.",
  "betawi-festive":
    "Dari Betawi yang hangat dan rame, kami ngundang abang none sekalian buat ngerayain hari bahagia kami.",
  "spring-garden":
    "Seperti taman yang merekah pelan di awal musim, kami pun mekar bersama dalam hari yang kami nantikan.",
  "autumn-warmth":
    "Di antara daun yang berguguran, kami menemukan kehangatan yang tetap tinggal — dan memilih untuk merawatnya selamanya.",
  "beach-sunset":
    "Di tepi laut tempat langit dan ombak bertemu, kami menulis janji yang dibawa angin ke seluruh penjuru.",
  "nordic-winter":
    "Dalam tenangnya musim dingin, satu janji yang sederhana terasa paling jernih. Hari ini kami ucapkan.",
  "art-deco":
    "Dengan gemerlap yang dirancang sederhana namun anggun, kami merayakan satu malam yang akan kami kenang.",
  "bohemian-dream":
    "Kami memilih jalan kami sendiri, bebas dan apa adanya — dan di ujungnya, kami memilih satu sama lain.",
  "waterfront-blue":
    "Seperti air yang selalu menemukan jalan pulang ke laut, kami menemukan jalan pulang pada satu sama lain.",
  "royal-purple":
    "Dengan rasa syukur dan kehormatan, kami mengundang Anda menyaksikan dua hati dipersatukan dalam janji yang agung.",
  "cherry-blossom":
    "Bagai kelopak sakura yang jatuh perlahan, hari-hari membawa kami pada satu musim yang kami nantikan bersama.",
  "desert-rose":
    "Di tanah yang gersang pun mawar tetap mekar. Begitu pula kasih kami — tumbuh sabar, mekar pada waktunya.",
  "vintage-lace":
    "Dengan kelembutan masa lampau yang kami rindukan, kami merangkai hari ini menjadi kenangan yang abadi.",
  "tropical-paradise":
    "Di bawah langit tropis yang cerah, kami merayakan cinta yang tumbuh subur dan penuh warna.",
  "celestial-night":
    "Di antara jutaan bintang, kami menemukan satu sama lain — dan memilih untuk berjalan di bawah langit yang sama.",
  "marble-luxe":
    "Dalam kesederhanaan yang ditata dengan teliti, kami menemukan keindahan yang ingin kami jaga selamanya.",
  "folk-art":
    "Dari hal-hal kecil yang dibuat dengan tangan dan hati, kami merangkai kisah sederhana yang ingin kami bagi.",
}

export function getDefaultOpeningQuote(theme: string): string {
  if (theme in DEFAULT_OPENING_QUOTES) {
    return DEFAULT_OPENING_QUOTES[theme as TemplateId]
  }
  return DEFAULT_OPENING_QUOTES["classic-elegant"]
}
