import { describe, it, expect, beforeEach } from "vitest"
import { createHmac } from "node:crypto"

// Set required env BEFORE importing the module - tripay.ts reads at module init
beforeEach(() => {
  process.env.TRIPAY_MODE = "sandbox"
  process.env.TRIPAY_API_KEY = "test-api-key"
  process.env.TRIPAY_PRIVATE_KEY = "test-private-key"
  process.env.TRIPAY_MERCHANT_CODE = "T9999"
  process.env.TRIPAY_CALLBACK_URL = "http://localhost:3000/api/webhooks/tripay"
  process.env.TRIPAY_RETURN_URL = "http://localhost:3000/dashboard/billing"
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"
  process.env.REDIS_URL = "redis://localhost:6379"
  process.env.MINIO_ENDPOINT = "http://localhost:9000"
  process.env.MINIO_PUBLIC_URL = "http://localhost:9000"
  process.env.MINIO_ACCESS_KEY = "minio"
  process.env.MINIO_SECRET_KEY = "minio12345"
  process.env.SMTP_USER = "test@example.com"
  process.env.SMTP_PASSWORD = "secret"
  process.env.SMTP_FROM_EMAIL = "noreply@example.com"
  process.env.ADMIN_NOTIFICATION_EMAIL = "admin@example.com"
})

describe("tripay signatures", () => {
  it("generateClosedPaymentSignature matches HMAC-SHA256(merchantCode + ref + amount, privateKey)", async () => {
    const { generateClosedPaymentSignature } = await import("@/server/payment/tripay")
    const sig = generateClosedPaymentSignature("IK-20260101-ABC12345", 100_000)
    const expected = createHmac("sha256", "test-private-key")
      .update("T9999IK-20260101-ABC12345100000")
      .digest("hex")
    expect(sig).toBe(expected)
  })

  it("verifyCallbackSignature accepts a valid signature", async () => {
    const { verifyCallbackSignature } = await import("@/server/payment/tripay")
    const body = '{"reference":"DEV-T0000001","status":"PAID","total_amount":100000}'
    const sig = createHmac("sha256", "test-private-key").update(body).digest("hex")
    expect(verifyCallbackSignature(body, sig)).toBe(true)
  })

  it("verifyCallbackSignature rejects a forged signature", async () => {
    const { verifyCallbackSignature } = await import("@/server/payment/tripay")
    const body = '{"reference":"DEV-T0000001","status":"PAID","total_amount":100000}'
    const sig = createHmac("sha256", "wrong-key").update(body).digest("hex")
    expect(verifyCallbackSignature(body, sig)).toBe(false)
  })

  it("verifyCallbackSignature rejects mismatched lengths without throwing", async () => {
    const { verifyCallbackSignature } = await import("@/server/payment/tripay")
    expect(verifyCallbackSignature("anything", "short")).toBe(false)
  })
})

describe("parseCallback", () => {
  it("returns invalid signature when signature header missing", async () => {
    const { parseCallback } = await import("@/server/payment/tripay")
    const r = parseCallback("{}", { signature: null, event: "payment_status" })
    expect(r.signatureValid).toBe(false)
  })

  it("returns parsed payload on valid signature + valid event + valid JSON", async () => {
    const { parseCallback } = await import("@/server/payment/tripay")
    const body = JSON.stringify({
      reference: "DEV-T0000001",
      merchant_ref: "IK-20260101-ABC12345",
      payment_method: "QRIS",
      payment_method_code: "QRIS",
      total_amount: 100000,
      status: "PAID",
    })
    const sig = createHmac("sha256", "test-private-key").update(body).digest("hex")
    const r = parseCallback(body, { signature: sig, event: "payment_status" })
    expect(r.signatureValid).toBe(true)
    expect(r.payload).not.toBeNull()
    expect(r.payload?.merchant_ref).toBe("IK-20260101-ABC12345")
    expect(r.payload?.status).toBe("PAID")
  })

  it("flags schema mismatch when fields are missing even if signature is valid", async () => {
    const { parseCallback } = await import("@/server/payment/tripay")
    const body = JSON.stringify({ unrelated: "data" })
    const sig = createHmac("sha256", "test-private-key").update(body).digest("hex")
    const r = parseCallback(body, { signature: sig, event: "payment_status" })
    expect(r.signatureValid).toBe(true)
    expect(r.payload).toBeNull()
    expect(r.parseError).toBe("schema_mismatch")
  })
})
