import { prisma } from "@/server/db/prisma"
import { AdminInvoicesTable } from "@/components/admin/admin-invoices-table"

export const dynamic = "force-dynamic"

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true, plan: true },
  })

  const rows = invoices.map((inv) => ({
    id: inv.id,
    createdAt: inv.createdAt,
    merchantRef: inv.merchantRef,
    userName: inv.user.name,
    userEmail: inv.user.email,
    planName: inv.plan.name,
    amount: inv.amount,
    status: inv.status,
  }))

  return (
    <article className="px-8 py-12 lg:px-14 lg:py-16">
      <header className="mb-10 border-b border-stone-200 pb-8">
        <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Invoice</p>
        <h1 className="mt-3 font-display text-5xl leading-[1] tracking-tight text-stone-900 md:text-6xl">
          Invoice masuk
        </h1>
        <p className="mt-3 max-w-md text-sm text-stone-600">
          Menampilkan 200 invoice paling baru. Cari berdasarkan email, paket,
          atau merchant ref.
        </p>
      </header>

      <AdminInvoicesTable rows={rows} />
    </article>
  )
}
