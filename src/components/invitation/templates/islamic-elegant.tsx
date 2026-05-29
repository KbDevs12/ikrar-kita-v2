/**
 * Islamic Elegant template.
 *
 * Visual identity:
 *   - Calm, serene atmosphere with abundant negative space
 *   - Sage-emerald (#264a3a) on warm parchment cream (#f4ecd8)
 *   - Geometric eight-point star ornament + arabesque arch frames around
 *     couple cards (echoing mihrab silhouettes), kept refined - not busy.
 *   - Generous vertical rhythm; sections are bigger than usual to invite
 *     contemplation. Bismillah space at the very top.
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
  openingQuote?: string
  giftEnabled?: boolean
  giftAccounts?: Array<{ bankName: string; accountNumber: string; accountHolder: string }>
  rsvpEnabled?: boolean
  guestMessageEnabled?: boolean
  mapsUrl?: string
}

/** 8-point geometric star, the hallmark of Islamic ornament. */
function EightPointStar({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg viewBox="0 0 80 80" className={className} style={style} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="0.9">
        <polygon points="40,4 52,28 76,40 52,52 40,76 28,52 4,40 28,28" />
        <polygon
          points="40,12 50,30 68,40 50,50 40,68 30,50 12,40 30,30"
          strokeOpacity="0.55"
        />
        <circle cx="40" cy="40" r="4" fill="currentColor" />
      </g>
    </svg>
  )
}

/** Mihrab-arch wrapper around a couple panel. */
function MihrabFrame({
  accent,
  children,
}: {
  accent: string
  children: React.ReactNode
}) {
  return (
    <div className="relative px-4 pt-2 pb-2">
      <svg
        viewBox="0 0 200 280"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <path
          d="M 12 280 L 12 100 Q 12 12 100 12 Q 188 12 188 100 L 188 280"
          fill="none"
          stroke={accent}
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
        <path
          d="M 22 280 L 22 104 Q 22 22 100 22 Q 178 22 178 104 L 178 280"
          fill="none"
          stroke={accent}
          strokeWidth="0.7"
          strokeOpacity="0.35"
        />
      </svg>
      <div className="relative px-6 pb-6 pt-12 text-center">{children}</div>
    </div>
  )
}

export function IslamicElegant({ invitation, recipient }: InvitationTemplateProps) {
  const c = (invitation.content ?? {}) as InvitationContent
  const accent = invitation.primaryColor ?? "#264a3a"

  return (
    <article
      className="relative min-h-screen overflow-hidden text-[#22311f]"
      style={{ background: "linear-gradient(180deg, #f7f0dc 0%, #f1e7ce 100%)" }}
    >
      {/* Faint star pattern in the corners */}
      <EightPointStar className="absolute left-6 top-6 h-12 w-12 text-[#264a3a]/25" />
      <EightPointStar className="absolute right-6 top-6 h-12 w-12 text-[#264a3a]/25" />

      {/* Hero - Bismillah on top */}
      <header className="relative z-10 mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p
          className="font-serif text-2xl"
          dir="rtl"
          style={{ color: accent, fontFamily: '"Amiri", "Cormorant Garamond", serif' }}
        >
          بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="mt-3 text-xs italic text-[#22311f]/70">
          Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang
        </p>

        <div className="mt-12">
          <EightPointStar className="mx-auto h-9 w-9" style={{ color: accent }} />
        </div>

        <p
          className="mt-8 text-xs uppercase tracking-[0.4em]"
          style={{ color: accent }}
        >
          Walimatul ‘Urs
        </p>

        <h1 className="mt-6 font-display text-4xl leading-[1.15] sm:text-5xl">
          <span className="block" style={{ color: accent }}>
            {invitation.groomName}
          </span>
          <span className="my-3 block font-serif text-2xl italic">&amp;</span>
          <span className="block" style={{ color: accent }}>
            {invitation.brideName}
          </span>
        </h1>

        <p className="mt-10 font-serif text-base italic">Kepada Yang Terhormat</p>
        <p className="mt-2 font-display text-2xl" style={{ color: accent }}>
          {recipient}
        </p>

        {invitation.eventDate ? (
          <p className="mt-10 font-serif text-base text-[#22311f]/80">
            {formatDateID(invitation.eventDate)}
          </p>
        ) : null}
      </header>

      {/* Quote / Ayat */}
      {c.openingQuote ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-20 text-center">
          <EightPointStar className="mx-auto h-7 w-7" style={{ color: accent }} />
          <blockquote
            className="mt-6 font-serif text-xl italic leading-relaxed sm:text-2xl"
            style={{ color: accent }}
          >
            “{c.openingQuote}”
          </blockquote>
        </section>
      ) : null}

      {/* Couple - mihrab arches */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2">
          <MihrabFrame accent={accent}>
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              Mempelai Pria
            </p>
            <h3
              className="mt-4 font-display text-2xl leading-tight"
              style={{ color: accent }}
            >
              {invitation.groomName}
            </h3>
            {(c.groomFatherName || c.groomMotherName) && (
              <p className="mt-3 font-serif text-sm italic">
                Putra dari
                {c.groomFatherName ? (
                  <>
                    <br />
                    Bapak {c.groomFatherName}
                  </>
                ) : null}
                {c.groomMotherName ? (
                  <>
                    <br />
                    &amp; Ibu {c.groomMotherName}
                  </>
                ) : null}
              </p>
            )}
          </MihrabFrame>

          <MihrabFrame accent={accent}>
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              Mempelai Wanita
            </p>
            <h3
              className="mt-4 font-display text-2xl leading-tight"
              style={{ color: accent }}
            >
              {invitation.brideName}
            </h3>
            {(c.brideFatherName || c.brideMotherName) && (
              <p className="mt-3 font-serif text-sm italic">
                Putri dari
                {c.brideFatherName ? (
                  <>
                    <br />
                    Bapak {c.brideFatherName}
                  </>
                ) : null}
                {c.brideMotherName ? (
                  <>
                    <br />
                    &amp; Ibu {c.brideMotherName}
                  </>
                ) : null}
              </p>
            )}
          </MihrabFrame>
        </div>
      </section>

      {/* Schedule */}
      {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-20">
          <header className="text-center">
            <EightPointStar
              className="mx-auto h-7 w-7"
              style={{ color: accent }}
            />
            <h2
              className="mt-4 font-display text-3xl"
              style={{ color: accent }}
            >
              Susunan Acara
            </h2>
          </header>
          <ul className="mt-12 space-y-9">
            {c.schedule.map((item, i) => (
              <li
                key={i}
                className="text-center"
              >
                <p
                  className="text-[11px] uppercase tracking-[0.4em]"
                  style={{ color: accent }}
                >
                  {item.label}
                </p>
                <p className="mt-2 font-display text-2xl">
                  {formatScheduleDate(item)}
                </p>
                <p className="mt-1 text-sm text-[#22311f]/80">
                  {formatScheduleRange(item)}
                </p>
                {item.notes ? (
                  <p className="mt-2 text-sm italic text-[#22311f]/65">
                    {item.notes}
                  </p>
                ) : null}
                {i < c.schedule!.length - 1 ? (
                  <EightPointStar
                    className="mx-auto mt-9 h-4 w-4 opacity-50"
                    style={{ color: accent }}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-12 text-center">
          <h2 className="font-display text-3xl" style={{ color: accent }}>
            Menanti Hari Bahagia
          </h2>
          <div className="mt-8">
            <Countdown target={invitation.eventDate} variant="classic" />
          </div>
        </section>
      ) : null}

      {/* Map */}
      {invitation.venueName ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16 text-center">
          <h2 className="font-display text-3xl" style={{ color: accent }}>
            {invitation.venueName}
          </h2>
          {invitation.venueAddress ? (
            <p className="mt-3 font-serif text-base italic">
              {invitation.venueAddress}
            </p>
          ) : null}
          {c.mapsUrl ||
          (typeof invitation.latitude === "number" &&
            typeof invitation.longitude === "number") ? (
            <Link
              href={
                c.mapsUrl ??
                `https://www.google.com/maps?q=${invitation.latitude},${invitation.longitude}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-medium text-[#f4ecd8]"
              style={{ background: accent }}
            >
              Buka peta lokasi
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && Array.isArray(c.giftAccounts) && c.giftAccounts.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <h2
            className="text-center font-display text-3xl"
            style={{ color: accent }}
          >
            Tanda Kasih
          </h2>
          <p className="mt-3 text-center text-sm italic text-[#22311f]/80">
            Doa restu Anda merupakan hadiah yang paling berharga.
          </p>
          <ul className="mt-8 space-y-4">
            {c.giftAccounts.map((g, i) => (
              <li key={i} className="rounded-md bg-[#f9f1d9] p-5 text-center">
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{ color: accent }}
                >
                  {g.bankName}
                </p>
                <p className="mt-1 font-mono text-lg">{g.accountNumber}</p>
                <p className="text-sm">a.n. {g.accountHolder}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <header className="text-center">
            <EightPointStar
              className="mx-auto h-7 w-7"
              style={{ color: accent }}
            />
            <h2
              className="mt-4 font-display text-3xl"
              style={{ color: accent }}
            >
              Konfirmasi Kehadiran
            </h2>
          </header>
          <div className="mt-8 rounded-lg bg-[#f9f1d9] p-6">
            <PublicRsvpForm invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Ucapan & doa */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <header className="text-center">
            <EightPointStar
              className="mx-auto h-7 w-7"
              style={{ color: accent }}
            />
            <h2
              className="mt-4 font-display text-3xl"
              style={{ color: accent }}
            >
              Ucapan &amp; Doa
            </h2>
          </header>
          <div className="mt-8 rounded-lg bg-[#f9f1d9] p-6">
            <PublicGuestMessageForm
              invitationId={invitation.id}
              tone="light"
              accent={accent}
            />
          </div>
          <div className="mt-8">
            <GuestMessagesList invitationId={invitation.id} tone="light" />
          </div>
        </section>
      ) : null}

      <footer className="relative z-10 mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <EightPointStar
          className="mx-auto h-9 w-9"
          style={{ color: accent }}
        />
        <p className="mt-6 font-serif text-base italic leading-relaxed">
          Semoga Allah memberkahi pernikahan kami, dan menyatukan kami dalam
          kebaikan. Atas doa dan kehadiran Anda, kami sekeluarga mengucapkan
          terima kasih.
        </p>
        <p className="mt-6 font-display text-2xl" style={{ color: accent }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>
    </article>
  )
}
