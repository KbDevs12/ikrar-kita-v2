/**
 * Vintage Lace template.
 *
 * Visual identity:
 *   - Ivory ground with blush (#f2c4ce), soft tan and antique gold (#b08d57).
 *   - Scalloped lace borders and a small ribbon bow recall a printed heirloom.
 *   - Cursive serif, formal and romantic.
 *   - Couple stacked; schedule cards; polaroid gallery.
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

const GOLD = "#b08d57"
const BLUSH = "#e2a8b6"

function LaceBorder({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1.2" strokeOpacity="0.7">
        {Array.from({ length: 20 }).map((_, i) => (
          <circle key={i} cx={i * 12 + 6} cy="6" r="5" />
        ))}
        <line x1="0" y1="13" x2="240" y2="13" strokeOpacity="0.4" />
      </g>
    </svg>
  )
}

function RibbonBow({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none" aria-hidden="true">
      <path d="M24 16 C 12 4 2 6 4 16 C 2 26 12 28 24 16Z" fill={color} fillOpacity="0.8" />
      <path d="M24 16 C 36 4 46 6 44 16 C 46 26 36 28 24 16Z" fill={color} fillOpacity="0.8" />
      <circle cx="24" cy="16" r="3.5" fill={GOLD} />
      <path d="M22 18 L16 30 M26 18 L32 30" stroke={color} strokeWidth="3" strokeOpacity="0.7" />
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <RibbonBow className="h-6 w-9" color={BLUSH} />
      <p className="mt-3 text-xs uppercase tracking-[0.36em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl italic sm:text-4xl" style={{ color: "#5a4636" }}>
        {title}
      </h2>
    </header>
  )
}

export function VintageLace({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? GOLD
  const quote = resolveQuote("vintage-lace", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#fbf7ef] text-[#4f4234]">
      <LaceBorder className="absolute inset-x-0 top-0 h-4 w-full" color={GOLD} />
      <LaceBorder className="absolute inset-x-0 bottom-0 h-4 w-full -scale-y-100" color={GOLD} />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <RibbonBow className="h-8 w-12" color={BLUSH} />
        <p className="mt-5 text-xs uppercase tracking-[0.44em]" style={{ color: accent }}>
          The Wedding Of
        </p>
        <h1 className="mt-6 font-display text-5xl italic leading-[1.05] sm:text-6xl" style={{ color: "#5a4636" }}>
          {invitation.groomName}
          <span className="mx-3 not-italic" style={{ color: BLUSH }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        {invitation.eventDate ? (
          <p className="mt-7 font-serif text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-8 font-serif text-sm italic opacity-70">Kepada Yth.</p>
        <p className="mt-1 font-display text-2xl italic" style={{ color: accent }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-2xl px-6">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border-2 p-1.5" style={{ borderColor: accent }}>
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority className="rounded-lg object-cover" />
          </div>
        </figure>
      ) : null}

      {/* Quote */}
      <section className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <blockquote className="font-display text-xl italic leading-snug sm:text-2xl" style={{ color: "#5a4636" }}>
          &ldquo;{quote}&rdquo;
        </blockquote>
      </section>

      {/* Couple */}
      <section className="relative mx-auto max-w-3xl px-6 py-16">
        <Heading kicker="Mempelai" title="Dua Hati" accent={accent} />
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
        <section className="relative mx-auto max-w-3xl px-6 py-16">
          <Heading kicker="Acara" title="Susunan Acara" accent={accent} />
          <div className="mt-12">
            <ScheduleList
              schedule={c.schedule}
              accent={accent}
              variant="cards"
              surfaceClassName="rounded-xl border bg-white/65 p-6"
            />
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <Heading kicker="Menuju Hari" title="Hitung Mundur" accent={accent} />
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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-xl border-2"
              buttonClassName="inline-block rounded-full px-6 py-2.5 text-sm font-medium text-white"
              buttonStyle={{ background: accent }}
            />
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {c.galleryUrls && c.galleryUrls.length > 0 ? (
        <section className="relative mx-auto max-w-4xl px-6 py-16">
          <Heading kicker="Galeri" title="Kenangan" accent={accent} />
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
              itemClassName="rounded-xl border bg-white/65 p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-xl border bg-white/65 p-6">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 rounded-xl border bg-white/65 p-6">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <RibbonBow className="mx-auto h-7 w-11" color={BLUSH} />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Dengan penuh syukur, kami menantikan kehadiran dan doa restu Anda.
        </p>
        <p className="mt-6 font-display text-3xl italic" style={{ color: "#5a4636" }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
