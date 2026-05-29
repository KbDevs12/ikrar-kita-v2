import { describe, it, expect, beforeEach, vi } from "vitest"

const mockSub = vi.hoisted(() => ({ value: null as null | { status: string; planCode: string; invitationLimit: number | null; expiresAt: string } }))

vi.mock("@/server/cache/redis", () => ({
  redis: { del: vi.fn() },
  cacheGet: vi.fn(async () => null),
  cacheSet: vi.fn(async () => undefined),
  cacheDel: vi.fn(async () => undefined),
  cacheKeys: { subscription: (id: string) => `s:${id}`, publicInvitation: (s: string) => `p:${s}` },
  invalidateAllInvitationsForUser: vi.fn(async () => undefined),
}))

const findFirstMock = vi.fn()
const countMock = vi.fn()

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    subscription: { findFirst: findFirstMock },
    invitation: { count: countMock, findMany: vi.fn(async () => []) },
  },
}))

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
  process.env.TRIPAY_API_KEY = "x"
  process.env.TRIPAY_PRIVATE_KEY = "x"
  process.env.TRIPAY_MERCHANT_CODE = "x"
  process.env.TRIPAY_CALLBACK_URL = "http://localhost/x"
  process.env.TRIPAY_RETURN_URL = "http://localhost/x"
  mockSub.value = null
  findFirstMock.mockReset()
  countMock.mockReset()
})

const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10)

describe("checkPublishLimit", () => {
  it("Basic plan allows 1 publish, denies the 2nd", async () => {
    findFirstMock.mockResolvedValue({
      expiresAt: futureDate,
      status: "ACTIVE",
      plan: { code: "BASIC", invitationLimit: 1 },
    })
    const { checkPublishLimit } = await import("@/server/subscription/subscription-service")
    countMock.mockResolvedValue(0)
    const ok = await checkPublishLimit("u1")
    expect(ok.allowed).toBe(true)
    expect(ok.limit).toBe(1)

    countMock.mockResolvedValue(1)
    const blocked = await checkPublishLimit("u1")
    expect(blocked.allowed).toBe(false)
    expect(blocked.publishedCount).toBe(1)
  })

  it("Pro plan allows up to 3", async () => {
    findFirstMock.mockResolvedValue({
      expiresAt: futureDate,
      status: "ACTIVE",
      plan: { code: "PRO", invitationLimit: 3 },
    })
    const { checkPublishLimit } = await import("@/server/subscription/subscription-service")
    countMock.mockResolvedValue(2)
    expect((await checkPublishLimit("u1")).allowed).toBe(true)
    countMock.mockResolvedValue(3)
    expect((await checkPublishLimit("u1")).allowed).toBe(false)
  })

  it("Reseller plan is unlimited", async () => {
    findFirstMock.mockResolvedValue({
      expiresAt: futureDate,
      status: "ACTIVE",
      plan: { code: "RESELLER", invitationLimit: null },
    })
    const { checkPublishLimit } = await import("@/server/subscription/subscription-service")
    countMock.mockResolvedValue(99)
    const r = await checkPublishLimit("u1")
    expect(r.allowed).toBe(true)
    expect(r.limit).toBeNull()
  })

  it("denies publish without an active subscription", async () => {
    findFirstMock.mockResolvedValue(null)
    const { checkPublishLimit } = await import("@/server/subscription/subscription-service")
    const r = await checkPublishLimit("u1")
    expect(r.allowed).toBe(false)
  })

  it("treats an expired sub as not active even if status row says ACTIVE", async () => {
    findFirstMock.mockResolvedValue({
      expiresAt: new Date(Date.now() - 1000),
      status: "ACTIVE",
      plan: { code: "BASIC", invitationLimit: 1 },
    })
    const { checkPublishLimit } = await import("@/server/subscription/subscription-service")
    const r = await checkPublishLimit("u1")
    expect(r.allowed).toBe(false)
  })
})
