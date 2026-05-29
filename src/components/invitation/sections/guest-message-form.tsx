"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { guestMessageSchema } from "@/lib/validators/guest-message"
import { zodFieldValidator } from "@/lib/forms/zod-validators"
import { toneClasses, type FormTone } from "./public-form-styles"

interface GuestMessageFormProps {
  invitationId: string
  tone?: FormTone
  accent?: string
}

type ApiResponse =
  | { ok: true; data: unknown; error?: undefined }
  | { ok: false; error: { code: string; message: string }; data?: undefined }

export function PublicGuestMessageForm({
  invitationId,
  tone = "light",
  accent = "#92422a",
}: GuestMessageFormProps) {
  const router = useRouter()
  const cls = toneClasses(tone)
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    defaultValues: {
      invitationId,
      name: "",
      message: "",
      website: "",
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const parsed = guestMessageSchema.safeParse(value)
      if (!parsed.success) {
        setServerError(parsed.error.issues[0]?.message ?? "Periksa kembali isian Anda.")
        return
      }
      const res = await fetch("/api/guest-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const json = (await res.json()) as ApiResponse
      if (!res.ok || !json.ok) {
        const map: Record<string, string> = {
          RATE_LIMITED: "Terlalu banyak pengiriman. Coba lagi sebentar.",
          INACTIVE: "Undangan ini sedang tidak aktif.",
          NOT_FOUND: "Undangan tidak ditemukan.",
        }
        setServerError(
          map[json.error?.code ?? ""] ?? json.error?.message ?? "Tidak dapat mengirim ucapan."
        )
        return
      }
      setSubmitted(true)
      // Reset only the message body so the same person can leave another note;
      // keep their name intact for convenience.
      form.setFieldValue("message", "")
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
      className="space-y-4"
      noValidate
    >
      {/* Honeypot */}
      <form.Field name="website">
        {(field) => (
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <form.Field
          name="name"
          validators={{ onChange: zodFieldValidator(guestMessageSchema.shape.name) }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className={cls.label}>
                Nama
              </label>
              <input
                id={field.name}
                className={cls.field}
                placeholder="Tulis nama Anda"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
              {field.state.meta.errors[0] ? (
                <p className={cls.error} role="alert">
                  {field.state.meta.errors[0]}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="message"
          validators={{ onChange: zodFieldValidator(guestMessageSchema.shape.message) }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className={cls.label}>
                Ucapan / doa
              </label>
              <textarea
                id={field.name}
                rows={3}
                className={cls.field}
                placeholder="Selamat menempuh hidup baru..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
              {field.state.meta.errors[0] ? (
                <p className={cls.error} role="alert">
                  {field.state.meta.errors[0]}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>
      </div>

      {submitted ? (
        <p className={cls.okBubble} role="status">
          Terima kasih, ucapan Anda sudah tersampaikan.
        </p>
      ) : null}
      {serverError ? (
        <p className={cls.errorBubble} role="alert">
          {serverError}
        </p>
      ) : null}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: accent }}
          >
            {isSubmitting ? "Mengirim..." : "Kirim ucapan"}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
