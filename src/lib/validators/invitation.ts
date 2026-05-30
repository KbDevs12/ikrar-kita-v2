import { z } from "zod"
import { TEMPLATE_IDS } from "@/lib/constants/invitation-templates"

/**
 * Invitation validators - reused by:
 *   - the multi-step builder (TanStack Form) per step via partial schemas
 *   - the API route handlers / server actions for create / update / publish
 *
 * The whole-document schema is the canonical source. Each step exports a
 * smaller schema derived from a shared shape so we cannot drift.
 */

// ─── Slug ────────────────────────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/

export const slugSchema = z
  .string({ required_error: "Nama pengundang (slug) wajib diisi" })
  .trim()
  .toLowerCase()
  .min(3, "Slug minimal 3 karakter")
  .max(64, "Slug maksimal 64 karakter")
  .regex(SLUG_REGEX, "Hanya huruf kecil, angka, dan tanda hubung")

/**
 * Sanitise a freeform string to a valid slug. Used to suggest a slug from
 * couple names. Always re-validate the result with slugSchema.
 */
export function sanitiseSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
}

// ─── Field shapes ────────────────────────────────────────────────────────────
// We keep raw shapes so we can compose without going through ZodEffects.

const isoDateTime = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  message: "Tanggal tidak valid",
})

/**
 * Event date must not be in the past. Compared against the start of today
 * (local), so an event scheduled for today is still allowed. Kept in sync
 * with the `minDate` floor enforced by the DatePicker in the builder UI.
 */
const eventDateSchema = isoDateTime.refine(
  (val) => {
    const date = new Date(val)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  },
  { message: "Tanggal acara tidak boleh di masa lalu" }
)

export const eventScheduleItemSchema = z
  .object({
    label: z.string().trim().min(2).max(80),
    startsAt: isoDateTime,
    // `endsAt` is optional. The builder emits an empty string for a not-yet
    // chosen end time, so we accept "" as "absent" alongside `undefined`.
    endsAt: isoDateTime.optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional(),
  })
  .refine(
    (item) => {
      if (!item.endsAt) return true // endsAt optional - skip when empty
      return new Date(item.endsAt) > new Date(item.startsAt)
    },
    { message: "Jam selesai harus setelah jam mulai", path: ["endsAt"] }
  )

export type EventScheduleItem = z.infer<typeof eventScheduleItemSchema>

const giftAccountSchema = z.object({
  bankName: z.string().trim().min(2).max(60),
  accountNumber: z
    .string()
    .trim()
    .regex(/^[0-9 -]{6,32}$/, "Nomor rekening hanya boleh angka, spasi, dan strip"),
  accountHolder: z.string().trim().min(2).max(80),
})

export type GiftAccount = z.infer<typeof giftAccountSchema>

// ─── Step shapes (raw - composable) ──────────────────────────────────────────

const coupleShape = {
  groomName: z.string().trim().min(2, "Nama mempelai pria wajib diisi").max(80),
  groomFatherName: z.string().trim().max(80).optional().or(z.literal("")),
  groomMotherName: z.string().trim().max(80).optional().or(z.literal("")),
  brideName: z.string().trim().min(2, "Nama mempelai wanita wajib diisi").max(80),
  brideFatherName: z.string().trim().max(80).optional().or(z.literal("")),
  brideMotherName: z.string().trim().max(80).optional().or(z.literal("")),
  coupleStory: z.string().trim().max(4000).optional().or(z.literal("")),
} as const

const eventShape = {
  title: z.string().trim().max(120).optional().or(z.literal("")),
  eventDate: eventDateSchema,
  schedule: z.array(eventScheduleItemSchema).min(1, "Minimal satu jadwal acara").max(10),
} as const

const locationShape = {
  venueName: z.string().trim().min(2, "Nama lokasi wajib diisi").max(120),
  venueAddress: z.string().trim().min(5, "Alamat wajib diisi").max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  mapsUrl: z.string().url().max(500).optional().or(z.literal("")),
} as const

const mediaShape = {
  coverImageUrl: z.string().url().max(500).optional().or(z.literal("")),
  musicUrl: z.string().url().max(500).optional().or(z.literal("")),
  galleryUrls: z.array(z.string().url().max(500)).max(30).default([]),
} as const

const themeShape = {
  theme: z.enum(TEMPLATE_IDS as unknown as [string, ...string[]]),
  primaryColor: z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Warna harus format hex (#RRGGBB)")
    .optional()
    .or(z.literal("")),
} as const

const extrasShape = {
  rsvpEnabled: z.boolean().default(true),
  guestMessageEnabled: z.boolean().default(true),
  giftEnabled: z.boolean().default(false),
  giftAccounts: z.array(giftAccountSchema).max(5).default([]),
  metaTitle: z.string().trim().max(80).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(200).optional().or(z.literal("")),
  openingQuote: z.string().trim().max(500).optional().or(z.literal("")),
} as const

// ─── Step validators (with cross-field refinements where needed) ─────────────

export const stepCoupleSchema = z.object(coupleShape)
export type StepCoupleInput = z.infer<typeof stepCoupleSchema>

export const stepEventSchema = z.object(eventShape).superRefine((data, ctx) => {
  const eventTs = Date.parse(data.eventDate)
  for (const [i, item] of data.schedule.entries()) {
    // endsAt-after-startsAt is enforced on the schedule item itself.
    if (Math.abs(Date.parse(item.startsAt) - eventTs) > 1000 * 60 * 60 * 24 * 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["schedule", i, "startsAt"],
        message: "Tanggal jadwal terlalu jauh dari tanggal acara",
      })
    }
  }
})
export type StepEventInput = z.infer<typeof stepEventSchema>

export const stepLocationSchema = z.object(locationShape)
export type StepLocationInput = z.infer<typeof stepLocationSchema>

export const stepMediaSchema = z.object(mediaShape)
export type StepMediaInput = z.infer<typeof stepMediaSchema>

export const stepThemeSchema = z.object(themeShape)
export type StepThemeInput = z.infer<typeof stepThemeSchema>

export const stepExtrasSchema = z.object(extrasShape)
export type StepExtrasInput = z.infer<typeof stepExtrasSchema>

// ─── Whole document ──────────────────────────────────────────────────────────

const fullShape = {
  slug: slugSchema,
  ...coupleShape,
  ...eventShape,
  ...locationShape,
  ...mediaShape,
  ...themeShape,
  ...extrasShape,
}

export const invitationCreateSchema = z.object(fullShape).superRefine((data, ctx) => {
  // Re-apply event cross-field validation at the document level too
  const eventTs = Date.parse(data.eventDate)
  for (const [i, item] of data.schedule.entries()) {
    // endsAt-after-startsAt is enforced on the schedule item itself.
    if (Math.abs(Date.parse(item.startsAt) - eventTs) > 1000 * 60 * 60 * 24 * 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["schedule", i, "startsAt"],
        message: "Tanggal jadwal terlalu jauh dari tanggal acara",
      })
    }
  }
  // Latitude / longitude are paired
  const hasLat = typeof data.latitude === "number"
  const hasLng = typeof data.longitude === "number"
  if (hasLat !== hasLng) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [hasLat ? "longitude" : "latitude"],
      message: "Lokasi harus berisi latitude dan longitude sekaligus",
    })
  }
})

export type InvitationCreateInput = z.infer<typeof invitationCreateSchema>

export const invitationUpdateSchema = z.object(fullShape).partial().extend({
  slug: slugSchema.optional(),
})
export type InvitationUpdateInput = z.infer<typeof invitationUpdateSchema>

export const invitationPublishSchema = z.object({
  invitationId: z.string().cuid(),
})

export const invitationArchiveSchema = z.object({
  invitationId: z.string().cuid(),
})

// ─── Public page query ───────────────────────────────────────────────────────

/**
 * `?to=` recipient name from the URL. Length-limited and stripped of any
 * angle brackets so the value can be safely placed in attributes after
 * additional escaping at render time. Final HTML escaping still happens at
 * render via React's text-children semantics.
 */
export const recipientQuerySchema = z
  .string()
  .max(120, "Nama penerima terlalu panjang")
  .transform((v) => v.replace(/[<>]/g, "").replace(/\s+/g, " ").trim())

export const DEFAULT_RECIPIENT = "Tamu Undangan"

export function sanitiseRecipient(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_RECIPIENT
  const result = recipientQuerySchema.safeParse(raw)
  if (!result.success) return DEFAULT_RECIPIENT
  return result.data.length > 0 ? result.data : DEFAULT_RECIPIENT
}
