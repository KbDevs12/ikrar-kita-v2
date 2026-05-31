/**
 * Betawi Festive template.
 *
 * Visual identity:
 *   - Bright white ground with festive merah (#c41e1e), hijau (#1e6b3a) and
 *     gold accents.
 *   - A pair of ondel-ondel silhouettes guard the hero; a gigi-balang
 *     sawtooth band runs under the headings.
 *   - Playful bold display type, celebratory and warm.
 *   - Couple split grid; schedule as bold cards.
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

const RED = "#c41e1e"
const GREEN = "#1e6b3a"
const GOLD = "#c8a35a"

function OndelOndel({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 60 140" fill="none" aria-hidden="true">
      <g fill={color} fillOpacity="0.9">
        <circle cx="30" cy="26" r="16" />
        <path d="M30 4 l 6 10 h -12 Z" />
        <path d="M10 16 l 8 6 M50 16 l -8 6" stroke={color} strokeWidth="2" />
      </g>
      <path d="M16 44 q 14 -8 28 0 l 6 90 h -40 Z" fill={color} fillOpacity="0.75" />
      <g stroke="#ffffff" strokeWidth="2" strokeOpacity="0.7">
        <path d="M30 50 V 130 M18 70 H 42 M16 96 H 44" />
      </g>
    </svg>
  )
}

function GigiBalang({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
      <g fill={color} fillOpacity="0.75">
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={i} d={`M${i * 12.5} 12 L${i * 12.5 + 6.25} 0 L${i * 12.5 + 12.5} 12 Z`} />
        ))}
      </g>
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GREEN }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl" style={{ color: accent }}>
        {title}
      </h2>
      <GigiBalang className="mt-3 h-3 w-44" color={GOLD} />
    </header>
  )
}

export function BetawiFestive({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? RED
  const quote = resolveQuote("betawi-festive", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-white text-[#26201b]">
      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <OndelOndel className="pointer-events-none absolute bottom-10 left-2 h-40 w-16 opacity-80 sm:left-8" color={RED} />
        <OndelOndel className="pointer-events-none absolute bottom-10 right-2 h-40 w-16 opacity-80 sm:right-8" color={GREEN} />

        <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: GREEN }}>
          Mangga Mampir, Kite Kawinan
        </p>
        <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] sm:text-7xl" style={{ color: accent }}>
          {invitation.groomName}
          <span className="mx-3" style={{ color: GOLD }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        <GigiBalang className="mt-6 h-3 w-48" color={GOLD} />
        {invitation.eventDate ? (
          <p className="mt-6 font-serif text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-8 font-serif text-sm italic opacity-70">Buat Yang Terhormat</p>
        <p className="mt-1 font-display text-2xl font-bold" style={{ color: GREEN }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-2xl px-6">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border-4" style={{ borderColor: GOLD }}>
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority />
          </div>
        </figure>
      ) : null}

      {/* Quote */}
      <section className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <blockquote className="font-serif text-xl italic leading-snug sm:text-2xl">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </section>

      {/* Couple */}
      <section className="relative mx-auto max-w-3xl px-6 py-16">
        <Heading kicker="Yang Mau Nikah" title="Kedua Mempelai" accent={accent} />
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
        <section className="relative mx-auto max-w-3xl px-6 py-16">
          <Heading kicker="Acara" title="Waktu &amp; Tempat" accent={accent} />
          <div className="mt-12">
            <ScheduleList
              schedule={c.schedule}
              accent={accent}
              variant="cards"
              surfaceClassName="rounded-2xl border-2 bg-white p-6 shadow-sm"
            />
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <Heading kicker="Ngitung Hari" title="Hitung Mundur" accent={accent} />
          <div className="mt-10">
            <CountdownBlock target={invitation.eventDate} variant="soft" />
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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-2xl border-2"
              buttonClassName="inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white"
              buttonStyle={{ background: GREEN }}
            />
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {c.galleryUrls && c.galleryUrls.length > 0 ? (
        <section className="relative mx-auto max-w-4xl px-6 py-16">
          <Heading kicker="Galeri" title="Foto-foto Kite" accent={accent} />
          <div className="mt-12">
            <GalleryBlock urls={c.galleryUrls} variant="mosaic" />
          </div>
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && c.giftAccounts && c.giftAccounts.length > 0 ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Tande Kasih" title="Hadiah" accent={accent} />
          <div className="mt-10">
            <GiftList
              accounts={c.giftAccounts}
              accent={accent}
              itemClassName="rounded-2xl border-2 bg-white p-5 text-center shadow-sm"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-2xl border-2 bg-white p-6 shadow-sm">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan Buat Kite" accent={accent} />
          <div className="mt-10 rounded-2xl border-2 bg-white p-6 shadow-sm">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <GigiBalang className="mx-auto h-3 w-48" color={GOLD} />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Makasih banyak udah mampir dan ngedoain. Salam anget dari kite berdua.
        </p>
        <p className="mt-6 font-display text-3xl font-bold" style={{ color: accent }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
