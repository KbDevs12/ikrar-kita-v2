/**
 * Marble Luxe template.
 *
 * Visual identity:
 *   - White and pale grey marble with fine veining and thin gold (#c8a35a) rules.
 *   - Clean, spa-like luxury - lots of light, restraint and precision.
 *   - Thin elegant serif.
 *   - Couple split; schedule hairline list; minimal countdown.
 */
import { readContent, type InvitationTemplateProps } from "./types"
import { formatDateID } from "@/lib/utils"
import {
  CoupleColumns,
  CountdownBlock,
  CoverPhoto,
  GalleryBlock,
  GiftList,
  MapBlock,
  MessagesBlock,
  RsvpBlock,
  ScheduleList,
  coupleParents,
  resolveQuote,
} from "./_shared"
import { BackToTop } from "../sections/back-to-top"

const GOLD = "#c8a35a"
const INK = "#2c2a27"

function MarbleVein({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <g stroke={color} strokeWidth="0.8" strokeOpacity="0.4" fill="none">
        <path d="M0 40 C 60 60 90 20 200 70" />
        <path d="M0 120 C 70 100 120 160 200 130" />
        <path d="M20 200 C 60 150 130 170 180 110" />
        <path d="M40 0 C 70 60 30 90 90 200" strokeOpacity="0.25" />
      </g>
    </svg>
  )
}

function GoldRule({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="4" x2="52" y2="4" stroke={color} strokeWidth="1" />
      <circle cx="60" cy="4" r="3" fill="none" stroke={color} strokeWidth="1" />
      <line x1="68" y1="4" x2="120" y2="4" stroke={color} strokeWidth="1" />
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <p className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl font-light tracking-[0.04em] sm:text-4xl" style={{ color: INK }}>
        {title}
      </h2>
      <GoldRule className="mt-4 h-2 w-32" color={accent} />
    </header>
  )
}

export function MarbleLuxe({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? GOLD
  const quote = resolveQuote("marble-luxe", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#f6f5f2] text-[#33312d]">
      <MarbleVein className="pointer-events-none absolute inset-0 h-full w-full" color="#b9b6ad" />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>
          The Wedding Of
        </p>
        <h1 className="mt-8 font-display text-5xl font-light leading-[1.05] tracking-[0.03em] sm:text-7xl" style={{ color: INK }}>
          {invitation.groomName}
          <span className="mx-3 font-extralight" style={{ color: accent }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        <GoldRule className="mt-8 h-2 w-36" color={accent} />
        {invitation.eventDate ? (
          <p className="mt-6 font-serif text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-8 font-serif text-sm italic opacity-70">Kepada Yth.</p>
        <p className="mt-1 font-display text-2xl font-light" style={{ color: accent }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-2xl px-6">
          <div className="relative aspect-[3/2] w-full overflow-hidden border" style={{ borderColor: accent }}>
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority />
          </div>
        </figure>
      ) : null}

      {/* Quote */}
      <section className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <blockquote className="font-display text-xl font-light italic leading-snug sm:text-2xl" style={{ color: INK }}>
          &ldquo;{quote}&rdquo;
        </blockquote>
      </section>

      {/* Couple */}
      <section className="relative mx-auto max-w-3xl px-6 py-16">
        <Heading kicker="The Couple" title="Mempelai" accent={accent} />
        <div className="mt-12">
          <CoupleColumns
            accent={accent}
            variant="split"
            groom={{ label: "Mempelai Pria", name: invitation.groomName, parents: groomParents }}
            bride={{ label: "Mempelai Wanita", name: invitation.brideName, parents: brideParents }}
          />
        </div>
      </section>

      {/* Schedule */}
      {c.schedule && c.schedule.length > 0 ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16">
          <Heading kicker="Agenda" title="Susunan Acara" accent={accent} />
          <div className="mt-12">
            <ScheduleList schedule={c.schedule} accent={accent} variant="list" />
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <Heading kicker="Countdown" title="Hitung Mundur" accent={accent} />
          <div className="mt-10 flex justify-center">
            <CountdownBlock target={invitation.eventDate} variant="minimal" />
          </div>
        </section>
      ) : null}

      {/* Map */}
      {invitation.venueName ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16">
          <Heading kicker="Lokasi" title={invitation.venueName} accent={accent} />
          {invitation.venueAddress ? (
            <address className="mt-3 text-center font-serif text-base not-italic opacity-80">
              {invitation.venueAddress}
            </address>
          ) : null}
          <div className="mx-auto mt-8 max-w-xl">
            <MapBlock
              latitude={invitation.latitude}
              longitude={invitation.longitude}
              mapsUrl={c.mapsUrl}
              venueName={invitation.venueName}
              mapClassName="aspect-[4/3] w-full overflow-hidden border"
              buttonClassName="inline-block px-6 py-2.5 text-sm font-medium uppercase tracking-[0.18em] text-white"
              buttonStyle={{ background: accent }}
            />
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {c.galleryUrls && c.galleryUrls.length > 0 ? (
        <section className="relative mx-auto max-w-4xl px-6 py-16">
          <Heading kicker="Gallery" title="Momen Kami" accent={accent} />
          <div className="mt-12">
            <GalleryBlock urls={c.galleryUrls} variant="mosaic" />
          </div>
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && c.giftAccounts && c.giftAccounts.length > 0 ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Tanda Kasih" title="Hadiah" accent={accent} />
          <div className="mt-10">
            <GiftList
              accounts={c.giftAccounts}
              accent={accent}
              itemClassName="border bg-white/70 p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 border bg-white/70 p-6">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 border bg-white/70 p-6">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <GoldRule className="mx-auto h-2 w-36" color={accent} />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Dengan penuh syukur, kami menantikan kehadiran dan doa restu Anda.
        </p>
        <p className="mt-6 font-display text-3xl font-light tracking-[0.03em]" style={{ color: INK }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
