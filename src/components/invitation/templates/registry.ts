/**
 * Map a TemplateId from the registry to its actual React component.
 *
 * Every template is registered as a `dynamic` import so the public invitation
 * page only ships the bytes for the chosen theme - 30 themes never end up in
 * one bundle.
 */
import dynamic from "next/dynamic"
import type { ComponentType } from "react"
import type { TemplateId } from "@/lib/constants/invitation-templates"
import type { InvitationTemplateProps } from "./types"

// Use dynamic imports so each template is its own chunk - public invitation
// page only ships the bytes for the chosen theme.
const ClassicElegant = dynamic(() => import("./classic-elegant").then((m) => m.ClassicElegant))
const ModernMinimalist = dynamic(() =>
  import("./modern-minimalist").then((m) => m.ModernMinimalist)
)
const SoftPastel = dynamic(() => import("./soft-pastel").then((m) => m.SoftPastel))
const RusticGarden = dynamic(() => import("./rustic-garden").then((m) => m.RusticGarden))
const LuxuryGold = dynamic(() => import("./luxury-gold").then((m) => m.LuxuryGold))
const TraditionalIndonesian = dynamic(() =>
  import("./traditional-indonesian").then((m) => m.TraditionalIndonesian)
)
const IslamicElegant = dynamic(() =>
  import("./islamic-elegant").then((m) => m.IslamicElegant)
)
const DarkRomance = dynamic(() => import("./dark-romance").then((m) => m.DarkRomance))
const FloralWatercolor = dynamic(() =>
  import("./floral-watercolor").then((m) => m.FloralWatercolor)
)
const CinematicStory = dynamic(() =>
  import("./cinematic-story").then((m) => m.CinematicStory)
)

// ─── 20 additional bespoke templates ─────────────────────────────────────────
const JavaneseRoyal = dynamic(() => import("./javanese-royal").then((m) => m.JavaneseRoyal))
const SundaneseNature = dynamic(() =>
  import("./sundanese-nature").then((m) => m.SundaneseNature)
)
const BalineseTemple = dynamic(() =>
  import("./balinese-temple").then((m) => m.BalineseTemple)
)
const MinangAdat = dynamic(() => import("./minang-adat").then((m) => m.MinangAdat))
const BetawiFestive = dynamic(() => import("./betawi-festive").then((m) => m.BetawiFestive))
const SpringGarden = dynamic(() => import("./spring-garden").then((m) => m.SpringGarden))
const AutumnWarmth = dynamic(() => import("./autumn-warmth").then((m) => m.AutumnWarmth))
const BeachSunset = dynamic(() => import("./beach-sunset").then((m) => m.BeachSunset))
const NordicWinter = dynamic(() => import("./nordic-winter").then((m) => m.NordicWinter))
const ArtDeco = dynamic(() => import("./art-deco").then((m) => m.ArtDeco))
const BohemianDream = dynamic(() => import("./bohemian-dream").then((m) => m.BohemianDream))
const WaterfrontBlue = dynamic(() =>
  import("./waterfront-blue").then((m) => m.WaterfrontBlue)
)
const RoyalPurple = dynamic(() => import("./royal-purple").then((m) => m.RoyalPurple))
const CherryBlossom = dynamic(() => import("./cherry-blossom").then((m) => m.CherryBlossom))
const DesertRose = dynamic(() => import("./desert-rose").then((m) => m.DesertRose))
const VintageLace = dynamic(() => import("./vintage-lace").then((m) => m.VintageLace))
const TropicalParadise = dynamic(() =>
  import("./tropical-paradise").then((m) => m.TropicalParadise)
)
const CelestialNight = dynamic(() =>
  import("./celestial-night").then((m) => m.CelestialNight)
)
const MarbleLuxe = dynamic(() => import("./marble-luxe").then((m) => m.MarbleLuxe))
const FolkArt = dynamic(() => import("./folk-art").then((m) => m.FolkArt))

const REGISTRY: Record<TemplateId, ComponentType<InvitationTemplateProps>> = {
  "classic-elegant": ClassicElegant,
  "modern-minimalist": ModernMinimalist,
  "rustic-garden": RusticGarden,
  "luxury-gold": LuxuryGold,
  "soft-pastel": SoftPastel,
  "traditional-indonesian": TraditionalIndonesian,
  "islamic-elegant": IslamicElegant,
  "dark-romance": DarkRomance,
  "floral-watercolor": FloralWatercolor,
  "cinematic-story": CinematicStory,
  "javanese-royal": JavaneseRoyal,
  "sundanese-nature": SundaneseNature,
  "balinese-temple": BalineseTemple,
  "minang-adat": MinangAdat,
  "betawi-festive": BetawiFestive,
  "spring-garden": SpringGarden,
  "autumn-warmth": AutumnWarmth,
  "beach-sunset": BeachSunset,
  "nordic-winter": NordicWinter,
  "art-deco": ArtDeco,
  "bohemian-dream": BohemianDream,
  "waterfront-blue": WaterfrontBlue,
  "royal-purple": RoyalPurple,
  "cherry-blossom": CherryBlossom,
  "desert-rose": DesertRose,
  "vintage-lace": VintageLace,
  "tropical-paradise": TropicalParadise,
  "celestial-night": CelestialNight,
  "marble-luxe": MarbleLuxe,
  "folk-art": FolkArt,
}

export function getTemplateComponent(
  id: string
): ComponentType<InvitationTemplateProps> {
  if (id in REGISTRY) return REGISTRY[id as TemplateId]
  return REGISTRY["classic-elegant"]
}
