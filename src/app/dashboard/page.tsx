import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { getActiveSubscriptionView } from "@/server/subscription/subscription-service"
import { formatDateID, formatRupiah } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

const STATUS_TONE = {
  DRAFT: "stone",
  PUBLISHED: "sage",
  ARCHIVED: "stone",
} as const

export default async function DashboardOverviewPage() {
  const session = await requireVerifiedUserOrRedirect()

  const [counts, lastInvoice, sub, recent] = await Promise.all([
    prisma.invitation.groupBy({
      by: ["status"],
      where: { userId: session.user.id },
      _count: { _all: true },
    }),
    prisma.invoice.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    }),
    getActiveSubscriptionView(session.user.id),
    prisma.invitation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        status: true,
        groomName: true,
        brideName: true,
        eventDate: true,
        updatedAt: true,
      },
    }),
  ])

  const total = counts.reduce((sum, c) => sum + c._count._all, 0)
  const published = counts.find((c) => c.status === "PUBLISHED")?._count._all ?? 0
  const drafts = counts.find((c) => c.status === "DRAFT")?._count._all ?? 0

  return (
    <article className="px-8 py-12 lg:px-14 lg:py-16">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.32em] text-rose-500">Ringkasan</p>
        <h1 className="mt-3 font-display text-5xl leading-[1] tracking-tight text-stone-900 md:text-6xl">
          Selamat datang,{" "}
          <span className="italic text-rose-500">
            {session.user.name.split(" ")[0]}.
          </span>
        </h1>
      </header>

      <section className="mb-16 grid grid-cols-1 gap-x-12 gap-y-10 border-t border-rose-100 pt-10 md:grid-cols-3">
        <Stat label="Total undangan" value={total} />
        <Stat label="Sudah dipublikasi" value={published} accent />
        <Stat label="Masih draf" value={drafts} />
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <header className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl text-stone-900">Undangan terbaru</h2>
            <Link
              href="/dashboard/invitations/new"
              className="inline-flex items-center gap-1 text-sm text-rose-600 hover:underline"
            >
              Buat baru
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </header>

          {recent.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-rose-100">
              {recent.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg text-stone-900">
                      {i.groomName} <span className="text-stone-400">&amp;</span>{" "}
                      {i.brideName}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {i.eventDate ? formatDateID(i.eventDate) : "Tanggal belum diisi"}
                      <span className="mx-2 text-stone-300">·</span>
                      <span className="font-mono text-stone-400">/{i.slug}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={STATUS_TONE[i.status]}>{i.status.toLowerCase()}</Badge>
                    <Link
                      href={`/dashboard/invitations/${i.id}/edit`}
                      className="text-sm text-stone-700 hover:text-rose-600"
                    >
                      Edit →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="rounded-2xl border border-rose-100 bg-white p-6">
          <h2 className="font-display text-2xl text-stone-900">Langganan</h2>
          {sub && sub.status === "ACTIVE" ? (
            <div className="mt-4 space-y-3">
              <p className="font-display text-3xl text-stone-900">{sub.planCode}</p>
              <p className="text-sm text-stone-500">
                Berlaku hingga{" "}
                <strong className="text-stone-900">
                  {formatDateID(sub.expiresAt)}
                </strong>
              </p>
              <p className="text-sm text-stone-500">
                {sub.invitationLimit === null
                  ? "Tanpa batas undangan terpublikasi."
                  : `Batas ${sub.invitationLimit} undangan terpublikasi.`}
              </p>
              <Link
                href="/dashboard/billing"
                className="mt-2 inline-flex items-center gap-1 text-sm text-rose-600 hover:underline"
              >
                Kelola langganan
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-stone-600">
                Belum ada langganan aktif. Anda tetap bisa membuat draf — bayar
                paket hanya saat siap publikasi.
              </p>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm text-white hover:bg-rose-600"
              >
                Lihat paket
              </Link>
            </div>
          )}
          {lastInvoice ? (
            <div className="mt-6 border-t border-rose-100 pt-4 text-xs text-stone-500">
              Tagihan terakhir{" "}
              <span className="text-stone-900">{formatRupiah(lastInvoice.amount)}</span>{" "}
              <span className="lowercase">({lastInvoice.status})</span>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.32em] text-stone-500">{label}</p>
      <p
        className={
          "mt-3 font-display text-7xl leading-none tracking-tight md:text-8xl " +
          (accent ? "text-rose-500" : "text-stone-900")
        }
      >
        {value}
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-12 text-center">
      <p className="font-display text-2xl text-stone-900">
        Mulai dari satu draf. <span className="italic text-rose-500">Gratis.</span>
      </p>
      <Link
        href="/dashboard/invitations/new"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm text-white hover:bg-rose-600"
      >
        Buat undangan pertama
      </Link>
    </div>
  )
}
