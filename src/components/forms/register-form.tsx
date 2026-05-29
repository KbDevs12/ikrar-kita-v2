"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError } from "./field-error"
import { registerSchema } from "@/lib/validators/auth"
import { quickCheckEmail } from "@/lib/validators/email"
import { zodFieldValidator } from "@/lib/forms/zod-validators"

interface ApiResponse {
  ok: boolean
  data?: unknown
  error?: { code: string; message: string; fieldErrors?: Record<string, string[]> }
}

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [emailHint, setEmailHint] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { name: "", email: "", password: "", website: "" },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const parsed = registerSchema.safeParse(value)
      if (!parsed.success) {
        setServerError(parsed.error.issues[0]?.message ?? "Periksa kembali isian Anda.")
        return
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const json = (await res.json()) as ApiResponse

      if (!json.ok || !res.ok) {
        if (json.error?.fieldErrors) {
          const emailErr = json.error.fieldErrors.email?.[0]
          if (emailErr) {
            form.setFieldMeta("email", (m) => ({ ...m, errors: [emailErr] }))
          }
        }
        const map: Record<string, string> = {
          EMAIL_TAKEN: "Email sudah terdaftar.",
          EMAIL_DISPOSABLE: "Mohon gunakan email pribadi atau kantor, bukan email sementara.",
          EMAIL_INVALID: "Format email tidak valid.",
          EMAIL_TYPO: "Sepertinya ada salah ketik pada email.",
          EMAIL_NO_MX: "Domain email tidak dapat menerima email.",
          RATE_LIMITED: "Terlalu banyak percobaan. Coba lagi nanti.",
        }
        setServerError(map[json.error?.code ?? ""] ?? json.error?.message ?? "Pendaftaran gagal.")
        return
      }

      router.push("/verify-email/pending")
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
      className="space-y-5"
      noValidate
    >
      {/* Honeypot - hidden from real users via aria + tabIndex + visually-hidden */}
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
        name="name"
        validators={{ onChange: zodFieldValidator(registerSchema.shape.name) }}
      >
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Nama lengkap</Label>
            <Input
              id={field.name}
              name={field.name}
              autoComplete="name"
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
            />
            <FieldError message={field.state.meta.errors[0] ?? null} />
          </div>
        )}
      </form.Field>

      <form.Field
        name="email"
        validators={{
          onChange: zodFieldValidator(registerSchema.shape.email),
          onBlur: ({ value }) => {
            // Side-effect: surface a friendly typo / disposable hint
            if (!value) {
              setEmailHint(null)
              return undefined
            }
            const r = quickCheckEmail(value)
            if (r.ok) {
              setEmailHint(null)
              return undefined
            }
            if (r.code === "TYPO_SUGGESTION") {
              setEmailHint(`Maksud Anda ${r.suggestion}?`)
            } else {
              setEmailHint(null)
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
            />
            <FieldError message={field.state.meta.errors[0] ?? null} />
            {emailHint && !field.state.meta.errors[0] ? (
              <p className="mt-1.5 text-xs text-muted-foreground">{emailHint}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onChange: zodFieldValidator(registerSchema.shape.password) }}
      >
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Password</Label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete="new-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
            />
            <FieldError message={field.state.meta.errors[0] ?? null} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Minimal 8 karakter, mengandung huruf dan angka.
            </p>
          </div>
        )}
      </form.Field>

      {serverError ? (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Mendaftarkan..." : "Buat akun"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
