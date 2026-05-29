"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export interface PreviewBannerProps {
  invitationId: string
  slug: string
  realStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  livePublic: boolean
  subscriptionStatus: string | null
  initialRecipient: string
}

const STATUS_LABEL: Record<PreviewBannerProps["realStatus"], string> = {
  DRAFT: "Draft",
  PUBLISHED: "Sudah dipublikasi",
  ARCHIVED: "Diarsipkan",
}

const STATUS_TONE: Record<PreviewBannerProps["realStatus"], string> = {
  DRAFT: "bg-amber-100 text-amber-900",
  PUBLISHED: "bg-sage-100 text-sage-700",
  ARCHIVED: "bg-muted text-muted-foreground",
}

const RECIPIENT_PRESETS = [
  "Bapak Budi",
  "Ibu Sari",
  "Keluarga Pak Agus",
  "Sahabat Lama",
  "Tamu Undangan",
] as const

/**
 * Sticky preview chrome rendered on top of the invitation template.
 *
 * Two things owners need:
 *   1. Confirmation that what they are looking at matches what visitors
 *      will see (or a clear note that the live URL is currently not
 *      serving this invitation).
 *   2. A way to test how a personalised greeting looks (?to=...).
 *
 * Pure client component: it only mutates the URL via router.replace so a
 * recipient change does not bust the shallow render history.
 */
export function PreviewBanner({
  invitationId,
  slug,
  realStatus,
  livePublic,
  subscriptionStatus,
  initialRecipient,
}: PreviewBannerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [recipient, setRecipient] = useState(initialRecipient)
  const [open, setOpen] = useState(false)

  function applyRecipient(value: string) {
    const trimmed = value.trim()
    setRecipient(trimmed)
    const sp = new URLSearchParams()
    if (trimmed) sp.set("to", trimmed)
    const next = sp.toString() ? `${pathname}?${sp}` : pathname
    router.replace(next)
  }

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur"
      data-preview-banner
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-primary">
          Pratinjau
        </span>

        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
            STATUS_TONE[realStatus]
          )}
        >
          {STATUS_LABEL[realStatus]}
        </span>

        {realStatus === "PUBLISHED" ? (
          livePublic ? (
            <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-[11px] font-medium text-sage-700">
              URL publik aktif
            </span>
          ) : (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-medium text-rose-700">
              URL publik tidak aktif
              {subscriptionStatus && subscriptionStatus !== "ACTIVE"
                ? " (langganan tidak aktif)"
                : ""}
            </span>
          )
        ) : null}

        <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">/{slug}</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-border px-2.5 py-1 text-foreground hover:bg-accent"
          >
            {open ? "Tutup" : "Tes nama tamu"}
          </button>
          <Link
            href={`/dashboard/invitations/${invitationId}/edit`}
            className="rounded-md border border-border px-2.5 py-1 text-foreground hover:bg-accent"
          >
            Edit
          </Link>
          <Link
            href={`/dashboard/invitations`}
            className="rounded-md bg-primary px-2.5 py-1 text-primary-foreground hover:opacity-90"
          >
            Keluar
          </Link>
        </span>
      </div>

      {open ? (
        <div className="border-t border-border bg-muted/40 px-4 py-3">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 text-sm">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Nama tamu
            </span>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                applyRecipient(recipient)
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Bapak Budi"
                className="h-8 w-56 rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                className="rounded-md border border-border bg-card px-2.5 py-1 text-xs hover:bg-accent"
              >
                Terapkan
              </button>
            </form>
            <span className="text-xs text-muted-foreground">atau cepat:</span>
            <div className="flex flex-wrap gap-1.5">
              {RECIPIENT_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyRecipient(p)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] transition",
                    recipient === p
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
