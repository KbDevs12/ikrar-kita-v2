import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { LenisProvider } from "@/components/lenis-provider"
import {
  HeroReveal,
  PreviewReveal,
  TestimonialReveal,
} from "./_landing/scroll-reveals"

export const metadata = {
  title: "Ikrar Kita — Undangan pernikahan yang ditulis tangan, dirancang ulang",
}

const PLACEHOLDER = (color: string, label = "+") =>
  `https://placehold.co/800x1000/${color}/9f1239?text=${label}`

const NUMBERS = [
  { value: "1.200", label: "pasangan tahun lalu memakai Ikrar Kita" },
  { value: "10", label: "tema yang ditulis ulang dari nol — bukan ganti warna" },
  { value: "30 hari", label: "satu paket cukup dari undangan sampai resepsi" },
] as const

const QUOTE = {
  body: `Kami sempat mencoba dua platform lain dan rasanya seperti memaksakan
template yang sama untuk lima ribu pasangan. Yang ini berbeda — kami pilih tema
Soft Pastel, ketik nama, lalu sebar. Tamu malah membalas “undangannya manis,
seperti adat foto kalian”. Kami tidak menambahkan apa-apa, hanya jujur saja.`,
  attribution: "Sinta &amp; Andi",
  context: "Akad di Bandung, resepsi di Jakarta · September 2025",
}

export default function LandingPage() {
  return (
    <LenisProvider>
      <main className="relative bg-rose-50/40 text-stone-900">
        <SiteHeader />
        <Hero />
        <TemplatePreview />
        <NumbersStrip />
        <PullQuote />
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
        <Link href="/pricing" className="rounded-full px-4 py-2 hover:bg-rose-50">
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
    <section className="relative overflow-hidden">
      <HeroReveal>
        <div className="grid grid-cols-12 gap-x-6 px-6 pb-16 pt-8 md:px-12 md:pb-24 md:pt-12">
          <div className="col-span-12 md:col-span-7">
            <p className="mb-8 text-xs uppercase tracking-[0.32em] text-rose-500">
              Ikrar Kita · Undangan digital, ditulis tangan
            </p>
            <h1 className="font-display text-[15vw] leading-[0.86] tracking-tight md:text-[10vw] lg:text-[8.4rem]">
              Undangan
              <span className="block italic text-rose-500">yang terasa</span>
              <span className="block">seperti puisi</span>
            </h1>
            <p className="mt-10 max-w-md text-base leading-relaxed text-stone-600">
              Sepuluh tema yang ditulis ulang dari nol. Bukan template. Anda
              ketik nama, kami yang menyusun komposisinya.
            </p>
            <Link
              href="/register"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-600"
            >
              Mulai dari draf gratis
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <aside className="col-span-12 mt-12 md:col-span-5 md:mt-0">
            <div className="relative h-[420px] md:h-[560px]">
              <Image
                src={PLACEHOLDER("fce7f3")}
                alt="Foto pasangan duduk di bangku rotan, taman terbuka, pakaian putih dan krem"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="rounded-[2rem] object-cover"
                priority
              />
              <Image
                src={PLACEHOLDER("fef3c7")}
                alt="Detail pegangan tangan dengan cincin emas tipis di atas buku catatan kulit"
                width={220}
                height={280}
                className="absolute -bottom-8 -left-10 hidden rounded-3xl border-8 border-rose-50 object-cover shadow-lg md:block"
              />
              <Image
                src={PLACEHOLDER("ffe4e6")}
                alt="Cuplikan undangan digital di layar ponsel, nuansa pastel"
                width={150}
                height={300}
                className="absolute -right-6 top-1/3 hidden rounded-3xl border-4 border-white object-cover shadow-md lg:block"
              />
            </div>
          </aside>
        </div>
      </HeroReveal>

      {/* Cut-off headline edge effect: a soft fade-out at the right viewport
          edge so the long display type 'spills' instead of stopping abruptly. */}
      <div className="pointer-events-none absolute right-0 top-1/4 hidden h-72 w-32 bg-gradient-to-l from-rose-50/60 to-transparent md:block" />
    </section>
  )
}

function TemplatePreview() {
  return (
    <section className="relative bg-white">
      <PreviewReveal>
        <div className="px-6 py-20 md:px-12 md:py-28">
          <div className="mb-10 grid grid-cols-12">
            <div className="col-span-12 md:col-span-6">
              <p className="text-xs uppercase tracking-[0.32em] text-rose-500">
                Tema unggulan bulan ini
              </p>
              <h2 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
                <span className="italic">Soft Pastel</span>
                <span className="block">untuk akad pagi</span>
              </h2>
            </div>
            <p className="col-span-12 mt-6 max-w-md text-base leading-relaxed text-stone-600 md:col-span-5 md:col-start-8 md:mt-0">
              Watercolor blob lembut peach dan lilac, kartu pasangan miring
              sedikit, dan jadwal dalam pil bulat. Semua tipografi serif italik
              karena pagi memang waktunya kalimat-kalimat panjang.
            </p>
          </div>

          <figure className="relative mx-auto max-w-6xl">
            <Image
              src={PLACEHOLDER("fce7f3")}
              alt="Tangkapan layar full undangan tema Soft Pastel"
              width={1280}
              height={720}
              className="w-full rounded-3xl border border-rose-100 object-cover shadow-xl"
            />
            <figcaption className="mt-4 text-center text-xs uppercase tracking-[0.32em] text-stone-500">
              soft-pastel · diuji di 312 pernikahan
            </figcaption>
          </figure>

          <div className="mt-10 flex justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm text-stone-700 underline decoration-rose-300 decoration-2 underline-offset-8 hover:text-rose-600"
            >
              Lihat sembilan tema lainnya
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </PreviewReveal>
    </section>
  )
}

function NumbersStrip() {
  return (
    <section className="relative bg-rose-50/60">
      <div className="px-6 py-20 md:px-12 md:py-24">
        <ul className="flex flex-col items-start divide-y divide-rose-200/60 md:flex-row md:items-end md:divide-x md:divide-y-0">
          {NUMBERS.map((n, i) => (
            <li
              key={n.label}
              className="w-full py-8 md:w-1/3 md:px-12 md:py-0"
              style={{ paddingLeft: i === 0 ? 0 : undefined }}
            >
              <p className="font-display text-7xl leading-none tracking-tight text-stone-900 md:text-8xl">
                {n.value}
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-600">{n.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function PullQuote() {
  return (
    <section className="relative bg-white">
      <TestimonialReveal>
        <div className="grid grid-cols-12 gap-x-6 px-6 py-24 md:px-12 md:py-32">
          <p className="col-span-12 mb-6 text-xs uppercase tracking-[0.32em] text-rose-500 md:col-span-3">
            Cerita pasangan
          </p>

          <blockquote className="col-span-12 md:col-span-9">
            <p className="font-display text-3xl leading-snug text-stone-900 md:text-5xl md:leading-[1.15]">
              <span aria-hidden className="mr-2 text-rose-300">“</span>
              {QUOTE.body}
            </p>
            <footer className="mt-10 flex flex-col gap-1 text-sm text-stone-600">
              <cite
                className="font-display text-xl not-italic text-stone-900"
                dangerouslySetInnerHTML={{ __html: QUOTE.attribution }}
              />
              <span>{QUOTE.context}</span>
            </footer>
          </blockquote>
        </div>
      </TestimonialReveal>
    </section>
  )
}

function ClosingNote() {
  return (
    <section className="relative bg-stone-900 text-rose-50">
      <div className="grid grid-cols-12 gap-x-6 px-6 py-20 md:px-12 md:py-28">
        <h2 className="col-span-12 font-display text-4xl md:col-span-7 md:text-6xl">
          Tulis nama Anda berdua. Sisanya kami yang menyusun.
        </h2>
        <div className="col-span-12 mt-10 flex flex-wrap items-center gap-4 md:col-span-5 md:mt-0 md:justify-end">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-400"
          >
            Buat akun
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/pricing"
            className="text-sm underline decoration-rose-300/40 underline-offset-8 hover:decoration-rose-300"
          >
            Lihat paket
          </Link>
        </div>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="bg-stone-900 text-rose-100/70">
      <div className="grid grid-cols-12 gap-x-6 px-6 pb-12 pt-8 md:px-12">
        <p className="col-span-12 text-xs md:col-span-6">
          © {new Date().getFullYear()} Ikrar Kita. Dibuat dengan banyak kopi.
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
