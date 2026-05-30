import Link from "next/link"
import type { Metadata } from "next"
import { resolvePublicInvitation } from "@/server/invitation/invitation-service"
import { sanitiseRecipient } from "@/lib/validators/invitation"
import { getTemplateComponent } from "@/components/invitation/templates/registry"
import { isValidTemplateId } from "@/lib/constants/invitation-templates"
import { FloralCorner } from "@/components/auth/floral-corner"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ to?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const inv = await resolvePublicInvitation(slug)
  if (!inv) return { title: "Undangan tidak aktif" }
  const couple = `${inv.groomName} & ${inv.brideName}`
  return {
    title: `${couple} — Undangan Pernikahan`,
    description: `Undangan pernikahan ${couple}.`,
    openGraph: {
      title: couple,
      description: `Undangan pernikahan ${couple}`,
      images: inv.coverImageUrl ? [inv.coverImageUrl] : undefined,
    },
    robots: { index: false },
  }
}

export default async function PublicInvitationPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  const inv = await resolvePublicInvitation(slug)
  if (!inv) return <InactiveScreen />

  const recipient = sanitiseRecipient(sp.to ?? null)
  const themeId = isValidTemplateId(inv.theme) ? inv.theme : "classic-elegant"
  const Template = getTemplateComponent(themeId)

  return <Template invitation={inv} recipient={recipient} />
}

/**
 * Full-screen "tidak aktif" page. No navbar, no chrome - the visitor came
 * here from a shared link and the only useful action is to contact the
 * couple. We keep the language warm and explicitly avoid system-error tone.
 */
function InactiveScreen() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 px-6">
      <FloralCorner className="pointer-events-none absolute -left-12 -top-16 h-72 w-72 -rotate-12 text-rose-200/70" />
      <FloralCorner className="pointer-events-none absolute -bottom-24 -right-12 h-80 w-80 rotate-[170deg] text-rose-200/60" />

      <div className="relative max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-rose-500">Ikrar Kita</p>
        <h1 className="mt-6 font-display text-6xl leading-[0.95] tracking-tight text-stone-900 md:text-8xl">
          Undangan ini
          <span className="block italic text-rose-500">sedang tidak aktif.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-stone-600">
          Kemungkinan masa aktif sudah habis atau pasangan pengundang sedang
          merevisi. Silakan hubungi mereka langsung untuk informasi terbaru.
        </p>
        <Link
          href="/"
          className="mt-10 inline-block rounded-full border border-rose-200 px-6 py-3 text-sm text-stone-700 transition-colors hover:bg-white"
        >
          Kembali ke Ikrar Kita
        </Link>
      </div>
    </main>
  )
}
