/**
 * Cinematic Story template.
 *
 * Visual identity:
 *   - Sections styled as numbered chapters: "I. Pertemuan", "II. Janji", etc.
 *     The whole page reads like a short film treatment.
 *   - Full-bleed dark hero with cover image when present, large display
 *     headline, fade overlay at the bottom for legibility.
 *   - Each chapter section is a tall block (min-h-screen on desktop) with
 *     a large oversize Roman numeral on the left and content on the right.
 *   - Greyscale palette with a single warm cream accent - distinct from
 *     dark-romance's copper-on-navy and modern-minimalist's hairline editorial.
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


const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]

/**
 * Chapter scaffold. Renders an oversized Roman numeral on the left and the
 * content on the right. Stacks on mobile; the numeral becomes a small chip.
 */
function Chapter({
  number,
  kicker,
  title,
  children,
  accent,
}: {
  number: number
  kicker: string
  title: string
  children: React.ReactNode
  accent: string
}) {
  return (
    <section className="border-t border-white/10 px-6 py-20 lg:py-28">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
        <div className="flex items-start gap-4 lg:flex-col">
          <span
            className="font-display text-7xl leading-none lg:text-[140px]"
            style={{ color: accent }}
          >
            {ROMAN[number - 1] ?? `${number}.`}
          </span>
          <div className="self-end pb-2 lg:hidden">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/60">
              {kicker}
            </p>
          </div>
        </div>
        <div>
          <p className="hidden text-[11px] uppercase tracking-[0.4em] text-white/60 lg:block">
            {kicker}
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            {title}
          </h2>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  )
}

export function CinematicStory({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? "#e9d8ad"

  // Build the chapter sequence. Each chapter is conditional on data.
  let chapter = 0

  return (
    <article className="relative min-h-screen overflow-hidden bg-[#0c0c0e] text-[#e6e3da]">
      {/* Hero - full-bleed with cover image */}
      <header className="relative flex min-h-[100vh] flex-col items-start justify-end px-6 pb-16 pt-24">
        {invitation.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={invitation.coverImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            loading="eager"
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1d] via-[#0c0c0e] to-black" aria-hidden />
        )}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(0deg, rgba(12,12,14,0.95) 0%, rgba(12,12,14,0.55) 40%, rgba(12,12,14,0.25) 75%, rgba(12,12,14,0.6) 100%)",
          }}
        />

        <div className="relative max-w-3xl">
          <p
            className="text-[11px] uppercase tracking-[0.5em]"
            style={{ color: accent }}
          >
            A Wedding Story · 2026
          </p>
          <h1 className="mt-8 font-display text-5xl leading-[0.95] sm:text-7xl lg:text-[8rem]">
            {invitation.groomName.split(" ")[0]}
            <br />
            <span className="text-white/40">&amp;</span>{" "}
            {invitation.brideName.split(" ")[0]}
          </h1>
          <p className="mt-10 max-w-md text-sm text-white/80">
            Untuk{" "}
            <span className="font-medium text-white">{recipient}</span>, sebuah
            cerita yang ingin kami bagikan bersama Anda.
          </p>
          {invitation.eventDate ? (
            <p
              className="mt-3 text-sm"
              style={{ color: accent }}
            >
              {formatDateID(invitation.eventDate)}
            </p>
          ) : null}
        </div>

        <div
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-[11px] uppercase tracking-[0.4em] text-white/50 lg:block"
          aria-hidden
        >
          ↓ Gulir untuk mulai
        </div>
      </header>

      {/* Chapter I — Quote / Prologue */}
      {c.openingQuote ? (
        <Chapter
          number={++chapter}
          kicker="Prolog"
          title="Sebuah pembuka"
          accent={accent}
        >
          <blockquote className="font-serif text-2xl italic leading-snug text-white/85 sm:text-3xl">
            “{c.openingQuote}”
          </blockquote>
        </Chapter>
      ) : null}

      {/* Chapter — Couple */}
      <Chapter
        number={++chapter}
        kicker="Tokoh"
        title="Dua orang yang akan menyatu"
        accent={accent}
      >
        <div className="grid gap-10 sm:grid-cols-2">
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
        {c.coupleStory ? (
          <p className="mt-8 max-w-2xl font-serif text-lg italic text-white/85">
            {c.coupleStory}
          </p>
        ) : null}
      </Chapter>

      {/* Chapter — Schedule */}
      {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
        <Chapter
          number={++chapter}
          kicker="Adegan"
          title="Susunan acara"
          accent={accent}
        >
          <ol className="space-y-8">
            {c.schedule.map((item, i) => (
              <li
                key={i}
                className="grid gap-2 border-l border-white/15 pl-6 sm:grid-cols-[180px_1fr]"
              >
                <p
                  className="text-[11px] uppercase tracking-[0.32em]"
                  style={{ color: accent }}
                >
                  Scene {String(i + 1).padStart(2, "0")} · {item.label}
                </p>
                <div>
                  <p className="font-display text-xl">{formatScheduleDate(item)}</p>
                  <p className="text-sm text-white/75">{formatScheduleRange(item)}</p>
                  {item.notes ? (
                    <p className="mt-2 text-sm italic text-white/60">{item.notes}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Chapter>
      ) : null}

      {/* Chapter — Countdown */}
      {invitation.eventDate ? (
        <Chapter
          number={++chapter}
          kicker="Hitung Mundur"
          title="Sebentar lagi"
          accent={accent}
        >
          <Countdown target={invitation.eventDate} variant="minimal" />
        </Chapter>
      ) : null}

      {/* Chapter — Location */}
      {invitation.venueName ? (
        <Chapter
          number={++chapter}
          kicker="Lokasi"
          title={invitation.venueName}
          accent={accent}
        >
          {invitation.venueAddress ? (
            <p className="max-w-xl text-base text-white/85">
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
              className="mt-6 inline-flex items-center gap-2 border-b border-current pb-1 text-sm"
              style={{ color: accent }}
            >
              Buka peta →
            </Link>
          ) : null}
        </Chapter>
      ) : null}

      {/* Chapter — Gift */}
      {c.giftEnabled && Array.isArray(c.giftAccounts) && c.giftAccounts.length > 0 ? (
        <Chapter
          number={++chapter}
          kicker="Tanda Kasih"
          title="Bila berkenan"
          accent={accent}
        >
          <ul className="space-y-4">
            {c.giftAccounts.map((g, i) => (
              <li key={i} className="border-t border-white/15 pt-4">
                <p
                  className="text-[11px] uppercase tracking-[0.3em]"
                  style={{ color: accent }}
                >
                  {g.bankName}
                </p>
                <p className="mt-2 font-mono text-lg">{g.accountNumber}</p>
                <p className="text-sm text-white/70">{g.accountHolder}</p>
              </li>
            ))}
          </ul>
        </Chapter>
      ) : null}

      {/* Chapter — RSVP */}
      {c.rsvpEnabled !== false ? (
        <Chapter
          number={++chapter}
          kicker="Konfirmasi"
          title="RSVP"
          accent={accent}
        >
          <p className="mb-6 max-w-md text-sm text-white/75">
            Kabarkan kehadiran Anda agar kami bisa menyiapkan satu kursi
            khusus.
          </p>
          <div className="border border-white/10 bg-white/[0.03] p-6">
            <PublicRsvpForm invitationId={invitation.id} tone="dark" accent={accent} />
          </div>
        </Chapter>
      ) : null}

      {/* Chapter — Ucapan */}
      {c.guestMessageEnabled !== false ? (
        <Chapter
          number={++chapter}
          kicker="Ucapan"
          title="Pesan tamu"
          accent={accent}
        >
          <div className="border border-white/10 bg-white/[0.03] p-6">
            <PublicGuestMessageForm
              invitationId={invitation.id}
              tone="dark"
              accent={accent}
            />
          </div>
          <div className="mt-8">
            <GuestMessagesList invitationId={invitation.id} tone="dark" />
          </div>
        </Chapter>
      ) : null}

      {/* Closing - "Fin" frame */}
      <footer className="border-t border-white/10 px-6 py-24 text-center">
        <p
          className="text-[11px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          Fin
        </p>
        <p className="mt-8 font-display text-3xl">
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
        <p className="mt-3 max-w-md text-base text-white/70 mx-auto">
          Terima kasih telah membaca cerita kami sampai halaman terakhir.
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
    <div>
      <p
        className="text-[10px] uppercase tracking-[0.5em]"
        style={{ color: accent }}
      >
        {label}
      </p>
      <h3 className="mt-3 font-display text-3xl">{name}</h3>
      {parents.length > 0 ? (
        <p className="mt-3 max-w-sm font-serif text-base italic text-white/80">
          Putra/i dari Bapak {parents[0]}
          {parents[1] ? <> &amp; Ibu {parents[1]}</> : null}
        </p>
      ) : null}
    </div>
  )
}
