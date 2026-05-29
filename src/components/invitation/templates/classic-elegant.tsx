/**
 * Classic Elegant template.
 *
 * Visual identity:
 *   - Generous whitespace, vertical rhythm anchored to a thin gold rule
 *   - Display serif (Playfair) for names, Cormorant for body
 *   - Off-white ivory ground with subtle grain
 *   - Asymmetric hero - portrait split with brides' names cascading
 *
 * Sections present: opening, hero, quote, couple, schedule, countdown,
 * gallery, map, RSVP, gift, closing. Each section has its own shape so
 * the page does not feel like a stack of identical cards.
 */
import Link from "next/link"
import type { InvitationTemplateProps } from "./types"
import { Countdown } from "../sections/countdown"
import { formatScheduleDate, formatScheduleRange } from "../sections/section-helpers"
import { PublicRsvpForm } from "../sections/rsvp-form"
import { PublicGuestMessageForm } from "../sections/guest-message-form"
import { GuestMessagesList } from "../sections/guest-messages-list"
import { formatDateID } from "@/lib/utils"

interface InvitationContent {
  schedule?: Array<{ label: string; startsAt: string; endsAt?: string; notes?: string }>
  groomFatherName?: string
  groomMotherName?: string
  brideFatherName?: string
  brideMotherName?: string
  coupleStory?: string
  openingQuote?: string
  galleryUrls?: string[]
  giftAccounts?: Array<{ bankName: string; accountNumber: string; accountHolder: string }>
  giftEnabled?: boolean
  rsvpEnabled?: boolean
  guestMessageEnabled?: boolean
  mapsUrl?: string
}

export function ClassicElegant({ invitation, recipient }: InvitationTemplateProps) {
  const c = (invitation.content ?? {}) as InvitationContent
  const accent = invitation.primaryColor ?? "#8a6a3b"

  return (
    <article className="relative min-h-screen overflow-hidden bg-[#f7f3ec] text-ink-700">
      <div className="absolute inset-0 bg-grain opacity-40" aria-hidden />

      {/* Opening */}
      <header className="relative z-10 mx-auto flex min-h-[88vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="font-serif text-sm uppercase tracking-[0.4em] text-ink-500">
          The Wedding Of
        </p>
        <h1
          className="mt-8 font-display text-5xl leading-[0.95] sm:text-7xl"
          style={{ color: accent }}
        >
          {invitation.groomName}
          <span className="mx-3 inline-block align-middle text-3xl text-ink-400">&amp;</span>
          {invitation.brideName}
        </h1>
        <div
          className="mt-10 h-px w-24 origin-center"
          style={{ background: accent }}
          aria-hidden
        />
        <p className="mt-6 font-serif text-lg italic text-ink-600">
          Kepada Yth.<br />
          <span className="not-italic font-semibold text-ink-700">{recipient}</span>
        </p>
        {invitation.eventDate ? (
          <p className="mt-10 font-serif text-base text-ink-500">
            {formatDateID(invitation.eventDate)}
          </p>
        ) : null}
      </header>

      {/* Quote */}
      {c.openingQuote ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-20 text-center">
          <blockquote className="font-serif text-xl italic leading-snug text-ink-600 sm:text-2xl">
            “{c.openingQuote}”
          </blockquote>
        </section>
      ) : null}

      {/* Couple */}
      <section className="relative z-10 mx-auto grid max-w-4xl gap-10 px-6 py-16 sm:grid-cols-2">
        <CouplePanel
          accent={accent}
          name={invitation.groomName}
          parents={[c.groomFatherName, c.groomMotherName].filter(Boolean) as string[]}
          label="Mempelai Pria"
          align="left"
        />
        <CouplePanel
          accent={accent}
          name={invitation.brideName}
          parents={[c.brideFatherName, c.brideMotherName].filter(Boolean) as string[]}
          label="Mempelai Wanita"
          align="right"
        />
      </section>

      {/* Schedule */}
      {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-20">
          <SectionHeading accent={accent} kicker="Susunan Acara" title="Mohon hadir di hari kami" />
          <div className="mt-10 space-y-6">
            {c.schedule.map((item, i) => (
              <div
                key={i}
                className="grid items-baseline gap-2 border-t border-ink-200/60 pt-6 sm:grid-cols-[180px_1fr]"
              >
                <p className="font-display text-xl" style={{ color: accent }}>
                  {item.label}
                </p>
                <div className="text-ink-600">
                  <p className="font-serif text-lg">{formatScheduleDate(item)}</p>
                  <p className="text-sm text-ink-500">{formatScheduleRange(item)}</p>
                  {item.notes ? <p className="mt-2 text-sm italic">{item.notes}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center">
          <SectionHeading accent={accent} kicker="Menuju Hari" title="Hitung mundur" />
          <div className="mt-10">
            <Countdown target={invitation.eventDate} variant="classic" />
          </div>
        </section>
      ) : null}

      {/* Map */}
      {invitation.venueName ? (
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center">
          <SectionHeading accent={accent} kicker="Lokasi" title={invitation.venueName} />
          {invitation.venueAddress ? (
            <p className="mt-3 font-serif text-base text-ink-600">{invitation.venueAddress}</p>
          ) : null}
          {(c.mapsUrl ||
            (typeof invitation.latitude === "number" &&
              typeof invitation.longitude === "number")) ? (
            <Link
              href={
                c.mapsUrl ??
                `https://www.google.com/maps?q=${invitation.latitude},${invitation.longitude}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block border px-5 py-2.5 text-sm font-medium tracking-wide"
              style={{ borderColor: accent, color: accent }}
            >
              Buka di Google Maps
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && Array.isArray(c.giftAccounts) && c.giftAccounts.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16">
          <SectionHeading accent={accent} kicker="Hadiah" title="Tanda kasih" />
          <p className="mt-3 text-center text-sm text-ink-500">
            Doa restu Anda sudah lebih dari cukup. Jika berkenan, salam dapat dikirim ke:
          </p>
          <ul className="mt-8 space-y-4">
            {c.giftAccounts.map((g, i) => (
              <li key={i} className="rounded-md border border-ink-200/70 bg-white/60 p-5">
                <p className="text-xs uppercase tracking-widest text-ink-400">{g.bankName}</p>
                <p className="font-mono text-lg" style={{ color: accent }}>
                  {g.accountNumber}
                </p>
                <p className="text-sm text-ink-600">a.n. {g.accountHolder}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <SectionHeading accent={accent} kicker="Konfirmasi Kehadiran" title="RSVP" />
          <p className="mt-3 text-center text-sm text-ink-500">
            Mohon konfirmasi kehadiran Anda agar kami dapat menyiapkan tempat
            dengan baik.
          </p>
          <div className="mt-8">
            <PublicRsvpForm invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Ucapan & doa */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <SectionHeading accent={accent} kicker="Ucapan &amp; Doa" title="Pesan untuk pasangan" />
          <div className="mt-8">
            <PublicGuestMessageForm
              invitationId={invitation.id}
              tone="light"
              accent={accent}
            />
          </div>
          <div className="mt-10">
            <GuestMessagesList invitationId={invitation.id} tone="light" />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative z-10 mx-auto max-w-xl px-6 pb-24 pt-16 text-center">
        <div className="mx-auto h-px w-16" style={{ background: accent }} aria-hidden />
        <p className="mt-6 font-serif text-lg italic text-ink-600">
          Merupakan kehormatan dan kebahagiaan tersendiri bagi kami apabila
          Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
        </p>
        <p className="mt-6 font-display text-2xl" style={{ color: accent }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>
    </article>
  )
}

function SectionHeading({
  kicker,
  title,
  accent,
}: {
  kicker: string
  title: string
  accent: string
}) {
  return (
    <header className="text-center">
      <p
        className="text-xs uppercase tracking-[0.32em]"
        style={{ color: accent }}
      >
        {kicker}
      </p>
      <h2 className="mt-3 font-display text-3xl text-ink-700 sm:text-4xl">{title}</h2>
      <div className="mx-auto mt-4 h-px w-12" style={{ background: accent }} aria-hidden />
    </header>
  )
}

function CouplePanel({
  name,
  parents,
  label,
  align,
  accent,
}: {
  name: string
  parents: string[]
  label: string
  align: "left" | "right"
  accent: string
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="text-xs uppercase tracking-[0.3em] text-ink-400">{label}</p>
      <h3 className="mt-3 font-display text-3xl" style={{ color: accent }}>
        {name}
      </h3>
      {parents.length > 0 ? (
        <p className="mt-3 font-serif text-base italic text-ink-600">
          Putra/i dari Bapak {parents[0]}
          {parents[1] ? ` & Ibu ${parents[1]}` : ""}
        </p>
      ) : null}
    </div>
  )
}
