/**
 * Registry of the 30 invitation templates.
 *
 * Each entry describes the visual identity that the React component
 * implementation must respect. The actual templates live under
 * src/components/invitation/templates/<id>.tsx.
 *
 * Tests assert that this registry stays in sync with the on-disk components
 * and that all templates exist.
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
  | "javanese-royal"
  | "sundanese-nature"
  | "balinese-temple"
  | "minang-adat"
  | "betawi-festive"
  | "spring-garden"
  | "autumn-warmth"
  | "beach-sunset"
  | "nordic-winter"
  | "art-deco"
  | "bohemian-dream"
  | "waterfront-blue"
  | "royal-purple"
  | "cherry-blossom"
  | "desert-rose"
  | "vintage-lace"
  | "tropical-paradise"
  | "celestial-night"
  | "marble-luxe"
  | "folk-art"

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
  {
    id: "javanese-royal",
    name: "Javanese Royal",
    shortDescription: "Coklat keraton, emas, dan motif parang rusak tipis — keagungan Jawa modern.",
    defaultPrimaryColor: "#c8a35a",
    vibe: "regal-heritage",
    category: "cultural",
  },
  {
    id: "sundanese-nature",
    name: "Sundanese Nature",
    shortDescription: "Hijau bambu dan terracotta dengan ilustrasi daun hanjuang yang tenang.",
    defaultPrimaryColor: "#4a6741",
    vibe: "calm-botanical",
    category: "cultural",
  },
  {
    id: "balinese-temple",
    name: "Balinese Temple",
    shortDescription: "Oranye hangat, ornamen pura, dan bunga kamboja yang spiritual.",
    defaultPrimaryColor: "#d4631a",
    vibe: "warm-spiritual",
    category: "cultural",
  },
  {
    id: "minang-adat",
    name: "Minang Adat",
    shortDescription: "Merah dan emas dengan gonjong rumah gadang — adat Minangkabau yang kuat.",
    defaultPrimaryColor: "#8b1a1a",
    vibe: "bold-heritage",
    category: "cultural",
  },
  {
    id: "betawi-festive",
    name: "Betawi Festive",
    shortDescription: "Merah hijau emas meriah dengan siluet ondel-ondel khas Betawi.",
    defaultPrimaryColor: "#c41e1e",
    vibe: "festive-folk",
    category: "cultural",
  },
  {
    id: "spring-garden",
    name: "Spring Garden",
    shortDescription: "Sage dan blush dengan ilustrasi sakura dan tulip — segar dan feminin.",
    defaultPrimaryColor: "#7a9e7e",
    vibe: "fresh-feminine",
    category: "feminine",
  },
  {
    id: "autumn-warmth",
    name: "Autumn Warmth",
    shortDescription: "Burnt orange dan coklat dengan daun maple — kehangatan musim gugur.",
    defaultPrimaryColor: "#c4622d",
    vibe: "warm-intimate",
    category: "outdoor",
  },
  {
    id: "beach-sunset",
    name: "Beach Sunset",
    shortDescription: "Coral dan teal dengan siluet ombak — pernikahan pantai yang santai.",
    defaultPrimaryColor: "#e8734a",
    vibe: "breezy-tropical",
    category: "outdoor",
  },
  {
    id: "nordic-winter",
    name: "Nordic Winter",
    shortDescription: "Biru es, putih, dan kristal salju — minimalis Skandinavia yang bersih.",
    defaultPrimaryColor: "#6b7b8b",
    vibe: "minimal-cool",
    category: "modern",
  },
  {
    id: "art-deco",
    name: "Art Deco",
    shortDescription: "Emas dan hitam dengan garis geometri dan sinar matahari era 1920an.",
    defaultPrimaryColor: "#c8a35a",
    vibe: "gilded-deco",
    category: "premium",
  },
  {
    id: "bohemian-dream",
    name: "Bohemian Dream",
    shortDescription: "Terracotta dan dusty rose dengan dreamcatcher dan bulan sabit, bebas dan artistik.",
    defaultPrimaryColor: "#c4622d",
    vibe: "boho-artistic",
    category: "feminine",
  },
  {
    id: "waterfront-blue",
    name: "Waterfront Blue",
    shortDescription: "Navy dan biru langit dengan gelombang laut halus — elegan tepi laut.",
    defaultPrimaryColor: "#1a2a4a",
    vibe: "nautical-elegant",
    category: "modern",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    shortDescription: "Ungu tua dan emas dengan fleur-de-lis — kemewahan kerajaan Eropa.",
    defaultPrimaryColor: "#4a1a6b",
    vibe: "regal-luxe",
    category: "premium",
  },
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    shortDescription: "Pink dan kayu dengan cabang sakura — romantis Jepang yang puitis.",
    defaultPrimaryColor: "#c25e7a",
    vibe: "poetic-soft",
    category: "soft",
  },
  {
    id: "desert-rose",
    name: "Desert Rose",
    shortDescription: "Terracotta dan dusty pink dengan kaktus — pernikahan gurun yang earthy.",
    defaultPrimaryColor: "#c4622d",
    vibe: "earthy-warm",
    category: "outdoor",
  },
  {
    id: "vintage-lace",
    name: "Vintage Lace",
    shortDescription: "Gading dan blush dengan pola renda — vintage romantic seperti undangan antik.",
    defaultPrimaryColor: "#b08d57",
    vibe: "vintage-romantic",
    category: "formal",
  },
  {
    id: "tropical-paradise",
    name: "Tropical Paradise",
    shortDescription: "Hijau tropis dan kuning cerah dengan daun monstera — ceria dan berwarna.",
    defaultPrimaryColor: "#2a6b4a",
    vibe: "vibrant-tropical",
    category: "outdoor",
  },
  {
    id: "celestial-night",
    name: "Celestial Night",
    shortDescription: "Midnight dan emas dengan bintang dan konstelasi — malam yang magis.",
    defaultPrimaryColor: "#c8a35a",
    vibe: "magical-moody",
    category: "moody",
  },
  {
    id: "marble-luxe",
    name: "Marble Luxe",
    shortDescription: "Marmer putih dengan venasi halus dan garis emas — kemewahan modern bersih.",
    defaultPrimaryColor: "#c8a35a",
    vibe: "clean-luxe",
    category: "premium",
  },
  {
    id: "folk-art",
    name: "Folk Art",
    shortDescription: "Merah biru kuning dengan ilustrasi bunga dan burung bergaya Skandinavia.",
    defaultPrimaryColor: "#c41e1e",
    vibe: "playful-handcrafted",
    category: "feminine",
  },
] as const

export const TEMPLATE_IDS: readonly TemplateId[] = INVITATION_TEMPLATES.map((t) => t.id)

export function getTemplate(id: string): InvitationTemplate | undefined {
  return INVITATION_TEMPLATES.find((t) => t.id === id)
}

export function isValidTemplateId(id: string): id is TemplateId {
  return TEMPLATE_IDS.includes(id as TemplateId)
}
