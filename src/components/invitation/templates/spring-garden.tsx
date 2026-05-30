/**
 * Spring Garden template.
 *
 * Visual identity:
 *   - Sage (#7a9e7e) and blush (#f2c4ce) on white, fresh and feminine.
 *   - Sakura sprigs and tulips bloom at the corners and dividers.
 *   - Light serif italic, airy spacing.
 *   - Couple stacked; schedule as hairline rows; polaroid gallery.
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

const SAGE = "#7a9e7e"
const BLUSH = "#f2c4ce"

function SakuraSprig({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path d="M4 76 C 30 60 44 40 70 8" stroke={SAGE} strokeWidth="2" strokeOpacity="0.6" />
      {[
        [60, 16],
        [44, 34],
        [30, 50],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          {Array.from({ length: 5 }).map((_, p) => (
            <ellipse key={p} cx="0" cy="-6" rx="3.4" ry="6" fill={BLUSH} transform={`rotate(${p * 72})`} />
          ))}
          <circle r="2" fill="#e8a0b4" />
        </g>
      ))}
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <SakuraSprig className="h-9 w-9" />
      <p className="mt-3 text-xs uppercase tracking-[0.34em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl italic sm:text-4xl" style={{ color: "#3f5840" }}>
        {title}
      </h2>
    </header>
  )
}

export function SpringGarden({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? SAGE
  const quote = resolveQuote("spring-garden", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#fbfcf8] text-[#3a463a]">
      <SakuraSprig className="pointer-events-none absolute left-0 top-0 h-28 w-28" />
      <SakuraSprig className="pointer-events-none absolute right-0 top-0 h-28 w-28 -scale-x-100" />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.46em]" style={{ color: "#c98aa0" }}>
          The Wedding Of
        </p>
        <h1 className="mt-8 font-display text-5xl italic leading-[1.05] sm:text-7xl" style={{ color: "#3f5840" }}>
          {invitation.groomName}
          <span className="mx-3 not-italic" style={{ color: "#c98aa0" }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        <span className="mt-8 block h-px w-20" style={{ background: BLUSH }} aria-hidden="true" />
        {invitation.eventDate ? (
          <p className="mt-6 font-serif text-base">
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
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border-4 border-white shadow-sm">
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority />
          </div>
        </figure>
      ) : null}

      {/* Quote */}
      <section className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <blockquote className="font-display text-xl italic leading-snug sm:text-2xl" style={{ color: "#3f5840" }}>
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
        <section className="relative mx-auto max-w-2xl px-6 py-16">
          <Heading kicker="Acara" title="Susunan Acara" accent={accent} />
          <div className="mt-12">
            <ScheduleList schedule={c.schedule} accent={accent} variant="list" />
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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-[2rem] border-4 border-white shadow-sm"
              buttonClassName="inline-block rounded-full px-6 py-2.5 text-sm font-medium text-white"
              buttonStyle={{ background: accent }}
            />
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {c.galleryUrls && c.galleryUrls.length > 0 ? (
        <section className="relative mx-auto max-w-4xl px-6 py-16">
          <Heading kicker="Galeri" title="Momen Kami" accent={accent} />
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
              itemClassName="rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-sm"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <SakuraSprig className="mx-auto h-10 w-10" />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Terima kasih atas kehadiran dan doa restu yang tulus untuk kami berdua.
        </p>
        <p className="mt-6 font-display text-3xl italic" style={{ color: "#3f5840" }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
