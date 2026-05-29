import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdminOrRedirect } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { formatDateID, formatRupiah } from "@/lib/utils"
import { InvoiceActions } from "@/components/admin/invoice-actions"

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

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-rose-50 text-rose-700",
  PAID: "bg-sage-100 text-sage-700",
  FAILED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
  REFUND: "bg-rose-100 text-rose-700",
}

export default async function AdminInvoiceDetailPage({ params }: PageProps) {
  const { id } = await params
  await requireAdminOrRedirect()

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      user: true,
      plan: true,
      approvedByAdmin: true,
      paymentEvents: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      emailEvents: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })
  if (!invoice) notFound()

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: "Invoice", entityId: invoice.id },
    orderBy: { createdAt: "desc" },
    include: {
      admin: { select: { id: true, name: true, email: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    take: 50,
  })

  return (
    <div className="px-8 py-10">
      <Link
        href="/admin/invoices"
        className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Daftar invoice
      </Link>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl">Invoice {invoice.plan.name}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {invoice.merchantRef}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Dibuat {formatDateID(invoice.createdAt)} oleh{" "}
            <Link
              href={`mailto:${invoice.user.email}`}
              className="font-medium text-foreground hover:underline"
            >
              {invoice.user.name}
            </Link>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              STATUS_COLOR[invoice.status] ?? "bg-muted"
            }`}
          >
            {STATUS_LABEL[invoice.status] ?? invoice.status}
          </span>
          <span className="text-xs text-muted-foreground">
            {invoice.paymentProvider === "MANUAL" ? "Disetujui manual" : "Tripay"}
          </span>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Summary */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Ringkasan</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Pengguna">
                <span>
                  {invoice.user.name}
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {invoice.user.email}
                  </span>
                </span>
              </Row>
              <Row label="Paket">
                <span>
                  {invoice.plan.name} ·{" "}
                  <span className="text-muted-foreground">
                    {invoice.plan.durationDays} hari
                  </span>
                </span>
              </Row>
              <Row label="Nominal">
                <span className="font-medium tabular-nums">
                  {formatRupiah(invoice.amount)}
                </span>
              </Row>
              <Row label="Metode">
                <span>{invoice.paymentMethodName ?? "-"}</span>
              </Row>
              <Row label="Provider">
                <span>{invoice.paymentProvider}</span>
              </Row>
              <Row label="Dibuat">
                <span>{formatDateID(invoice.createdAt)}</span>
              </Row>
              {invoice.expiredAt ? (
                <Row label="Kedaluwarsa">
                  <span>{formatDateID(invoice.expiredAt)}</span>
                </Row>
              ) : null}
              {invoice.paidAt ? (
                <Row label="Dibayar">
                  <span>{formatDateID(invoice.paidAt)}</span>
                </Row>
              ) : null}
              {invoice.processedAt ? (
                <Row label="Diproses">
                  <span>{formatDateID(invoice.processedAt)}</span>
                </Row>
              ) : null}
            </dl>
          </section>

          {/* Tripay info */}
          {invoice.tripayReference ||
          invoice.tripayPayCode ||
          invoice.tripayCheckoutUrl ? (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-lg">Info Tripay</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {invoice.tripayReference ? (
                  <Row label="Reference">
                    <span className="font-mono text-xs">
                      {invoice.tripayReference}
                    </span>
                  </Row>
                ) : null}
                {invoice.paymentMethodCode ? (
                  <Row label="Method code">
                    <span className="font-mono text-xs">
                      {invoice.paymentMethodCode}
                    </span>
                  </Row>
                ) : null}
                {invoice.tripayPayCode ? (
                  <Row label="Pay code / VA">
                    <span className="font-mono">{invoice.tripayPayCode}</span>
                  </Row>
                ) : null}
                {invoice.tripayCheckoutUrl ? (
                  <Row label="Checkout URL">
                    <Link
                      href={invoice.tripayCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Buka di Tripay ↗
                    </Link>
                  </Row>
                ) : null}
              </dl>
            </section>
          ) : null}

          {/* Manual approval info */}
          {invoice.paymentProvider === "MANUAL" && invoice.approvedByAdmin ? (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-lg">Disetujui manual</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Disetujui oleh">
                  <span>
                    {invoice.approvedByAdmin.name}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {invoice.approvedByAdmin.email}
                    </span>
                  </span>
                </Row>
                {invoice.approvedAt ? (
                  <Row label="Tanggal">
                    <span>{formatDateID(invoice.approvedAt)}</span>
                  </Row>
                ) : null}
                {invoice.manualApprovalNote ? (
                  <Row label="Catatan">
                    <span className="whitespace-pre-wrap text-foreground">
                      {invoice.manualApprovalNote}
                    </span>
                  </Row>
                ) : null}
              </dl>
            </section>
          ) : null}

          {/* Payment events (Tripay callbacks) */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Riwayat callback</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Setiap webhook Tripay yang masuk — termasuk yang ditolak — tercatat
              di sini untuk audit. Centang pada kolom <strong>Sig</strong>{" "}
              menandakan signature valid.
            </p>
            {invoice.paymentEvents.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Belum ada callback yang tercatat untuk invoice ini.
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 text-[11px] uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Waktu</th>
                      <th className="px-3 py-2 text-left font-medium">Event</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">Sig</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.paymentEvents.map((ev) => (
                      <tr key={ev.id}>
                        <td className="px-3 py-2 font-mono text-muted-foreground">
                          {ev.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                        </td>
                        <td className="px-3 py-2 font-mono">{ev.eventType}</td>
                        <td className="px-3 py-2 font-mono">{ev.status}</td>
                        <td className="px-3 py-2">
                          {ev.isValidSignature ? (
                            <span className="rounded-full bg-sage-100 px-2 py-0.5 text-sage-700">
                              OK
                            </span>
                          ) : (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700">
                              GAGAL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Email events */}
          {invoice.emailEvents.length > 0 ? (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-lg">Email terkirim</h2>
              <ul className="mt-4 divide-y divide-border text-sm">
                {invoice.emailEvents.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {ev.type}
                      </p>
                      <p>{ev.recipient}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        ev.status === "SENT"
                          ? "bg-sage-100 text-sage-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {ev.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Audit log */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Audit trail</h2>
            {auditLogs.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Belum ada catatan audit untuk invoice ini.
              </p>
            ) : (
              <ol className="mt-4 space-y-3 text-sm">
                {auditLogs.map((log) => (
                  <li
                    key={log.id}
                    className="border-l-2 border-border pl-4"
                  >
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatDateID(log.createdAt, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="font-medium">{log.action}</p>
                    {log.admin ? (
                      <p className="text-xs text-muted-foreground">
                        oleh admin {log.admin.name} ({log.admin.email})
                      </p>
                    ) : log.user ? (
                      <p className="text-xs text-muted-foreground">
                        oleh user {log.user.email}
                      </p>
                    ) : null}
                    {log.metadata ? (
                      <pre className="mt-1 overflow-x-auto rounded bg-muted/50 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <InvoiceActions
            invoiceId={invoice.id}
            status={invoice.status}
            hasTripayReference={Boolean(invoice.tripayReference)}
          />

          <section className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <p className="text-xs uppercase tracking-widest">Pengingat</p>
            <p className="mt-2">
              Approve manual seharusnya menjadi pengecualian, bukan jalur utama.
              Setiap tindakan manual menulis audit log dengan nama Anda.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-baseline gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
