"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FieldError } from "@/components/forms/field-error"
import {
  adminCancelInvoiceSchema,
  adminManualApproveSchema,
} from "@/lib/validators/admin"
import { zodFieldValidator } from "@/lib/forms/zod-validators"
import { cn } from "@/lib/utils"

interface InvoiceActionsProps {
  invoiceId: string
  /** Current invoice status from the server */
  status: string
  /** Whether the invoice carries a Tripay reference (sync requires it) */
  hasTripayReference: boolean
}

type ApiResponse =
  | { ok: true; data: unknown; error?: undefined }
  | { ok: false; error: { code: string; message: string }; data?: undefined }

export function InvoiceActions({
  invoiceId,
  status,
  hasTripayReference,
}: InvoiceActionsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"approve" | "cancel" | "sync">(
    isTerminalStatus(status) ? "sync" : "approve"
  )
  const [syncResult, setSyncResult] = useState<{
    kind: "ok" | "error"
    message: string
  } | null>(null)
  const [syncing, setSyncing] = useState(false)

  const isFinal = isTerminalStatus(status)

  async function runSync() {
    setSyncing(true)
    setSyncResult(null)
    const res = await fetch(`/api/admin/invoices/${invoiceId}/sync`, {
      method: "POST",
    })
    const json = (await res.json()) as ApiResponse
    setSyncing(false)
    if (!res.ok || !json.ok) {
      setSyncResult({
        kind: "error",
        message: json.error?.message ?? "Sinkronisasi gagal.",
      })
      return
    }
    setSyncResult({
      kind: "ok",
      message: "Status berhasil disinkronisasi dengan Tripay.",
    })
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Tindakan admin
        </p>
      </header>

      <div className="flex border-b border-border text-sm">
        <TabButton
          active={activeTab === "approve"}
          disabled={isFinal}
          onClick={() => setActiveTab("approve")}
        >
          Approve manual
        </TabButton>
        <TabButton
          active={activeTab === "cancel"}
          disabled={isFinal}
          onClick={() => setActiveTab("cancel")}
        >
          Batalkan
        </TabButton>
        <TabButton
          active={activeTab === "sync"}
          disabled={!hasTripayReference}
          onClick={() => setActiveTab("sync")}
        >
          Sinkron Tripay
        </TabButton>
      </div>

      <div className="p-5">
        {activeTab === "approve" ? (
          isFinal ? (
            <FinalNotice status={status} />
          ) : (
            <ManualApproveForm invoiceId={invoiceId} />
          )
        ) : null}

        {activeTab === "cancel" ? (
          isFinal ? (
            <FinalNotice status={status} />
          ) : (
            <CancelInvoiceForm invoiceId={invoiceId} />
          )
        ) : null}

        {activeTab === "sync" ? (
          !hasTripayReference ? (
            <p className="text-sm text-muted-foreground">
              Invoice ini tidak memiliki referensi Tripay sehingga tidak dapat
              disinkronkan dari API Tripay.
            </p>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                Tarik status terkini dari Tripay dan rekonsiliasi invoice. Aman
                dijalankan berkali-kali — proses bersifat idempoten.
              </p>
              <Button
                type="button"
                onClick={runSync}
                disabled={syncing}
                className="mt-4"
              >
                {syncing ? "Menyinkronkan..." : "Sinkronkan sekarang"}
              </Button>
              {syncResult ? (
                <p
                  role={syncResult.kind === "ok" ? "status" : "alert"}
                  className={cn(
                    "mt-3 rounded-md px-3 py-2 text-xs",
                    syncResult.kind === "ok"
                      ? "bg-sage-100 text-sage-700"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {syncResult.message}
                </p>
              ) : null}
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}

function isTerminalStatus(status: string): boolean {
  return ["PAID", "FAILED", "EXPIRED", "REFUND", "CANCELLED"].includes(status)
}

function FinalNotice({ status }: { status: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      Invoice sudah dalam status <strong>{status}</strong>. Tidak ada tindakan
      yang tersedia di tab ini. Anda masih dapat melihat audit trail dan
      riwayat callback di bagian bawah halaman.
    </p>
  )
}

function TabButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 px-4 py-2.5 text-center transition-colors",
        active
          ? "border-b-2 border-primary text-foreground"
          : "border-b-2 border-transparent text-muted-foreground hover:text-foreground",
        disabled ? "cursor-not-allowed opacity-50 hover:text-muted-foreground" : ""
      )}
    >
      {children}
    </button>
  )
}

// ─── Manual Approve ─────────────────────────────────────────────────────────

function ManualApproveForm({ invoiceId }: { invoiceId: string }) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm({
    defaultValues: { note: "" },
    onSubmit: async ({ value }) => {
      setServerError(null)
      setSuccess(false)

      // Build the full payload that matches adminManualApproveSchema
      const payload = { invoiceId, note: value.note }
      const parsed = adminManualApproveSchema.safeParse(payload)
      if (!parsed.success) {
        setServerError(parsed.error.issues[0]?.message ?? "Catatan tidak valid")
        return
      }

      // Confirmation guard before destructive admin action
      const ok = window.confirm(
        "Approve invoice ini secara manual? Subscription akan langsung aktif/diperpanjang."
      )
      if (!ok) return

      const res = await fetch(`/api/admin/invoices/${invoiceId}/manual-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: parsed.data.note }),
      })
      const json = (await res.json()) as ApiResponse
      if (!res.ok || !json.ok) {
        const map: Record<string, string> = {
          ALREADY_PAID: "Invoice sudah berstatus PAID.",
          BAD_STATE: "Invoice tidak dalam status yang dapat di-approve.",
          NOT_FOUND: "Invoice tidak ditemukan.",
        }
        setServerError(
          map[json.error?.code ?? ""] ?? json.error?.message ?? "Approve gagal."
        )
        return
      }
      setSuccess(true)
      router.refresh()
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
    >
      <p className="text-sm text-muted-foreground">
        Tindakan ini menandai invoice sebagai <strong>PAID</strong> tanpa callback
        Tripay, mengaktifkan/memperpanjang subscription, dan menulis audit log.
        Hanya gunakan sebagai fallback (transfer manual atau callback yang
        hilang).
      </p>

      <form.Field
        name="note"
        validators={{
          onChange: zodFieldValidator(adminManualApproveSchema.shape.note),
        }}
      >
        {(field) => (
          <div className="mt-4">
            <Label htmlFor={field.name}>
              Alasan / catatan <span className="text-destructive">*</span>
            </Label>
            <textarea
              id={field.name}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Contoh: konfirmasi transfer manual #TRF20260601-001 dari user via WA"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
            />
            <FieldError message={field.state.meta.errors[0] ?? null} />
            <p className="mt-1 text-xs text-muted-foreground">
              Minimal 10 karakter. Akan tersimpan di audit log dan kolom invoice.
            </p>
          </div>
        )}
      </form.Field>

      {serverError ? (
        <p
          role="alert"
          className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {serverError}
        </p>
      ) : null}
      {success ? (
        <p
          role="status"
          className="mt-3 rounded-md bg-sage-100 px-3 py-2 text-xs text-sage-700"
        >
          Invoice berhasil di-approve manual. Subscription user sudah aktif.
        </p>
      ) : null}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="mt-4"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Memproses..." : "Approve manual"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

// ─── Cancel ─────────────────────────────────────────────────────────────────

function CancelInvoiceForm({ invoiceId }: { invoiceId: string }) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm({
    defaultValues: { reason: "" },
    onSubmit: async ({ value }) => {
      setServerError(null)
      setSuccess(false)

      // The server schema accepts an empty string OR an opt-in reason 5-500 chars.
      const parsed = adminCancelInvoiceSchema.safeParse({
        invoiceId,
        reason: value.reason,
      })
      if (!parsed.success) {
        setServerError(parsed.error.issues[0]?.message ?? "Alasan tidak valid")
        return
      }

      const ok = window.confirm(
        "Batalkan invoice ini? Tindakan ini tidak dapat dibatalkan dan dicatat di audit log."
      )
      if (!ok) return

      const res = await fetch(`/api/admin/invoices/${invoiceId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: parsed.data.reason ?? "" }),
      })
      const json = (await res.json()) as ApiResponse
      if (!res.ok || !json.ok) {
        const map: Record<string, string> = {
          ALREADY_PAID: "Invoice yang sudah lunas tidak bisa dibatalkan.",
          NOT_FOUND: "Invoice tidak ditemukan.",
        }
        setServerError(
          map[json.error?.code ?? ""] ?? json.error?.message ?? "Pembatalan gagal."
        )
        return
      }
      setSuccess(true)
      router.refresh()
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
    >
      <p className="text-sm text-muted-foreground">
        Tandai invoice sebagai <strong>CANCELLED</strong>. Subscription tidak akan
        diaktifkan untuk invoice ini.
      </p>

      <form.Field name="reason">
        {(field) => (
          <div className="mt-4">
            <Label htmlFor={field.name}>Alasan (opsional)</Label>
            <Input
              id={field.name}
              placeholder="Contoh: user salah pilih paket, akan checkout ulang"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError message={field.state.meta.errors[0] ?? null} />
            <p className="mt-1 text-xs text-muted-foreground">
              Kosongkan jika tidak perlu. Bila diisi, minimal 5 karakter.
            </p>
          </div>
        )}
      </form.Field>

      {serverError ? (
        <p
          role="alert"
          className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {serverError}
        </p>
      ) : null}
      {success ? (
        <p
          role="status"
          className="mt-3 rounded-md bg-sage-100 px-3 py-2 text-xs text-sage-700"
        >
          Invoice telah dibatalkan.
        </p>
      ) : null}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            variant="danger"
            className="mt-4"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Memproses..." : "Batalkan invoice"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
