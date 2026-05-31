import Link from "next/link"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/forms/login-form"
import { getSession } from "@/server/auth/session"

export const metadata = { title: "Masuk" }

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect(session.user.emailVerifiedAt ? "/dashboard" : "/verify-email/pending")

  return (
    <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1.3fr_minmax(420px,520px)]">
      <aside className="relative hidden overflow-hidden lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <Link href="/" className="font-display text-lg tracking-tight text-stone-900">
            Ikrar Kita
          </Link>
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.32em] text-rose-500">Masuk</p>
            <h1 className="font-display text-7xl leading-[0.9] tracking-tight text-stone-900 xl:text-8xl">
              Selamat
              <span className="block italic text-rose-500">datang</span>
              <span className="block">kembali.</span>
            </h1>
            <p className="mt-8 max-w-md text-base text-stone-600">
              Lanjutkan menyusun draf, balas RSVP, atau atur jadwal akad
              <br />
              semua dari satu dashboard.
            </p>
          </div>
          <p className="text-xs text-stone-500">© {new Date().getFullYear()} Ikrar Kita</p>
        </div>
      </aside>

      <main className="relative flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 inline-block font-display text-lg tracking-tight lg:hidden"
          >
            Ikrar Kita
          </Link>
          <h2 className="font-display text-3xl text-stone-900">Masuk ke akun</h2>
          <p className="mt-1.5 text-sm text-stone-500">
            Belum punya akun?{" "}
            <Link href="/register" className="text-rose-600 underline-offset-4 hover:underline">
              Daftar di sini
            </Link>
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  )
}
