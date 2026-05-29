import { describe, it, expect } from "vitest"
import {
  emailSchema,
  quickCheckEmail,
  suggestEmailDomainCorrection,
  getEmailDomain,
} from "@/lib/validators/email"
import { isDisposableEmailDomain } from "@/lib/constants/disposable-email-domains"

describe("emailSchema", () => {
  it("accepts standard providers", () => {
    for (const e of [
      "user@gmail.com",
      "user.name@outlook.com",
      "user+tag@protonmail.com",
      "user@my-company.co.id",
    ]) {
      expect(emailSchema.safeParse(e).success).toBe(true)
    }
  })

  it("rejects malformed values", () => {
    for (const e of ["plainstring", "no-at-sign", "user@", "@example.com", "a@b"]) {
      expect(emailSchema.safeParse(e).success).toBe(false)
    }
  })
})

describe("suggestEmailDomainCorrection", () => {
  it.each([
    ["user@gmai.com", "user@gmail.com"],
    ["user@gmail.con", "user@gmail.com"],
    ["user@hotmial.com", "user@hotmail.com"],
    ["user@yaho.com", "user@yahoo.com"],
  ])("suggests %s -> %s", (input, expected) => {
    expect(suggestEmailDomainCorrection(input)).toBe(expected)
  })

  it("returns null for clean domains", () => {
    expect(suggestEmailDomainCorrection("user@gmail.com")).toBeNull()
    expect(suggestEmailDomainCorrection("user@my-company.co.id")).toBeNull()
  })
})

describe("isDisposableEmailDomain", () => {
  it("flags known disposable providers", () => {
    expect(isDisposableEmailDomain("mailinator.com")).toBe(true)
    expect(isDisposableEmailDomain("YOPMAIL.COM")).toBe(true)
    expect(isDisposableEmailDomain("10minutemail.com")).toBe(true)
  })
  it("does not flag normal providers", () => {
    expect(isDisposableEmailDomain("gmail.com")).toBe(false)
    expect(isDisposableEmailDomain("my-company.co.id")).toBe(false)
  })
})

describe("quickCheckEmail", () => {
  it("returns ok for clean emails", () => {
    expect(quickCheckEmail("user@gmail.com")).toEqual({ ok: true })
  })
  it("returns DISPOSABLE for blocked domains", () => {
    const r = quickCheckEmail("user@mailinator.com")
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe("DISPOSABLE")
  })
  it("returns TYPO_SUGGESTION with a fix", () => {
    const r = quickCheckEmail("user@gmai.com")
    expect(r.ok).toBe(false)
    if (!r.ok && r.code === "TYPO_SUGGESTION") {
      expect(r.suggestion).toBe("user@gmail.com")
    } else {
      throw new Error("expected TYPO_SUGGESTION")
    }
  })
  it("returns INVALID_FORMAT for garbage", () => {
    const r = quickCheckEmail("not-an-email")
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe("INVALID_FORMAT")
  })
})

describe("getEmailDomain", () => {
  it("extracts and lowercases", () => {
    expect(getEmailDomain("User@GMAIL.COM")).toBe("gmail.com")
  })
  it("returns empty string for non-emails", () => {
    expect(getEmailDomain("not-email")).toBe("")
  })
})
