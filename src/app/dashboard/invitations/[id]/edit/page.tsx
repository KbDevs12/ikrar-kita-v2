import { notFound } from "next/navigation"
import Link from "next/link"
import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { getInvitationForUser, InvitationError } from "@/server/invitation/invitation-service"
import { InvitationBuilder } from "@/components/forms/invitation-builder"
import { PublishButton } from "@/components/dashboard/publish-button"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditInvitationPage({ params }: PageProps) {
  const { id } = await params
  const session = await requireVerifiedUserOrRedirect()

  let invitation
  try {
    invitation = await getInvitationForUser(session.user.id, id)
  } catch (e) {
    if (e instanceof InvitationError && (e.code === "NOT_FOUND" || e.code === "FORBIDDEN")) {
      notFound()
    }
    throw e
  }

  // Map db -> builder shape (flatten content JSON back into top-level fields)
  const content = (invitation.content ?? {}) as Record<string, unknown>
  const initialData = {
    id: invitation.id,
    slug: invitation.slug,
    groomName: invitation.groomName,
    brideName: invitation.brideName,
    title: invitation.title ?? "",
    eventDate: invitation.eventDate ? invitation.eventDate.toISOString().slice(0, 16) : "",
    venueName: invitation.venueName ?? "",
    venueAddress: invitation.venueAddress ?? "",
    latitude: invitation.latitude ?? undefined,
    longitude: invitation.longitude ?? undefined,
    theme: invitation.theme,
    primaryColor: invitation.primaryColor ?? "",
    coverImageUrl: invitation.coverImageUrl ?? "",
    musicUrl: invitation.musicUrl ?? "",
    ...content,
  }

  return (
    <div className="px-8 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/invitations"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← Daftar undangan
          </Link>
          <h1 className="mt-2 font-display text-3xl">
            Edit{" "}
            <span className="font-mono text-base text-muted-foreground">/{invitation.slug}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${invitation.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
          >
            Pratinjau
          </Link>
          {invitation.status !== "PUBLISHED" ? <PublishButton invitationId={invitation.id} /> : null}
        </div>
      </header>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <InvitationBuilder initialData={initialData as any} />
    </div>
  )
}
