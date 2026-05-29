import Link from "next/link"
import { prisma } from "@/server/db/prisma"
import { formatDateID, formatRupiah } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-rose-50 text-rose-700",
  PAID: "bg-sage-100 text-sage-700",
  FAILED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
  REFUND: "bg-rose-100 text-rose-700",
}

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: true, plan: true },
  })

  return (
    <div className="px-8 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
        <h1 className="mt-1 font-display text-3xl">Invoice</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          100 invoice terbaru. Gunakan filter atau API jika butuh data historis.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Tanggal</th>
              <th className="px-4 py-3 text-left font-medium">Merchant Ref</th>
              <th className="px-4 py-3 text-left font-medium">Pengguna</th>
              <th className="px-4 py-3 text-left font-medium">Paket</th>
              <th className="px-4 py-3 text-left font-medium">Nominal</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 text-muted-foreground">{formatDateID(inv.createdAt)}</td>
                <td className="px-4 py-3 font-mono text-xs">{inv.merchantRef}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{inv.user.name}</p>
                  <p className="text-xs text-muted-foreground">{inv.user.email}</p>
                </td>
                <td className="px-4 py-3">{inv.plan.name}</td>
                <td className="px-4 py-3 tabular-nums">{formatRupiah(inv.amount)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      STATUS_BADGE[inv.status] ?? "bg-muted"
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/invoices/${inv.id}`} className="text-primary hover:underline">
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
