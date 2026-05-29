import Link from "next/link"
import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { getActiveSubscriptionView } from "@/server/subscription/subscription-service"
import { formatDateID, formatRupiah } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function DashboardOverviewPage() {
  const session = await requireVerifiedUserOrRedirect()

  const [counts, lastInvoice, sub] = await Promise.all([
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
  ])

  const total = counts.reduce((sum, c) => sum + c._count._all, 0)
  const published = counts.find((c) => c.status === "PUBLISHED")?._count._all ?? 0
  const drafts = counts.find((c) => c.status === "DRAFT")?._count._all ?? 0

  return (
    <div className="px-8 py-10">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ringkasan</p>
        <h1 className="mt-1 font-display text-3xl">Halo, {session.user.name.split(" ")[0]}.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Berikut status undangan dan langganan Anda saat ini.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total undangan" value={total} />
        <Stat label="Sudah dipublish" value={published} />
        <Stat label="Masih draft" value={drafts} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Undangan terbaru</h2>
            <Link
              href="/dashboard/invitations/new"
              className="text-sm font-medium text-primary hover:underline"
            >
              + Buat baru
            </Link>
          </div>
          <RecentInvitations userId={session.user.id} />
        </section>

        <aside className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Langganan</h2>
          {sub && sub.status === "ACTIVE" ? (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Paket aktif
              </p>
              <p className="mt-1 font-display text-2xl">{sub.planCode}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Berlaku hingga{" "}
                <strong className="text-foreground">{formatDateID(sub.expiresAt)}</strong>.
                {sub.invitationLimit !== null
                  ? ` Limit ${sub.invitationLimit} undangan terpublikasi.`
                  : " Tanpa batas undangan terpublikasi."}
              </p>
            </div>
          ) : (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Belum ada langganan aktif. Pilih paket untuk mulai mempublikasikan undangan.</p>
              <Link
                href="/dashboard/billing"
                className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
              >
                Lihat paket
              </Link>
            </div>
          )}
          {lastInvoice ? (
            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
              Tagihan terakhir{" "}
              <span className="text-foreground">{formatRupiah(lastInvoice.amount)}</span>{" "}
              ({lastInvoice.status.toLowerCase()})
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums">{value}</p>
    </div>
  )
}

async function RecentInvitations({ userId }: { userId: string }) {
  const items = await prisma.invitation.findMany({
    where: { userId },
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
  })

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
        <p className="font-display text-lg">Belum ada undangan</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Mulailah dengan satu draft. Anda boleh mengubahnya kapan saja sebelum publikasi.
        </p>
        <Link
          href="/dashboard/invitations/new"
          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          Buat undangan pertama
        </Link>
      </div>
    )
  }

  return (
    <ul className="mt-4 divide-y divide-border">
      {items.map((i) => (
        <li key={i.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">
              {i.groomName} &amp; {i.brideName}
            </p>
            <p className="text-xs text-muted-foreground">
              {i.eventDate ? formatDateID(i.eventDate) : "Tanggal belum diisi"} ·{" "}
              <span className="lowercase">{i.status}</span>
            </p>
          </div>
          <Link
            href={`/dashboard/invitations/${i.id}/edit`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Edit →
          </Link>
        </li>
      ))}
    </ul>
  )
}
