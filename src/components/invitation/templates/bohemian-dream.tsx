/**
 * Bohemian Dream template.
 *
 * Visual identity:
 *   - Terracotta (#c4622d), dusty rose (#d4a0a0), cream and sage - boho chic.
 *   - A dreamcatcher and a crescent moon drift across the page.
 *   - Free serif italic, relaxed and artistic.
 *   - Couple stacked; schedule as ribbons; polaroid gallery.
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
const ROSE = "#c98f8f"

function Dreamcatcher({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 48 96" fill="none" aria-hidden="true">
      <circle cx="24" cy="22" r="18" stroke={color} strokeWidth="1.6" />
      <g stroke={color} strokeWidth="0.9" strokeOpacity="0.6">
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (Math.PI * i) / 3
          return <line key={i} x1="24" y1="22" x2={24 + Math.cos(a) * 18} y2={22 + Math.sin(a) * 18} />
        })}
        <circle cx="24" cy="22" r="9" />
      </g>
      <g stroke={color} strokeWidth="1.2">
        <line x1="14" y1="40" x2="14" y2="64" />
        <line x1="24" y1="40" x2="24" y2="76" />
        <line x1="34" y1="40" x2="34" y2="60" />
      </g>
      <g fill={color} fillOpacity="0.55">
        <path d="M14 64 q -4 8 0 14 q 4 -6 0 -14Z" />
        <path d="M24 76 q -4 8 0 16 q 4 -8 0 -16Z" />
        <path d="M34 60 q -4 8 0 14 q 4 -6 0 -14Z" />
      </g>
    </svg>
  )
}

function Crescent({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M28 4 a 16 16 0 1 0 0 32 a 13 13 0 1 1 0 -32Z" fill={color} fillOpacity="0.8" />
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Crescent className="h-6 w-6" color={accent} />
      <p className="mt-3 text-xs uppercase tracking-[0.34em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl italic sm:text-4xl" style={{ color: "#5a3326" }}>
        {title}
      </h2>
    </header>
  )
}

export function BohemianDream({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? TERRA
  const quote = resolveQuote("bohemian-dream", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#f4ebde] text-[#4a382e]">
      <Dreamcatcher className="pointer-events-none absolute right-5 top-4 h-28 w-14 opacity-80" color={ROSE} />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.44em]" style={{ color: accent }}>
          Wild &amp; Free, Together
        </p>
        <h1 className="mt-8 font-display text-5xl italic leading-[1.05] sm:text-7xl" style={{ color: "#5a3326" }}>
          {invitation.groomName}
          <span className="mx-3 not-italic" style={{ color: ROSE }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        {invitation.eventDate ? (
          <p className="mt-8 font-serif text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-10 font-serif text-sm italic opacity-70">Untuk</p>
        <p className="mt-1 font-display text-2xl italic" style={{ color: accent }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-2xl px-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[9rem] border-2" style={{ borderColor: ROSE }}>
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority sizes="(max-width: 768px) 100vw, 640px" />
          </div>
        </figure>
      ) : null}

      {/* Quote */}
      <section className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <blockquote className="font-display text-xl italic leading-snug sm:text-2xl" style={{ color: "#5a3326" }}>
          &ldquo;{quote}&rdquo;
        </blockquote>
      </section>

      {/* Couple */}
      <section className="relative mx-auto max-w-3xl px-6 py-16">
        <Heading kicker="Mempelai" title="Dua Jiwa" accent={accent} />
        <div className="mt-12">
          <CoupleColumns
            accent={accent}
            variant="stacked"
            groom={{ label: "Mempelai Pria", name: invitation.groomName, parents: groomParents }}
            bride={{ label: "Mempelai Wanita", name: invitation.brideName, parents: brideParents }}
          />
        </div>
      </section>

      {/* Schedule */}
      {c.schedule && c.schedule.length > 0 ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16">
          <Heading kicker="Acara" title="Susunan Acara" accent={accent} />
          <div className="mt-12">
            <ScheduleList
              schedule={c.schedule}
              accent={accent}
              variant="ribbon"
              surfaceClassName="rounded-3xl border bg-white/50 px-8 py-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <Heading kicker="Menuju Hari" title="Hitung Mundur" accent={accent} />
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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-3xl border-2"
              buttonClassName="inline-block rounded-full px-6 py-2.5 text-sm font-medium text-white"
              buttonStyle={{ background: accent }}
            />
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {c.galleryUrls && c.galleryUrls.length > 0 ? (
        <section className="relative mx-auto max-w-4xl px-6 py-16">
          <Heading kicker="Galeri" title="Petualangan Kami" accent={accent} />
          <div className="mt-12">
            <GalleryBlock urls={c.galleryUrls} variant="polaroid" />
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
              itemClassName="rounded-3xl border bg-white/50 p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-3xl border bg-white/50 p-6">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 rounded-3xl border bg-white/50 p-6">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <Crescent className="mx-auto h-8 w-8" color={accent} />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Terima kasih telah berbagi mimpi dan doa untuk perjalanan baru kami.
        </p>
        <p className="mt-6 font-display text-3xl italic" style={{ color: "#5a3326" }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
