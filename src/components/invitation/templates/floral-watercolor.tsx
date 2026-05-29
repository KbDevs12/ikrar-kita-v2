/**
 * Floral Watercolor template.
 *
 * Visual identity:
 *   - Hand-painted-feel SVG flora at the corners and as section bookends
 *   - Dusty rose + cream + sage green palette, warmer than soft-pastel
 *   - Centered classical composition with bouquet illustrations acting as
 *     visual anchors (not tilted cards like soft-pastel)
 *   - Schedule rendered as garlanded panels with a wreath bullet
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

/**
 * A small "bouquet" composed of three blob blossoms and a couple of leaves.
 * Looks watercolor-like thanks to soft fills and stroked outlines.
 */
function Bouquet({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg viewBox="0 0 120 140" className={className} style={style} aria-hidden>
      <g>
        {/* leaves */}
        <path
          d="M30 90 C 22 70, 22 50, 38 32 C 42 56, 40 76, 30 90 Z"
          fill="#9ab895"
          fillOpacity="0.6"
        />
        <path
          d="M88 92 C 96 72, 96 52, 80 34 C 76 58, 78 78, 88 92 Z"
          fill="#9ab895"
          fillOpacity="0.55"
        />
        {/* blossoms */}
        <circle cx="40" cy="44" r="14" fill="#e89c84" fillOpacity="0.85" />
        <circle cx="40" cy="44" r="6" fill="#b65538" fillOpacity="0.7" />
        <circle cx="76" cy="38" r="12" fill="#f5c8b9" fillOpacity="0.9" />
        <circle cx="76" cy="38" r="5" fill="#d27258" fillOpacity="0.75" />
        <circle cx="58" cy="62" r="16" fill="#e8b4a8" fillOpacity="0.85" />
        <circle cx="58" cy="62" r="6" fill="#92422a" fillOpacity="0.65" />
        {/* stems */}
        <path
          d="M40 58 Q 50 100, 60 130"
          stroke="#577d52"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M76 50 Q 70 100, 60 130"
          stroke="#577d52"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M58 78 Q 58 105, 60 130"
          stroke="#577d52"
          strokeWidth="1.2"
          fill="none"
        />
      </g>
    </svg>
  )
}

/** A single small wreath bullet for schedule items. */
function WreathBullet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden>
      <circle
        cx="18"
        cy="18"
        r="12"
        fill="none"
        stroke="#577d52"
        strokeWidth="1"
        strokeOpacity="0.7"
      />
      <circle cx="10" cy="18" r="2.5" fill="#e89c84" fillOpacity="0.8" />
      <circle cx="26" cy="18" r="2.5" fill="#e89c84" fillOpacity="0.8" />
      <circle cx="18" cy="10" r="2.5" fill="#f5c8b9" />
      <circle cx="18" cy="26" r="2.5" fill="#f5c8b9" />
    </svg>
  )
}

export function FloralWatercolor({ invitation, recipient }: InvitationTemplateProps) {
  const c = (invitation.content ?? {}) as InvitationContent
  const accent = invitation.primaryColor ?? "#b65538"

  return (
    <article
      className="relative min-h-screen overflow-hidden text-[#5a3a30]"
      style={{ background: "linear-gradient(180deg, #fbf3ee 0%, #f7e6dc 100%)" }}
    >
      {/* Bouquets at the corners */}
      <Bouquet className="absolute -left-2 -top-4 h-32 w-28 rotate-[-12deg] opacity-90" />
      <Bouquet className="absolute -right-2 -top-2 h-28 w-24 rotate-[14deg] opacity-90 -scale-x-100" />
      <Bouquet className="absolute -left-4 bottom-2 h-32 w-28 rotate-[180deg] opacity-80" />
      <Bouquet className="absolute -right-2 bottom-4 h-28 w-24 rotate-[-180deg] -scale-x-100 opacity-80" />

      {/* Hero */}
      <header className="relative z-10 mx-auto flex min-h-[88vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p
          className="font-serif text-sm italic"
          style={{ color: accent }}
        >
          ~ undangan pernikahan ~
        </p>

        <Bouquet className="mt-8 h-16 w-14 opacity-95" />

        <h1
          className="mt-6 font-display text-5xl italic leading-[1.05] sm:text-6xl"
          style={{ color: "#5a3a30" }}
        >
          {invitation.groomName}
          <span className="mx-3 not-italic" style={{ color: accent }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>

        <p className="mt-8 font-serif text-base italic">Kepada Yang Tercinta</p>
        <p
          className="mt-2 font-display text-2xl italic"
          style={{ color: accent }}
        >
          {recipient}
        </p>

        {invitation.eventDate ? (
          <p className="mt-10 font-serif text-base">
            {formatDateID(invitation.eventDate)}
          </p>
        ) : null}
      </header>

      {/* Quote */}
      {c.openingQuote ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16 text-center">
          <WreathBullet className="mx-auto h-8 w-8" />
          <blockquote
            className="mt-5 font-serif text-xl italic leading-snug sm:text-2xl"
            style={{ color: "#5a3a30" }}
          >
            “{c.openingQuote}”
          </blockquote>
        </section>
      ) : null}

      {/* Couple - centered with bouquet flanking */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <div className="flex flex-col items-center gap-12 sm:flex-row sm:justify-center sm:gap-10">
          <FloralCouple
            label="Mempelai Pria"
            name={invitation.groomName}
            parents={[c.groomFatherName, c.groomMotherName].filter(Boolean) as string[]}
            accent={accent}
          />
          <Bouquet
            className="hidden h-20 w-16 sm:block"
            aria-hidden
          />
          <FloralCouple
            label="Mempelai Wanita"
            name={invitation.brideName}
            parents={[c.brideFatherName, c.brideMotherName].filter(Boolean) as string[]}
            accent={accent}
          />
        </div>
      </section>

      {/* Schedule - garlanded panels */}
      {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16">
          <header className="text-center">
            <WreathBullet className="mx-auto h-8 w-8" />
            <h2
              className="mt-3 font-display text-3xl italic sm:text-4xl"
              style={{ color: accent }}
            >
              Susunan Acara
            </h2>
          </header>
          <div className="mt-10 space-y-5">
            {c.schedule.map((item, i) => (
              <div
                key={i}
                className="relative rounded-3xl border bg-[#fdf6f1] px-7 py-6 text-center sm:px-12"
                style={{ borderColor: `${accent}33` }}
              >
                <WreathBullet className="absolute -left-3 top-1/2 h-7 w-7 -translate-y-1/2 sm:-left-4" />
                <p
                  className="text-xs uppercase tracking-[0.32em]"
                  style={{ color: accent }}
                >
                  {item.label}
                </p>
                <p className="mt-2 font-display text-xl italic">
                  {formatScheduleDate(item)}
                </p>
                <p className="text-sm text-[#5a3a30]/75">
                  {formatScheduleRange(item)}
                </p>
                {item.notes ? (
                  <p className="mt-1 text-sm italic text-[#5a3a30]/65">
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
        <section className="relative z-10 mx-auto max-w-xl px-6 py-12 text-center">
          <h2
            className="font-display text-3xl italic"
            style={{ color: accent }}
          >
            Menanti Hari
          </h2>
          <div className="mt-8">
            <Countdown target={invitation.eventDate} variant="soft" />
          </div>
        </section>
      ) : null}

      {/* Map */}
      {invitation.venueName ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16 text-center">
          <h2
            className="font-display text-3xl italic"
            style={{ color: accent }}
          >
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
              className="mt-6 inline-block rounded-full border px-6 py-2.5 text-sm font-medium"
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
          <h2
            className="text-center font-display text-3xl italic"
            style={{ color: accent }}
          >
            Tanda Kasih
          </h2>
          <ul className="mt-8 space-y-4">
            {c.giftAccounts.map((g, i) => (
              <li
                key={i}
                className="rounded-2xl border bg-[#fdf6f1] p-5 text-center"
                style={{ borderColor: `${accent}33` }}
              >
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

      <footer className="relative z-10 mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <Bouquet className="mx-auto h-14 w-12" />
        <p className="mt-5 font-serif text-base italic">
          “Bunga-bunga ini kami petik dari hari kami berdua. Terima kasih
          telah ikut merangkainya bersama kami.”
        </p>
        <p
          className="mt-6 font-display text-2xl italic"
          style={{ color: accent }}
        >
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>
    </article>
  )
}

function FloralCouple({
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
      <p
        className="text-[10px] uppercase tracking-[0.3em]"
        style={{ color: accent }}
      >
        {label}
      </p>
      <h3
        className="mt-3 font-display text-3xl italic leading-tight"
        style={{ color: "#5a3a30" }}
      >
        {name}
      </h3>
      {parents.length > 0 ? (
        <p className="mt-3 font-serif text-base italic">
          Putra/i dari Bapak {parents[0]}
          {parents[1] ? <> &amp; Ibu {parents[1]}</> : null}
        </p>
      ) : null}
    </div>
  )
}
