import { resolvePublicInvitation } from "@/server/invitation/invitation-service"
import { sanitiseRecipient } from "@/lib/validators/invitation"
import { getTemplateComponent } from "@/components/invitation/templates/registry"
import { isValidTemplateId } from "@/lib/constants/invitation-templates"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ to?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const inv = await resolvePublicInvitation(slug)
  if (!inv) return { title: "Undangan" }
  const couple = `${inv.groomName} & ${inv.brideName}`
  return {
    title: `${couple} - Undangan Pernikahan`,
    description: `Undangan pernikahan ${couple}`,
    openGraph: {
      title: `${couple}`,
      description: `Undangan pernikahan ${couple}`,
      images: inv.coverImageUrl ? [inv.coverImageUrl] : undefined,
    },
    robots: { index: false }, // Public-but-not-discovered: prefer link sharing
  }
}

export default async function PublicInvitationPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  const inv = await resolvePublicInvitation(slug)
  if (!inv) {
    return <InactiveScreen />
  }

  const recipient = sanitiseRecipient(sp.to ?? null)
  const themeId = isValidTemplateId(inv.theme) ? inv.theme : "classic-elegant"
  const Template = getTemplateComponent(themeId)

  return <Template invitation={inv} recipient={recipient} />
}

function InactiveScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#faf7f2] px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-ink-500">Ikrar Kita</p>
        <h1 className="mt-6 font-display text-3xl text-ink-700">
          Undangan tidak aktif
        </h1>
        <p className="mt-3 text-sm text-ink-500">
          Mohon maaf, undangan ini sedang tidak dapat diakses. Silakan
          hubungi pasangan pengundang untuk informasi lebih lanjut.
        </p>
      </div>
    </main>
  )
}
