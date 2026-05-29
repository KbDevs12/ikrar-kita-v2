import "server-only"
import Link from "next/link"
import { verifyEmailToken } from "@/server/email/verification"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

/**
 * GET /verify-email?token=...
 *
 * Renders a small success/error screen depending on the token. Side effect:
 * if the token is valid the user is marked VERIFIED in the same handler.
 */
export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  if (!token) return <ResultCard variant="error" title="Tautan tidak lengkap" />

  const result = await verifyEmailToken(token)

  if (result.ok) {
    return (
      <ResultCard
        variant="ok"
        title="Email Anda berhasil diverifikasi"
        body="Selamat datang di Ikrar Kita. Anda sudah bisa membuat undangan dan memilih paket dari dasbor."
        action={{ href: "/dashboard", label: "Buka dasbor" }}
      />
    )
  }

  const messages = {
    INVALID: {
      title: "Tautan tidak valid",
      body: "Kemungkinan tautan ini sudah pernah digunakan, atau dibuat untuk akun lain.",
    },
    EXPIRED: {
      title: "Tautan kedaluwarsa",
      body: "Tautan verifikasi hanya berlaku 60 menit. Silakan minta tautan baru.",
    },
    USED: {
      title: "Tautan sudah dipakai",
      body: "Tautan ini sudah digunakan. Jika Anda belum berhasil masuk, silakan minta tautan baru.",
    },
  } as const
  const msg = messages[result.reason]

  return (
    <ResultCard
      variant="error"
      title={msg.title}
      body={msg.body}
      action={{ href: "/verify-email/pending", label: "Minta tautan baru" }}
    />
  )
}

function ResultCard(props: {
  variant: "ok" | "error"
  title: string
  body?: string
  action?: { href: string; label: string }
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div
          className={
            "mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full " +
            (props.variant === "ok"
              ? "bg-sage-100 text-sage-700"
              : "bg-rose-100 text-rose-700")
          }
          aria-hidden
        >
          {props.variant === "ok" ? "✓" : "!"}
        </div>
        <h1 className="font-display text-2xl">{props.title}</h1>
        {props.body ? (
          <p className="mt-2 text-sm text-muted-foreground">{props.body}</p>
        ) : null}
        {props.action ? (
          <Link
            href={props.action.href}
            className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"
          >
            {props.action.label}
          </Link>
        ) : null}
      </div>
    </main>
  )
}
