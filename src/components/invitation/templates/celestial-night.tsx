/**
 * Celestial Night template.
 *
 * Visual identity:
 *   - Midnight (#0a1020) to deep blue (#1a2a4a) with gilt gold and silver.
 *   - Scattered stars, a crescent moon and a faint constellation.
 *   - Serif with airy letter-spacing in gold, magical and romantic.
 *   - Couple facing; schedule timeline; cinema gallery.
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
const SILVER = "#dfe6f2"

function Star({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 C 13 8 16 11 24 12 C 16 13 13 16 12 24 C 11 16 8 13 0 12 C 8 11 11 8 12 0Z" fill={color} fillOpacity="0.85" />
    </svg>
  )
}

function Constellation({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 160 40" fill="none" aria-hidden="true">
      <polyline points="6,30 40,12 78,24 110,8 150,18" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
      <g fill={color}>
        {[
          [6, 30],
          [40, 12],
          [78, 24],
          [110, 8],
          [150, 18],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.8" />
        ))}
      </g>
    </svg>
  )
}

function Moon({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M32 5 a 19 19 0 1 0 0 38 a 15 15 0 1 1 0 -38Z" fill={color} fillOpacity="0.9" />
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Star className="h-5 w-5" color={accent} />
      <p className="mt-3 text-xs uppercase tracking-[0.46em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl tracking-[0.06em] sm:text-4xl" style={{ color: SILVER }}>
        {title}
      </h2>
    </header>
  )
}

export function CelestialNight({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? GOLD
  const quote = resolveQuote("celestial-night", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article
      id="top"
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a1020 0%, #1a2a4a 100%)", color: SILVER }}
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
            fallback={<div className="h-full w-full" style={{ background: "radial-gradient(circle at 70% 18%, #243a63 0%, #0a1020 65%)" }} />}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,16,32,0.5), rgba(10,16,32,0.9))" }} />
        </div>
        <Star className="absolute left-10 top-24 h-3 w-3" color={SILVER} />
        <Star className="absolute right-12 top-40 h-2 w-2" color={SILVER} />
        <Star className="absolute left-1/4 top-64 h-2 w-2" color={GOLD} />
        <Moon className="absolute right-8 top-12 h-10 w-10" color={GOLD} />

        <div className="relative z-10 flex flex-col items-center">
          <Constellation className="h-10 w-44" color={accent} />
          <p className="mt-5 text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>
            Written In The Stars
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.08] tracking-[0.05em] sm:text-6xl" style={{ color: SILVER }}>
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
          <p className="mt-8 text-xs uppercase tracking-[0.3em] opacity-70">Kepada</p>
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
        <Heading kicker="Two Stars" title="Mempelai" accent={accent} />
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
        <section className="relative mx-auto max-w-2xl px-6 py-16">
          <Heading kicker="Agenda" title="Susunan Acara" accent={accent} />
          <div className="mt-12">
            <ScheduleList schedule={c.schedule} accent={accent} variant="timeline" />
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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/15"
              buttonClassName="inline-block rounded-full px-6 py-2.5 text-sm font-medium"
              buttonStyle={{ background: accent, color: "#0a1020" }}
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
              itemClassName="rounded-xl border border-white/15 bg-white/5 p-5 text-center"
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
        <Constellation className="mx-auto h-10 w-44" color={accent} />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Di bawah langit yang sama, terima kasih atas doa dan kehadiran Anda.
        </p>
        <p className="mt-6 font-display text-3xl tracking-[0.06em]" style={{ color: SILVER }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="dark" />
    </article>
  )
}
