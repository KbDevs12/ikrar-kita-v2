/**
 * Registry of the 10 invitation templates.
 *
 * Each entry describes the visual identity that the React component
 * implementation must respect. The actual templates live under
 * src/components/invitation/templates/<id>/.
 *
 * Tests assert that this registry stays in sync with the on-disk components
 * and that all 10 templates exist.
 */

export type TemplateId =
  | "classic-elegant"
  | "modern-minimalist"
  | "rustic-garden"
  | "luxury-gold"
  | "soft-pastel"
  | "traditional-indonesian"
  | "islamic-elegant"
  | "dark-romance"
  | "floral-watercolor"
  | "cinematic-story"

export interface InvitationTemplate {
  id: TemplateId
  name: string
  shortDescription: string
  defaultPrimaryColor: string
  vibe: string
  category: "formal" | "modern" | "outdoor" | "premium" | "soft" | "cultural" | "religious" | "moody" | "feminine" | "narrative"
}

export const INVITATION_TEMPLATES: readonly InvitationTemplate[] = [
  {
    id: "classic-elegant",
    name: "Classic Elegant",
    shortDescription: "Serif klasik, palet ivory dan emas tua, terasa formal namun hangat.",
    defaultPrimaryColor: "#8a6a3b",
    vibe: "formal-warm",
    category: "formal",
  },
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    shortDescription: "Whitespace luas, tipografi bersih, satu aksen warna lembut.",
    defaultPrimaryColor: "#2f3437",
    vibe: "calm-architectural",
    category: "modern",
  },
  {
    id: "rustic-garden",
    name: "Rustic Garden",
    shortDescription: "Nuansa kebun, daun zaitun, kertas tekstur, cocok untuk garden party.",
    defaultPrimaryColor: "#577d52",
    vibe: "earthy-botanical",
    category: "outdoor",
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    shortDescription: "Hitam pekat dengan aksen emas, animasi halus untuk acara ballroom.",
    defaultPrimaryColor: "#c8a25b",
    vibe: "bold-premium",
    category: "premium",
  },
  {
    id: "soft-pastel",
    name: "Soft Pastel",
    shortDescription: "Pastel peach dan lilac, lembut, cocok untuk intimate wedding.",
    defaultPrimaryColor: "#e8b4a8",
    vibe: "intimate-soft",
    category: "soft",
  },
  {
    id: "traditional-indonesian",
    name: "Traditional Indonesian",
    shortDescription: "Motif batik halus, palet maroon dan gading, bukan dekorasi norak.",
    defaultPrimaryColor: "#7a2326",
    vibe: "heritage-modern",
    category: "cultural",
  },
  {
    id: "islamic-elegant",
    name: "Islamic Elegant",
    shortDescription: "Ornamen geometri Islami tipis, ruang untuk ayat dan doa.",
    defaultPrimaryColor: "#264a3a",
    vibe: "serene-spiritual",
    category: "religious",
  },
  {
    id: "dark-romance",
    name: "Dark Romance",
    shortDescription: "Gelap mendalam, kontras tinggi, cocok untuk resepsi malam indoor.",
    defaultPrimaryColor: "#1a1410",
    vibe: "moody-cinematic",
    category: "moody",
  },
  {
    id: "floral-watercolor",
    name: "Floral Watercolor",
    shortDescription: "Ilustrasi bunga watercolor lembut, feminin, romantis.",
    defaultPrimaryColor: "#b65538",
    vibe: "feminine-painterly",
    category: "feminine",
  },
  {
    id: "cinematic-story",
    name: "Cinematic Story",
    shortDescription: "Hero visual besar, transisi seperti film pendek, fokus storytelling.",
    defaultPrimaryColor: "#0e0c08",
    vibe: "story-led",
    category: "narrative",
  },
] as const

export const TEMPLATE_IDS: readonly TemplateId[] = INVITATION_TEMPLATES.map((t) => t.id)

export function getTemplate(id: string): InvitationTemplate | undefined {
  return INVITATION_TEMPLATES.find((t) => t.id === id)
}

export function isValidTemplateId(id: string): id is TemplateId {
  return TEMPLATE_IDS.includes(id as TemplateId)
}
