import { describe, it, expect, beforeEach, vi } from "vitest"
import type { User } from "@prisma/client"

// ── Env ──────────────────────────────────────────────────────────────────────
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

// ── Spy on the cache module ─────────────────────────────────────────────────
// We mock the WHOLE module so we can assert on individual function calls.
// Other helpers exported from cache.ts are stubbed to keep the rest of the
// service code path running normally.
const invalidatePublicInvitationMock = vi.fn(async () => undefined)
const invalidatePublicInvitationsForUserMock = vi.fn(async () => undefined)

vi.mock("@/server/invitation/cache", () => ({
  invalidatePublicInvitation: invalidatePublicInvitationMock,
  invalidatePublicInvitationsForUser: invalidatePublicInvitationsForUserMock,
  toPublicView: vi.fn(),
  setCachedPublicInvitation: vi.fn(),
  getCachedPublicInvitation: vi.fn(async () => null),
}))

const findUniqueMock = vi.fn()
const updateMock = vi.fn()

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    invitation: {
      findUnique: findUniqueMock,
      update: updateMock,
    },
    auditLog: { create: vi.fn(async () => ({})) },
  },
}))

vi.mock("@/server/cache/redis", () => ({
  redis: {},
  cacheKeys: { publicInvitation: (s: string) => `p:${s}` },
  cacheGet: vi.fn(async () => null),
  cacheSet: vi.fn(async () => undefined),
  cacheDel: vi.fn(async () => undefined),
}))

const ACTIVE_SUB = {
  status: "ACTIVE" as const,
  planCode: "PRO",
  invitationLimit: 3,
  expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
}

vi.mock("@/server/subscription/subscription-service", () => ({
  getActiveSubscriptionView: vi.fn(async () => ACTIVE_SUB),
  checkPublishLimit: vi.fn(async () => ({
    allowed: true,
    publishedCount: 0,
    limit: 3,
  })),
}))

beforeEach(() => {
  invalidatePublicInvitationMock.mockClear()
  invalidatePublicInvitationsForUserMock.mockClear()
  findUniqueMock.mockReset()
  updateMock.mockReset()
})

// ── Fixtures ────────────────────────────────────────────────────────────────
const verifiedUser: User = {
  id: "user1",
  name: "A",
  email: "a@x.com",
  passwordHash: "h",
  role: "USER",
  emailVerifiedAt: new Date(),
  emailVerificationStatus: "VERIFIED",
  createdAt: new Date(),
  updatedAt: new Date(),
}

function invitation(overrides: Record<string, unknown> = {}) {
  return {
    id: "inv1",
    userId: "user1",
    slug: "andi-sinta",
    status: "DRAFT",
    title: null,
    groomName: "A",
    brideName: "B",
    eventDate: new Date(),
    venueName: "V",
    venueAddress: "Addr",
    latitude: null,
    longitude: null,
    theme: "classic-elegant",
    primaryColor: null,
    coverImageUrl: null,
    musicUrl: null,
    content: {},
    publishedAt: null,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────────────────────

describe("public invitation cache invalidation", () => {
  it("publishInvitation invalidates the cache for the new slug", async () => {
    findUniqueMock.mockResolvedValue(invitation())
    updateMock.mockResolvedValue(
      invitation({ status: "PUBLISHED", publishedAt: new Date() })
    )
    const { publishInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await publishInvitation(verifiedUser, "inv1")
    expect(invalidatePublicInvitationMock).toHaveBeenCalledWith("andi-sinta")
    expect(invalidatePublicInvitationMock).toHaveBeenCalledTimes(1)
  })

  it("archiveInvitation invalidates the cache so the public URL stops serving", async () => {
    findUniqueMock.mockResolvedValue(
      invitation({ status: "PUBLISHED", publishedAt: new Date() })
    )
    updateMock.mockResolvedValue(
      invitation({ status: "ARCHIVED", archivedAt: new Date() })
    )
    const { archiveInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await archiveInvitation(verifiedUser, "inv1")
    expect(invalidatePublicInvitationMock).toHaveBeenCalledWith("andi-sinta")
  })

  it("updateInvitation invalidates the OLD slug when slug changes", async () => {
    // Existing slug = andi-sinta. Update changes it to andi-sinta-2026.
    // Only the old slug needs invalidation - the new slug had no cached
    // entry yet, and slug uniqueness is enforced by the DB.
    findUniqueMock.mockResolvedValue(invitation())
    updateMock.mockResolvedValue(
      invitation({ slug: "andi-sinta-2026", status: "DRAFT" })
    )
    const { updateInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await updateInvitation(verifiedUser, "inv1", { slug: "andi-sinta-2026" })
    expect(invalidatePublicInvitationMock).toHaveBeenCalledWith("andi-sinta")
  })

  it("updateInvitation invalidates the cache when the invitation is already PUBLISHED", async () => {
    findUniqueMock.mockResolvedValue(
      invitation({ status: "PUBLISHED", publishedAt: new Date() })
    )
    updateMock.mockResolvedValue(
      invitation({
        status: "PUBLISHED",
        publishedAt: new Date(),
        groomName: "Andi Pratama",
      })
    )
    const { updateInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await updateInvitation(verifiedUser, "inv1", { groomName: "Andi Pratama" })
    // Same slug -> invalidated once for the published slug
    expect(invalidatePublicInvitationMock).toHaveBeenCalledWith("andi-sinta")
  })

  it("updateInvitation does NOT invalidate when nothing slug-affecting changes on a DRAFT", async () => {
    findUniqueMock.mockResolvedValue(invitation())
    updateMock.mockResolvedValue(invitation({ groomName: "Andi" }))
    const { updateInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await updateInvitation(verifiedUser, "inv1", { groomName: "Andi" })
    // DRAFT was never cached publicly; no invalidation needed.
    expect(invalidatePublicInvitationMock).not.toHaveBeenCalled()
  })
})
