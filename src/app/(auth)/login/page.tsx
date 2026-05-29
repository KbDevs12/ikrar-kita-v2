import Link from "next/link"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/forms/login-form"
import { getSession } from "@/server/auth/session"

export const metadata = {
  title: "Masuk",
}

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect(session.user.emailVerifiedAt ? "/dashboard" : "/verify-email/pending")

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(420px,520px)]">
      <aside className="relative hidden overflow-hidden bg-ink-700 text-ink-50 lg:block">
        <div className="absolute inset-0 bg-grain opacity-20" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="font-display text-xl tracking-tight">
            Ikrar Kita
          </Link>
          <blockquote className="max-w-md font-serif text-2xl leading-snug">
            “Kami suka karena prosesnya tenang. Tinggal isi data, pilih tema,
            sebar undangan. Tidak ribet.”
            <footer className="mt-3 text-sm font-sans text-ink-200">
              — Sinta &amp; Andi, Bandung
            </footer>
          </blockquote>
        </div>
      </aside>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block font-display text-lg lg:hidden">
            Ikrar Kita
          </Link>
          <h1 className="font-display text-3xl">Masuk ke akun Anda</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Kelola undangan, tamu, dan langganan dari satu dasbor.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
