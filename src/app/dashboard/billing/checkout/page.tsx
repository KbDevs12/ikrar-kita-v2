import Link from "next/link"
import { notFound } from "next/navigation"
import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { CheckoutForm } from "@/components/forms/checkout-form"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{ plan?: string }>
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  await requireVerifiedUserOrRedirect()
  const sp = await searchParams
  const code = (sp.plan ?? "").toUpperCase()
  if (!["BASIC", "PRO", "RESELLER"].includes(code)) notFound()

  const plan = await prisma.plan.findUnique({
    where: { code: code as "BASIC" | "PRO" | "RESELLER" },
  })
  if (!plan || !plan.isActive) notFound()

  return (
    <div className="mx-auto max-w-xl px-8 py-10">
      <Link
        href="/dashboard/billing"
        className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Langganan
      </Link>
      <header className="mb-8 mt-3">
        <h1 className="font-display text-3xl">Bayar paket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih metode pembayaran. Subscription aktif otomatis setelah dana
          masuk.
        </p>
      </header>

      <CheckoutForm
        plan={{
          code: plan.code,
          name: plan.name,
          price: plan.price,
          durationDays: plan.durationDays,
        }}
      />
    </div>
  )
}
