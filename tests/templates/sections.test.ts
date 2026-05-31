import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

/**
 * Static guard: every bespoke template must wire up the public RSVP and
 * guest-message sections through the shared components, not via per-template
 * fetch logic. This stops a future template from forgetting one of the two
 * sections or hand-rolling its own less-secure form.
 */

const TEMPLATES_DIR = join(process.cwd(), "src/components/invitation/templates")
const EXCLUDED = new Set(["registry.ts", "types.ts"])

function bespokeTemplateFiles(): string[] {
  return readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".tsx") && !EXCLUDED.has(f))
    .map((f) => join(TEMPLATES_DIR, f))
}

describe("public form sections in templates", () => {
  const files = bespokeTemplateFiles()

  it("there are exactly 10 bespoke template files", () => {
    expect(files).toHaveLength(10)
  })

  it.each(files)("%s renders <PublicRsvpForm>", (file) => {
    const src = readFileSync(file, "utf8")
    expect(src).toMatch(/import\s+\{[^}]*PublicRsvpForm[^}]*\}\s+from\s+["'][^"']*rsvp-form["']/)
    expect(src).toMatch(/<PublicRsvpForm\b/)
  })

  it.each(files)("%s renders <PublicGuestMessageForm> + <GuestMessagesList>", (file) => {
    const src = readFileSync(file, "utf8")
    expect(src).toMatch(
      /import\s+\{[^}]*PublicGuestMessageForm[^}]*\}\s+from\s+["'][^"']*guest-message-form["']/
    )
    expect(src).toMatch(
      /import\s+\{[^}]*GuestMessagesList[^}]*\}\s+from\s+["'][^"']*guest-messages-list["']/
    )
    expect(src).toMatch(/<PublicGuestMessageForm\b/)
    expect(src).toMatch(/<GuestMessagesList\b/)
  })

  it.each(files)("%s gates RSVP + messages on rsvpEnabled / guestMessageEnabled", (file) => {
    const src = readFileSync(file, "utf8")
    expect(src).toContain("c.rsvpEnabled !== false")
    expect(src).toContain("c.guestMessageEnabled !== false")
  })
})
