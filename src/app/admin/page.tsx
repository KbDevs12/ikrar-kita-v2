import { prisma } from "@/server/db/prisma"
import { formatRupiah } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminOverview() {
  const [totalUsers, pendingInvoices, paidThisMonth, activeSubs] = await Promise.all([
    prisma.user.count(),
    prisma.invoice.count({ where: { status: "PENDING" } }),
    prisma.invoice.aggregate({
      _sum: { amount: true },
      where: {
        status: "PAID",
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ])

  const stats = [
    { label: "Pengguna", value: totalUsers.toLocaleString("id-ID") },
    { label: "Invoice menunggu", value: pendingInvoices.toLocaleString("id-ID") },
    { label: "Pendapatan bulan ini", value: formatRupiah(paidThisMonth._sum.amount ?? 0) },
    { label: "Langganan aktif", value: activeSubs.toLocaleString("id-ID") },
  ]

  return (
    <div className="px-8 py-10">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
        <h1 className="mt-1 font-display text-3xl">Ringkasan operasional</h1>
      </header>
      <div className="grid gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-2xl tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
