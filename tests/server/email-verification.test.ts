import { describe, it, expect, beforeEach, vi } from "vitest"
import { createHash } from "node:crypto"

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
  process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES = "60"
  process.env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS = "60"
  process.env.ADMIN_API_KEY = "x".repeat(32)
  vi.resetModules()
})

// ── Mocks ────────────────────────────────────────────────────────────────────
type TokenCreateArg = {
  data: { userId: string; tokenHash: string; expiresAt: Date }
}
type TokenUpdateArg = { where: { id: string }; data: { usedAt: Date } }
type TokenUpdateManyArg = {
  where: { userId: string; usedAt: null }
  data: { usedAt: Date }
}
type TokenFindUniqueArg = {
  where: { tokenHash: string }
  include?: { user: boolean }
}
type UserFindUniqueArg = { where: { email: string } }
type UserUpdateArg = {
  where: { id: string }
  data: { emailVerifiedAt: Date; emailVerificationStatus: string }
}

const tokenCreateMock = vi.fn<(arg: TokenCreateArg) => Promise<unknown>>()
const tokenUpdateMock = vi.fn<(arg: TokenUpdateArg) => Promise<unknown>>()
const tokenUpdateManyMock = vi.fn<(arg: TokenUpdateManyArg) => Promise<unknown>>()
const tokenFindUniqueMock = vi.fn<(arg: TokenFindUniqueArg) => Promise<unknown>>()
const userFindUniqueMock = vi.fn<(arg: UserFindUniqueArg) => Promise<unknown>>()
const userUpdateMock = vi.fn<(arg: UserUpdateArg) => Promise<unknown>>()

const transactionMock = vi.fn(async (ops: unknown) => {
  // The verification module passes either an array of pending Prisma ops or
  // a callback. Either way we just resolve to an array of empty results so
  // callers that destructure tx return values don't crash.
  if (Array.isArray(ops)) return ops.map(() => ({}))
  return undefined
})

const sendVerificationEmailMock =
  vi.fn<(user: { id: string; name: string; email: string }, rawToken: string) => Promise<void>>()
const sendVerificationSuccessEmailMock =
  vi.fn<(user: { id: string; name: string; email: string }) => Promise<void>>()

const redisGetMock = vi.fn()
const redisTtlMock = vi.fn()
const redisSetMock = vi.fn()

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    emailVerificationToken: {
      create: tokenCreateMock,
      update: tokenUpdateMock,
      updateMany: tokenUpdateManyMock,
      findUnique: tokenFindUniqueMock,
    },
    user: {
      findUnique: userFindUniqueMock,
      update: userUpdateMock,
    },
    $transaction: transactionMock,
  },
}))

vi.mock("@/server/cache/redis", () => ({
  redis: {
    get: redisGetMock,
    ttl: redisTtlMock,
    set: redisSetMock,
  },
  cacheKeys: {
    verificationCooldown: (email: string) => `email-verify-cooldown:${email}`,
    publicInvitation: (s: string) => `p:${s}`,
    subscription: (id: string) => `s:${id}`,
    rateLimit: (id: string, action: string) => `rl:${id}:${action}`,
  },
}))

vi.mock("@/server/email/email-service", () => ({
  sendVerificationEmail: sendVerificationEmailMock,
  sendVerificationSuccessEmail: sendVerificationSuccessEmailMock,
}))

beforeEach(() => {
  tokenCreateMock.mockReset()
  tokenUpdateMock.mockReset()
  tokenUpdateManyMock.mockReset()
  tokenFindUniqueMock.mockReset()
  userFindUniqueMock.mockReset()
  userUpdateMock.mockReset()
  redisGetMock.mockReset()
  redisTtlMock.mockReset()
  redisSetMock.mockReset()
  sendVerificationEmailMock.mockReset().mockResolvedValue(undefined)
  sendVerificationSuccessEmailMock.mockReset().mockResolvedValue(undefined)
  transactionMock.mockClear()
})

// Helper: SHA-256 the token the same way the production code does so tests
// can assert against expected hash values without re-implementing the algo.
function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex")
}

// ── sendInitialVerification: token persistence ──────────────────────────────
describe("sendInitialVerification", () => {
  it("stores the SHA-256 hash, never the raw token, and emails it", async () => {
    tokenCreateMock.mockResolvedValue({ id: "t1" })
    tokenUpdateManyMock.mockResolvedValue({ count: 0 })
    sendVerificationEmailMock.mockResolvedValue(undefined)

    const { sendInitialVerification } = await import("@/server/email/verification")
    await sendInitialVerification({ id: "u1", name: "Andi", email: "a@b.com" })

    // The transaction wrapper got called with an array of two ops (mark-old +
    // create-new). We grab the create call directly from its mock.
    expect(tokenCreateMock).toHaveBeenCalledTimes(1)
    const createArgs = tokenCreateMock.mock.calls[0]?.[0]
    if (!createArgs) throw new Error("expected tokenCreate to have been called")
    expect(createArgs.data.userId).toBe("u1")
    expect(createArgs.data.tokenHash).toMatch(/^[0-9a-f]{64}$/)
    // The raw token must not appear in the persisted row
    const tokenSentToEmail = sendVerificationEmailMock.mock.calls[0]?.[1]
    if (typeof tokenSentToEmail !== "string") {
      throw new Error("expected sendVerificationEmail to have received a token string")
    }
    expect(createArgs.data.tokenHash).not.toBe(tokenSentToEmail)
    // And the hash must be SHA-256 of the raw token
    expect(createArgs.data.tokenHash).toBe(sha256(tokenSentToEmail))
  })

  it("invalidates pending tokens before issuing a new one", async () => {
    tokenUpdateManyMock.mockResolvedValue({ count: 2 })
    tokenCreateMock.mockResolvedValue({ id: "t2" })
    const { sendInitialVerification } = await import("@/server/email/verification")
    await sendInitialVerification({ id: "u1", name: "A", email: "a@b.com" })
    expect(tokenUpdateManyMock).toHaveBeenCalledWith({
      where: { userId: "u1", usedAt: null },
      data: { usedAt: expect.any(Date) },
    })
  })

  it("sets expiresAt approximately TTL minutes from now", async () => {
    process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES = "30"
    tokenCreateMock.mockResolvedValue({ id: "t3" })
    tokenUpdateManyMock.mockResolvedValue({ count: 0 })
    const { sendInitialVerification } = await import("@/server/email/verification")
    await sendInitialVerification({ id: "u1", name: "A", email: "a@b.com" })
    const createArgs = tokenCreateMock.mock.calls[0]?.[0]
    if (!createArgs) throw new Error("expected tokenCreate to have been called")
    const expiresAt = createArgs.data.expiresAt
    const drift = expiresAt.getTime() - Date.now() - 30 * 60 * 1000
    expect(Math.abs(drift)).toBeLessThan(1000)
  })
})

// ── verifyEmailToken: lifecycle ─────────────────────────────────────────────
describe("verifyEmailToken", () => {
  it("hashes the input with SHA-256 before looking up the row", async () => {
    tokenFindUniqueMock.mockResolvedValueOnce(null)
    const { verifyEmailToken } = await import("@/server/email/verification")
    const result = await verifyEmailToken("not-a-real-token-but-long-enough-to-pass")
    expect(result).toEqual({ ok: false, reason: "INVALID" })
    expect(tokenFindUniqueMock).toHaveBeenCalledWith({
      where: { tokenHash: sha256("not-a-real-token-but-long-enough-to-pass") },
      include: { user: true },
    })
  })

  it("rejects an expired token", async () => {
    tokenFindUniqueMock.mockResolvedValueOnce({
      id: "t1",
      userId: "u1",
      tokenHash: "h",
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
      user: { id: "u1" },
    })
    const { verifyEmailToken } = await import("@/server/email/verification")
    const result = await verifyEmailToken("anything-long-enough-to-pass")
    expect(result).toEqual({ ok: false, reason: "EXPIRED" })
  })

  it("rejects a token that was already consumed (single-use)", async () => {
    tokenFindUniqueMock.mockResolvedValueOnce({
      id: "t1",
      userId: "u1",
      tokenHash: "h",
      usedAt: new Date(Date.now() - 1000), // already used earlier
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: "u1" },
    })
    const { verifyEmailToken } = await import("@/server/email/verification")
    const result = await verifyEmailToken("anything-long-enough-to-pass")
    expect(result).toEqual({ ok: false, reason: "USED" })
  })

  it("on success: marks usedAt + flips the user to VERIFIED in one transaction", async () => {
    const updatedUser = {
      id: "u1",
      email: "a@b.com",
      name: "A",
      emailVerifiedAt: new Date(),
      emailVerificationStatus: "VERIFIED",
    }
    tokenFindUniqueMock.mockResolvedValueOnce({
      id: "t1",
      userId: "u1",
      tokenHash: "h",
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: "u1", email: "a@b.com", name: "A" },
    })
    transactionMock.mockResolvedValueOnce([{}, updatedUser])

    const { verifyEmailToken } = await import("@/server/email/verification")
    const result = await verifyEmailToken("anything-long-enough-to-pass")

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.user.emailVerificationStatus).toBe("VERIFIED")
    }
    // Best-effort confirmation email is fired but not awaited blocking
    expect(sendVerificationSuccessEmailMock).toHaveBeenCalledTimes(1)
  })
})

// ── resendVerification: cooldown via Redis ──────────────────────────────────
describe("resendVerification cooldown", () => {
  it("returns COOLDOWN with the remaining seconds when Redis has the key", async () => {
    redisGetMock.mockResolvedValueOnce("1")
    redisTtlMock.mockResolvedValueOnce(42)
    const { resendVerification } = await import("@/server/email/verification")
    const result = await resendVerification("a@b.com")
    expect(result).toEqual({
      ok: false,
      reason: "COOLDOWN",
      retryAfterSeconds: 42,
    })
    // No new token should be issued while a cooldown is active
    expect(tokenCreateMock).not.toHaveBeenCalled()
    expect(sendVerificationEmailMock).not.toHaveBeenCalled()
  })

  it("falls back to the configured cooldown when Redis TTL returns -1", async () => {
    redisGetMock.mockResolvedValueOnce("1")
    redisTtlMock.mockResolvedValueOnce(-1)
    process.env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS = "90"
    const { resendVerification } = await import("@/server/email/verification")
    const result = await resendVerification("a@b.com")
    if (!result.ok && result.reason === "COOLDOWN") {
      expect(result.retryAfterSeconds).toBe(90)
    } else {
      throw new Error("expected COOLDOWN result")
    }
  })

  it("anti-enumeration: unknown email still sets a cooldown and reports UNKNOWN", async () => {
    redisGetMock.mockResolvedValueOnce(null)
    userFindUniqueMock.mockResolvedValueOnce(null)
    redisSetMock.mockResolvedValueOnce("OK")
    const { resendVerification } = await import("@/server/email/verification")
    const result = await resendVerification("ghost@example.com")
    expect(result).toEqual({ ok: false, reason: "UNKNOWN" })
    expect(redisSetMock).toHaveBeenCalledWith(
      "email-verify-cooldown:ghost@example.com",
      "1",
      "EX",
      60
    )
    // Crucially: no token issued and no email sent for a non-existent user
    expect(tokenCreateMock).not.toHaveBeenCalled()
    expect(sendVerificationEmailMock).not.toHaveBeenCalled()
  })

  it("does not re-issue when the user is already verified", async () => {
    redisGetMock.mockResolvedValueOnce(null)
    userFindUniqueMock.mockResolvedValueOnce({
      id: "u1",
      email: "a@b.com",
      name: "A",
      emailVerifiedAt: new Date(),
    })
    const { resendVerification } = await import("@/server/email/verification")
    const result = await resendVerification("a@b.com")
    expect(result).toEqual({ ok: false, reason: "ALREADY_VERIFIED" })
    expect(tokenCreateMock).not.toHaveBeenCalled()
  })

  it("issues a new token + sets cooldown when user is unverified", async () => {
    redisGetMock.mockResolvedValueOnce(null)
    userFindUniqueMock.mockResolvedValueOnce({
      id: "u1",
      email: "a@b.com",
      name: "A",
      emailVerifiedAt: null,
    })
    tokenUpdateManyMock.mockResolvedValueOnce({ count: 0 })
    tokenCreateMock.mockResolvedValueOnce({ id: "tnew" })
    redisSetMock.mockResolvedValueOnce("OK")
    const { resendVerification } = await import("@/server/email/verification")
    const result = await resendVerification("a@b.com")
    expect(result).toEqual({ ok: true })
    expect(sendVerificationEmailMock).toHaveBeenCalledTimes(1)
    expect(redisSetMock).toHaveBeenCalledWith(
      "email-verify-cooldown:a@b.com",
      "1",
      "EX",
      expect.any(Number)
    )
  })
})
