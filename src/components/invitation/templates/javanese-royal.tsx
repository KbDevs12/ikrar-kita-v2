/**
 * Javanese Royal template.
 *
 * Visual identity:
 *   - Deep keraton brown ground (#3d2314 -> #2a1810) with gilt gold (#c8a35a)
 *     and warm cream (#f5edd8) text.
 *   - Thin parang-rusak motif bands frame the hero and the footer.
 *   - Oversized serif display for the names, restrained sans for the details.
 *   - Schedule kept as a quiet hairline list; couple sides face a centred "&".
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

/** Repeating parang-rusak band - drawn as flowing diagonal strokes. */
function ParangBand({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1.4" strokeOpacity="0.6">
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M${i * 20} 16 Q ${i * 20 + 7} 2 ${i * 20 + 13} 11 T ${i * 20 + 24} 7`} />
        ))}
      </g>
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="text-center">
      <p className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl" style={{ color: CREAM }}>
        {title}
      </h2>
      <ParangBand className="mx-auto mt-4 h-3 w-44" color={accent} />
    </header>
  )
}

export function JavaneseRoyal({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? GOLD
  const quote = resolveQuote("javanese-royal", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article
      id="top"
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #3d2314 0%, #2a1810 100%)", color: CREAM }}
    >
      {/* Hero */}
      <header className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0" aria-hidden="true">
          <CoverPhoto
            src={invitation.coverImageUrl}
            alt=""
            sizes="100vw"
            priority
            className="object-cover opacity-40"
            fallback={<div className="h-full w-full" style={{ background: "radial-gradient(circle at 50% 30%, #5a3a22 0%, #2a1810 70%)" }} />}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(42,24,16,0.55) 0%, rgba(42,24,16,0.85) 100%)" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <ParangBand className="h-4 w-56" color={accent} />
          <p className="mt-6 text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>
            Dhauping Putra-Putri
          </p>
          <h1 className="mt-8 font-display text-5xl leading-[1.05] sm:text-7xl" style={{ color: CREAM }}>
            {invitation.groomName}
            <span className="mx-3 align-middle text-3xl" style={{ color: accent }}>
              &amp;
            </span>
            {invitation.brideName}
          </h1>
          {invitation.eventDate ? (
            <p className="mt-8 font-serif text-base">
              <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
            </p>
          ) : null}
          <p className="mt-10 font-serif text-sm italic opacity-80">Kepada Yth.</p>
          <p className="mt-1 font-display text-2xl" style={{ color: accent }}>
            {recipient}
          </p>
          <ParangBand className="mt-8 h-4 w-56" color={accent} />
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
        <Heading kicker="Sungkem lan Pangestu" title="Kedua Mempelai" accent={accent} />
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
          <Heading kicker="Tata Cara" title="Susunan Acara" accent={accent} />
          <div className="mt-12">
            <ScheduleList schedule={c.schedule} accent={accent} variant="list" />
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <Heading kicker="Ngentosi Dinten" title="Hitung Mundur" accent={accent} />
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
            <address className="mt-3 text-center font-serif text-base not-italic opacity-85">
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
              buttonStyle={{ background: accent, color: "#2a1810" }}
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
        <ParangBand className="mx-auto h-4 w-56" color={accent} />
        <p className="mt-8 font-serif text-base italic opacity-85">
          Maturnuwun awit rawuh saha pangestu ingkang sampun kaparingaken.
        </p>
        <p className="mt-6 font-display text-3xl" style={{ color: accent }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="dark" />
    </article>
  )
}
