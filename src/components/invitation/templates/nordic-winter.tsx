/**
 * Nordic Winter template.
 *
 * Visual identity:
 *   - Icy blue (#c8d8e8), white and slate grey (#6b7b8b), clean and cold.
 *   - Minimal snow crystals and a lone pine mark the page.
 *   - Geometric bold sans, lots of negative space, Scandinavian restraint.
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

const SLATE = "#6b7b8b"
const ICE = "#aac4dc"

function Snowflake({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <g stroke={color} strokeWidth="1.6" strokeOpacity="0.7">
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 60} 24 24)`}>
            <line x1="24" y1="6" x2="24" y2="42" />
            <line x1="24" y1="12" x2="19" y2="17" />
            <line x1="24" y1="12" x2="29" y2="17" />
          </g>
        ))}
      </g>
    </svg>
  )
}

function Pine({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 40 56" aria-hidden="true">
      <g fill={color} fillOpacity="0.7">
        <path d="M20 2 L30 20 H10 Z" />
        <path d="M20 14 L33 34 H7 Z" />
        <path d="M20 28 L36 50 H4 Z" />
      </g>
      <rect x="18" y="50" width="4" height="6" fill={SLATE} />
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Snowflake className="h-6 w-6" color={accent} />
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.4em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl text-slate-800">
        {title}
      </h2>
    </header>
  )
}

export function NordicWinter({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? SLATE
  const quote = resolveQuote("nordic-winter", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#f4f8fc] text-slate-700">
      <Snowflake className="pointer-events-none absolute left-6 top-8 h-10 w-10" color={ICE} />
      <Pine className="pointer-events-none absolute right-6 top-6 h-16 w-12" color={SLATE} />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.5em]" style={{ color: accent }}>
          The Wedding Of
        </p>
        <h1 className="mt-8 font-sans text-5xl font-bold leading-[1.02] tracking-tight text-slate-800 sm:text-7xl">
          {invitation.groomName}
          <span className="block text-3xl font-light" style={{ color: accent }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        <span className="mt-8 block h-px w-24" style={{ background: ICE }} aria-hidden="true" />
        {invitation.eventDate ? (
          <p className="mt-6 font-sans text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-8 text-xs uppercase tracking-[0.3em] opacity-60">Kepada</p>
        <p className="mt-1 font-sans text-2xl font-semibold" style={{ color: accent }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-2xl px-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority />
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
        <Heading kicker="Couple" title="Mempelai" accent={accent} />
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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200"
              buttonClassName="inline-block rounded-md px-6 py-2.5 text-sm font-medium text-white"
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
              itemClassName="rounded-lg border border-slate-200 bg-white p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-lg border border-slate-200 bg-white p-6">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 rounded-lg border border-slate-200 bg-white p-6">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <Snowflake className="mx-auto h-8 w-8" color={ICE} />
        <p className="mt-6 font-sans text-base font-light leading-relaxed opacity-80">
          Terima kasih atas kehadiran dan doa restu yang menghangatkan hari kami.
        </p>
        <p className="mt-6 font-sans text-3xl font-bold tracking-tight text-slate-800">
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
