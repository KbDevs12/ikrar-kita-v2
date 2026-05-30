"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldError } from "./field-error"
import { loginSchema } from "@/lib/validators/auth"
import { zodFieldValidator } from "@/lib/forms/zod-validators"

interface LoginFormProps {
  redirectTo?: string
}

interface ApiResponse {
  ok: boolean
  data?: { user: { emailVerified: boolean; role: string } }
  error?: { code: string; message: string; fieldErrors?: Record<string, string[]> }
}

export function LoginForm({ redirectTo = "/dashboard" }: LoginFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const parsed = loginSchema.safeParse(value)
      if (!parsed.success) {
        setServerError(parsed.error.issues[0]?.message ?? "Periksa kembali isian Anda.")
        return
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const json = (await res.json()) as ApiResponse

      if (!json.ok || !res.ok) {
        if (json.error?.code === "RATE_LIMITED") {
          setServerError("Terlalu banyak percobaan. Silakan coba lagi nanti.")
        } else if (json.error?.code === "INVALID_CREDENTIALS") {
          setServerError("Email atau password tidak cocok.")
        } else {
          setServerError(json.error?.message ?? "Tidak dapat masuk saat ini.")
        }
        return
      }

      const verified = json.data?.user.emailVerified
      router.push(verified ? redirectTo : "/verify-email/pending")
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
      <form.Field
        name="email"
        validators={{ onChange: zodFieldValidator(loginSchema.shape.email) }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className="sr-only">
              Email
            </label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              placeholder="Email"
              autoComplete="email"
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={field.state.meta.errors.length > 0}
              required
            />
            <FieldError message={field.state.meta.errors[0] ?? null} />
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onChange: zodFieldValidator(loginSchema.shape.password) }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className="sr-only">
              Password
            </label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={field.state.meta.errors.length > 0}
              required
            />
            <FieldError message={field.state.meta.errors[0] ?? null} />
          </div>
        )}
      </form.Field>

      {serverError ? (
        <p
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Memproses…" : "Masuk"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
