import Link from "next/link"
import { ResendVerificationForm } from "@/components/forms/resend-verification-form"
import { requireSessionOrRedirect } from "@/server/auth/guards"
import { redirect } from "next/navigation"
import { FloralCorner } from "@/components/auth/floral-corner"

export const metadata = { title: "Verifikasi email" }

export default async function VerifyEmailPendingPage() {
  const session = await requireSessionOrRedirect()
  if (session.user.emailVerifiedAt) redirect("/dashboard")

  return (
    <main className="relative grid min-h-screen grid-cols-1 overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 lg:grid-cols-[1.2fr_minmax(380px,460px)]">
      <FloralCorner className="pointer-events-none absolute -left-12 -top-12 h-72 w-72 -rotate-12 text-rose-200/70" />
      <FloralCorner className="pointer-events-none absolute -bottom-20 -right-12 h-80 w-80 rotate-[170deg] text-rose-200/60" />

      <section className="relative flex flex-col justify-between p-8 md:p-12">
        <Link href="/" className="font-display text-lg tracking-tight text-stone-900">
          Ikrar Kita
        </Link>

        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-rose-500">
            Verifikasi diperlukan
          </p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-stone-900 md:text-7xl">
            Cek email
            <span className="block italic text-rose-500">Anda dulu.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-stone-600">
            Kami sudah mengirim tautan ke{" "}
            <strong className="font-medium text-stone-900">{session.user.email}</strong>.
            Klik tautan tersebut untuk membuka dasbor. Bila tidak menemukan,
            cek juga folder spam.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-stone-500">
          <Link href="/login" className="hover:text-stone-900">
            ← Halaman masuk
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="hover:text-stone-900">
              Keluar
            </button>
          </form>
        </div>
      </section>

      <section className="relative flex flex-col justify-center bg-white px-8 py-12 md:px-12">
        <p className="text-xs uppercase tracking-[0.32em] text-rose-500">
          Tidak menerima email?
        </p>
        <h2 className="mt-2 font-display text-3xl text-stone-900">
          Kirim ulang tautannya.
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          Kami batasi pengiriman ulang setiap 60 detik. Pastikan email yang
          Anda masukkan benar.
        </p>
        <div className="mt-6">
          <ResendVerificationForm initialEmail={session.user.email} />
        </div>
      </section>
    </main>
  )
}
