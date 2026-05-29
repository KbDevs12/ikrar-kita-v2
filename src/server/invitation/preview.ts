/**
 * Owner preview for invitations.
 *
 * Differs from `resolvePublicInvitation`:
 *   - Always requires an authenticated owner (caller must enforce this; we
 *     return null on missing/foreign rows so the page can `notFound()`).
 *   - Renders even when the invitation is DRAFT or ARCHIVED.
 *   - Renders even when the owner has no active subscription.
 *   - Returns enough metadata for the preview banner to explain what the
 *     public URL would or wouldn't show right now.
 */
import "server-only"
import { prisma } from "@/server/db/prisma"
import { getActiveSubscriptionView } from "@/server/subscription/subscription-service"
import type { PublicInvitationView } from "./cache"

export interface InvitationPreview {
  /**
   * Shape-compatible with PublicInvitationView so the existing template
   * registry can render it without modification. The `status` field is
   * pinned to "PUBLISHED" because templates do not branch on status; the
   * real lifecycle status is exposed separately via `realStatus` below.
   */
  view: PublicInvitationView
  realStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  publishedAt: Date | null
  subscription: {
    status: string
    expiresAt: string
  } | null
  /**
   * True when the live public URL would actually serve this invitation
   * right now (PUBLISHED + owner subscription ACTIVE). The banner uses this
   * to surface a clear "live" / "not live" indicator.
   */
  livePublic: boolean
}

export async function getInvitationPreview(
  userId: string,
  invitationId: string
): Promise<InvitationPreview | null> {
  const inv = await prisma.invitation.findUnique({ where: { id: invitationId } })
  if (!inv) return null
  if (inv.userId !== userId) return null

  const sub = await getActiveSubscriptionView(userId)
  const livePublic = inv.status === "PUBLISHED" && sub?.status === "ACTIVE"

  const view: PublicInvitationView = {
    id: inv.id,
    slug: inv.slug,
    status: "PUBLISHED",
    title: inv.title,
    groomName: inv.groomName,
    brideName: inv.brideName,
    eventDate: inv.eventDate?.toISOString() ?? null,
    venueName: inv.venueName,
    venueAddress: inv.venueAddress,
    latitude: inv.latitude,
    longitude: inv.longitude,
    theme: inv.theme,
    primaryColor: inv.primaryColor,
    coverImageUrl: inv.coverImageUrl,
    musicUrl: inv.musicUrl,
    content: inv.content,
    // For DRAFT/ARCHIVED there is no real publishedAt; pass an epoch so the
    // template's optional date-based logic does not crash on null.
    publishedAt: inv.publishedAt?.toISOString() ?? new Date(0).toISOString(),
  }

  return {
    view,
    realStatus: inv.status,
    publishedAt: inv.publishedAt,
    subscription: sub
      ? { status: sub.status, expiresAt: sub.expiresAt }
      : null,
    livePublic,
  }
}
