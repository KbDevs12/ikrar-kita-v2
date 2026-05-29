import Link from "next/link"
import { prisma } from "@/server/db/prisma"
import { formatRupiah } from "@/lib/utils"

export const metadata = { title: "Harga" }
export const dynamic = "force-dynamic"

const HIGHLIGHTS: Record<string, string[]> = {
  BASIC: [
    "1 undangan terpublikasi",
    "Akses ke semua tema dan animasi",
    "RSVP, ucapan tamu, dan rekening hadiah",
    "Domain ikrar-kita dengan slug pilihan Anda",
  ],
  PRO: [
    "3 undangan terpublikasi sekaligus",
    "Cocok untuk vendor kecil atau pasangan dengan dua acara",
    "Semua fitur Basic, plus laporan tamu lebih rapi",
  ],
  RESELLER: [
    "Tanpa batas undangan terpublikasi",
    "Untuk WO, vendor undangan, dan agensi",
    "Dukungan prioritas via email",
  ],
}

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-lg">
            Ikrar Kita
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="font-medium">
              Harga
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
              Mulai
            </Link>
          </nav>
        </div>
      </header>

      <section className="container py-20">
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Paket</p>
        <h1 className="mt-2 max-w-3xl font-display text-5xl text-balance">
          Bayar saat siap menerbitkan, bukan saat sedang merancang.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground text-pretty">
          Buat draft kapan saja secara cuma-cuma. Pilih paket hanya saat
          undangan siap dibagikan ke tamu.
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const highlights = HIGHLIGHTS[plan.code] ?? []
            const featured = plan.code === "PRO"
            return (
              <article
                key={plan.id}
                className={
                  "relative flex flex-col rounded-2xl border bg-card p-7 " +
                  (featured ? "border-primary shadow-md" : "border-border")
                }
              >
                {featured ? (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[11px] uppercase tracking-widest text-primary-foreground">
                    Paling populer
                  </span>
                ) : null}
                <h2 className="font-display text-2xl">{plan.name}</h2>
                {plan.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                ) : null}
                <p className="mt-6">
                  <span className="font-display text-4xl tabular-nums">
                    {formatRupiah(plan.price)}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">/ {plan.durationDays} hari</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={
                    "mt-8 inline-block rounded-md px-4 py-2.5 text-center text-sm font-medium " +
                    (featured
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border hover:bg-accent")
                  }
                >
                  Mulai dengan {plan.name}
                </Link>
              </article>
            )
          })}
        </div>

        <div className="mt-16 rounded-xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          Semua paket berlaku 30 hari sejak pembayaran berhasil. Setelah masa
          aktif berakhir, draft tetap tersimpan; cukup perpanjang untuk
          mengaktifkan kembali undangan publik.
        </div>
      </section>
    </main>
  )
}
