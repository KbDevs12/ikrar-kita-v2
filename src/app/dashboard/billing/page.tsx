import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { getActiveSubscriptionView } from "@/server/subscription/subscription-service"
import { BillingTabs } from "@/components/dashboard/billing-tabs"

export const dynamic = "force-dynamic"

export default async function BillingPage() {
  const session = await requireVerifiedUserOrRedirect()

  const [plans, sub, invoices] = await Promise.all([
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getActiveSubscriptionView(session.user.id),
    prisma.invoice.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { plan: true },
    }),
  ])

  return (
    <article className="px-8 py-12 lg:px-14 lg:py-16">
      <header className="mb-10 border-b border-rose-100 pb-8">
        <p className="text-xs uppercase tracking-[0.32em] text-rose-500">Langganan</p>
        <h1 className="mt-3 font-display text-5xl leading-[1] tracking-tight text-stone-900 md:text-6xl">
          Paket &amp; tagihan
        </h1>
        <p className="mt-3 max-w-lg text-sm text-stone-500">
          Bayar saat siap menyebar undangan. Setelah expired, draf tetap
          tersimpan; cukup perpanjang untuk mengaktifkan kembali URL publik.
        </p>
      </header>

      <BillingTabs
        plans={plans}
        subscription={sub}
        invoices={invoices.map((i) => ({
          id: i.id,
          merchantRef: i.merchantRef,
          amount: i.amount,
          status: i.status,
          createdAt: i.createdAt,
          planName: i.plan.name,
        }))}
      />
    </article>
  )
}
