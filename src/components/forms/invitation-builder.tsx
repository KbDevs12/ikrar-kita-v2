"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { LocationPicker } from "@/components/forms/location-picker"
import { FieldError } from "./field-error"
import {
  invitationCreateSchema,
  sanitiseSlug,
  slugSchema,
  stepCoupleSchema,
  stepEventSchema,
  stepLocationSchema,
  stepThemeSchema,
} from "@/lib/validators/invitation"
import { zodFieldValidator } from "@/lib/forms/zod-validators"
import { INVITATION_TEMPLATES } from "@/lib/constants/invitation-templates"
import { cn } from "@/lib/utils"

interface BuilderProps {
  initialData?: Partial<BuilderValues> & { id?: string }
}

interface BuilderValues {
  slug: string
  groomName: string
  groomFatherName: string
  groomMotherName: string
  brideName: string
  brideFatherName: string
  brideMotherName: string
  coupleStory: string
  title: string
  eventDate: string
  schedule: Array<{ label: string; startsAt: string; endsAt: string; notes: string }>
  venueName: string
  venueAddress: string
  latitude: number | undefined
  longitude: number | undefined
  mapsUrl: string
  coverImageUrl: string
  musicUrl: string
  galleryUrls: string[]
  theme: string
  primaryColor: string
  rsvpEnabled: boolean
  guestMessageEnabled: boolean
  giftEnabled: boolean
  giftAccounts: Array<{ bankName: string; accountNumber: string; accountHolder: string }>
  metaTitle: string
  metaDescription: string
  openingQuote: string
}

const DEFAULT_VALUES: BuilderValues = {
  slug: "",
  groomName: "",
  groomFatherName: "",
  groomMotherName: "",
  brideName: "",
  brideFatherName: "",
  brideMotherName: "",
  coupleStory: "",
  title: "",
  eventDate: "",
  schedule: [{ label: "Akad", startsAt: "", endsAt: "", notes: "" }],
  venueName: "",
  venueAddress: "",
  latitude: undefined,
  longitude: undefined,
  mapsUrl: "",
  coverImageUrl: "",
  musicUrl: "",
  galleryUrls: [],
  theme: "classic-elegant",
  primaryColor: "",
  rsvpEnabled: true,
  guestMessageEnabled: true,
  giftEnabled: false,
  giftAccounts: [],
  metaTitle: "",
  metaDescription: "",
  openingQuote: "",
}

/**
 * Returns true when the given ISO date string falls before the start of today
 * (local time). Empty/invalid values are treated as "not in the past" so the
 * required-field validator owns that message instead.
 */
function isBeforeToday(value: string): boolean {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const STEPS = [
  { id: 1, label: "Pasangan", description: "Identitas mempelai dan orang tua" },
  { id: 2, label: "Acara", description: "Tanggal dan jadwal" },
  { id: 3, label: "Lokasi", description: "Alamat dan koordinat" },
  { id: 4, label: "Tema", description: "Pilih karakter visual" },
  { id: 5, label: "Tambahan", description: "RSVP, hadiah, kutipan" },
  { id: 6, label: "Tinjau", description: "Periksa & simpan draft" },
] as const

export function InvitationBuilder({ initialData }: BuilderProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = Boolean(initialData?.id)

  const initial = useMemo<BuilderValues>(
    () => ({ ...DEFAULT_VALUES, ...(initialData ?? {}) } as BuilderValues),
    [initialData]
  )

  const form = useForm({
    defaultValues: initial,
    onSubmit: async ({ value }) => {
      setServerError(null)
      // Final validation on the full document
      const parsed = invitationCreateSchema.safeParse(value)
      if (!parsed.success) {
        setServerError(parsed.error.issues[0]?.message ?? "Periksa kembali isian Anda.")
        return
      }
      const url = isEditing && initialData?.id ? `/api/invitations/${initialData.id}` : "/api/invitations"
      const method = isEditing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setServerError(json.error?.message ?? "Tidak dapat menyimpan undangan.")
        return
      }
      const id = json.data?.invitation?.id ?? initialData?.id
      router.push(`/dashboard/invitations/${id}/edit`)
      router.refresh()
    },
  })

  // Per-step validation gate
  function canAdvance(values: BuilderValues): boolean {
    switch (step) {
      case 1:
        return stepCoupleSchema.safeParse(values).success
      case 2:
        return stepEventSchema.safeParse(values).success
      case 3:
        return stepLocationSchema.safeParse(values).success
      case 4:
        return stepThemeSchema.safeParse(values).success
      case 5:
        return true
      default:
        return true
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border border-border bg-card p-4">
        <ol className="space-y-1 text-sm">
          {STEPS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition",
                  step === s.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                    step === s.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {s.id}
                </span>
                <span>
                  <span className="block font-medium">{s.label}</span>
                  <span className="block text-xs text-muted-foreground">{s.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="rounded-xl border border-border bg-card p-6"
        noValidate
      >
        {step === 1 ? <StepCouple form={form} /> : null}
        {step === 2 ? <StepEvent form={form} /> : null}
        {step === 3 ? <StepLocation form={form} /> : null}
        {step === 4 ? <StepTheme form={form} /> : null}
        {step === 5 ? <StepExtras form={form} /> : null}
        {step === 6 ? <StepReview form={form} /> : null}

        {serverError ? (
          <p
            className="mt-6 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {serverError}
          </p>
        ) : null}

        <form.Subscribe selector={(s) => s.values}>
          {(values) => (
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <Button
                type="button"
                variant="outline"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                ← Sebelumnya
              </Button>

              {step < STEPS.length ? (
                <Button
                  type="button"
                  disabled={!canAdvance(values as BuilderValues)}
                  onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
                >
                  Lanjut →
                </Button>
              ) : (
                <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting
                        ? "Menyimpan..."
                        : isEditing
                          ? "Simpan perubahan"
                          : "Simpan draft"}
                    </Button>
                  )}
                </form.Subscribe>
              )}
            </div>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}

// ─── Steps ──────────────────────────────────────────────────────────────────

interface StepProps {
  form: ReturnType<typeof useForm<BuilderValues>> // eslint-disable-line @typescript-eslint/no-explicit-any
}

function StepCouple({ form }: StepProps) {
  return (
    <section>
      <header className="mb-6">
        <h2 className="font-display text-2xl">Identitas pasangan</h2>
        <p className="text-sm text-muted-foreground">
          Nama yang akan tampil di hero undangan dan slug URL.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldText form={form} name="groomName" label="Nama mempelai pria" required />
        <FieldText form={form} name="brideName" label="Nama mempelai wanita" required />
        <FieldText form={form} name="groomFatherName" label="Nama ayah mempelai pria" />
        <FieldText form={form} name="groomMotherName" label="Nama ibu mempelai pria" />
        <FieldText form={form} name="brideFatherName" label="Nama ayah mempelai wanita" />
        <FieldText form={form} name="brideMotherName" label="Nama ibu mempelai wanita" />
      </div>

      <SlugField form={form} />
      <FieldTextarea form={form} name="coupleStory" label="Cerita pasangan (opsional)" rows={4} />
    </section>
  )
}

function StepEvent({ form }: StepProps) {
  return (
    <section>
      <header className="mb-6">
        <h2 className="font-display text-2xl">Tanggal &amp; jadwal</h2>
        <p className="text-sm text-muted-foreground">
          Tambahkan satu atau beberapa rangkaian acara.
        </p>
      </header>

      <FieldText form={form} name="title" label="Judul undangan (opsional)" />

      <form.Field name="eventDate">
        {(field) => {
          const value = field.state.value
          const past = isBeforeToday(value)
          return (
            <div className="mt-3">
              <Label>
                Tanggal acara utama <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <DatePicker
                  value={value}
                  onChange={(next) => field.handleChange(next)}
                  minDate={new Date().toISOString()}
                  placeholder="Pilih tanggal acara"
                />
              </div>
              {past ? (
                <p className="mt-1.5 text-xs text-destructive" role="alert">
                  Tanggal acara tidak boleh di masa lalu
                </p>
              ) : (
                <FieldError message={field.state.meta.errors[0] ?? null} />
              )}
            </div>
          )
        }}
      </form.Field>

      <form.Subscribe selector={(s) => s.values.eventDate}>
        {(eventDate) => (
          <form.Field name="schedule" mode="array">
            {(field) => (
              <div className="mt-6 space-y-4">
                {field.state.value.map((item, i) => {
                  const endInvalid =
                    item.endsAt && item.startsAt
                      ? new Date(item.endsAt) <= new Date(item.startsAt)
                      : false
                  return (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
                      <FieldText form={form} name={`schedule[${i}].label`} label="Nama rangkaian" />
                      <div className="mt-3 grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label>Jam mulai</Label>
                          <div className="mt-1.5">
                            <form.Field name={`schedule[${i}].startsAt` as never}>
                              {(sub) => (
                                <TimePicker
                                  value={(sub.state.value as string) ?? ""}
                                  dateValue={eventDate}
                                  onChange={(val) => sub.handleChange(val as never)}
                                  placeholder="Jam mulai"
                                />
                              )}
                            </form.Field>
                          </div>
                        </div>
                        <div>
                          <Label>Jam selesai (opsional)</Label>
                          <div className="mt-1.5">
                            <form.Field name={`schedule[${i}].endsAt` as never}>
                              {(sub) => (
                                <TimePicker
                                  value={(sub.state.value as string) ?? ""}
                                  dateValue={eventDate}
                                  minTime={item.startsAt || undefined}
                                  onChange={(val) => sub.handleChange(val as never)}
                                  placeholder="Jam selesai (opsional)"
                                />
                              )}
                            </form.Field>
                          </div>
                          {endInvalid ? (
                            <p className="mt-1.5 text-xs text-destructive" role="alert">
                              Jam selesai harus setelah jam mulai
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <FieldText form={form} name={`schedule[${i}].notes`} label="Catatan (opsional)" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-destructive"
                        onClick={() => field.removeValue(i)}
                        disabled={field.state.value.length <= 1}
                      >
                        Hapus rangkaian
                      </Button>
                    </div>
                  )
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => field.pushValue({ label: "", startsAt: "", endsAt: "", notes: "" })}
                >
                  + Tambah rangkaian
                </Button>
              </div>
            )}
          </form.Field>
        )}
      </form.Subscribe>
    </section>
  )
}

function StepLocation({ form }: StepProps) {
  return (
    <section>
      <header className="mb-6">
        <h2 className="font-display text-2xl">Lokasi</h2>
        <p className="text-sm text-muted-foreground">
          Alamat lengkap akan ditampilkan beserta tombol buka di Google Maps.
        </p>
      </header>

      <FieldText form={form} name="venueName" label="Nama lokasi" required />
      <FieldTextarea form={form} name="venueAddress" label="Alamat lengkap" rows={3} required />

      <div className="mt-4">
        <Label>Titik lokasi di peta</Label>
        <form.Subscribe
          selector={(s) =>
            [s.values.mapsUrl, s.values.latitude, s.values.longitude, s.values.venueAddress] as const
          }
        >
          {([mapsUrl, latitude, longitude, venueAddress]) => (
            <LocationPicker
              mapsUrl={mapsUrl ?? ""}
              latitude={latitude}
              longitude={longitude}
              venueAddress={venueAddress ?? ""}
              onChange={(patch) => {
                if (patch.mapsUrl !== undefined) form.setFieldValue("mapsUrl", patch.mapsUrl)
                if (patch.latitude !== undefined) form.setFieldValue("latitude", patch.latitude)
                if (patch.longitude !== undefined) form.setFieldValue("longitude", patch.longitude)
                if (patch.venueAddress !== undefined)
                  form.setFieldValue("venueAddress", patch.venueAddress)
              }}
            />
          )}
        </form.Subscribe>
      </div>
    </section>
  )
}

function StepTheme({ form }: StepProps) {
  return (
    <section>
      <header className="mb-6">
        <h2 className="font-display text-2xl">Tema</h2>
        <p className="text-sm text-muted-foreground">
          Setiap tema memiliki karakter visual yang berbeda - bukan hanya
          ganti warna.
        </p>
      </header>

      <form.Field name="theme">
        {(field) => (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INVITATION_TEMPLATES.map((t) => {
              const selected = field.state.value === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => field.handleChange(t.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition",
                    selected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-foreground/30"
                  )}
                >
                  <div
                    className="mb-3 h-16 rounded"
                    style={{ background: t.defaultPrimaryColor }}
                    aria-hidden
                  />
                  <p className="font-display text-base">{t.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.shortDescription}</p>
                </button>
              )
            })}
          </div>
        )}
      </form.Field>

      <div className="mt-6 max-w-xs">
        <FieldText
          form={form}
          name="primaryColor"
          label="Warna utama (hex, opsional)"
          placeholder="#8a6a3b"
        />
      </div>
    </section>
  )
}

function StepExtras({ form }: StepProps) {
  return (
    <section>
      <header className="mb-6">
        <h2 className="font-display text-2xl">Tambahan</h2>
        <p className="text-sm text-muted-foreground">
          Aktifkan RSVP, kolom ucapan, dan rekening hadiah jika diinginkan.
        </p>
      </header>

      <FieldTextarea
        form={form}
        name="openingQuote"
        label="Kutipan/ayat pembuka (opsional)"
        rows={3}
      />

      <div className="mt-4 space-y-3">
        <FieldCheckbox form={form} name="rsvpEnabled" label="Aktifkan RSVP" />
        <FieldCheckbox form={form} name="guestMessageEnabled" label="Aktifkan kolom ucapan" />
        <FieldCheckbox form={form} name="giftEnabled" label="Tampilkan info hadiah/rekening" />
      </div>

      <form.Subscribe selector={(s) => s.values.giftEnabled}>
        {(giftEnabled) =>
          giftEnabled ? (
            <form.Field name="giftAccounts" mode="array">
              {(field) => (
                <div className="mt-6 space-y-3">
                  {field.state.value.map((_, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
                      <FieldText form={form} name={`giftAccounts[${i}].bankName`} label="Bank" />
                      <FieldText
                        form={form}
                        name={`giftAccounts[${i}].accountNumber`}
                        label="Nomor rekening"
                      />
                      <FieldText
                        form={form}
                        name={`giftAccounts[${i}].accountHolder`}
                        label="Atas nama"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => field.removeValue(i)}
                      >
                        Hapus rekening
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      field.pushValue({
                        bankName: "",
                        accountNumber: "",
                        accountHolder: "",
                      })
                    }
                  >
                    + Tambah rekening
                  </Button>
                </div>
              )}
            </form.Field>
          ) : null
        }
      </form.Subscribe>
    </section>
  )
}

function StepReview({ form }: StepProps) {
  return (
    <section>
      <header className="mb-6">
        <h2 className="font-display text-2xl">Tinjau</h2>
        <p className="text-sm text-muted-foreground">
          Pastikan data sudah sesuai sebelum disimpan.
        </p>
      </header>
      <form.Subscribe selector={(s) => s.values}>
        {(values) => {
          const result = invitationCreateSchema.safeParse(values)
          return (
            <div className="space-y-3 text-sm">
              <Row label="Pasangan" value={`${values.groomName || "-"} & ${values.brideName || "-"}`} />
              <Row label="Slug URL" value={values.slug ? `/${values.slug}` : "-"} />
              <Row
                label="Tanggal acara"
                value={values.eventDate ? new Date(values.eventDate).toLocaleString("id-ID") : "-"}
              />
              <Row label="Lokasi" value={values.venueName || "-"} />
              <Row label="Tema" value={values.theme} />
              {!result.success ? (
                <div className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Masih ada data yang perlu dilengkapi:
                  <ul className="ml-4 mt-1 list-disc">
                    {result.error.issues.slice(0, 4).map((i, idx) => (
                      <li key={idx}>
                        {i.path.join(".")}: {i.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )
        }}
      </form.Subscribe>
    </section>
  )
}

// ─── Generic field helpers ──────────────────────────────────────────────────

interface FieldTextProps {
  form: ReturnType<typeof useForm<BuilderValues>> // eslint-disable-line @typescript-eslint/no-explicit-any
  name: string
  label: string
  required?: boolean
  type?: string
  placeholder?: string
}

function FieldText({ form, name, label, required, type = "text", placeholder }: FieldTextProps) {
  return (
    <form.Field name={name as never}>
      {(field) => (
        <div className="mt-3 first:mt-0">
          <Label htmlFor={field.name}>
            {label} {required ? <span className="text-destructive">*</span> : null}
          </Label>
          <Input
            id={field.name}
            type={type}
            placeholder={placeholder}
            value={(field.state.value as string) ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value as never)}
            required={required}
          />
          <FieldError message={field.state.meta.errors[0] ?? null} />
        </div>
      )}
    </form.Field>
  )
}

function FieldTextarea({
  form,
  name,
  label,
  rows = 3,
  required,
}: {
  form: ReturnType<typeof useForm<BuilderValues>> // eslint-disable-line @typescript-eslint/no-explicit-any
  name: string
  label: string
  rows?: number
  required?: boolean
}) {
  return (
    <form.Field name={name as never}>
      {(field) => (
        <div className="mt-3">
          <Label htmlFor={field.name}>
            {label} {required ? <span className="text-destructive">*</span> : null}
          </Label>
          <textarea
            id={field.name}
            rows={rows}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={(field.state.value as string) ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value as never)}
            required={required}
          />
          <FieldError message={field.state.meta.errors[0] ?? null} />
        </div>
      )}
    </form.Field>
  )
}

function FieldCheckbox({
  form,
  name,
  label,
}: {
  form: ReturnType<typeof useForm<BuilderValues>> // eslint-disable-line @typescript-eslint/no-explicit-any
  name: string
  label: string
}) {
  return (
    <form.Field name={name as never}>
      {(field) => (
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={Boolean(field.state.value)}
            onChange={(e) => field.handleChange(e.target.checked as never)}
            className="h-4 w-4 rounded border-border"
          />
          {label}
        </label>
      )}
    </form.Field>
  )
}

function SlugField({ form }: StepProps) {
  return (
    <form.Field
      name="slug"
      validators={{ onChange: zodFieldValidator(slugSchema) }}
    >
      {(field) => (
        <div className="mt-4">
          <Label htmlFor={field.name}>
            Nama pengundang (slug URL) <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center">
            <span className="mr-2 text-xs text-muted-foreground">/</span>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(sanitiseSlug(e.target.value))}
              placeholder="andi-sinta"
              required
            />
          </div>
          <FieldError message={field.state.meta.errors[0] ?? null} />
          <p className="mt-1 text-xs text-muted-foreground">
            URL undangan: <span className="font-mono">/{field.state.value || "andi-sinta"}</span>
          </p>
        </div>
      )}
    </form.Field>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
