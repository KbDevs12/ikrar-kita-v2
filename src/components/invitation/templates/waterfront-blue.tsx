/**
 * Waterfront Blue template.
 *
 * Visual identity:
 *   - Deep navy (#1a2a4a) ground with sky blue (#7ab0d4) and silver-white.
 *   - Fine wave lines and a small anchor mark the nautical mood.
 *   - Clean nautical sans, confident and calm.
 *   - Couple split; schedule on a timeline; cinema gallery.
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

const SKY = "#7ab0d4"
const WHITE = "#eef4fa"

function Waves({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 240 24" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1.6" strokeOpacity="0.6">
        <path d="M0 9 q 20 -7 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" />
        <path d="M0 17 q 20 -7 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" strokeOpacity="0.3" />
      </g>
    </svg>
  )
}

function Anchor({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 40 48" fill="none" aria-hidden="true">
      <g stroke={color} strokeWidth="2" strokeOpacity="0.85" fill="none">
        <circle cx="20" cy="7" r="4" />
        <line x1="20" y1="11" x2="20" y2="40" />
        <line x1="11" y1="18" x2="29" y2="18" />
        <path d="M6 30 q 0 12 14 12 q 14 0 14 -12" />
      </g>
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <p className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-sans text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: WHITE }}>
        {title}
      </h2>
      <Waves className="mt-4 h-4 w-40" color={accent} />
    </header>
  )
}

export function WaterfrontBlue({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? SKY
  const quote = resolveQuote("waterfront-blue", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article
      id="top"
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #1a2a4a 0%, #0f1a30 100%)", color: WHITE }}
    >
      {/* Hero */}
      <header className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0" aria-hidden="true">
          <CoverPhoto
            src={invitation.coverImageUrl}
            alt=""
            sizes="100vw"
            priority
            className="object-cover opacity-35"
            fallback={<div className="h-full w-full" style={{ background: "radial-gradient(circle at 50% 20%, #25406b 0%, #0f1a30 70%)" }} />}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,26,48,0.55), rgba(15,26,48,0.9))" }} />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <Anchor className="h-12 w-10" color={accent} />
          <p className="mt-5 text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>
            The Wedding Of
          </p>
          <h1 className="mt-6 font-sans text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl" style={{ color: WHITE }}>
            {invitation.groomName}
            <span className="block text-3xl font-light" style={{ color: accent }}>
              &amp;
            </span>
            {invitation.brideName}
          </h1>
          <Waves className="mt-6 h-5 w-48" color={accent} />
          {invitation.eventDate ? (
            <p className="mt-6 font-sans text-base">
              <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
            </p>
          ) : null}
          <p className="mt-8 text-xs uppercase tracking-[0.3em] opacity-70">Kepada</p>
          <p className="mt-1 font-sans text-2xl font-semibold" style={{ color: accent }}>
            {recipient}
          </p>
        </div>
      </header>

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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/15"
              buttonClassName="inline-block rounded-full px-6 py-2.5 text-sm font-medium"
              buttonStyle={{ background: accent, color: "#0f1a30" }}
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
        <Anchor className="mx-auto h-12 w-10" color={accent} />
        <p className="mt-6 font-sans text-base font-light leading-relaxed opacity-80">
          Terima kasih telah berlayar bersama kami menuju babak baru kehidupan ini.
        </p>
        <p className="mt-6 font-sans text-3xl font-bold tracking-tight" style={{ color: WHITE }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="dark" />
    </article>
  )
}
