import { describe, it, expect } from "vitest"
import {
  INVITATION_TEMPLATES,
  TEMPLATE_IDS,
  isValidTemplateId,
} from "@/lib/constants/invitation-templates"

describe("invitation template registry", () => {
  it("contains exactly 10 templates", () => {
    expect(INVITATION_TEMPLATES).toHaveLength(10)
    expect(TEMPLATE_IDS).toHaveLength(10)
  })

  it("ids are unique", () => {
    expect(new Set(TEMPLATE_IDS).size).toBe(TEMPLATE_IDS.length)
  })

  it("each template carries the spec metadata", () => {
    for (const t of INVITATION_TEMPLATES) {
      expect(t.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/)
      expect(t.name.length).toBeGreaterThan(0)
      expect(t.shortDescription.length).toBeGreaterThan(10)
      expect(t.defaultPrimaryColor).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it("isValidTemplateId narrows correctly", () => {
    expect(isValidTemplateId("classic-elegant")).toBe(true)
    expect(isValidTemplateId("not-real")).toBe(false)
  })
})
