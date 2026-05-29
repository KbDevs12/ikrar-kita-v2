import { describe, it, expect } from "vitest"
import {
  TEMPLATE_IDS,
  INVITATION_TEMPLATES,
} from "@/lib/constants/invitation-templates"
import { getTemplateComponent } from "@/components/invitation/templates/registry"

/**
 * Guard against regressing back to delegated fallbacks.
 *
 * Every template id in the spec MUST resolve to a unique component. If you
 * touch the registry to "save time" by pointing two ids at the same
 * implementation, this test will catch it.
 */
describe("template registry", () => {
  it("has an entry for every TemplateId", () => {
    for (const id of TEMPLATE_IDS) {
      const Component = getTemplateComponent(id)
      expect(Component).toBeTruthy()
    }
  })

  it("returns a unique component per id (no fallback delegation)", () => {
    const seen = new Set<unknown>()
    for (const id of TEMPLATE_IDS) {
      const Component = getTemplateComponent(id)
      expect(seen.has(Component)).toBe(false)
      seen.add(Component)
    }
    expect(seen.size).toBe(TEMPLATE_IDS.length)
    expect(seen.size).toBe(10)
  })

  it("falls back to classic-elegant for unknown ids", () => {
    const Unknown = getTemplateComponent("does-not-exist")
    const Classic = getTemplateComponent("classic-elegant")
    expect(Unknown).toBe(Classic)
  })

  it("the spec metadata has 10 templates", () => {
    expect(INVITATION_TEMPLATES).toHaveLength(10)
  })
})
