/**
 * Traditional Indonesian template.
 *
 * Visual identity:
 *   - Maroon (#7a2326) and gading (warm cream #f3e6c8) palette
 *   - Subtle batik-inspired SVG border on the hero, songket lozenge motifs
 *     as section dividers
 *   - Center alignment with a heritage feel - but kept refined; no garish
 *     color clash, no busy textures
 *   - Schedule rendered in a "scroll" cartouche with rounded ends
 */
import Link from "next/link"
import {
  type InvitationContent,
  type InvitationTemplateProps,
  readContent,
} from "./types"
import { Countdown } from "../sections/countdown"
import { formatScheduleDate, formatScheduleRange } from "../sections/section-helpers"
import { PublicRsvpForm } from "../sections/rsvp-form"
import { PublicGuestMessageForm } from "../sections/guest-message-form"
import { GuestMessagesList } from "../sections/guest-messages-list"
import { formatDateID } from "@/lib/utils"


/** Songket-style diamond divider */
function SongketDivider({ accent }: { accent: string }) {
  return (
    <svg
      viewBox="0 0 240 14"
      className="mx-auto h-3 w-56"
      aria-hidden
      preserveAspectRatio="none"
    >
      <g fill={accent} stroke={accent} strokeWidth="0.5">
        <path d="M0 7 L 30 7" stroke={accent} strokeOpacity="0.4" />
        <path d="M210 7 L 240 7" stroke={accent} strokeOpacity="0.4" />
        <path d="M40 7 L 50 1 L 60 7 L 50 13 Z" />
        <path d="M70 7 L 80 1 L 90 7 L 80 13 Z" fillOpacity="0.5" />
        <path d="M100 7 L 110 1 L 120 7 L 110 13 Z" />
        <path d="M120 7 L 130 1 L 140 7 L 130 13 Z" fillOpacity="0.5" />
        <path d="M150 7 L 160 1 L 170 7 L 160 13 Z" />
        <path d="M180 7 L 190 1 L 200 7 L 190 13 Z" fillOpacity="0.5" />
      </g>
    </svg>
  )
}

/** Decorative batik-corner ornament */
function BatikCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M0 0 L 100 0 L 100 100" />
        <path d="M10 10 Q 50 30 90 10" strokeOpacity="0.7" />
        <path d="M10 10 Q 30 50 10 90" strokeOpacity="0.7" />
        <circle cx="50" cy="20" r="3" fill="currentColor" />
        <circle cx="20" cy="50" r="3" fill="currentColor" />
        <circle cx="80" cy="20" r="2" fill="currentColor" fillOpacity="0.6" />
        <circle cx="20" cy="80" r="2" fill="currentColor" fillOpacity="0.6" />
      </g>
    </svg>
  )
}

export function TraditionalIndonesian({
  invitation,
  recipient,
}: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? "#7a2326"

  return (
    <article
      className="relative min-h-screen overflow-hidden text-[#3a1c12]"
      style={{ background: "linear-gradient(180deg, #f8efd9 0%, #f3e6c8 100%)" }}
    >
      {/* Corner ornaments */}
      <BatikCorner className="absolute left-0 top-0 h-24 w-24 text-[#7a2326]/40" />
      <BatikCorner className="absolute right-0 top-0 h-24 w-24 -scale-x-100 text-[#7a2326]/40" />
      <BatikCorner className="absolute left-0 bottom-0 h-24 w-24 -scale-y-100 text-[#7a2326]/40" />
      <BatikCorner className="absolute right-0 bottom-0 h-24 w-24 -scale-100 text-[#7a2326]/40" />

      {/* Hero */}
      <header className="relative z-10 mx-auto flex min-h-[88vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p
          className="text-xs uppercase tracking-[0.4em]"
          style={{ color: accent }}
        >
          Walimatul ‘Urs
        </p>
        <SongketDivider accent={accent} />

        <h1
          className="mt-8 font-display text-5xl leading-[1.1] sm:text-6xl"
          style={{ color: accent }}
        >
          {invitation.groomName}
          <span className="mx-3 font-serif italic text-[#3a1c12]/70">&amp;</span>
          {invitation.brideName}
        </h1>

        <p className="mt-8 font-serif text-base italic">Kepada Yang Terhormat</p>
        <p className="mt-2 font-display text-2xl" style={{ color: accent }}>
          {recipient}
        </p>

        {invitation.eventDate ? (
          <p className="mt-10 font-serif text-base">
            {formatDateID(invitation.eventDate)}
          </p>
        ) : null}

        <SongketDivider accent={accent} />
      </header>

      {/* Quote */}
      {c.openingQuote ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-14 text-center">
          <blockquote className="font-serif text-xl italic leading-snug text-[#3a1c12]/85 sm:text-2xl">
            “{c.openingQuote}”
          </blockquote>
        </section>
      ) : null}

      {/* Couple */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <SongketDivider accent={accent} />
        <p
          className="mt-6 text-center text-xs uppercase tracking-[0.4em]"
          style={{ color: accent }}
        >
          Tanpa mengurangi rasa hormat, kami mengundang
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <HeritageCouple
            label="Mempelai Pria"
            name={invitation.groomName}
            parents={[c.groomFatherName, c.groomMotherName].filter(Boolean) as string[]}
            accent={accent}
          />
          <HeritageCouple
            label="Mempelai Wanita"
            name={invitation.brideName}
            parents={[c.brideFatherName, c.brideMotherName].filter(Boolean) as string[]}
            accent={accent}
          />
        </div>
      </section>

      {/* Schedule - scroll cartouche */}
      {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16">
          <h2
            className="text-center font-display text-3xl"
            style={{ color: accent }}
          >
            Susunan Acara
          </h2>
          <SongketDivider accent={accent} />
          <div className="mt-10 space-y-5">
            {c.schedule.map((item, i) => (
              <div
                key={i}
                className="rounded-full border bg-[#fbf3df]/70 px-7 py-5 text-center sm:px-12"
                style={{ borderColor: `${accent}33` }}
              >
                <p
                  className="text-xs uppercase tracking-[0.32em]"
                  style={{ color: accent }}
                >
                  {item.label}
                </p>
                <p className="mt-2 font-display text-xl">{formatScheduleDate(item)}</p>
                <p className="text-sm text-[#3a1c12]/75">{formatScheduleRange(item)}</p>
                {item.notes ? (
                  <p className="mt-1 text-sm italic text-[#3a1c12]/65">{item.notes}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-12 text-center">
          <h2 className="font-display text-3xl" style={{ color: accent }}>
            Menanti Hari
          </h2>
          <SongketDivider accent={accent} />
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
            <p className="mt-3 font-serif text-base italic">{invitation.venueAddress}</p>
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
              className="mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-medium text-[#fbf3df]"
              style={{ background: accent }}
            >
              Lihat lokasi
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && Array.isArray(c.giftAccounts) && c.giftAccounts.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <h2 className="text-center font-display text-3xl" style={{ color: accent }}>
            Hadiah
          </h2>
          <SongketDivider accent={accent} />
          <ul className="mt-8 space-y-3">
            {c.giftAccounts.map((g, i) => (
              <li
                key={i}
                className="rounded-md border bg-[#fbf3df]/70 p-5 text-center"
                style={{ borderColor: `${accent}33` }}
              >
                <p className="text-xs uppercase tracking-widest" style={{ color: accent }}>
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
          <h2
            className="text-center font-display text-3xl"
            style={{ color: accent }}
          >
            Konfirmasi Kehadiran
          </h2>
          <SongketDivider accent={accent} />
          <div
            className="mt-8 rounded-lg border bg-[#fbf3df]/70 p-6"
            style={{ borderColor: `${accent}33` }}
          >
            <PublicRsvpForm invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Ucapan */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <h2
            className="text-center font-display text-3xl"
            style={{ color: accent }}
          >
            Ucapan &amp; Doa
          </h2>
          <SongketDivider accent={accent} />
          <div
            className="mt-8 rounded-lg border bg-[#fbf3df]/70 p-6"
            style={{ borderColor: `${accent}33` }}
          >
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
        <SongketDivider accent={accent} />
        <p className="mt-6 font-serif text-base italic text-[#3a1c12]/85">
          Atas perhatian dan kehadirannya, kami sekeluarga mengucapkan terima kasih.
        </p>
        <p className="mt-6 font-display text-3xl" style={{ color: accent }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>
    </article>
  )
}

function HeritageCouple({
  label,
  name,
  parents,
  accent,
}: {
  label: string
  name: string
  parents: string[]
  accent: string
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: accent }}>
        {label}
      </p>
      <h3 className="mt-3 font-display text-3xl" style={{ color: accent }}>
        {name}
      </h3>
      {parents.length > 0 ? (
        <p className="mt-3 font-serif text-base italic">
          Putra/i dari
          <br />
          Bapak {parents[0]}
          {parents[1] ? (
            <>
              <br />
              &amp; Ibu {parents[1]}
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}
