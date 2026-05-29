/**
 * Map a TemplateId from the registry to its actual React component.
 *
 * For templates that do not yet have a fully bespoke implementation, we
 * fall back to the closest sibling. The plan is to grow this list over
 * time without ever shipping a template that is just a recoloured copy.
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

const REGISTRY: Record<TemplateId, ComponentType<InvitationTemplateProps>> = {
  "classic-elegant": ClassicElegant,
  "modern-minimalist": ModernMinimalist,
  "rustic-garden": ClassicElegant, // TODO bespoke - tracked in AGENTS.md
  "luxury-gold": ClassicElegant, // TODO bespoke
  "soft-pastel": SoftPastel,
  "traditional-indonesian": ClassicElegant, // TODO bespoke
  "islamic-elegant": ClassicElegant, // TODO bespoke
  "dark-romance": ClassicElegant, // TODO bespoke
  "floral-watercolor": SoftPastel, // TODO bespoke
  "cinematic-story": ModernMinimalist, // TODO bespoke
}

export function getTemplateComponent(
  id: string
): ComponentType<InvitationTemplateProps> {
  if (id in REGISTRY) return REGISTRY[id as TemplateId]
  return REGISTRY["classic-elegant"]
}
