import { notFound } from "next/navigation"
import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { getInvitationPreview } from "@/server/invitation/preview"
import { isValidTemplateId } from "@/lib/constants/invitation-templates"
import { sanitiseRecipient } from "@/lib/validators/invitation"
import { getTemplateComponent } from "@/components/invitation/templates/registry"
import { PreviewBanner } from "@/components/invitation/preview-banner"

export const dynamic = "force-dynamic"
export const metadata = { title: "Pratinjau" }

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ to?: string }>
}

/**
 * Owner-only preview. Renders the chosen template regardless of the
 * invitation status (DRAFT/PUBLISHED/ARCHIVED) and regardless of the
 * subscription state - owners can iterate freely. The PreviewBanner
 * explains in plain language whether the public URL would currently serve
 * the same view.
 *
 * Layout note: this page intentionally floats a fixed-position container on
 * top of the parent dashboard layout so the templates can use their full
 * design width without the dashboard sidebar interfering visually. The
 * sidebar still exists in the DOM and is reachable via the banner buttons.
 */
export default async function InvitationPreviewPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const session = await requireVerifiedUserOrRedirect()

  const preview = await getInvitationPreview(session.user.id, id)
  if (!preview) notFound()

  const recipient = sanitiseRecipient(sp.to ?? null)
  const themeId = isValidTemplateId(preview.view.theme)
    ? preview.view.theme
    : "classic-elegant"
  const Template = getTemplateComponent(themeId)

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-background">
      <PreviewBanner
        invitationId={preview.view.id}
        slug={preview.view.slug}
        realStatus={preview.realStatus}
        livePublic={preview.livePublic}
        subscriptionStatus={preview.subscription?.status ?? null}
        initialRecipient={recipient}
      />
      {/* pt-16 to clear the fixed banner. The banner expands when the
          recipient widget is open - 4rem covers the collapsed state, and
          we let the page scroll naturally underneath when expanded. */}
      <div className="pt-16">
        <Template
          invitation={preview.view}
          recipient={recipient}
          staticPreview
        />
      </div>
    </div>
  )
}
