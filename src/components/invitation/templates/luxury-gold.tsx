/**
 * Luxury Gold template.
 *
 * Visual identity:
 *   - Deep ink-black ground, restrained gold accents (no neon yellow)
 *   - Heavy display serif, oversized monogram framed in a thin gilt border
 *   - Center-symmetric stacks - the *opposite* of Modern Minimalist's
 *     editorial split. Verticals dominate; section dividers are paired
 *     gilt rules with a tiny lozenge between them.
 *   - Schedule rendered as a vertical "card stack" with framed gilt edges
 *     instead of timeline or simple rows.
 */
import Link from "next/link"
import type { InvitationTemplateProps } from "./types"
import { Countdown } from "../sections/countdown"
import { formatScheduleDate, formatScheduleRange } from "../sections/section-helpers"
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
  mapsUrl?: string
}

const GOLD = "#c8a25b"
const GOLD_SOFT = "#a98446"

function GiltRule({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={`mx-auto flex items-center justify-center gap-3 ${wide ? "w-full max-w-md" : "w-32"}`}
      aria-hidden
    >
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(to right, transparent, ${GOLD_SOFT}, transparent)`,
        }}
      />
      <div
        className="rotate-45 border"
        style={{ borderColor: GOLD, width: 8, height: 8 }}
      />
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(to right, transparent, ${GOLD_SOFT}, transparent)`,
        }}
      />
    </div>
  )
}

export function LuxuryGold({ invitation, recipient }: InvitationTemplateProps) {
  const c = (invitation.content ?? {}) as InvitationContent
  const accent = invitation.primaryColor ?? GOLD

  return (
    <article className="relative min-h-screen overflow-hidden bg-[#0e0c08] text-[#e9e0c9]">
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(200,162,91,0.07) 0%, transparent 60%)",
        }}
      />

      {/* Hero - oversized monogram in a thin gilt frame */}
      <header className="relative z-10 mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          The Wedding Ceremony of
        </p>

        {/* Monogram frame */}
        <div className="relative mt-10 px-10 py-8 sm:px-16 sm:py-10">
          <span
            className="pointer-events-none absolute inset-0 border"
            style={{ borderColor: accent }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-2 border"
            style={{ borderColor: `${accent}55` }}
            aria-hidden
          />
          <h1 className="font-display text-5xl leading-tight sm:text-7xl">
            <span className="block" style={{ color: accent }}>
              {invitation.groomName.split(" ")[0]}
            </span>
            <span className="my-1 block font-serif text-3xl italic text-[#e9e0c9]/80 sm:text-4xl">
              &amp;
            </span>
            <span className="block" style={{ color: accent }}>
              {invitation.brideName.split(" ")[0]}
            </span>
          </h1>
        </div>

        <div className="mt-10">
          <GiltRule />
        </div>

        <p className="mt-8 text-[10px] uppercase tracking-[0.4em] text-[#e9e0c9]/70">
          Reserved for
        </p>
        <p className="mt-2 font-display text-2xl" style={{ color: accent }}>
          {recipient}
        </p>

        {invitation.eventDate ? (
          <p className="mt-10 font-serif text-base text-[#e9e0c9]/80">
            {formatDateID(invitation.eventDate)}
          </p>
        ) : null}
      </header>

      {/* Quote */}
      {c.openingQuote ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16 text-center">
          <p
            className="text-[10px] uppercase tracking-[0.4em]"
            style={{ color: accent }}
          >
            Aforisme
          </p>
          <blockquote className="mt-5 font-serif text-2xl italic leading-snug text-[#e9e0c9]/90">
            “{c.openingQuote}”
          </blockquote>
        </section>
      ) : null}

      {/* Couple - center-symmetric */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <GiltRule wide />
        <h2
          className="mt-8 text-center text-[10px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          The Bride &amp; Groom
        </h2>
        <div className="mt-10 flex flex-col items-center gap-12 sm:flex-row sm:justify-center sm:gap-16">
          <SymmetricCouple
            name={invitation.groomName}
            parents={[c.groomFatherName, c.groomMotherName].filter(Boolean) as string[]}
            accent={accent}
          />
          <span
            className="hidden font-display text-5xl sm:block"
            style={{ color: accent }}
            aria-hidden
          >
            &amp;
          </span>
          <SymmetricCouple
            name={invitation.brideName}
            parents={[c.brideFatherName, c.brideMotherName].filter(Boolean) as string[]}
            accent={accent}
          />
        </div>
      </section>

      {/* Schedule - vertical card stack */}
      {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16">
          <header className="text-center">
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              The Programme
            </p>
            <h2 className="mt-3 font-display text-4xl">Susunan Acara</h2>
          </header>
          <div className="mt-10 space-y-5">
            {c.schedule.map((item, i) => (
              <div key={i} className="relative px-6 py-6">
                <span
                  className="pointer-events-none absolute inset-0 border"
                  style={{ borderColor: `${accent}40` }}
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute inset-1 border"
                  style={{ borderColor: `${accent}20` }}
                  aria-hidden
                />
                <p
                  className="text-center text-xs uppercase tracking-[0.4em]"
                  style={{ color: accent }}
                >
                  {item.label}
                </p>
                <p className="mt-3 text-center font-display text-2xl">
                  {formatScheduleDate(item)}
                </p>
                <p className="mt-1 text-center text-sm text-[#e9e0c9]/75">
                  {formatScheduleRange(item)}
                </p>
                {item.notes ? (
                  <p className="mt-2 text-center text-sm italic text-[#e9e0c9]/65">
                    {item.notes}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
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
          <h2 className="mt-3 font-display text-4xl">Sebentar lagi</h2>
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
            Venue
          </p>
          <h2 className="mt-3 font-display text-3xl">{invitation.venueName}</h2>
          {invitation.venueAddress ? (
            <p className="mt-3 font-serif text-base text-[#e9e0c9]/80">
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
              className="mt-8 inline-flex items-center gap-2 border px-6 py-2.5 text-sm font-medium tracking-wider"
              style={{ borderColor: accent, color: accent }}
            >
              Buka di peta
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
            <h2 className="mt-3 font-display text-3xl">Tanda Kasih</h2>
          </header>
          <ul className="mt-8 space-y-4">
            {c.giftAccounts.map((g, i) => (
              <li key={i} className="relative bg-[#171411] px-6 py-5 text-center">
                <span
                  className="pointer-events-none absolute inset-0 border"
                  style={{ borderColor: `${accent}40` }}
                  aria-hidden
                />
                <p
                  className="text-[10px] uppercase tracking-[0.4em]"
                  style={{ color: accent }}
                >
                  {g.bankName}
                </p>
                <p className="mt-2 font-mono text-xl" style={{ color: accent }}>
                  {g.accountNumber}
                </p>
                <p className="text-sm text-[#e9e0c9]/80">a.n. {g.accountHolder}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="relative z-10 mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <GiltRule />
        <p className="mt-8 font-display text-3xl" style={{ color: accent }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
        <p className="mt-3 font-serif text-base italic text-[#e9e0c9]/70">
          Merupakan kehormatan tersendiri bila Bapak/Ibu/Saudara/i berkenan hadir.
        </p>
      </footer>
    </article>
  )
}

function SymmetricCouple({
  name,
  parents,
  accent,
}: {
  name: string
  parents: string[]
  accent: string
}) {
  return (
    <div className="text-center">
      <h3 className="font-display text-3xl" style={{ color: accent }}>
        {name}
      </h3>
      {parents.length > 0 ? (
        <p className="mt-3 font-serif text-base italic text-[#e9e0c9]/85">
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
