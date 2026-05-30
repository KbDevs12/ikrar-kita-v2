/**
 * Art Deco template.
 *
 * Visual identity:
 *   - 1920s glamour: gilt gold (#c8a35a) on near-black (#1a1410), cream text,
 *     a whisper of deep red.
 *   - Sunburst fans, stepped chevrons and symmetric geometry.
 *   - Decorative serif with wide letter-spacing.
 *   - Couple facing; schedule as framed cards; classic countdown.
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
const CREAM = "#f5edd8"

function Sunburst({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" aria-hidden="true">
      <g stroke={color} strokeWidth="1.4" strokeOpacity="0.85">
        {Array.from({ length: 13 }).map((_, i) => {
          const a = (Math.PI * i) / 12
          return <line key={i} x1="60" y1="58" x2={60 - Math.cos(a) * 56} y2={58 - Math.sin(a) * 52} />
        })}
      </g>
      <path d="M30 58 A 30 30 0 0 1 90 58" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

function Chevron({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1.4" strokeOpacity="0.8">
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={`M${i * 15} 10 L${i * 15 + 7.5} 2 L${i * 15 + 15} 10`} />
        ))}
      </g>
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <p className="text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.18em] sm:text-4xl" style={{ color: CREAM }}>
        {title}
      </h2>
      <Chevron className="mt-4 h-3 w-40" color={accent} />
    </header>
  )
}

export function ArtDeco({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? GOLD
  const quote = resolveQuote("art-deco", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article
      id="top"
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#1a1410", color: CREAM }}
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
            fallback={<div className="h-full w-full" style={{ background: "radial-gradient(circle at 50% 0%, #2a2018 0%, #120e0a 70%)" }} />}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(18,14,10,0.6), rgba(18,14,10,0.9))" }} />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <Sunburst className="h-16 w-32" color={accent} />
          <p className="mt-6 text-xs uppercase tracking-[0.6em]" style={{ color: accent }}>
            We Are Getting Married
          </p>
          <h1 className="mt-6 font-display text-5xl uppercase leading-[1.1] tracking-[0.12em] sm:text-6xl" style={{ color: CREAM }}>
            {invitation.groomName}
            <span className="mx-3" style={{ color: accent }}>
              &amp;
            </span>
            {invitation.brideName}
          </h1>
          <Chevron className="mt-6 h-3 w-44" color={accent} />
          {invitation.eventDate ? (
            <p className="mt-6 font-serif text-base tracking-wide">
              <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
            </p>
          ) : null}
          <p className="mt-8 text-xs uppercase tracking-[0.3em] opacity-70">Kepada</p>
          <p className="mt-1 font-display text-2xl tracking-[0.1em]" style={{ color: accent }}>
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
              surfaceClassName="rounded-none border border-white/15 p-6"
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
              mapClassName="aspect-[4/3] w-full overflow-hidden border border-white/15"
              buttonClassName="inline-block px-6 py-2.5 text-sm font-medium uppercase tracking-[0.2em]"
              buttonStyle={{ background: accent, color: "#1a1410" }}
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
              itemClassName="border border-white/15 bg-white/5 p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 border border-white/10 bg-white/5 p-6">
            <RsvpBlock invitationId={invitation.id} tone="dark" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 border border-white/10 bg-white/5 p-6">
            <MessagesBlock invitationId={invitation.id} tone="dark" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <Sunburst className="mx-auto h-14 w-28 rotate-180" color={accent} />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Sebuah kehormatan apabila Anda berkenan hadir merayakan malam ini bersama kami.
        </p>
        <p className="mt-6 font-display text-3xl uppercase tracking-[0.14em]" style={{ color: accent }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="dark" />
    </article>
  )
}
