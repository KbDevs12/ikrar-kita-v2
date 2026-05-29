import { describe, it, expect } from "vitest"
import {
  planCodeSchema,
  paymentMethodCodeSchema,
  checkoutSchema,
  invoiceSyncSchema,
  tripayCallbackSchema,
} from "@/lib/validators/billing"

describe("planCodeSchema", () => {
  it.each(["BASIC", "PRO", "RESELLER"])(
    "accepts the spec plan code %s",
    (code) => {
      expect(planCodeSchema.safeParse(code).success).toBe(true)
    }
  )

  it.each(["FREE", "GOLD", "basic", "pro", "Reseller", "", "BASIC "])(
    "rejects %s",
    (code) => {
      expect(planCodeSchema.safeParse(code).success).toBe(false)
    }
  )
})

describe("paymentMethodCodeSchema", () => {
  it.each(["BRIVA", "QRIS", "OVO", "BNIVA", "MANDIRIVA", "DANA"])(
    "accepts uppercase alphanumeric code %s",
    (code) => {
      expect(paymentMethodCodeSchema.safeParse(code).success).toBe(true)
    }
  )

  it("normalises whitespace and case", () => {
    const result = paymentMethodCodeSchema.parse(" briva ")
    expect(result).toBe("BRIVA")
  })

  it.each([
    "X", // too short (< 2)
    "TOOOOOOOOOOOOOOOOLONG", // > 16
    "BRI VA", // space
    "BRIVA-1", // dash
    "bri.va", // dot
    "BRIVA!",
    "",
  ])("rejects %s", (code) => {
    expect(paymentMethodCodeSchema.safeParse(code).success).toBe(false)
  })
})

describe("checkoutSchema", () => {
  it("accepts a typical user-submitted checkout", () => {
    const result = checkoutSchema.safeParse({
      planCode: "PRO",
      paymentMethodCode: "QRIS",
    })
    expect(result.success).toBe(true)
  })

  it("requires both fields", () => {
    expect(checkoutSchema.safeParse({}).success).toBe(false)
    expect(
      checkoutSchema.safeParse({ planCode: "BASIC" }).success
    ).toBe(false)
    expect(
      checkoutSchema.safeParse({ paymentMethodCode: "QRIS" }).success
    ).toBe(false)
  })

  it("rejects an unknown plan", () => {
    expect(
      checkoutSchema.safeParse({
        planCode: "ENTERPRISE",
        paymentMethodCode: "QRIS",
      }).success
    ).toBe(false)
  })

  it("rejects a malformed payment method code", () => {
    expect(
      checkoutSchema.safeParse({
        planCode: "PRO",
        paymentMethodCode: "qris with spaces",
      }).success
    ).toBe(false)
  })

  it("rejects extra fields silently? - actually .object() ignores them", () => {
    const result = checkoutSchema.safeParse({
      planCode: "BASIC",
      paymentMethodCode: "QRIS",
      injectAdminFlag: true,
    })
    // Zod default strips unknown keys but does not error - this is the
    // expected behaviour and protects callers from privilege escalation
    // through extra payload fields.
    expect(result.success).toBe(true)
    if (result.success) {
      expect("injectAdminFlag" in result.data).toBe(false)
    }
  })
})

describe("invoiceSyncSchema", () => {
  it("accepts a CUID invoice id", () => {
    expect(
      invoiceSyncSchema.safeParse({ invoiceId: "ckxyz0000000000000000000" })
        .success
    ).toBe(true)
  })

  it("rejects garbage strings and non-strings", () => {
    expect(invoiceSyncSchema.safeParse({ invoiceId: "" }).success).toBe(false)
    expect(invoiceSyncSchema.safeParse({ invoiceId: "not-a-cuid" }).success).toBe(
      false
    )
    expect(invoiceSyncSchema.safeParse({ invoiceId: 123 }).success).toBe(false)
    expect(invoiceSyncSchema.safeParse({}).success).toBe(false)
  })
})

describe("tripayCallbackSchema", () => {
  const validBase = {
    reference: "DEV-T0000001",
    merchant_ref: "IK-20260101-AAA1",
    payment_method_code: "QRIS",
    total_amount: 100000,
    status: "PAID",
  }

  it("accepts the minimum required Tripay callback shape", () => {
    expect(tripayCallbackSchema.safeParse(validBase).success).toBe(true)
  })

  it("coerces numeric strings into numbers (Tripay quirk)", () => {
    const result = tripayCallbackSchema.parse({
      ...validBase,
      total_amount: "100000",
    })
    expect(result.total_amount).toBe(100000)
  })

  it("passes through unknown extra fields untouched (forward-compat)", () => {
    const result = tripayCallbackSchema.parse({
      ...validBase,
      this_field_was_added_by_tripay_next_quarter: "ok",
    })
    expect(
      (result as Record<string, unknown>).this_field_was_added_by_tripay_next_quarter
    ).toBe("ok")
  })

  it("rejects when required fields are missing", () => {
    expect(
      tripayCallbackSchema.safeParse({ reference: "x" }).success
    ).toBe(false)
    expect(
      tripayCallbackSchema.safeParse({ ...validBase, status: undefined })
        .success
    ).toBe(false)
    expect(
      tripayCallbackSchema.safeParse({ ...validBase, merchant_ref: "" })
        .success
    ).toBe(false)
  })

  it("rejects negative total_amount", () => {
    expect(
      tripayCallbackSchema.safeParse({ ...validBase, total_amount: -1 }).success
    ).toBe(false)
  })

  it("accepts is_closed_payment only as 0 or 1", () => {
    expect(
      tripayCallbackSchema.safeParse({
        ...validBase,
        is_closed_payment: 1,
      }).success
    ).toBe(true)
    expect(
      tripayCallbackSchema.safeParse({
        ...validBase,
        is_closed_payment: 2,
      }).success
    ).toBe(false)
  })
})
