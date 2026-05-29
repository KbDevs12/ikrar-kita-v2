import Link from "next/link"
import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/forms/register-form"
import { getSession } from "@/server/auth/session"

export const metadata = {
  title: "Daftar",
}

export default async function RegisterPage() {
  const session = await getSession()
  if (session) redirect(session.user.emailVerifiedAt ? "/dashboard" : "/verify-email/pending")

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(420px,520px)_1fr]">
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block font-display text-lg">
            Ikrar Kita
          </Link>
          <h1 className="font-display text-3xl">Buat akun Ikrar Kita</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Mulai dari draft gratis. Bayar saat siap menerbitkan.
          </p>

          <div className="mt-8">
            <RegisterForm />
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </main>

      <aside className="relative hidden overflow-hidden bg-rose-50 lg:block">
        <div className="absolute inset-0 bg-grain opacity-30" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-12 text-rose-900">
          <span className="font-serif text-sm uppercase tracking-[0.18em]">
            Sepuluh tema, satu pernikahan
          </span>
          <p className="max-w-md font-display text-3xl leading-tight">
            Tema klasik, modern, kebun, atau islami — pilih yang paling
            <span className="italic"> terasa Anda berdua.</span>
          </p>
        </div>
      </aside>
    </div>
  )
}
