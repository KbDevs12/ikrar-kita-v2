import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { prisma } from "@/server/db/prisma"
import { formatRupiah } from "@/lib/utils"
import { LenisProvider } from "@/components/lenis-provider"

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
    "Cocok untuk pasangan dengan dua acara berbeda",
    "Semua fitur Basic, plus laporan tamu lebih rapi",
    "Prioritas balas pertanyaan teknis",
  ],
  RESELLER: [
    "Tanpa batas undangan terpublikasi",
    "Untuk WO, vendor, dan agensi",
    "Subdomain putih label setelah konfirmasi",
    "Dukungan langsung lewat WhatsApp",
  ],
}

const PLAN_KICKER: Record<string, string> = {
  BASIC: "Cukup untuk satu hari",
  PRO: "Untuk yang punya dua acara",
  RESELLER: "Untuk vendor",
}

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <LenisProvider>
      <main className="min-h-screen bg-rose-50/40 text-stone-900">
        <SiteHeader />
        <Hero />
        <PlanList plans={plans} />
        <CompareTable plans={plans} />
        <ClosingNote />
        <SiteFooter />
      </main>
    </LenisProvider>
  )
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-5 backdrop-blur md:px-12">
      <Link href="/" className="font-display text-lg tracking-tight text-stone-900">
        Ikrar Kita
      </Link>
      <nav className="flex items-center gap-1 text-sm text-stone-700">
        <Link href="/pricing" className="rounded-full bg-white px-4 py-2 ring-1 ring-rose-200">
          Harga
        </Link>
        <Link href="/login" className="rounded-full px-4 py-2 hover:bg-rose-50">
          Masuk
        </Link>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="grid grid-cols-12 gap-x-6 px-6 pb-14 pt-8 md:px-12 md:pb-20">
      <div className="col-span-12 md:col-span-8">
        <p className="text-xs uppercase tracking-[0.32em] text-rose-500">Harga</p>
        <h1 className="mt-6 font-display text-[14vw] leading-[0.86] tracking-tight md:text-[8vw] lg:text-[7rem]">
          Bayar saat siap
          <span className="block italic text-rose-500">menyebar.</span>
          <span className="block">Bukan saat masih merancang.</span>
        </h1>
      </div>
      <p className="col-span-12 mt-10 max-w-md text-base leading-relaxed text-stone-600 md:col-span-4 md:col-start-9 md:mt-0 md:self-end">
        Draf gratis selamanya. Setelah masa aktif berakhir, draf tetap
        tersimpan; cukup perpanjang untuk mengaktifkan kembali undangan
        publik. Tidak ada langganan otomatis.
      </p>
    </section>
  )
}

function PlanList({
  plans,
}: {
  plans: Array<{
    id: string
    code: string
    name: string
    price: number
    durationDays: number
    description: string | null
  }>
}) {
  return (
    <section className="border-t border-rose-200">
      <ul>
        {plans.map((plan, i) => {
          const featured = plan.code === "PRO"
          const highlights = HIGHLIGHTS[plan.code] ?? []
          return (
            <li
              key={plan.id}
              className={
                "group relative " +
                (featured
                  ? "bg-stone-900 text-rose-50"
                  : "border-b border-rose-200 bg-rose-50/40")
              }
            >
              <div className="grid grid-cols-12 gap-x-6 px-6 py-12 md:px-12 md:py-16">
                <p
                  className={
                    "col-span-12 font-display text-7xl tracking-tight md:col-span-2 md:text-8xl " +
                    (featured ? "text-rose-300/70" : "text-rose-500/70")
                  }
                >
                  {String(i + 1).padStart(2, "0")}
                </p>

                <div className="col-span-12 mt-4 md:col-span-6 md:mt-0">
                  <p
                    className={
                      "text-xs uppercase tracking-[0.32em] " +
                      (featured ? "text-rose-300" : "text-rose-500")
                    }
                  >
                    {PLAN_KICKER[plan.code] ?? "Paket"}
                  </p>
                  <h2 className="mt-2 font-display text-5xl leading-tight md:text-6xl">
                    {plan.name}
                  </h2>
                  <p
                    className={
                      "mt-3 max-w-md text-base " +
                      (featured ? "text-rose-100/80" : "text-stone-600")
                    }
                  >
                    {plan.description ?? ""}
                  </p>
                  <ul className="mt-6 space-y-2 text-sm">
                    {highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className={
                            "mt-2 block h-1 w-3 " +
                            (featured ? "bg-rose-300" : "bg-rose-400")
                          }
                        />
                        <span className={featured ? "text-rose-100" : "text-stone-700"}>
                          {h}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-span-12 mt-10 flex flex-col items-start gap-3 md:col-span-4 md:mt-0 md:items-end md:text-right">
                  <p className="font-display text-5xl tabular-nums leading-none md:text-6xl">
                    {formatRupiah(plan.price)}
                  </p>
                  <p
                    className={
                      "text-xs uppercase tracking-[0.32em] " +
                      (featured ? "text-rose-200" : "text-stone-500")
                    }
                  >
                    {plan.durationDays} hari
                  </p>
                  <Link
                    href={`/register?plan=${plan.code}`}
                    className={
                      "mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors " +
                      (featured
                        ? "bg-rose-500 text-white hover:bg-rose-400"
                        : "bg-stone-900 text-white hover:bg-stone-800")
                    }
                  >
                    Pilih {plan.name}
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function CompareTable({
  plans,
}: {
  plans: Array<{ code: string; invitationLimit: number | null }>
}) {
  const rows: Array<{ label: string; values: Record<string, string> }> = [
    {
      label: "Undangan terpublikasi",
      values: plans.reduce<Record<string, string>>(
        (acc, p) => {
          acc[p.code] = p.invitationLimit === null ? "Tanpa batas" : `${p.invitationLimit}`
          return acc
        },
        {}
      ),
    },
    {
      label: "Akses 10 tema",
      values: { BASIC: "Ya", PRO: "Ya", RESELLER: "Ya" },
    },
    {
      label: "RSVP &amp; ucapan tamu",
      values: { BASIC: "Ya", PRO: "Ya", RESELLER: "Ya" },
    },
    {
      label: "Laporan tamu",
      values: { BASIC: "Ringkas", PRO: "Lengkap", RESELLER: "Lengkap + ekspor" },
    },
    {
      label: "Subdomain putih label",
      values: { BASIC: "—", PRO: "—", RESELLER: "Ya" },
    },
    {
      label: "Dukungan",
      values: { BASIC: "Email", PRO: "Email prioritas", RESELLER: "WhatsApp langsung" },
    },
  ]

  return (
    <section className="bg-white">
      <div className="px-6 py-20 md:px-12 md:py-24">
        <p className="text-xs uppercase tracking-[0.32em] text-rose-500">Perbandingan</p>
        <h2 className="mt-3 font-display text-4xl text-stone-900 md:text-5xl">
          Apa bedanya?
        </h2>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-rose-200 text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="px-3 py-4 font-medium">Fitur</th>
                {plans.map((p) => (
                  <th key={p.code} className="px-3 py-4 font-medium">
                    {p.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {rows.map((row) => (
                <tr key={row.label}>
                  <td
                    className="px-3 py-4 text-stone-600"
                    dangerouslySetInnerHTML={{ __html: row.label }}
                  />
                  {plans.map((p) => (
                    <td
                      key={p.code}
                      className={
                        "px-3 py-4 " +
                        (p.code === "PRO"
                          ? "font-medium text-rose-600"
                          : "text-stone-700")
                      }
                    >
                      {row.values[p.code] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function ClosingNote() {
  return (
    <section className="bg-rose-50/40">
      <div className="px-6 py-20 text-center md:px-12 md:py-24">
        <h2 className="mx-auto max-w-3xl font-display text-4xl text-stone-900 md:text-5xl">
          Tidak yakin paket mana?{" "}
          <span className="italic text-rose-500">Mulai dari draf dulu.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base text-stone-600">
          Anda baru memilih paket saat siap menyebar undangan. Kami tidak
          minta nomor kartu di awal.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-medium text-white hover:bg-rose-600"
        >
          Mulai membuat draf
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="bg-stone-900 text-rose-100/70">
      <div className="grid grid-cols-12 gap-x-6 px-6 pb-12 pt-8 md:px-12">
        <p className="col-span-12 text-xs md:col-span-6">
          © {new Date().getFullYear()} Ikrar Kita.
        </p>
        <nav className="col-span-12 mt-4 flex gap-6 text-xs md:col-span-6 md:mt-0 md:justify-end">
          <Link href="/pricing" className="hover:text-rose-200">Harga</Link>
          <Link href="/login" className="hover:text-rose-200">Masuk</Link>
          <Link href="/register" className="hover:text-rose-200">Daftar</Link>
        </nav>
      </div>
    </footer>
  )
}
