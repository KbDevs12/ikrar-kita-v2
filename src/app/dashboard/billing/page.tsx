import Link from "next/link"
import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { getActiveSubscriptionView } from "@/server/subscription/subscription-service"
import { formatDateID, formatRupiah } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  REFUND: "Refund",
}

export default async function BillingPage() {
  const session = await requireVerifiedUserOrRedirect()

  const [plans, sub, invoices] = await Promise.all([
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getActiveSubscriptionView(session.user.id),
    prisma.invoice.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { plan: true },
    }),
  ])

  return (
    <div className="px-8 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Langganan</p>
        <h1 className="mt-1 font-display text-3xl">Paket &amp; tagihan</h1>
      </header>

      <section className="mb-10 rounded-xl border border-border bg-card p-6">
        {sub && sub.status === "ACTIVE" ? (
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Paket aktif
              </p>
              <p className="mt-1 font-display text-2xl">{sub.planCode}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Berlaku hingga{" "}
                <strong className="text-foreground">{formatDateID(sub.expiresAt)}</strong>
              </p>
            </div>
            <Link
              href="#perpanjang"
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
            >
              Perpanjang
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada langganan aktif. Pilih paket di bawah untuk mulai mempublikasikan undangan.
          </p>
        )}
      </section>

      <section id="perpanjang" className="mb-10 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-xl">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            <p className="mt-4 font-display text-3xl tabular-nums">{formatRupiah(plan.price)}</p>
            <p className="text-xs text-muted-foreground">/ {plan.durationDays} hari</p>
            <Link
              href={`/dashboard/billing/checkout?plan=${plan.code}`}
              className="mt-6 block rounded-md bg-primary px-4 py-2.5 text-center text-sm text-primary-foreground hover:opacity-90"
            >
              Pilih {plan.name}
            </Link>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl">Riwayat tagihan</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {invoices.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Belum ada tagihan.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium">Paket</th>
                  <th className="px-4 py-3 text-left font-medium">Nominal</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3">{formatDateID(inv.createdAt)}</td>
                    <td className="px-4 py-3">{inv.plan.name}</td>
                    <td className="px-4 py-3 tabular-nums">{formatRupiah(inv.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {STATUS_LABEL[inv.status] ?? inv.status}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/billing/invoices/${inv.id}`}
                        className="text-primary hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
