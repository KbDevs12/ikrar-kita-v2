import { describe, it, expect } from "vitest"
import { registerSchema, loginSchema, verifyEmailSchema } from "@/lib/validators/auth"

describe("registerSchema", () => {
  it("accepts a typical Indonesian user", () => {
    const result = registerSchema.safeParse({
      name: "Andi Pratama",
      email: "andi@gmail.com",
      password: "rahasia123",
    })
    expect(result.success).toBe(true)
  })

  it("normalises email to lowercase", () => {
    const result = registerSchema.parse({
      name: "Andi",
      email: " ANDI@GMAIL.COM ",
      password: "rahasia123",
    })
    expect(result.email).toBe("andi@gmail.com")
  })

  it("rejects passwords without numbers", () => {
    const result = registerSchema.safeParse({
      name: "Andi",
      email: "andi@gmail.com",
      password: "rahasiarahasia",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"])
    }
  })

  it("rejects disposable / typo / etc via the email layer (format only here)", () => {
    const result = registerSchema.safeParse({
      name: "Andi",
      email: "not-an-email",
      password: "rahasia123",
    })
    expect(result.success).toBe(false)
  })

  it("rejects honeypot bot submissions", () => {
    const result = registerSchema.safeParse({
      name: "Bot",
      email: "bot@example.com",
      password: "rahasia123",
      website: "https://spam.test",
    })
    expect(result.success).toBe(false)
  })
})

describe("loginSchema", () => {
  it("requires both fields", () => {
    expect(loginSchema.safeParse({}).success).toBe(false)
    expect(loginSchema.safeParse({ email: "a@a.com", password: "" }).success).toBe(false)
  })
})

describe("verifyEmailSchema", () => {
  it("rejects very short tokens", () => {
    expect(verifyEmailSchema.safeParse({ token: "short" }).success).toBe(false)
  })
  it("accepts plausible random tokens", () => {
    expect(
      verifyEmailSchema.safeParse({ token: "a".repeat(64) }).success
    ).toBe(true)
  })
})
