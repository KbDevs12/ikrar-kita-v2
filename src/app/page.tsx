import Link from "next/link"

/**
 * Landing page placeholder.
 *
 * The full landing experience is implemented in a later milestone with bespoke
 * sections, animation, and dummy testimonials. This skeleton exists so the
 * project boots cleanly during the foundation phase.
 */
export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <header className="border-b border-border/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            Ikrar Kita
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
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

      <section className="container flex flex-1 flex-col items-start justify-center gap-6 py-24">
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Undangan pernikahan digital
        </p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-balance md:text-6xl">
          Undangan yang terasa hangat sejak halaman pertama dibuka.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
          Rancang undangan pernikahan yang bersih, elegan, dan mudah dibagikan ke keluarga,
          sahabat, dan rekan. Sepuluh tema dengan karakter visual berbeda, lengkap dengan RSVP,
          peta lokasi, dan ucapan tamu.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="rounded-md bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90"
          >
            Buat undangan
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-border px-5 py-2.5 hover:bg-accent"
          >
            Lihat paket
          </Link>
        </div>
      </section>
    </main>
  )
}
