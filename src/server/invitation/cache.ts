/**
 * Public invitation caching.
 *
 * Cached value is a sanitised snapshot of the invitation - no admin fields,
 * no raw user data.
 */
import "server-only"
import { prisma } from "@/server/db/prisma"
import { cacheDel, cacheGet, cacheKeys, cacheSet } from "@/server/cache/redis"
import type { Invitation } from "@prisma/client"

const PUBLIC_TTL_SECONDS = 60 * 5 // 5 minutes

export interface PublicInvitationView {
  id: string
  slug: string
  status: "PUBLISHED"
  title: string | null
  groomName: string
  brideName: string
  eventDate: string | null
  venueName: string | null
  venueAddress: string | null
  latitude: number | null
  longitude: number | null
  theme: string
  primaryColor: string | null
  coverImageUrl: string | null
  musicUrl: string | null
  content: unknown
  publishedAt: string
}

export function toPublicView(inv: Invitation): PublicInvitationView | null {
  if (inv.status !== "PUBLISHED" || !inv.publishedAt) return null
  return {
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
    publishedAt: inv.publishedAt.toISOString(),
  }
}

export async function getCachedPublicInvitation(
  slug: string
): Promise<PublicInvitationView | null> {
  return cacheGet<PublicInvitationView>(cacheKeys.publicInvitation(slug))
}

export async function setCachedPublicInvitation(
  slug: string,
  view: PublicInvitationView
): Promise<void> {
  await cacheSet(cacheKeys.publicInvitation(slug), view, PUBLIC_TTL_SECONDS)
}

export async function invalidatePublicInvitation(slug: string): Promise<void> {
  await cacheDel(cacheKeys.publicInvitation(slug))
}

export async function invalidatePublicInvitationsForUser(userId: string): Promise<void> {
  const slugs = await prisma.invitation.findMany({
    where: { userId, status: "PUBLISHED" },
    select: { slug: true },
  })
  if (slugs.length === 0) return
  await cacheDel(...slugs.map((s) => cacheKeys.publicInvitation(s.slug)))
}
