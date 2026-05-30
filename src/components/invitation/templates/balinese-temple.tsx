/**
 * Balinese Temple template.
 *
 * Visual identity:
 *   - Warm cream ground with burnt orange (#d4631a) and gilt accents, deep
 *     ink for text.
 *   - A candi-bentar (split temple gate) crowns the hero; frangipani
 *     (kamboja) blooms punctuate the dividers.
 *   - Decorative serif, centred and ceremonial.
 *   - Couple split grid; schedule as rounded ribbons.
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

const ORANGE = "#d4631a"
const GOLD = "#c8a35a"

function Frangipani({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <g fill={color} fillOpacity="0.85">
        {Array.from({ length: 5 }).map((_, i) => (
          <ellipse key={i} cx="24" cy="13" rx="6" ry="11" transform={`rotate(${i * 72} 24 24)`} />
        ))}
      </g>
      <circle cx="24" cy="24" r="4" fill="#f4d35e" />
    </svg>
  )
}

function CandiBentar({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 200 80" fill="none" aria-hidden="true">
      <g fill={color} fillOpacity="0.85">
        <path d="M10 80 L10 26 L34 10 L40 14 L40 80 Z" />
        <path d="M190 80 L190 26 L166 10 L160 14 L160 80 Z" />
      </g>
      <g stroke={color} strokeWidth="2" strokeOpacity="0.6">
        <path d="M14 36 H36 M14 48 H36 M14 60 H36" />
        <path d="M164 36 H186 M164 48 H186 M164 60 H186" />
      </g>
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Frangipani className="h-7 w-7" color={accent} />
      <p className="mt-3 text-xs uppercase tracking-[0.36em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl sm:text-4xl" style={{ color: "#5a2d10" }}>
        {title}
      </h2>
    </header>
  )
}

export function BalineseTemple({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? ORANGE
  const quote = resolveQuote("balinese-temple", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#f5edd8] text-[#3a2415]">
      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <CandiBentar className="h-20 w-52" color={accent} />
        <p className="mt-6 text-xs uppercase tracking-[0.46em]" style={{ color: GOLD }}>
          Om Swastiastu
        </p>
        <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl" style={{ color: "#5a2d10" }}>
          {invitation.groomName}
          <span className="mx-3" style={{ color: accent }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        {invitation.eventDate ? (
          <p className="mt-8 font-serif text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-10 font-serif text-sm italic opacity-70">Kepada Yth.</p>
        <p className="mt-1 font-display text-2xl" style={{ color: accent }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-2xl px-6">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border-2" style={{ borderColor: GOLD }}>
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority />
          </div>
        </figure>
      ) : null}

      {/* Quote */}
      <section className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <Frangipani className="mx-auto h-8 w-8" color={accent} />
        <blockquote className="mt-6 font-serif text-xl italic leading-snug sm:text-2xl">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </section>

      {/* Couple */}
      <section className="relative mx-auto max-w-3xl px-6 py-16">
        <Heading kicker="Penganten" title="Kedua Mempelai" accent={accent} />
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
          <Heading kicker="Upacara" title="Susunan Acara" accent={accent} />
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
          <Heading kicker="Nyanggra Rahina" title="Hitung Mundur" accent={accent} />
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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-2xl border-2"
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
            <GalleryBlock urls={c.galleryUrls} variant="circle" />
          </div>
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && c.giftAccounts && c.giftAccounts.length > 0 ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Punia" title="Hadiah" accent={accent} />
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
        <Frangipani className="mx-auto h-8 w-8" color={accent} />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Om Santih, Santih, Santih, Om. Terima kasih atas kehadiran dan doa restunya.
        </p>
        <p className="mt-6 font-display text-3xl" style={{ color: "#5a2d10" }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
