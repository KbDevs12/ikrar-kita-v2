import { describe, it, expect } from "vitest"
import {
  adminManualApproveSchema,
  adminCancelInvoiceSchema,
  adminInvoiceSyncSchema,
  adminToggleInvitationSchema,
} from "@/lib/validators/admin"

const cuid = "ckxyz0000000000000000000"

describe("adminManualApproveSchema", () => {
  it("requires a note of at least 10 characters", () => {
    expect(
      adminManualApproveSchema.safeParse({ invoiceId: cuid, note: "" }).success
    ).toBe(false)
    expect(
      adminManualApproveSchema.safeParse({ invoiceId: cuid, note: "short" }).success
    ).toBe(false)
    expect(
      adminManualApproveSchema.safeParse({
        invoiceId: cuid,
        note: "konfirmasi transfer manual #TRF20260601-001",
      }).success
    ).toBe(true)
  })

  it("rejects whitespace-only notes", () => {
    expect(
      adminManualApproveSchema.safeParse({
        invoiceId: cuid,
        note: "          ",
      }).success
    ).toBe(false)
  })

  it("caps notes at 1000 characters", () => {
    expect(
      adminManualApproveSchema.safeParse({
        invoiceId: cuid,
        note: "x".repeat(1001),
      }).success
    ).toBe(false)
  })

  it("requires a CUID invoiceId", () => {
    expect(
      adminManualApproveSchema.safeParse({
        invoiceId: "not-a-cuid",
        note: "konfirmasi via WA admin",
      }).success
    ).toBe(false)
  })
})

describe("adminCancelInvoiceSchema", () => {
  it("accepts no reason at all", () => {
    expect(
      adminCancelInvoiceSchema.safeParse({ invoiceId: cuid }).success
    ).toBe(true)
  })

  it("accepts an empty string reason (UI default)", () => {
    expect(
      adminCancelInvoiceSchema.safeParse({ invoiceId: cuid, reason: "" }).success
    ).toBe(true)
  })

  it("rejects a reason that is too short", () => {
    expect(
      adminCancelInvoiceSchema.safeParse({ invoiceId: cuid, reason: "no" }).success
    ).toBe(false)
  })

  it("accepts a reasonable reason", () => {
    expect(
      adminCancelInvoiceSchema.safeParse({
        invoiceId: cuid,
        reason: "user salah pilih paket, akan checkout ulang",
      }).success
    ).toBe(true)
  })
})

describe("adminInvoiceSyncSchema", () => {
  it("requires a CUID", () => {
    expect(adminInvoiceSyncSchema.safeParse({ invoiceId: cuid }).success).toBe(true)
    expect(adminInvoiceSyncSchema.safeParse({ invoiceId: "x" }).success).toBe(false)
  })
})

describe("adminToggleInvitationSchema", () => {
  it("requires a boolean for archived", () => {
    expect(
      adminToggleInvitationSchema.safeParse({
        invitationId: cuid,
        archived: true,
      }).success
    ).toBe(true)
    expect(
      adminToggleInvitationSchema.safeParse({
        invitationId: cuid,
        archived: "yes",
      }).success
    ).toBe(false)
  })
})
