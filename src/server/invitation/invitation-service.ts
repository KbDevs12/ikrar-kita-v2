/**
 * Invitation domain service.
 *
 * Responsibilities:
 *   - CRUD with strict ownership checks
 *   - Slug uniqueness
 *   - Publish guard (status + verified user + active subscription + plan limit)
 *   - Cache invalidation on publish/edit/archive
 */
import "server-only"
import { Prisma, type Invitation, type User } from "@prisma/client"
import { prisma } from "@/server/db/prisma"
import {
  invitationCreateSchema,
  invitationUpdateSchema,
  type InvitationCreateInput,
  type InvitationUpdateInput,
} from "@/lib/validators/invitation"
import {
  invalidatePublicInvitation,
  invalidatePublicInvitationsForUser,
  toPublicView,
  setCachedPublicInvitation,
  getCachedPublicInvitation,
  type PublicInvitationView,
} from "./cache"
import { checkPublishLimit, getActiveSubscriptionView } from "@/server/subscription/subscription-service"

export class InvitationError extends Error {
  constructor(
    public code:
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "SLUG_TAKEN"
      | "EMAIL_NOT_VERIFIED"
      | "NO_ACTIVE_SUBSCRIPTION"
      | "LIMIT_REACHED"
      | "ALREADY_PUBLISHED"
      | "ARCHIVED",
    message: string
  ) {
    super(message)
    this.name = "InvitationError"
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureOwner(invitation: Invitation, userId: string): void {
  if (invitation.userId !== userId) {
    throw new InvitationError("FORBIDDEN", "Anda tidak memiliki akses ke undangan ini")
  }
}

function extractColumnFields(input: InvitationCreateInput) {
  // Map flat schema input -> top-level columns + content JSONB.
  // Top-level fields are the ones we index/list on. The rest goes into content.
  const {
    slug,
    groomName,
    brideName,
    title,
    eventDate,
    venueName,
    venueAddress,
    latitude,
    longitude,
    theme,
    primaryColor,
    coverImageUrl,
    musicUrl,
    ...content
  } = input
  return {
    columns: {
      slug,
      groomName,
      brideName,
      title: title || null,
      eventDate: new Date(eventDate),
      venueName,
      venueAddress,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      theme,
      primaryColor: primaryColor || null,
      coverImageUrl: coverImageUrl || null,
      musicUrl: musicUrl || null,
    },
    content,
  }
}

// ─── Create ─────────────────────────────────────────────────────────────────

export async function createInvitation(
  user: User,
  rawInput: unknown
): Promise<Invitation> {
  if (!user.emailVerifiedAt) {
    throw new InvitationError("EMAIL_NOT_VERIFIED", "Email belum diverifikasi")
  }
  const input = invitationCreateSchema.parse(rawInput)
  const { columns, content } = extractColumnFields(input)

  try {
    return await prisma.invitation.create({
      data: {
        ...columns,
        userId: user.id,
        status: "DRAFT",
        content: content as unknown as Prisma.JsonObject,
      },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new InvitationError("SLUG_TAKEN", "Nama pengundang sudah dipakai")
    }
    throw err
  }
}

// ─── Update ─────────────────────────────────────────────────────────────────

export async function updateInvitation(
  user: User,
  invitationId: string,
  rawInput: unknown
): Promise<Invitation> {
  if (!user.emailVerifiedAt) {
    throw new InvitationError("EMAIL_NOT_VERIFIED", "Email belum diverifikasi")
  }
  const input = invitationUpdateSchema.parse(rawInput)

  const existing = await prisma.invitation.findUnique({ where: { id: invitationId } })
  if (!existing) throw new InvitationError("NOT_FOUND", "Undangan tidak ditemukan")
  ensureOwner(existing, user.id)
  if (existing.status === "ARCHIVED") {
    throw new InvitationError("ARCHIVED", "Undangan sudah diarsipkan")
  }

  // Decide which top-level columns are touched
  const data: Prisma.InvitationUpdateInput = {}
  if (input.slug !== undefined) data.slug = input.slug
  if (input.groomName !== undefined) data.groomName = input.groomName
  if (input.brideName !== undefined) data.brideName = input.brideName
  if (input.title !== undefined) data.title = input.title || null
  if (input.eventDate !== undefined) data.eventDate = new Date(input.eventDate)
  if (input.venueName !== undefined) data.venueName = input.venueName
  if (input.venueAddress !== undefined) data.venueAddress = input.venueAddress
  if (input.latitude !== undefined) data.latitude = input.latitude
  if (input.longitude !== undefined) data.longitude = input.longitude
  if (input.theme !== undefined) data.theme = input.theme
  if (input.primaryColor !== undefined) data.primaryColor = input.primaryColor || null
  if (input.coverImageUrl !== undefined) data.coverImageUrl = input.coverImageUrl || null
  if (input.musicUrl !== undefined) data.musicUrl = input.musicUrl || null

  // Merge non-column fields into content JSONB
  const contentPatch: Record<string, unknown> = {}
  for (const k of [
    "groomFatherName",
    "groomMotherName",
    "brideFatherName",
    "brideMotherName",
    "coupleStory",
    "schedule",
    "mapsUrl",
    "galleryUrls",
    "rsvpEnabled",
    "guestMessageEnabled",
    "giftEnabled",
    "giftAccounts",
    "metaTitle",
    "metaDescription",
    "openingQuote",
  ] as const) {
    if (k in input && (input as Record<string, unknown>)[k] !== undefined) {
      contentPatch[k] = (input as Record<string, unknown>)[k]
    }
  }
  if (Object.keys(contentPatch).length > 0) {
    data.content = {
      ...(existing.content as Prisma.JsonObject),
      ...contentPatch,
    } as unknown as Prisma.JsonObject
  }

  try {
    const updated = await prisma.invitation.update({
      where: { id: invitationId },
      data,
    })
    if (existing.slug !== updated.slug) {
      await invalidatePublicInvitation(existing.slug)
    }
    if (updated.status === "PUBLISHED") {
      await invalidatePublicInvitation(updated.slug)
    }
    return updated
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new InvitationError("SLUG_TAKEN", "Nama pengundang sudah dipakai")
    }
    throw err
  }
}

// ─── Publish / Archive ──────────────────────────────────────────────────────

export async function publishInvitation(
  user: User,
  invitationId: string
): Promise<Invitation> {
  if (!user.emailVerifiedAt) {
    throw new InvitationError("EMAIL_NOT_VERIFIED", "Email belum diverifikasi")
  }
  const sub = await getActiveSubscriptionView(user.id)
  if (!sub || sub.status !== "ACTIVE") {
    throw new InvitationError("NO_ACTIVE_SUBSCRIPTION", "Subscription belum aktif")
  }
  const limitCheck = await checkPublishLimit(user.id)
  if (!limitCheck.allowed) {
    throw new InvitationError(
      "LIMIT_REACHED",
      `Batas publish paket Anda (${limitCheck.limit}) sudah tercapai`
    )
  }

  const existing = await prisma.invitation.findUnique({ where: { id: invitationId } })
  if (!existing) throw new InvitationError("NOT_FOUND", "Undangan tidak ditemukan")
  ensureOwner(existing, user.id)
  if (existing.status === "PUBLISHED") {
    throw new InvitationError("ALREADY_PUBLISHED", "Undangan sudah dipublish")
  }

  const updated = await prisma.invitation.update({
    where: { id: existing.id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "invitation.publish",
      entityType: "Invitation",
      entityId: updated.id,
      metadata: { slug: updated.slug },
    },
  })

  await invalidatePublicInvitation(updated.slug)
  return updated
}

export async function archiveInvitation(user: User, invitationId: string): Promise<Invitation> {
  const existing = await prisma.invitation.findUnique({ where: { id: invitationId } })
  if (!existing) throw new InvitationError("NOT_FOUND", "Undangan tidak ditemukan")
  ensureOwner(existing, user.id)
  const updated = await prisma.invitation.update({
    where: { id: existing.id },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  })
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "invitation.archive",
      entityType: "Invitation",
      entityId: updated.id,
      metadata: { slug: updated.slug },
    },
  })
  await invalidatePublicInvitation(updated.slug)
  return updated
}

// ─── Public read ────────────────────────────────────────────────────────────

/**
 * Resolve an invitation for public display. Caches by slug. Returns null if
 * not published or owner subscription not active.
 */
export async function resolvePublicInvitation(slug: string): Promise<PublicInvitationView | null> {
  const cached = await getCachedPublicInvitation(slug)
  if (cached) return cached

  const inv = await prisma.invitation.findUnique({ where: { slug } })
  if (!inv) return null
  if (inv.status !== "PUBLISHED") return null

  // Check subscription liveness
  const sub = await getActiveSubscriptionView(inv.userId)
  if (!sub || sub.status !== "ACTIVE") return null

  const view = toPublicView(inv)
  if (!view) return null
  await setCachedPublicInvitation(slug, view)
  return view
}

export async function listInvitationsForUser(userId: string): Promise<Invitation[]> {
  return prisma.invitation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getInvitationForUser(
  userId: string,
  invitationId: string
): Promise<Invitation> {
  const inv = await prisma.invitation.findUnique({ where: { id: invitationId } })
  if (!inv) throw new InvitationError("NOT_FOUND", "Undangan tidak ditemukan")
  ensureOwner(inv, userId)
  return inv
}
