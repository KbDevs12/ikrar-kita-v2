import { describe, it, expect, beforeEach, vi } from "vitest"
import type { User } from "@prisma/client"

// ── Env (kept tiny - we only exercise the ownership branch) ─────────────────
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

vi.mock("@/server/invitation/cache", () => ({
  invalidatePublicInvitation: vi.fn(async () => undefined),
  invalidatePublicInvitationsForUser: vi.fn(async () => undefined),
  toPublicView: vi.fn(),
  setCachedPublicInvitation: vi.fn(),
  getCachedPublicInvitation: vi.fn(async () => null),
}))

vi.mock("@/server/subscription/subscription-service", () => ({
  getActiveSubscriptionView: vi.fn(),
  checkPublishLimit: vi.fn(),
}))

beforeEach(() => {
  findUniqueMock.mockReset()
  updateMock.mockReset()
})

// User A is the legitimate owner. User B is a malicious caller.
const userA: User = {
  id: "userA",
  name: "A",
  email: "a@x.com",
  passwordHash: "h",
  role: "USER",
  emailVerifiedAt: new Date(),
  emailVerificationStatus: "VERIFIED",
  createdAt: new Date(),
  updatedAt: new Date(),
}
const userB: User = { ...userA, id: "userB", email: "b@x.com" }

const invitationOwnedByA = {
  id: "inv1",
  userId: "userA",
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
}

// ─────────────────────────────────────────────────────────────────────────────

describe("ownership: invitation reads", () => {
  it("getInvitationForUser returns the row when caller IS the owner", async () => {
    findUniqueMock.mockResolvedValue(invitationOwnedByA)
    const { getInvitationForUser } = await import(
      "@/server/invitation/invitation-service"
    )
    const result = await getInvitationForUser("userA", "inv1")
    expect(result.id).toBe("inv1")
  })

  it("getInvitationForUser refuses when caller is NOT the owner", async () => {
    findUniqueMock.mockResolvedValue(invitationOwnedByA)
    const { getInvitationForUser, InvitationError } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(getInvitationForUser("userB", "inv1")).rejects.toMatchObject({
      name: "InvitationError",
      code: "FORBIDDEN",
    })
    expect(updateMock).not.toHaveBeenCalled()
    // Sanity-check the error class is the one we expect
    await getInvitationForUser("userB", "inv1").catch((e) => {
      expect(e).toBeInstanceOf(InvitationError)
    })
  })

  it("getInvitationForUser throws NOT_FOUND when the row does not exist", async () => {
    findUniqueMock.mockResolvedValue(null)
    const { getInvitationForUser } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(getInvitationForUser("userA", "missing")).rejects.toMatchObject({
      code: "NOT_FOUND",
    })
  })
})

describe("ownership: invitation writes", () => {
  it("updateInvitation refuses cross-owner mutation and never calls prisma.update", async () => {
    findUniqueMock.mockResolvedValue(invitationOwnedByA)
    const { updateInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(
      updateInvitation(userB, "inv1", { groomName: "Hijack" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(updateMock).not.toHaveBeenCalled()
  })

  it("archiveInvitation refuses cross-owner mutation", async () => {
    findUniqueMock.mockResolvedValue(invitationOwnedByA)
    const { archiveInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(archiveInvitation(userB, "inv1")).rejects.toMatchObject({
      code: "FORBIDDEN",
    })
    expect(updateMock).not.toHaveBeenCalled()
  })
})

describe("ownership: invitation publish", () => {
  it("publishInvitation refuses cross-owner action even when sub + limit are OK", async () => {
    const sub = await import("@/server/subscription/subscription-service")
    vi.mocked(sub.getActiveSubscriptionView).mockResolvedValue({
      status: "ACTIVE",
      planCode: "PRO",
      invitationLimit: 3,
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    })
    vi.mocked(sub.checkPublishLimit).mockResolvedValue({
      allowed: true,
      publishedCount: 0,
      limit: 3,
    })
    findUniqueMock.mockResolvedValue(invitationOwnedByA)
    const { publishInvitation } = await import(
      "@/server/invitation/invitation-service"
    )
    await expect(publishInvitation(userB, "inv1")).rejects.toMatchObject({
      code: "FORBIDDEN",
    })
    expect(updateMock).not.toHaveBeenCalled()
  })
})
