import { describe, it, expect } from "vitest"
import { sanitiseRecipient } from "@/lib/validators/invitation"

describe("public ?to= sanitiser - regression for XSS payloads", () => {
  it.each([
    ["<img src=x onerror=alert(1)>", "img src=x onerror=alert(1)"],
    [`"><script>alert(1)</script>`, '"scriptalert(1)/script'],
    ["javascript:alert(1)", "javascript:alert(1)"], // not active, just text
    ["onload=alert(1)", "onload=alert(1)"], // text only, never injected as attr
    ["normal Bapak Budi", "normal Bapak Budi"],
    ["Keluarga    Pak    Agus", "Keluarga Pak Agus"],
  ])("neutralises %s -> %s", (input, expected) => {
    expect(sanitiseRecipient(input)).toBe(expected)
  })

  it("falls back to default when input is empty/null", () => {
    expect(sanitiseRecipient(null)).toBe("Tamu Undangan")
    expect(sanitiseRecipient(undefined)).toBe("Tamu Undangan")
    expect(sanitiseRecipient("")).toBe("Tamu Undangan")
    expect(sanitiseRecipient("   ")).toBe("Tamu Undangan")
  })
})
