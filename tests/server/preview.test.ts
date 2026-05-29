import { describe, it, expect, beforeEach, vi } from "vitest"

// Bare-minimum env so any imported singleton initialises happily
beforeEach(() => {
  process.env.SESSION_SECRET = "x".repeat(32)
  process.env.INTERNAL_API_KEY = "x".repeat(32)
  process.env.CRON_SECRET = "x".repeat(32)
  process.env.DATABASE_URL = "postgresql://t:t@localhost/t"
  process.env.REDIS_URL = "redis://localhost"
  process.env.MINIO_ENDPOINT = "http://localhost:9000"
  process.env.MINIO_PUBLIC_URL = "http://localhost:9000"
  process.env.MINIO_ACCESS_KEY = "x"
  process.env.MINIO_SECRET_KEY = "xxxxxxxx"
  process.env.SMTP_USER = "x@x.com"
  process.env.SMTP_PASSWORD = "x"
  process.env.SMTP_FROM_EMAIL = "x@x.com"
  process.env.ADMIN_NOTIFICATION_EMAIL = "x@x.com"
  process.env.TRIPAY_MODE = "sandbox"
  process.env.TRIPAY_API_KEY = "x"
  process.env.TRIPAY_PRIVATE_KEY = "x"
  process.env.TRIPAY_MERCHANT_CODE = "x"
  process.env.TRIPAY_CALLBACK_URL = "http://localhost/x"
  process.env.TRIPAY_RETURN_URL = "http://localhost/x"
  vi.resetModules()
})

const findUniqueMock = vi.fn()
const getActiveSubscriptionViewMock = vi.fn()

vi.mock("@/server/db/prisma", () => ({
  prisma: { invitation: { findUnique: findUniqueMock } },
}))

vi.mock("@/server/subscription/subscription-service", () => ({
  getActiveSubscriptionView: getActiveSubscriptionViewMock,
}))

const baseInvitation = {
  id: "inv1",
  userId: "user1",
  slug: "andi-sinta",
  status: "DRAFT" as const,
  title: null,
  groomName: "Andi",
  brideName: "Sinta",
  eventDate: new Date("2026-09-12T00:00:00Z"),
  venueName: "Bale Asri",
  venueAddress: "Jl. Merdeka 12",
  latitude: null,
  longitude: null,
  theme: "classic-elegant",
  primaryColor: null,
  coverImageUrl: null,
  musicUrl: null,
  content: { schedule: [] },
  publishedAt: null,
  archivedAt: null,
}

describe("getInvitationPreview", () => {
  it("returns null when the invitation does not exist", async () => {
    findUniqueMock.mockResolvedValueOnce(null)
    const { getInvitationPreview } = await import("@/server/invitation/preview")
    const result = await getInvitationPreview("user1", "inv1")
    expect(result).toBeNull()
  })

  it("refuses to expose another user's invitation", async () => {
    findUniqueMock.mockResolvedValueOnce({ ...baseInvitation, userId: "userOTHER" })
    const { getInvitationPreview } = await import("@/server/invitation/preview")
    const result = await getInvitationPreview("user1", "inv1")
    expect(result).toBeNull()
  })

  it("renders a DRAFT for the owner even without an active subscription", async () => {
    findUniqueMock.mockResolvedValueOnce(baseInvitation)
    getActiveSubscriptionViewMock.mockResolvedValueOnce(null)
    const { getInvitationPreview } = await import("@/server/invitation/preview")
    const result = await getInvitationPreview("user1", "inv1")
    expect(result).not.toBeNull()
    expect(result!.realStatus).toBe("DRAFT")
    expect(result!.livePublic).toBe(false)
    expect(result!.view.status).toBe("PUBLISHED") // pinned for templates
    expect(result!.view.publishedAt).toBeTruthy() // never null - templates expect string
  })

  it("flags livePublic=true only when PUBLISHED + ACTIVE subscription", async () => {
    findUniqueMock.mockResolvedValueOnce({
      ...baseInvitation,
      status: "PUBLISHED",
      publishedAt: new Date(),
    })
    getActiveSubscriptionViewMock.mockResolvedValueOnce({
      status: "ACTIVE",
      planCode: "BASIC",
      invitationLimit: 1,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    })
    const { getInvitationPreview } = await import("@/server/invitation/preview")
    const result = await getInvitationPreview("user1", "inv1")
    expect(result!.livePublic).toBe(true)
  })

  it("flags livePublic=false when PUBLISHED but subscription EXPIRED", async () => {
    findUniqueMock.mockResolvedValueOnce({
      ...baseInvitation,
      status: "PUBLISHED",
      publishedAt: new Date(),
    })
    getActiveSubscriptionViewMock.mockResolvedValueOnce({
      status: "EXPIRED",
      planCode: "BASIC",
      invitationLimit: 1,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    })
    const { getInvitationPreview } = await import("@/server/invitation/preview")
    const result = await getInvitationPreview("user1", "inv1")
    expect(result!.livePublic).toBe(false)
    expect(result!.subscription?.status).toBe("EXPIRED")
  })

  it("renders ARCHIVED for the owner without leaking it as livePublic", async () => {
    findUniqueMock.mockResolvedValueOnce({
      ...baseInvitation,
      status: "ARCHIVED",
      archivedAt: new Date(),
    })
    getActiveSubscriptionViewMock.mockResolvedValueOnce({
      status: "ACTIVE",
      planCode: "PRO",
      invitationLimit: 3,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    })
    const { getInvitationPreview } = await import("@/server/invitation/preview")
    const result = await getInvitationPreview("user1", "inv1")
    expect(result!.realStatus).toBe("ARCHIVED")
    expect(result!.livePublic).toBe(false)
  })
})
