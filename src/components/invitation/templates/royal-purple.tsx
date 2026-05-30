/**
 * Royal Purple template.
 *
 * Visual identity:
 *   - Deep royal purple (#4a1a6b) ground with lavender (#c8a0e8) and gilt gold.
 *   - Fleur-de-lis and a small crown crown the hero.
 *   - Luxe serif with airy letter-spacing.
 *   - Couple facing; schedule as gilt-bordered cards; classic countdown.
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
const LAV = "#d9c2f0"

function FleurDeLis({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 40 48" aria-hidden="true">
      <g fill={color} fillOpacity="0.9">
        <path d="M20 2 C 16 12 16 18 20 24 C 24 18 24 12 20 2Z" />
        <path d="M20 24 C 12 16 6 18 6 26 C 6 33 14 32 20 26Z" />
        <path d="M20 24 C 28 16 34 18 34 26 C 34 33 26 32 20 26Z" />
      </g>
      <rect x="9" y="30" width="22" height="3" fill={color} />
      <path d="M20 33 C 16 40 16 44 20 46 C 24 44 24 40 20 33Z" fill={color} />
    </svg>
  )
}

function Crown({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 60 32" aria-hidden="true">
      <path d="M4 30 L8 10 L20 22 L30 6 L40 22 L52 10 L56 30 Z" fill={color} fillOpacity="0.9" />
      <g fill="#4a1a6b">
        <circle cx="30" cy="20" r="2" />
        <circle cx="16" cy="22" r="1.5" />
        <circle cx="44" cy="22" r="1.5" />
      </g>
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <FleurDeLis className="h-7 w-6" color={accent} />
      <p className="mt-3 text-xs uppercase tracking-[0.46em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl tracking-[0.08em] sm:text-4xl" style={{ color: LAV }}>
        {title}
      </h2>
    </header>
  )
}

export function RoyalPurple({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? GOLD
  const quote = resolveQuote("royal-purple", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article
      id="top"
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #4a1a6b 0%, #2e0f45 100%)", color: LAV }}
    >
      {/* Hero */}
      <header className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0" aria-hidden="true">
          <CoverPhoto
            src={invitation.coverImageUrl}
            alt=""
            sizes="100vw"
            priority
            className="object-cover opacity-30"
            fallback={<div className="h-full w-full" style={{ background: "radial-gradient(circle at 50% 10%, #5e2585 0%, #2e0f45 70%)" }} />}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(46,15,69,0.55), rgba(46,15,69,0.9))" }} />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <Crown className="h-10 w-20" color={accent} />
          <p className="mt-5 text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>
            The Royal Wedding Of
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.08] tracking-[0.06em] sm:text-6xl" style={{ color: "#f3eafc" }}>
            {invitation.groomName}
            <span className="mx-3" style={{ color: accent }}>
              &amp;
            </span>
            {invitation.brideName}
          </h1>
          {invitation.eventDate ? (
            <p className="mt-6 font-serif text-base tracking-wide">
              <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
            </p>
          ) : null}
          <p className="mt-8 text-xs uppercase tracking-[0.3em] opacity-70">Kepada Yang Terhormat</p>
          <p className="mt-1 font-display text-2xl tracking-[0.06em]" style={{ color: accent }}>
            {recipient}
          </p>
        </div>
      </header>

      {/* Quote */}
      <section className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <blockquote className="font-serif text-xl italic leading-snug sm:text-2xl">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </section>

      {/* Couple */}
      <section className="relative mx-auto max-w-3xl px-6 py-16">
        <Heading kicker="The Couple" title="Mempelai" accent={accent} />
        <div className="mt-12">
          <CoupleColumns
            accent={accent}
            variant="facing"
            groom={{ label: "Mempelai Pria", name: invitation.groomName, parents: groomParents }}
            bride={{ label: "Mempelai Wanita", name: invitation.brideName, parents: brideParents }}
          />
        </div>
      </section>

      {/* Schedule */}
      {c.schedule && c.schedule.length > 0 ? (
        <section className="relative mx-auto max-w-3xl px-6 py-16">
          <Heading kicker="Agenda" title="Susunan Acara" accent={accent} />
          <div className="mt-12">
            <ScheduleList
              schedule={c.schedule}
              accent={accent}
              variant="cards"
              surfaceClassName="rounded-2xl border border-white/15 p-6"
            />
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <Heading kicker="Countdown" title="Hitung Mundur" accent={accent} />
          <div className="mt-10 flex justify-center">
            <CountdownBlock target={invitation.eventDate} variant="classic" />
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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/15"
              buttonClassName="inline-block rounded-full px-6 py-2.5 text-sm font-medium"
              buttonStyle={{ background: accent, color: "#2e0f45" }}
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
              itemClassName="rounded-2xl border border-white/15 bg-white/5 p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <RsvpBlock invitationId={invitation.id} tone="dark" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <MessagesBlock invitationId={invitation.id} tone="dark" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <FleurDeLis className="mx-auto h-9 w-7" color={accent} />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Suatu kehormatan bagi kami atas kehadiran dan restu yang Anda berikan.
        </p>
        <p className="mt-6 font-display text-3xl tracking-[0.06em]" style={{ color: "#f3eafc" }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="dark" />
    </article>
  )
}
