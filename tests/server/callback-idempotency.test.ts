import { describe, it, expect, beforeEach, vi } from "vitest"
import { createHmac } from "node:crypto"

const ENV = {
  TRIPAY_MODE: "sandbox",
  TRIPAY_API_KEY: "x",
  TRIPAY_PRIVATE_KEY: "test-private-key",
  TRIPAY_MERCHANT_CODE: "T9999",
  TRIPAY_CALLBACK_URL: "http://localhost/x",
  TRIPAY_RETURN_URL: "http://localhost/x",
  DATABASE_URL: "postgresql://t:t@localhost/t",
  REDIS_URL: "redis://localhost",
  MINIO_ENDPOINT: "http://localhost:9000",
  MINIO_PUBLIC_URL: "http://localhost:9000",
  MINIO_ACCESS_KEY: "x",
  MINIO_SECRET_KEY: "xxxxxxxx",
  SMTP_USER: "x@x.com",
  SMTP_PASSWORD: "x",
  SMTP_FROM_EMAIL: "x@x.com",
  ADMIN_NOTIFICATION_EMAIL: "x@x.com",
  SESSION_SECRET: "x".repeat(32),
  INTERNAL_API_KEY: "x".repeat(32),
  CRON_SECRET: "x".repeat(32),
  ADMIN_API_KEY: "x".repeat(32),
}

beforeEach(() => {
  for (const [k, v] of Object.entries(ENV)) process.env[k] = v as string
  vi.resetModules()
  findUniqueMock.mockReset()
  updateMock.mockReset()
  auditCreateMock.mockReset().mockResolvedValue({})
  eventCreateMock.mockReset().mockResolvedValue({})
  subFindFirstMock.mockReset()
  subUpdateMock.mockReset()
  subCreateMock.mockReset()
})

// ─── Mocks ───────────────────────────────────────────────────────────────────

const findUniqueMock = vi.fn()
const updateMock = vi.fn()
const auditCreateMock = vi.fn()
const eventCreateMock = vi.fn()
const subFindFirstMock = vi.fn()
const subUpdateMock = vi.fn()
const subCreateMock = vi.fn()

const txClient = {
  invoice: {
    findUnique: findUniqueMock,
    update: updateMock,
  },
  subscription: {
    findFirst: subFindFirstMock,
    update: subUpdateMock,
    create: subCreateMock,
  },
  auditLog: { create: auditCreateMock },
}

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    paymentEvent: { create: eventCreateMock },
    invoice: {
      findUnique: vi.fn(async ({ where }: { where: { merchantRef: string } }) => ({
        id: "inv1",
        merchantRef: where.merchantRef,
      })),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(async (fn: (tx: typeof txClient) => Promise<unknown>) => fn(txClient)),
  },
}))

vi.mock("@/server/cache/redis", () => ({
  redis: { del: vi.fn() },
  cacheGet: vi.fn(async () => null),
  cacheSet: vi.fn(async () => undefined),
  cacheDel: vi.fn(async () => undefined),
  cacheKeys: { subscription: (id: string) => `s:${id}`, publicInvitation: (s: string) => `p:${s}` },
  invalidateAllInvitationsForUser: vi.fn(async () => undefined),
}))

vi.mock("@/server/subscription/subscription-service", () => ({
  activateOrExtendSubscription: vi.fn(async () => ({ id: "sub1" })),
  invalidateSubscriptionCache: vi.fn(async () => undefined),
  getActiveSubscriptionView: vi.fn(),
}))

vi.mock("@/server/invitation/cache", () => ({
  invalidatePublicInvitationsForUser: vi.fn(async () => undefined),
  invalidatePublicInvitation: vi.fn(async () => undefined),
}))

vi.mock("@/server/email/email-service", () => ({
  sendInvoicePaidEmailToUser: vi.fn(async () => undefined),
  sendInvoicePaidEmailToAdmin: vi.fn(async () => undefined),
  sendInvoiceExpiredEmailToUser: vi.fn(async () => undefined),
  sendInvoiceFailedEmailToUser: vi.fn(async () => undefined),
}))

// ─── Tests ───────────────────────────────────────────────────────────────────

function makeBody(merchantRef: string, status = "PAID"): string {
  return JSON.stringify({
    reference: "DEV-T0000001",
    merchant_ref: merchantRef,
    payment_method: "QRIS",
    payment_method_code: "QRIS",
    total_amount: 100000,
    status,
  })
}
function sign(body: string): string {
  return createHmac("sha256", ENV.TRIPAY_PRIVATE_KEY).update(body).digest("hex")
}

describe("Tripay callback idempotency", () => {
  it("activates subscription on first PAID callback", async () => {
    const body = makeBody("IK-20260101-AAA1")
    findUniqueMock.mockResolvedValue({
      id: "inv1",
      userId: "user1",
      merchantRef: "IK-20260101-AAA1",
      status: "PENDING",
      plan: { id: "p1", durationDays: 30 },
      user: { id: "user1", email: "u@e.com", name: "U" },
    })
    updateMock.mockResolvedValue({
      id: "inv1",
      userId: "user1",
      status: "PAID",
      paidAt: new Date(),
      paymentMethodName: "QRIS",
      merchantRef: "IK-20260101-AAA1",
      amount: 100000,
      tripayCheckoutUrl: null,
      tripayPayCode: null,
      expiredAt: null,
    })
    auditCreateMock.mockResolvedValue({})

    const { handleTripayCallback } = await import("@/server/billing/callback-service")

    const result = await handleTripayCallback(body, {
      signature: sign(body),
      event: "payment_status",
    })

    expect(result.status).toBe("ACCEPTED")
    expect(updateMock).toHaveBeenCalledTimes(1)
    expect(auditCreateMock).toHaveBeenCalledTimes(1) // invoice.paid
  })

  it("does not double-activate on duplicate PAID callback", async () => {
    const body = makeBody("IK-20260101-AAA2")
    findUniqueMock.mockResolvedValue({
      id: "inv1",
      userId: "user1",
      merchantRef: "IK-20260101-AAA2",
      status: "PAID", // already terminal
      plan: { id: "p1" },
      user: { id: "user1" },
    })
    updateMock.mockResolvedValue({}) // payload bookkeeping update

    const { handleTripayCallback } = await import("@/server/billing/callback-service")
    const result = await handleTripayCallback(body, {
      signature: sign(body),
      event: "payment_status",
    })

    expect(result.status).toBe("DUPLICATE")
    expect(auditCreateMock).not.toHaveBeenCalled() // no second activation audit
  })

  it("rejects forged signatures and persists the attempt", async () => {
    const body = makeBody("IK-20260101-AAA3")
    eventCreateMock.mockResolvedValue({})
    const { handleTripayCallback } = await import("@/server/billing/callback-service")
    const result = await handleTripayCallback(body, {
      signature: "deadbeef".repeat(8),
      event: "payment_status",
    })
    expect(result.status).toBe("INVALID_SIGNATURE")
    expect(eventCreateMock).toHaveBeenCalled() // audit row written
    expect(eventCreateMock.mock.calls[0]?.[0].data.isValidSignature).toBe(false)
  })

  it("ignores non payment_status events even if signature is valid", async () => {
    const body = makeBody("IK-20260101-AAA4")
    const { handleTripayCallback } = await import("@/server/billing/callback-service")
    const result = await handleTripayCallback(body, {
      signature: sign(body),
      event: "something_else",
    })
    expect(result.status).toBe("INVALID_EVENT")
  })

  it("maps EXPIRED Tripay status to EXPIRED invoice", async () => {
    const body = makeBody("IK-20260101-AAA5", "EXPIRED")
    findUniqueMock.mockResolvedValue({
      id: "inv1",
      userId: "user1",
      merchantRef: "IK-20260101-AAA5",
      status: "PENDING",
      plan: { id: "p1" },
      user: { id: "user1", email: "u@e.com", name: "U" },
    })
    updateMock.mockResolvedValue({
      id: "inv1",
      status: "EXPIRED",
      userId: "user1",
      merchantRef: "IK-20260101-AAA5",
      amount: 100000,
      paidAt: null,
      paymentMethodName: null,
      tripayCheckoutUrl: null,
      tripayPayCode: null,
      expiredAt: null,
    })
    const { handleTripayCallback } = await import("@/server/billing/callback-service")
    const result = await handleTripayCallback(body, {
      signature: sign(body),
      event: "payment_status",
    })
    expect(result.status).toBe("ACCEPTED")
  })
})
