/**
 * Beach Sunset template.
 *
 * Visual identity:
 *   - Coral (#e8734a) and teal (#2a7d7d) on warm sand, breezy and tropical.
 *   - Layered wave lines and a small starfish punctuate the page.
 *   - Light sans with oversized headlines.
 *   - Couple split; schedule as ribbons; cinema (horizontal) gallery.
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

const CORAL = "#e8734a"
const TEAL = "#2a7d7d"

function Waves({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 240 24" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.5">
        <path d="M0 8 q 20 -8 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" />
        <path d="M0 16 q 20 -8 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" strokeOpacity="0.3" />
      </g>
    </svg>
  )
}

function Starfish({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2 l5 13 14 0-11 9 4 14-12-9-12 9 4-14-11-9 14 0z" fill={color} fillOpacity="0.8" />
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <p className="text-xs uppercase tracking-[0.36em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-sans text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: TEAL }}>
        {title}
      </h2>
      <Waves className="mt-4 h-4 w-40" color={accent} />
    </header>
  )
}

export function BeachSunset({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? CORAL
  const quote = resolveQuote("beach-sunset", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#f7ecd6] text-[#2f3a3a]">
      <Starfish className="pointer-events-none absolute right-6 top-8 h-10 w-10" color={CORAL} />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.46em]" style={{ color: accent }}>
          Save the Date
        </p>
        <h1 className="mt-6 font-sans text-6xl font-bold leading-[0.95] tracking-tight sm:text-8xl" style={{ color: TEAL }}>
          {invitation.groomName}
          <span className="block text-4xl font-light sm:text-5xl" style={{ color: accent }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        <Waves className="mt-8 h-5 w-48" color={accent} />
        {invitation.eventDate ? (
          <p className="mt-6 font-sans text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-8 text-sm uppercase tracking-[0.2em] opacity-70">Untuk</p>
        <p className="mt-1 font-sans text-2xl font-semibold" style={{ color: accent }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-3xl px-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl">
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
              surfaceClassName="rounded-3xl border bg-white/55 px-8 py-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <Heading kicker="Counting Down" title="Hitung Mundur" accent={accent} />
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
              buttonClassName="inline-block rounded-full px-6 py-2.5 text-sm font-medium text-white"
              buttonStyle={{ background: TEAL }}
            />
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {c.galleryUrls && c.galleryUrls.length > 0 ? (
        <section className="relative mx-auto max-w-5xl px-6 py-16">
          <Heading kicker="Gallery" title="Momen Kami" accent={accent} />
          <div className="mt-12">
            <GalleryBlock urls={c.galleryUrls} variant="cinema" />
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
              itemClassName="rounded-2xl border bg-white/55 p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-2xl border bg-white/55 p-6">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 rounded-2xl border bg-white/55 p-6">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <Waves className="mx-auto h-5 w-48" color={accent} />
        <p className="mt-6 font-sans text-base font-light leading-relaxed opacity-80">
          Terima kasih telah menjadi bagian dari hari yang kami nantikan di tepi laut.
        </p>
        <p className="mt-6 font-sans text-3xl font-bold tracking-tight" style={{ color: TEAL }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
