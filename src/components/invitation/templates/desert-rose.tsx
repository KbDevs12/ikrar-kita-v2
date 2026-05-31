/**
 * Desert Rose template.
 *
 * Visual identity:
 *   - Terracotta (#c4622d), dusty pink (#d4a0a0), warm sand and copper.
 *   - Saguaro cacti and a stepped desert arch frame the page.
 *   - Bold, large sans, earthy and modern.
 *   - Couple split; schedule cards; mosaic gallery.
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

const TERRA = "#c4622d"
const PINK = "#c98f8f"

function Cactus({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 48 72" fill="none" aria-hidden="true">
      <g stroke={color} strokeWidth="5" strokeLinecap="round" strokeOpacity="0.8">
        <line x1="24" y1="70" x2="24" y2="18" />
        <path d="M24 40 q -10 0 -10 -10 v -6" />
        <path d="M24 34 q 10 0 10 -10 v -10" />
      </g>
      <circle cx="24" cy="16" r="3" fill={TERRA} />
    </svg>
  )
}

function DesertArch({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 120 70" fill="none" aria-hidden="true">
      <path d="M14 70 L14 34 A 46 46 0 0 1 106 34 L106 70" stroke={color} strokeWidth="2" strokeOpacity="0.8" />
      <path d="M26 70 L26 38 A 34 34 0 0 1 94 38 L94 70" stroke={color} strokeWidth="1.4" strokeOpacity="0.5" />
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "#5a3322" }}>
        {title}
      </h2>
      <span className="mt-4 block h-1 w-12 rounded-full" style={{ background: PINK }} aria-hidden="true" />
    </header>
  )
}

export function DesertRose({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? TERRA
  const quote = resolveQuote("desert-rose", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#f5e6c8] text-[#4a3526]">
      <Cactus className="pointer-events-none absolute left-4 bottom-10 h-24 w-16 opacity-70" color="#9a7b3f" />
      <Cactus className="pointer-events-none absolute right-5 bottom-16 h-16 w-12 opacity-60" color="#9a7b3f" />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <DesertArch className="h-20 w-40" color={accent} />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: accent }}>
          To Have &amp; To Hold
        </p>
        <h1 className="mt-5 font-sans text-5xl font-bold leading-[1.0] tracking-tight sm:text-7xl" style={{ color: "#5a3322" }}>
          {invitation.groomName}
          <span className="block text-3xl font-light" style={{ color: PINK }}>
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
        <p className="mt-1 font-sans text-2xl font-semibold" style={{ color: accent }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-2xl px-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-full border-2" style={{ borderColor: accent }}>
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority sizes="(max-width: 768px) 100vw, 640px" />
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
        <section className="relative mx-auto max-w-3xl px-6 py-16">
          <Heading kicker="Agenda" title="Susunan Acara" accent={accent} />
          <div className="mt-12">
            <ScheduleList
              schedule={c.schedule}
              accent={accent}
              variant="cards"
              surfaceClassName="rounded-2xl border bg-white/45 p-6"
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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-2xl border-2"
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
              itemClassName="rounded-2xl border bg-white/45 p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-2xl border bg-white/45 p-6">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 rounded-2xl border bg-white/45 p-6">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <DesertArch className="mx-auto h-16 w-32" color={accent} />
        <p className="mt-6 font-sans text-base font-light leading-relaxed opacity-80">
          Terima kasih telah menyertai langkah baru kami dengan doa dan kehadiran.
        </p>
        <p className="mt-6 font-sans text-3xl font-bold tracking-tight" style={{ color: "#5a3322" }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
