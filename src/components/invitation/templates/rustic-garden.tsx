/**
 * Rustic Garden template.
 *
 * Visual identity:
 *   - Outdoor / botanical, sage + cream palette on textured paper feel
 *   - Layout: scrapbook-style with off-axis polaroid cards (tilted ±2°)
 *   - Hand-drawn ornaments: leaves at section corners, dotted dividers
 *   - Typography: serif body, lowercase script-feel kicker
 *
 * Differs structurally from siblings: schedule is rendered as a vertical
 * "branch" with leaf bullets instead of a hairline timeline; couple cards
 * are tilted in opposite directions instead of perfectly aligned.
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

function LeafSprig({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      <path
        d="M40 8 C 24 22, 22 44, 40 72 C 58 44, 56 22, 40 8 Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path d="M40 8 L 40 72" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path
        d="M40 26 L 28 32 M40 38 L 26 46 M40 50 L 30 56 M40 26 L 52 32 M40 38 L 54 46 M40 50 L 50 56"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
      />
    </svg>
  )
}

export function RusticGarden({ invitation, recipient }: InvitationTemplateProps) {
  const c = (invitation.content ?? {}) as InvitationContent
  const accent = invitation.primaryColor ?? "#577d52"

  return (
    <article
      className="relative min-h-screen overflow-hidden text-[#3a3528]"
      style={{
        background:
          "radial-gradient(ellipse at top, #f3eedf 0%, #e9e2cd 60%, #ddd2b6 100%)",
      }}
    >
      {/* Paper-like grain */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-50" aria-hidden />
      {/* Corner sprigs */}
      <LeafSprig className="absolute left-4 top-4 h-20 w-20 -rotate-12 text-sage-700/35" />
      <LeafSprig className="absolute right-4 top-12 h-24 w-24 rotate-[18deg] text-sage-700/30" />
      <LeafSprig className="absolute -left-4 bottom-12 h-28 w-28 rotate-[110deg] text-sage-700/25" />
      <LeafSprig className="absolute right-2 bottom-4 h-24 w-24 rotate-[-150deg] text-sage-700/30" />

      {/* Hero */}
      <header className="relative z-10 mx-auto flex min-h-[88vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="font-serif text-sm italic lowercase tracking-wide" style={{ color: accent }}>
          ~ menanti hari di antara dedaunan ~
        </p>
        <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl">
          <span className="block">{invitation.groomName}</span>
          <span
            className="my-2 block font-serif text-2xl italic"
            style={{ color: accent }}
          >
            &amp;
          </span>
          <span className="block">{invitation.brideName}</span>
        </h1>
        <div
          className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.32em]"
          style={{ color: accent }}
        >
          <span aria-hidden>· · ·</span>
          <span>untuk</span>
          <span aria-hidden>· · ·</span>
        </div>
        <p className="mt-3 font-serif text-xl italic">{recipient}</p>
        {invitation.eventDate ? (
          <p className="mt-8 font-serif text-base">{formatDateID(invitation.eventDate)}</p>
        ) : null}
      </header>

      {/* Quote on a torn-paper card */}
      {c.openingQuote ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-12">
          <blockquote className="relative rotate-[-0.5deg] rounded-sm border border-[#9ab895]/40 bg-[#fbf6e9] px-7 py-8 font-serif text-lg italic leading-snug shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]">
            <span
              className="absolute -left-2 -top-2 inline-block h-5 w-5 rotate-12 bg-[#cdb887]"
              aria-hidden
            />
            “{c.openingQuote}”
          </blockquote>
        </section>
      ) : null}

      {/* Couple - polaroid-style cards, tilted opposite ways */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <div className="flex flex-col items-stretch gap-10 sm:flex-row sm:gap-6">
          <PolaroidPanel
            label="mempelai pria"
            name={invitation.groomName}
            parents={[c.groomFatherName, c.groomMotherName].filter(Boolean) as string[]}
            tilt="-rotate-[1.5deg]"
            accent={accent}
          />
          <div className="hidden self-center sm:block">
            <LeafSprig className="h-14 w-14 text-sage-700/45" />
          </div>
          <PolaroidPanel
            label="mempelai wanita"
            name={invitation.brideName}
            parents={[c.brideFatherName, c.brideMotherName].filter(Boolean) as string[]}
            tilt="rotate-[1.5deg] sm:translate-y-4"
            accent={accent}
          />
        </div>
      </section>

      {/* Schedule - vertical "branch" with leaf bullets */}
      {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16">
          <RusticHeading kicker="susunan acara" title="Hari di taman" accent={accent} />
          <ol className="relative ml-4 mt-10 space-y-9 border-l-2 border-dashed border-sage-700/30 pl-7">
            {c.schedule.map((item, i) => (
              <li key={i} className="relative">
                <LeafSprig
                  className="absolute -left-[42px] top-0 h-7 w-7 rotate-90"
                  style={{ color: accent }}
                />
                <p className="font-serif text-xl italic" style={{ color: accent }}>
                  {item.label}
                </p>
                <p className="mt-1 font-serif text-base">{formatScheduleDate(item)}</p>
                <p className="text-sm italic text-[#3a3528]/70">{formatScheduleRange(item)}</p>
                {item.notes ? (
                  <p className="mt-1 text-sm text-[#3a3528]/65">{item.notes}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-12 text-center">
          <RusticHeading kicker="menghitung hari" title="Sebentar lagi" accent={accent} />
          <div className="mt-8">
            <Countdown target={invitation.eventDate} variant="classic" />
          </div>
        </section>
      ) : null}

      {/* Map */}
      {invitation.venueName ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16 text-center">
          <RusticHeading kicker="tempat acara" title={invitation.venueName} accent={accent} />
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
              className="mt-6 inline-block rounded-full border-2 border-dashed px-6 py-2.5 text-sm font-medium hover:bg-[#fbf6e9]"
              style={{ borderColor: accent, color: accent }}
            >
              Lihat di peta →
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && Array.isArray(c.giftAccounts) && c.giftAccounts.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <RusticHeading kicker="tanda kasih" title="Bila berkenan" accent={accent} />
          <ul className="mt-8 space-y-4">
            {c.giftAccounts.map((g, i) => (
              <li
                key={i}
                className="rounded-sm border border-sage-700/30 bg-[#fbf6e9]/70 p-5"
                style={{ transform: `rotate(${i % 2 === 0 ? "-0.4deg" : "0.4deg"})` }}
              >
                <p className="text-xs uppercase tracking-widest" style={{ color: accent }}>
                  {g.bankName}
                </p>
                <p className="mt-1 font-mono text-lg">{g.accountNumber}</p>
                <p className="text-sm italic">a.n. {g.accountHolder}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="relative z-10 mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <LeafSprig className="mx-auto h-10 w-10 text-sage-700/55" />
        <p className="mt-5 font-serif text-lg italic">
          “Tanaman tumbuh perlahan — begitu juga cinta kami. Terima kasih atas doa
          dan kehadiran Anda di hari kami.”
        </p>
        <p className="mt-6 font-display text-2xl">
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>
    </article>
  )
}

function RusticHeading({
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
        className="text-xs italic lowercase tracking-[0.3em]"
        style={{ color: accent }}
      >
        ~ {kicker} ~
      </p>
      <h2 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h2>
    </header>
  )
}

function PolaroidPanel({
  label,
  name,
  parents,
  tilt,
  accent,
}: {
  label: string
  name: string
  parents: string[]
  tilt: string
  accent: string
}) {
  return (
    <div
      className={`relative flex-1 rounded-sm border border-sage-700/35 bg-[#fbf6e9] px-7 pb-7 pt-6 text-center shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)] ${tilt}`}
    >
      <span
        className="absolute -top-3 left-1/2 -translate-x-1/2 rotate-[-2deg] bg-[#d6c89a] px-3 py-0.5 text-[10px] uppercase tracking-widest text-[#3a3528]/80"
        aria-hidden
      >
        polaroid
      </span>
      <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
        {label}
      </p>
      <h3 className="mt-3 font-display text-3xl">{name}</h3>
      {parents.length > 0 ? (
        <p className="mt-3 font-serif text-base italic leading-relaxed">
          Putra/i dari Bapak {parents[0]}
          {parents[1] ? <> &amp; Ibu {parents[1]}</> : null}
        </p>
      ) : null}
    </div>
  )
}
