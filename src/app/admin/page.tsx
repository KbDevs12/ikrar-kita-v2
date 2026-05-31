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
        paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ])

  const stats = [
    { label: "Pengguna terdaftar", value: totalUsers.toLocaleString("id-ID") },
    { label: "Menunggu pembayaran", value: pendingInvoices.toLocaleString("id-ID") },
    {
      label: "Pendapatan bulan ini",
      value: formatRupiah(paidThisMonth._sum.amount ?? 0),
    },
    { label: "Langganan aktif", value: activeSubs.toLocaleString("id-ID") },
  ]

  return (
    <article className="px-8 py-12 lg:px-14 lg:py-16">
      <header className="mb-12 border-b border-stone-200 pb-8">
        <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Operasi</p>
        <h1 className="mt-3 font-display text-5xl leading-[1] tracking-tight text-stone-900 md:text-6xl">
          Ringkasan harian
        </h1>
      </header>

      <section className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xs uppercase tracking-[0.32em] text-stone-500">{s.label}</p>
            <p className="mt-3 font-display text-5xl leading-none tracking-tight text-stone-900 md:text-6xl">
              {s.value}
            </p>
          </div>
        ))}
      </section>
    </article>
  )
}
