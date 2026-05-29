"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function PublishButton({ invitationId }: { invitationId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function publish() {
    if (!confirm("Publikasikan undangan ini? URL publik akan langsung aktif.")) return
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/invitations/${invitationId}/publish`, { method: "POST" })
    const json = await res.json()
    setBusy(false)
    if (!res.ok || !json.ok) {
      const map: Record<string, string> = {
        NO_ACTIVE_SUBSCRIPTION: "Anda perlu langganan aktif untuk mempublikasikan undangan.",
        LIMIT_REACHED: "Batas publikasi paket Anda sudah tercapai. Upgrade paket atau arsipkan undangan lain.",
        EMAIL_NOT_VERIFIED: "Verifikasi email dulu sebelum publikasi.",
      }
      setError(map[json.error?.code] ?? json.error?.message ?? "Gagal publikasi.")
      return
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={publish} disabled={busy}>
        {busy ? "Memproses..." : "Publikasikan"}
      </Button>
      {error ? (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
