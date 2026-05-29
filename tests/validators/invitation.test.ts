import { describe, it, expect } from "vitest"
import {
  slugSchema,
  sanitiseSlug,
  sanitiseRecipient,
  recipientQuerySchema,
  invitationCreateSchema,
  stepEventSchema,
} from "@/lib/validators/invitation"
import { TEMPLATE_IDS } from "@/lib/constants/invitation-templates"

describe("slugSchema", () => {
  it("accepts kebab-case", () => {
    expect(slugSchema.safeParse("andi-sinta").success).toBe(true)
    expect(slugSchema.safeParse("rizky-nadia-2026").success).toBe(true)
  })
  it("rejects uppercase, spaces, special chars", () => {
    for (const s of ["Andi-Sinta", "andi sinta", "andi_sinta", "andi.sinta", "-andi", "andi-"]) {
      expect(slugSchema.safeParse(s).success).toBe(false)
    }
  })
  it("rejects too short or too long", () => {
    expect(slugSchema.safeParse("ab").success).toBe(false)
    expect(slugSchema.safeParse("a".repeat(65)).success).toBe(false)
  })
})

describe("sanitiseSlug", () => {
  it("converts couple names into safe slugs", () => {
    expect(sanitiseSlug("Andi & Sinta")).toBe("andi-sinta")
    expect(sanitiseSlug("Rizky Nadia")).toBe("rizky-nadia")
    expect(sanitiseSlug("Putri Náthifâ")).toBe("putri-nathifa")
  })
  it("strips diacritics and trims hyphens", () => {
    expect(sanitiseSlug("---hello---world---")).toBe("hello-world")
  })
})

describe("sanitiseRecipient (?to= query)", () => {
  it("returns default when missing/empty", () => {
    expect(sanitiseRecipient(null)).toBe("Tamu Undangan")
    expect(sanitiseRecipient("")).toBe("Tamu Undangan")
  })
  it("strips angle brackets to neutralise XSS payloads", () => {
    expect(sanitiseRecipient("<script>alert(1)</script>Bapak Budi")).toBe("scriptalert(1)/scriptBapak Budi")
  })
  it("normalises whitespace", () => {
    expect(sanitiseRecipient("  Keluarga   Besar  Pak Agus  ")).toBe("Keluarga Besar Pak Agus")
  })
  it("caps very long inputs", () => {
    const long = "x".repeat(500)
    const result = recipientQuerySchema.safeParse(long)
    expect(result.success).toBe(false)
  })
})

describe("invitation full schema", () => {
  const validBase = {
    slug: "andi-sinta",
    groomName: "Andi Pratama",
    brideName: "Sinta Lestari",
    eventDate: "2026-09-12T00:00:00.000Z",
    schedule: [
      {
        label: "Akad Nikah",
        startsAt: "2026-09-12T01:00:00.000Z",
        endsAt: "2026-09-12T03:00:00.000Z",
      },
      {
        label: "Resepsi",
        startsAt: "2026-09-12T05:00:00.000Z",
      },
    ],
    venueName: "Gedung Serba Guna Bakti Sejahtera",
    venueAddress: "Jl. Merdeka No. 12, Bandung",
    theme: TEMPLATE_IDS[0],
    galleryUrls: [],
    rsvpEnabled: true,
    guestMessageEnabled: true,
    giftEnabled: false,
    giftAccounts: [],
  }

  it("accepts a complete invitation", () => {
    const result = invitationCreateSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it("rejects when latitude is set without longitude", () => {
    const result = invitationCreateSchema.safeParse({ ...validBase, latitude: -6.9 })
    expect(result.success).toBe(false)
  })

  it("rejects events where endsAt <= startsAt", () => {
    const result = stepEventSchema.safeParse({
      eventDate: "2026-09-12T00:00:00.000Z",
      schedule: [
        {
          label: "Akad",
          startsAt: "2026-09-12T05:00:00.000Z",
          endsAt: "2026-09-12T05:00:00.000Z",
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid template ids", () => {
    const result = invitationCreateSchema.safeParse({ ...validBase, theme: "not-a-template" })
    expect(result.success).toBe(false)
  })
})
