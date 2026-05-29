"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FieldError } from "./field-error"
import { checkoutSchema } from "@/lib/validators/billing"
import { formatRupiah } from "@/lib/utils"

interface PaymentChannel {
  code: string
  name: string
  type: string
  group: string
  feeFlat: number
  feePercent: number
  iconUrl: string
  active: boolean
}

interface PlanInfo {
  code: "BASIC" | "PRO" | "RESELLER"
  name: string
  price: number
  durationDays: number
}

export function CheckoutForm({ plan }: { plan: PlanInfo }) {
  const router = useRouter()
  const [channels, setChannels] = useState<PaymentChannel[]>([])
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/billing/payment-channels")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        if (j.ok) setChannels(j.data.channels.filter((c: PaymentChannel) => c.active))
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoadingChannels(false))
    return () => {
      cancelled = true
    }
  }, [])

  const form = useForm({
    defaultValues: { planCode: plan.code, paymentMethodCode: "" },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const parsed = checkoutSchema.safeParse(value)
      if (!parsed.success) {
        setServerError(parsed.error.issues[0]?.message ?? "Pilih metode pembayaran")
        return
      }
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setServerError(json.error?.message ?? "Tidak dapat memproses checkout.")
        return
      }
      const invoiceId: string = json.data.invoice.id
      router.push(`/dashboard/billing/invoices/${invoiceId}`)
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
      className="space-y-6"
      noValidate
    >
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Paket</p>
        <p className="mt-1 font-display text-2xl">{plan.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatRupiah(plan.price)} / {plan.durationDays} hari
        </p>
      </div>

      <form.Field name="paymentMethodCode">
        {(field) => (
          <div>
            <Label>Metode pembayaran</Label>
            {loadingChannels ? (
              <p className="mt-3 text-sm text-muted-foreground">Memuat metode pembayaran...</p>
            ) : channels.length === 0 ? (
              <p className="mt-3 text-sm text-destructive">
                Tidak ada metode pembayaran yang tersedia. Silakan coba lagi nanti.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {channels.map((c) => (
                  <label
                    key={c.code}
                    className={
                      "flex cursor-pointer items-center justify-between rounded-md border px-4 py-3 text-sm transition " +
                      (field.state.value === c.code
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-foreground/30")
                    }
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethodCode"
                        value={c.code}
                        checked={field.state.value === c.code}
                        onChange={() => field.handleChange(c.code)}
                        className="sr-only"
                      />
                      <span className="font-medium">{c.name}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{c.group}</span>
                  </label>
                ))}
              </div>
            )}
            <FieldError message={field.state.meta.errors[0] ?? null} />
          </div>
        )}
      </form.Field>

      {serverError ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {serverError}
        </p>
      ) : null}

      <form.Subscribe selector={(s) => [s.values.paymentMethodCode, s.isSubmitting] as const}>
        {([code, isSubmitting]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={!code || isSubmitting || channels.length === 0}
          >
            {isSubmitting ? "Memproses..." : `Bayar ${formatRupiah(plan.price)}`}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
