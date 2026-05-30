/**
 * Folk Art template.
 *
 * Visual identity:
 *   - Scandinavian folk palette: red (#c41e1e), blue (#1e3a8a), yellow
 *     (#e8c32a), white and ink black.
 *   - Hand-drawn folk flowers, a little bird and hearts.
 *   - Bold playful sans, cheerful and handcrafted.
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

const RED = "#c41e1e"
const BLUE = "#1e3a8a"
const YELLOW = "#e8c32a"

function FolkFlower({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <g>
        {Array.from({ length: 6 }).map((_, i) => (
          <ellipse key={i} cx="24" cy="11" rx="4.5" ry="9" fill={BLUE} fillOpacity="0.85" transform={`rotate(${i * 60} 24 24)`} />
        ))}
        <circle cx="24" cy="24" r="6" fill={YELLOW} />
        <circle cx="24" cy="24" r="2.5" fill={RED} />
      </g>
    </svg>
  )
}

function FolkBird({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 40" aria-hidden="true">
      <path d="M6 26 C 14 10 30 10 40 18 C 44 20 46 16 44 12 C 44 24 32 34 18 34 C 12 34 8 30 6 26Z" fill={RED} fillOpacity="0.85" />
      <circle cx="36" cy="17" r="1.6" fill="#ffffff" />
      <path d="M18 34 l -4 6 M24 34 l -2 6" stroke={YELLOW} strokeWidth="2" />
    </svg>
  )
}

function Heart({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21 C 4 14 2 9 6 6 C 9 4 12 7 12 9 C 12 7 15 4 18 6 C 22 9 20 14 12 21Z" fill={color} fillOpacity="0.85" />
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <FolkFlower className="h-7 w-7" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-sans text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: BLUE }}>
        {title}
      </h2>
    </header>
  )
}

export function FolkArt({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? RED
  const quote = resolveQuote("folk-art", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#fdfbf4] text-[#272320]">
      <FolkFlower className="pointer-events-none absolute left-4 top-4 h-12 w-12" />
      <FolkBird className="pointer-events-none absolute right-5 top-6 h-10 w-12" />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5" color={RED} />
          <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: accent }}>
            Kami Menikah
          </p>
          <Heart className="h-5 w-5" color={RED} />
        </div>
        <h1 className="mt-6 font-sans text-5xl font-bold leading-[1.0] tracking-tight sm:text-7xl" style={{ color: BLUE }}>
          {invitation.groomName}
          <span className="block text-3xl font-light" style={{ color: accent }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        <FolkFlower className="mt-6 h-8 w-8" />
        {invitation.eventDate ? (
          <p className="mt-5 font-sans text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-8 text-xs uppercase tracking-[0.2em] opacity-70">Untuk</p>
        <p className="mt-1 font-sans text-2xl font-bold" style={{ color: accent }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-2xl px-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-4" style={{ borderColor: YELLOW }}>
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
        <Heading kicker="Mempelai" title="Dua Hati" accent={accent} />
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
          <Heading kicker="Acara" title="Susunan Acara" accent={accent} />
          <div className="mt-12">
            <ScheduleList
              schedule={c.schedule}
              accent={accent}
              variant="cards"
              surfaceClassName="rounded-2xl border-2 bg-white p-6"
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
              buttonStyle={{ background: BLUE }}
            />
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {c.galleryUrls && c.galleryUrls.length > 0 ? (
        <section className="relative mx-auto max-w-4xl px-6 py-16">
          <Heading kicker="Galeri" title="Momen Kami" accent={accent} />
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
              itemClassName="rounded-2xl border-2 bg-white p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-2xl border-2 bg-white p-6">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 rounded-2xl border-2 bg-white p-6">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <div className="flex items-center justify-center gap-3">
          <Heart className="h-5 w-5" color={RED} />
          <FolkFlower className="h-8 w-8" />
          <Heart className="h-5 w-5" color={RED} />
        </div>
        <p className="mt-6 font-sans text-base font-light leading-relaxed opacity-80">
          Terima kasih atas kehadiran dan doa yang hangat untuk kami berdua.
        </p>
        <p className="mt-6 font-sans text-3xl font-bold tracking-tight" style={{ color: BLUE }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
