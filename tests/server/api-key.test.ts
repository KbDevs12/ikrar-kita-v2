import { describe, it, expect, beforeEach, vi } from "vitest"

beforeEach(() => {
  process.env.ADMIN_API_KEY = "x".repeat(32)
  process.env.INTERNAL_API_KEY = "this-is-the-real-internal-api-key-32b"
  process.env.CRON_SECRET = "this-is-the-real-cron-secret-32b-long"
  process.env.TRIPAY_MODE = "sandbox"
  process.env.TRIPAY_API_KEY = "x"
  process.env.TRIPAY_PRIVATE_KEY = "x"
  process.env.TRIPAY_MERCHANT_CODE = "x"
  process.env.TRIPAY_CALLBACK_URL = "http://localhost/x"
  process.env.TRIPAY_RETURN_URL = "http://localhost/x"
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
  process.env.SESSION_SECRET = "this-is-a-32-character-session-secret"
  vi.resetModules() // Clear module cache to ensure environment variables are re-read
})

function reqWith(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/internal/test", { headers })
}

describe("verifyInternalApiKey", () => {
  it("accepts a valid Bearer token", async () => {
    const { verifyInternalApiKey } = await import("@/server/security/api-key")
    expect(
      verifyInternalApiKey(
        reqWith({ Authorization: "Bearer this-is-the-real-internal-api-key-32b" })
      )
    ).toBe(true)
  })

  it("accepts a valid X-Internal-Api-Key header", async () => {
    const { verifyInternalApiKey } = await import("@/server/security/api-key")
    expect(
      verifyInternalApiKey(
        reqWith({ "X-Internal-Api-Key": "this-is-the-real-internal-api-key-32b" })
      )
    ).toBe(true)
  })

  it("rejects when no header is present", async () => {
    const { verifyInternalApiKey } = await import("@/server/security/api-key")
    expect(verifyInternalApiKey(reqWith({}))).toBe(false)
  })

  it("rejects an incorrect key (same length, different bytes)", async () => {
    const { verifyInternalApiKey } = await import("@/server/security/api-key")
    expect(
      verifyInternalApiKey(
        reqWith({ Authorization: "Bearer this-is-NOT-the-real-internal-key-32" })
      )
    ).toBe(false)
  })

  it("rejects an incorrect key with different length", async () => {
    const { verifyInternalApiKey } = await import("@/server/security/api-key")
    expect(verifyInternalApiKey(reqWith({ Authorization: "Bearer short" }))).toBe(false)
  })

  it("requireInternalApiKey throws UnauthorizedError on miss", async () => {
    const { requireInternalApiKey, UnauthorizedError } = await import("@/server/security/api-key")
    expect(() => requireInternalApiKey(reqWith({}))).toThrow(UnauthorizedError)
  })
})

describe("verifyCronSecret", () => {
  it("accepts the cron secret via X-Cron-Secret", async () => {
    const { verifyCronSecret } = await import("@/server/security/api-key")
    expect(
      verifyCronSecret(reqWith({ "X-Cron-Secret": "this-is-the-real-cron-secret-32b-long" }))
    ).toBe(true)
  })

  it("does not accept the internal API key as a cron secret", async () => {
    const { verifyCronSecret } = await import("@/server/security/api-key")
    expect(
      verifyCronSecret(reqWith({ "X-Cron-Secret": "this-is-the-real-internal-api-key-32b" }))
    ).toBe(false)
  })
})
