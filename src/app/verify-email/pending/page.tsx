import Link from "next/link"
import { ResendVerificationForm } from "@/components/forms/resend-verification-form"
import { requireSessionOrRedirect } from "@/server/auth/guards"
import { redirect } from "next/navigation"

export const metadata = { title: "Verifikasi email" }

export default async function VerifyEmailPendingPage() {
  const session = await requireSessionOrRedirect()
  if (session.user.emailVerifiedAt) redirect("/dashboard")

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700" aria-hidden>
          ✦
        </div>
        <h1 className="text-center font-display text-2xl">Cek email Anda</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Kami sudah mengirim tautan verifikasi ke <strong>{session.user.email}</strong>.
          Klik tautan tersebut untuk membuka dasbor sepenuhnya.
        </p>

        <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Tidak menerima email? Periksa folder spam, atau minta tautan baru
          di bawah ini.
        </div>

        <div className="mt-6">
          <ResendVerificationForm initialEmail={session.user.email} />
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">
            ← Kembali ke masuk
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="hover:text-foreground" type="submit">
              Keluar
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
