import "server-only"
import Link from "next/link"
import { verifyEmailToken } from "@/server/email/verification"
import { FloralCorner } from "@/components/auth/floral-corner"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

/**
 * GET /verify-email?token=...
 *
 * Full-page acknowledgement screen instead of a centred card. The body is
 * one large display headline so it reads like a personal note from the
 * site, not a system dialog.
 */
export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  if (!token) {
    return (
      <Shell tone="error">
        <Headline lead="Tautan tidak lengkap." emphasis="Periksa lagi" />
        <Body>
          Email verifikasi kami menyertakan tautan dengan token. Silakan minta
          tautan baru dari halaman pratinjau verifikasi.
        </Body>
        <Action href="/verify-email/pending" label="Minta tautan baru" />
      </Shell>
    )
  }

  const result = await verifyEmailToken(token)

  if (result.ok) {
    return (
      <Shell tone="ok">
        <Headline
          lead="Email Anda"
          emphasis="terverifikasi."
          tail="Selamat menulis cerita."
        />
        <Body>
          Dasbor sudah terbuka penuh. Anda bisa langsung membuat draf undangan,
          memilih tema, dan mengundang tamu.
        </Body>
        <Action href="/dashboard" label="Masuk ke dasbor" />
      </Shell>
    )
  }

  const messages = {
    INVALID: {
      lead: "Tautan ini",
      emphasis: "tidak valid.",
      body: "Kemungkinan tautan sudah pernah dipakai, atau dibuat untuk akun lain.",
    },
    EXPIRED: {
      lead: "Tautan",
      emphasis: "kedaluwarsa.",
      body: "Demi keamanan, tautan verifikasi hanya berlaku 60 menit. Silakan minta yang baru.",
    },
    USED: {
      lead: "Tautan",
      emphasis: "sudah dipakai.",
      body: "Bila Anda belum sempat masuk, silakan minta tautan baru.",
    },
  } as const
  const m = messages[result.reason]

  return (
    <Shell tone="error">
      <Headline lead={m.lead} emphasis={m.emphasis} />
      <Body>{m.body}</Body>
      <Action href="/verify-email/pending" label="Minta tautan baru" />
    </Shell>
  )
}

function Shell({
  tone,
  children,
}: {
  tone: "ok" | "error"
  children: React.ReactNode
}) {
  return (
    <main
      className={
        "relative grid min-h-screen place-items-center overflow-hidden px-6 " +
        (tone === "ok"
          ? "bg-gradient-to-br from-rose-50 to-pink-50"
          : "bg-gradient-to-br from-stone-50 to-rose-50")
      }
    >
      <FloralCorner className="pointer-events-none absolute -left-12 -top-16 h-72 w-72 -rotate-12 text-rose-200/70" />
      <FloralCorner className="pointer-events-none absolute -bottom-24 -right-12 h-80 w-80 rotate-[170deg] text-rose-200/60" />
      <div className="relative max-w-3xl text-center">{children}</div>
    </main>
  )
}

function Headline({
  lead,
  emphasis,
  tail,
}: {
  lead: string
  emphasis: string
  tail?: string
}) {
  return (
    <h1 className="font-display text-6xl leading-[0.95] tracking-tight text-stone-900 md:text-8xl">
      {lead}
      <span className="block italic text-rose-500">{emphasis}</span>
      {tail ? <span className="block text-stone-700">{tail}</span> : null}
    </h1>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-stone-600">
      {children}
    </p>
  )
}

function Action({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-10 inline-block rounded-full bg-rose-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-600"
    >
      {label}
    </Link>
  )
}
