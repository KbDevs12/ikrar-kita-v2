"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError } from "./field-error"
import { resendVerificationSchema } from "@/lib/validators/auth"
import { zodFieldValidator } from "@/lib/forms/zod-validators"

export function ResendVerificationForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [message, setMessage] = useState<{
    kind: "ok" | "error"
    text: string
  } | null>(null)

  const form = useForm({
    defaultValues: { email: initialEmail },
    onSubmit: async ({ value }) => {
      setMessage(null)
      const parsed = resendVerificationSchema.safeParse(value)
      if (!parsed.success) {
        setMessage({ kind: "error", text: parsed.error.issues[0]?.message ?? "Periksa email" })
        return
      }
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      if (res.status === 429) {
        setMessage({
          kind: "error",
          text: "Terlalu banyak permintaan. Coba lagi sebentar.",
        })
        return
      }
      // Anti-enumeration: success message regardless of whether email exists
      setMessage({
        kind: "ok",
        text:
          "Jika email tersebut terdaftar dan belum diverifikasi, kami sudah mengirim ulang tautannya.",
      })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-3"
      noValidate
    >
      <form.Field
        name="email"
        validators={{ onChange: zodFieldValidator(resendVerificationSchema.shape.email) }}
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
          </div>
        )}
      </form.Field>

      {message ? (
        <p
          className={
            message.kind === "ok"
              ? "rounded-md bg-sage-100 px-3 py-2 text-xs text-sage-700"
              : "rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
          }
          role={message.kind === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Mengirim..." : "Kirim ulang tautan verifikasi"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
