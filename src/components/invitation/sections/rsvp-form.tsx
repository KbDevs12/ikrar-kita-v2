"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { rsvpSchema } from "@/lib/validators/rsvp"
import { zodFieldValidator } from "@/lib/forms/zod-validators"
import { toneClasses, type FormTone } from "./public-form-styles"

interface RsvpFormProps {
  invitationId: string
  tone?: FormTone
  accent?: string
}

type ApiResponse =
  | { ok: true; data: unknown; error?: undefined }
  | { ok: false; error: { code: string; message: string }; data?: undefined }

const STATUSES = [
  { value: "YES", label: "Hadir" },
  { value: "MAYBE", label: "Belum yakin" },
  { value: "NO", label: "Mohon maaf, berhalangan" },
] as const

export function PublicRsvpForm({
  invitationId,
  tone = "light",
  accent = "#92422a",
}: RsvpFormProps) {
  const router = useRouter()
  const cls = toneClasses(tone)
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    defaultValues: {
      invitationId,
      guestName: "",
      attendanceStatus: "YES" as "YES" | "NO" | "MAYBE",
      guestCount: 1,
      message: "",
      website: "",
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const parsed = rsvpSchema.safeParse(value)
      if (!parsed.success) {
        setServerError(parsed.error.issues[0]?.message ?? "Periksa kembali isian Anda.")
        return
      }
      const res = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const json = (await res.json()) as ApiResponse
      if (!res.ok || !json.ok) {
        const map: Record<string, string> = {
          RATE_LIMITED: "Terlalu banyak pengiriman. Silakan tunggu sebentar.",
          INACTIVE: "Undangan ini sedang tidak aktif.",
          NOT_FOUND: "Undangan tidak ditemukan.",
        }
        setServerError(map[json.error?.code ?? ""] ?? json.error?.message ?? "Tidak dapat mengirim RSVP.")
        return
      }
      setSubmitted(true)
      router.refresh()
    },
  })

  if (submitted) {
    return (
      <p className={cls.okBubble} role="status">
        Terima kasih sudah memberi kabar — kami akan menyiapkan tempat sesuai
        konfirmasi Anda.
      </p>
    )
  }

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

      <form.Field
        name="guestName"
        validators={{ onChange: zodFieldValidator(rsvpSchema.shape.guestName) }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className={cls.label}>
              Nama Anda
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

      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <form.Field
          name="attendanceStatus"
          validators={{ onChange: zodFieldValidator(rsvpSchema.shape.attendanceStatus) }}
        >
          {(field) => (
            <div>
              <span className={cls.label}>Kehadiran</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUSES.map((s) => {
                  const active = field.state.value === s.value
                  return (
                    <label
                      key={s.value}
                      className={
                        "inline-flex cursor-pointer items-center rounded-full border px-3.5 py-1.5 text-xs transition " +
                        (active
                          ? "border-transparent text-white"
                          : "border-current/30 hover:border-current/55")
                      }
                      style={
                        active ? { background: accent, color: "white" } : undefined
                      }
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={s.value}
                        checked={active}
                        onChange={() => field.handleChange(s.value)}
                        className="sr-only"
                      />
                      {s.label}
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </form.Field>

        <form.Field
          name="guestCount"
          validators={{ onChange: zodFieldValidator(rsvpSchema.shape.guestCount) }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className={cls.label}>
                Jumlah
              </label>
              <input
                id={field.name}
                type="number"
                inputMode="numeric"
                min={1}
                max={10}
                className={cls.field}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value) || 1)}
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

      <form.Field
        name="message"
        validators={{ onChange: zodFieldValidator(rsvpSchema.shape.message) }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className={cls.label}>
              Pesan singkat (opsional)
            </label>
            <textarea
              id={field.name}
              rows={2}
              className={cls.field}
              placeholder="Salam dan doa untuk pasangan"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

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
            {isSubmitting ? "Mengirim..." : "Kirim konfirmasi"}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
