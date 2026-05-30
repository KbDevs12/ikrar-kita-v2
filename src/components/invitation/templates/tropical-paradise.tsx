/**
 * Tropical Paradise template.
 *
 * Visual identity:
 *   - Tropical green (#2a6b4a), bright yellow (#e8c32a), coral and white.
 *   - Monstera leaves and a hibiscus bloom spill across the corners.
 *   - Playful, large sans, cheerful and colourful.
 *   - Couple split; schedule ribbons; mosaic gallery.
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

const GREEN = "#2a6b4a"
const YELLOW = "#e8c32a"

function Monstera({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M32 62 C 10 48 4 24 18 6 C 30 16 42 12 58 14 C 52 34 52 50 32 62Z"
        fill={color}
        fillOpacity="0.8"
      />
      <g fill="#ffffff" fillOpacity="0.85">
        <path d="M30 50 q 6 -4 10 -10 l -2 -3 q -5 6 -10 9Z" />
        <path d="M22 36 q 6 -3 11 -9 l -2 -3 q -6 6 -11 8Z" />
        <path d="M40 30 q 5 -2 9 -7 l -2 -3 q -4 5 -9 6Z" />
      </g>
    </svg>
  )
}

function Hibiscus({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <g fill={color} fillOpacity="0.85">
        {Array.from({ length: 5 }).map((_, i) => (
          <ellipse key={i} cx="24" cy="12" rx="7" ry="12" transform={`rotate(${i * 72} 24 24)`} />
        ))}
      </g>
      <circle cx="24" cy="24" r="4" fill={YELLOW} />
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Hibiscus className="h-7 w-7" color="#e8734a" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.32em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: GREEN }}>
        {title}
      </h2>
    </header>
  )
}

export function TropicalParadise({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? GREEN
  const quote = resolveQuote("tropical-paradise", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#fbfcf4] text-[#26342b]">
      <Monstera className="pointer-events-none absolute -left-4 top-2 h-28 w-28 -rotate-12" color={GREEN} />
      <Monstera className="pointer-events-none absolute -right-5 top-8 h-24 w-24 rotate-[160deg]" color="#3a8a5e" />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: "#e8734a" }}>
          Let&rsquo;s Celebrate
        </p>
        <h1 className="mt-6 font-sans text-6xl font-bold leading-[0.95] tracking-tight sm:text-8xl" style={{ color: GREEN }}>
          {invitation.groomName}
          <span className="block text-4xl font-light" style={{ color: YELLOW }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        {invitation.eventDate ? (
          <p className="mt-6 font-sans text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-8 text-xs uppercase tracking-[0.2em] opacity-70">Untuk</p>
        <p className="mt-1 font-sans text-2xl font-semibold" style={{ color: "#e8734a" }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-3xl px-6">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl">
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority sizes="(max-width: 768px) 100vw, 896px" />
          </div>
        </figure>
      ) : null}

      {/* Quote */}
      <section className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <blockquote className="font-sans text-xl font-light leading-relaxed sm:text-2xl">
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
            <ScheduleList
              schedule={c.schedule}
              accent={accent}
              variant="ribbon"
              surfaceClassName="rounded-3xl border bg-white px-8 py-5 text-center shadow-sm"
            />
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <Heading kicker="Countdown" title="Hitung Mundur" accent={accent} />
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
            <address className="mt-3 text-center font-sans text-base not-italic opacity-80">
              {invitation.venueAddress}
            </address>
          ) : null}
          <div className="mx-auto mt-8 max-w-xl">
            <MapBlock
              latitude={invitation.latitude}
              longitude={invitation.longitude}
              mapsUrl={c.mapsUrl}
              venueName={invitation.venueName}
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-3xl"
              buttonClassName="inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white"
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
              itemClassName="rounded-2xl border bg-white p-5 text-center shadow-sm"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <Hibiscus className="mx-auto h-9 w-9" color="#e8734a" />
        <p className="mt-6 font-sans text-base font-light leading-relaxed opacity-80">
          Terima kasih telah ikut merayakan hari penuh warna ini bersama kami.
        </p>
        <p className="mt-6 font-sans text-3xl font-bold tracking-tight" style={{ color: GREEN }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
