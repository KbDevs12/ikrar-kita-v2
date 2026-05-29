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

const findUniqueMock = vi.fn()
const updateMock = vi.fn()
const auditCreateMock = vi.fn(async () => ({}))
const invalidatePublicInvitationMock = vi.fn(async () => undefined)
const getActiveSubscriptionViewMock = vi.fn()
const checkPublishLimitMock = vi.fn()

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    invitation: {
      findUnique: findUniqueMock,
      update: updateMock,
    },
    auditLog: { create: auditCreateMock },
  },
}))

vi.mock("@/server/cache/redis", () => ({
  redis: {},
  cacheKeys: { publicInvitation: (s: string) => `p:${s}` },
  cacheGet: vi.fn(async () => null),
  cacheSet: vi.fn(async () => undefined),
  cacheDel: vi.fn(async () => undefined),
}))

vi.mock("@/server/invitation/cache", () => ({
  invalidatePublicInvitation: invalidatePublicInvitationMock,
  invalidatePublicInvitationsForUser: vi.fn(async () => undefined),
  toPublicView: vi.fn(),
  setCachedPublicInvitation: vi.fn(),
  getCachedPublicInvitation: vi.fn(async () => null),
}))

vi.mock("@/server/subscription/subscription-service", () => ({
  getActiveSubscriptionView: getActiveSubscriptionViewMock,
  checkPublishLimit: checkPublishLimitMock,
}))

beforeEach(() => {
  findUniqueMock.mockReset()
  updateMock.mockReset()
  auditCreateMock.mockClear()
  invalidatePublicInvitationMock.mockClear()
  getActiveSubscriptionViewMock.mockReset()
  checkPublishLimitMock.mockReset()
})

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
const unverifiedUser: User = { ...verifiedUser, emailVerifiedAt: null }

function draftInvitation(overrides: Record<string, unknown> = {}) {
  return {
    id: "inv1",
    userId: "user1",
    slug: "andi-sinta",
    status: "DRAFT" as const,
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

const ACTIVE_SUB = {
  status: "ACTIVE" as const,
  planCode: "PRO",
  invitationLimit: 3,
  expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
}

// ─────────────────────────────────────────────────────────────────────────────

describe("publishInvitation guards", () => {
  it("rejects unverified users before touching prisma", async () => {
    const { publishInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(
      publishInvitation(unverifiedUser, "inv1")
    ).rejects.toMatchObject({ code: "EMAIL_NOT_VERIFIED" })
    expect(getActiveSubscriptionViewMock).not.toHaveBeenCalled()
    expect(findUniqueMock).not.toHaveBeenCalled()
  })

  it("rejects when there is no subscription at all", async () => {
    getActiveSubscriptionViewMock.mockResolvedValue(null)
    const { publishInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(
      publishInvitation(verifiedUser, "inv1")
    ).rejects.toMatchObject({ code: "NO_ACTIVE_SUBSCRIPTION" })
    expect(findUniqueMock).not.toHaveBeenCalled()
  })

  it("rejects when subscription exists but is not ACTIVE (e.g. EXPIRED)", async () => {
    getActiveSubscriptionViewMock.mockResolvedValue({
      ...ACTIVE_SUB,
      status: "EXPIRED",
    })
    const { publishInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(
      publishInvitation(verifiedUser, "inv1")
    ).rejects.toMatchObject({ code: "NO_ACTIVE_SUBSCRIPTION" })
  })

  it("rejects when the plan publish limit is already reached", async () => {
    getActiveSubscriptionViewMock.mockResolvedValue(ACTIVE_SUB)
    checkPublishLimitMock.mockResolvedValue({
      allowed: false,
      publishedCount: 3,
      limit: 3,
    })
    const { publishInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(
      publishInvitation(verifiedUser, "inv1")
    ).rejects.toMatchObject({ code: "LIMIT_REACHED" })
    expect(findUniqueMock).not.toHaveBeenCalled()
  })

  it("refuses to publish an ARCHIVED invitation directly", async () => {
    getActiveSubscriptionViewMock.mockResolvedValue(ACTIVE_SUB)
    checkPublishLimitMock.mockResolvedValue({
      allowed: true,
      publishedCount: 0,
      limit: 3,
    })
    findUniqueMock.mockResolvedValue(
      draftInvitation({ status: "ARCHIVED", archivedAt: new Date() })
    )
    const { publishInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(
      publishInvitation(verifiedUser, "inv1")
    ).rejects.toMatchObject({ code: "ARCHIVED" })
    expect(updateMock).not.toHaveBeenCalled()
    expect(invalidatePublicInvitationMock).not.toHaveBeenCalled()
  })

  it("refuses to re-publish an already PUBLISHED invitation", async () => {
    getActiveSubscriptionViewMock.mockResolvedValue(ACTIVE_SUB)
    checkPublishLimitMock.mockResolvedValue({
      allowed: true,
      publishedCount: 0,
      limit: 3,
    })
    findUniqueMock.mockResolvedValue(
      draftInvitation({ status: "PUBLISHED", publishedAt: new Date() })
    )
    const { publishInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(
      publishInvitation(verifiedUser, "inv1")
    ).rejects.toMatchObject({ code: "ALREADY_PUBLISHED" })
    expect(updateMock).not.toHaveBeenCalled()
  })

  it("publishes a DRAFT when verified + ACTIVE sub + limit OK + correct owner", async () => {
    getActiveSubscriptionViewMock.mockResolvedValue(ACTIVE_SUB)
    checkPublishLimitMock.mockResolvedValue({
      allowed: true,
      publishedCount: 0,
      limit: 3,
    })
    findUniqueMock.mockResolvedValue(draftInvitation())
    updateMock.mockResolvedValue(
      draftInvitation({ status: "PUBLISHED", publishedAt: new Date() })
    )
    const { publishInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    const result = await publishInvitation(verifiedUser, "inv1")
    expect(result.status).toBe("PUBLISHED")
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "inv1" },
      data: { status: "PUBLISHED", publishedAt: expect.any(Date) },
    })
    // Audit + cache invalidation are part of the publish flow
    expect(auditCreateMock).toHaveBeenCalledTimes(1)
    expect(auditCreateMock.mock.calls[0]?.[0]?.data?.action).toBe(
      "invitation.publish"
    )
    expect(invalidatePublicInvitationMock).toHaveBeenCalledWith("andi-sinta")
  })
})
