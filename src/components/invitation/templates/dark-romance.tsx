/**
 * Dark Romance template.
 *
 * Visual identity:
 *   - Cinematic letterbox: thin 4px black bands at the very top and bottom
 *     of the page so it always feels like a film frame
 *   - Deep midnight palette (#0a1422 ground, #1a2638 panels) with copper
 *     accent (#c8855e) - moody but not goth
 *   - Generous large-image hero at the top, then text-only sections with
 *     vertical-line gutter that runs through the whole article (a single
 *     hairline stroke that visually ties the page together)
 *   - Schedule rendered as a left-aligned timeline with copper bullets
 *     hanging on the gutter line
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


const COPPER = "#c8855e"

export function DarkRomance({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? COPPER

  return (
    <article
      className="relative min-h-screen overflow-hidden text-[#dfe2e7]"
      style={{ background: "linear-gradient(180deg, #0a1422 0%, #07101e 100%)" }}
    >
      {/* Cinematic letterbox bars */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-2 bg-black" aria-hidden />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-2 bg-black" aria-hidden />

      {/* Continuous hairline gutter that ties every section */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 sm:block"
        style={{ background: `${accent}33` }}
        aria-hidden
      />

      {/* Hero - large dark backdrop with overlay text */}
      <header className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-6 text-center">
        {invitation.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={invitation.coverImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            loading="eager"
            aria-hidden
          />
        ) : null}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(7,16,30,0.85) 70%, #07101e 100%)",
          }}
        />
        <div className="relative">
          <p
            className="text-[11px] uppercase tracking-[0.5em]"
            style={{ color: accent }}
          >
            A Wedding Story
          </p>
          <h1 className="mt-10 font-display text-5xl leading-[0.95] sm:text-7xl">
            <span className="block">{invitation.groomName}</span>
            <span
              className="my-2 block font-serif text-2xl italic sm:text-3xl"
              style={{ color: accent }}
            >
              &amp;
            </span>
            <span className="block">{invitation.brideName}</span>
          </h1>
          <div
            className="mx-auto mt-10 h-px w-20"
            style={{ background: accent }}
            aria-hidden
          />
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-[#dfe2e7]/70">
            Reserved for
          </p>
          <p className="mt-2 font-display text-2xl">{recipient}</p>
          {invitation.eventDate ? (
            <p className="mt-10 font-serif text-base text-[#dfe2e7]/80">
              {formatDateID(invitation.eventDate)}
            </p>
          ) : null}
        </div>
      </header>

      {/* Quote */}
      {c.openingQuote ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-20 text-center">
          <p
            className="text-[10px] uppercase tracking-[0.4em]"
            style={{ color: accent }}
          >
            Prologue
          </p>
          <blockquote className="mt-6 font-serif text-2xl italic leading-snug">
            “{c.openingQuote}”
          </blockquote>
        </section>
      ) : null}

      {/* Couple - vertical stack with copper rules */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10 text-center">
          <p
            className="text-[10px] uppercase tracking-[0.4em]"
            style={{ color: accent }}
          >
            The Cast
          </p>
        </header>
        <div className="grid gap-12 sm:grid-cols-2">
          <CinemaCouple
            label="HE"
            name={invitation.groomName}
            parents={[c.groomFatherName, c.groomMotherName].filter(Boolean) as string[]}
            accent={accent}
          />
          <CinemaCouple
            label="SHE"
            name={invitation.brideName}
            parents={[c.brideFatherName, c.brideMotherName].filter(Boolean) as string[]}
            accent={accent}
          />
        </div>
      </section>

      {/* Schedule - left-anchored timeline hanging off the gutter */}
      {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-20">
          <header className="text-center">
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              The Programme
            </p>
            <h2 className="mt-3 font-display text-4xl">Susunan Acara</h2>
          </header>
          <ol className="relative mt-12 space-y-10">
            {c.schedule.map((item, i, arr) => (
              <li key={i} className="relative pl-8 sm:mx-auto sm:max-w-md">
                <span
                  className="absolute left-0 top-2 h-2 w-2 rounded-full"
                  style={{ background: accent }}
                  aria-hidden
                />
                <span
                  className="absolute left-[3px] top-4 h-full w-px"
                  style={{ background: `${accent}33` }}
                  aria-hidden={i === arr.length - 1}
                />
                <p
                  className="text-[10px] uppercase tracking-[0.4em]"
                  style={{ color: accent }}
                >
                  {item.label}
                </p>
                <p className="mt-2 font-display text-xl">{formatScheduleDate(item)}</p>
                <p className="mt-1 text-sm text-[#dfe2e7]/70">{formatScheduleRange(item)}</p>
                {item.notes ? (
                  <p className="mt-2 text-sm italic text-[#dfe2e7]/55">{item.notes}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center">
          <p
            className="text-[10px] uppercase tracking-[0.4em]"
            style={{ color: accent }}
          >
            Counting the Days
          </p>
          <h2 className="mt-3 font-display text-4xl">Hitung mundur</h2>
          <div className="mt-10">
            <Countdown target={invitation.eventDate} variant="classic" />
          </div>
        </section>
      ) : null}

      {/* Map */}
      {invitation.venueName ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16 text-center">
          <p
            className="text-[10px] uppercase tracking-[0.4em]"
            style={{ color: accent }}
          >
            Location
          </p>
          <h2 className="mt-3 font-display text-3xl">{invitation.venueName}</h2>
          {invitation.venueAddress ? (
            <p className="mt-3 font-serif text-base text-[#dfe2e7]/80">
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
              className="mt-6 inline-flex items-center gap-2 border px-6 py-2.5 text-sm font-medium tracking-wider"
              style={{ borderColor: accent, color: accent }}
            >
              Buka peta
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && Array.isArray(c.giftAccounts) && c.giftAccounts.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <header className="text-center">
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              Wedding Gift
            </p>
            <h2 className="mt-3 font-display text-3xl">Tanda kasih</h2>
          </header>
          <ul className="mt-8 space-y-4">
            {c.giftAccounts.map((g, i) => (
              <li
                key={i}
                className="border bg-[#0e1a2c] px-6 py-5 text-center"
                style={{ borderColor: `${accent}40` }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.4em]"
                  style={{ color: accent }}
                >
                  {g.bankName}
                </p>
                <p className="mt-2 font-mono text-xl" style={{ color: accent }}>
                  {g.accountNumber}
                </p>
                <p className="text-sm text-[#dfe2e7]/80">a.n. {g.accountHolder}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <header className="text-center">
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              Confirmation
            </p>
            <h2 className="mt-3 font-display text-3xl">RSVP</h2>
          </header>
          <div className="mt-8 border bg-[#0e1a2c] p-6" style={{ borderColor: `${accent}30` }}>
            <PublicRsvpForm invitationId={invitation.id} tone="dark" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Ucapan */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <header className="text-center">
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              Toast &amp; Wishes
            </p>
            <h2 className="mt-3 font-display text-3xl">Ucapan tamu</h2>
          </header>
          <div className="mt-8 border bg-[#0e1a2c] p-6" style={{ borderColor: `${accent}30` }}>
            <PublicGuestMessageForm
              invitationId={invitation.id}
              tone="dark"
              accent={accent}
            />
          </div>
          <div className="mt-8">
            <GuestMessagesList invitationId={invitation.id} tone="dark" />
          </div>
        </section>
      ) : null}

      <footer className="relative z-10 mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          Fin
        </p>
        <p className="mt-6 font-display text-3xl">
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
        <p className="mt-3 font-serif text-base italic text-[#dfe2e7]/70">
          Sebuah malam yang lama kami nantikan — terima kasih telah menjadi
          bagian darinya.
        </p>
      </footer>
    </article>
  )
}

function CinemaCouple({
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
    <div className="relative pl-5 sm:pl-7">
      <span
        className="absolute left-0 top-2 h-full w-px"
        style={{ background: `${accent}55` }}
        aria-hidden
      />
      <p
        className="text-[10px] uppercase tracking-[0.5em]"
        style={{ color: accent }}
      >
        {label}
      </p>
      <h3 className="mt-3 font-display text-3xl">{name}</h3>
      {parents.length > 0 ? (
        <p className="mt-3 font-serif text-base italic text-[#dfe2e7]/85">
          Putra/i dari Bapak {parents[0]}
          {parents[1] ? <> &amp; Ibu {parents[1]}</> : null}
        </p>
      ) : null}
    </div>
  )
}
