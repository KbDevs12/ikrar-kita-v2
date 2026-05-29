import Link from "next/link"
import { notFound } from "next/navigation"
import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { getInvoiceForUser } from "@/server/billing/checkout-service"
import { formatDateID, formatRupiah } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  REFUND: "Refund",
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await requireVerifiedUserOrRedirect()
  const invoice = await getInvoiceForUser(session.user.id, id)
  if (!invoice) notFound()

  return (
    <div className="px-8 py-10">
      <Link
        href="/dashboard/billing"
        className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Tagihan
      </Link>
      <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Tagihan {invoice.plan.name}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{invoice.merchantRef}</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-sm">
          {STATUS_LABEL[invoice.status] ?? invoice.status}
        </span>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-border bg-card p-6">
          <dl className="space-y-4 text-sm">
            <Row label="Nominal" value={formatRupiah(invoice.amount)} />
            <Row label="Metode" value={invoice.paymentMethodName ?? "-"} />
            <Row label="Dibuat" value={formatDateID(invoice.createdAt)} />
            {invoice.expiredAt ? (
              <Row label="Bayar sebelum" value={formatDateID(invoice.expiredAt)} />
            ) : null}
            {invoice.paidAt ? <Row label="Dibayar" value={formatDateID(invoice.paidAt)} /> : null}
          </dl>

          {invoice.status === "PENDING" ? (
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="font-display text-lg">Cara membayar</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Selesaikan pembayaran sebelum batas waktu. Setelah berhasil,
                halaman ini akan ter-update otomatis dan langganan Anda aktif.
              </p>

              {invoice.tripayCheckoutUrl ? (
                <Link
                  href={invoice.tripayCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"
                >
                  Buka instruksi pembayaran
                </Link>
              ) : null}

              {invoice.tripayPayCode ? (
                <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Kode pembayaran / VA
                  </p>
                  <p className="mt-1 font-mono text-2xl">{invoice.tripayPayCode}</p>
                </div>
              ) : null}

              {invoice.tripayQrUrl ? (
                <div className="mt-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Scan QR di aplikasi pembayaran
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={invoice.tripayQrUrl}
                    alt="QR Pembayaran"
                    className="mt-2 h-56 w-56 rounded-md border border-border bg-white p-3"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <aside className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg">Paket {invoice.plan.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{invoice.plan.description}</p>
          <p className="mt-4 font-display text-2xl tabular-nums">{formatRupiah(invoice.amount)}</p>
          <p className="text-xs text-muted-foreground">
            Berlaku {invoice.plan.durationDays} hari setelah pembayaran berhasil
          </p>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
