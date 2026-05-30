/**
 * Sundanese Nature template.
 *
 * Visual identity:
 *   - Bamboo green (#4a6741) and terracotta (#b5622a) on a soft cream ground.
 *   - Hand-drawn bamboo stalks and hanjuang leaves tuck into the corners.
 *   - Display italic names, generous air, an unhurried botanical calm.
 *   - Couple stacked vertically; schedule as bordered cards.
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

const GREEN = "#4a6741"
const TERRA = "#b5622a"

function BambooStalk({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 40 120" fill="none" aria-hidden="true">
      <g stroke={color} strokeWidth="2.4" strokeOpacity="0.5">
        <path d="M16 120 L16 4" />
        <path d="M16 30 q 14 -6 20 -2" strokeWidth="1.6" />
        <path d="M16 64 q 14 -6 20 -2" strokeWidth="1.6" />
        <line x1="9" y1="42" x2="23" y2="42" />
        <line x1="9" y1="78" x2="23" y2="78" />
      </g>
      <g fill={color} fillOpacity="0.35">
        <path d="M36 28 q 8 -4 12 2 q -8 4 -12 -2 Z" />
        <path d="M36 62 q 8 -4 12 2 q -8 4 -12 -2 Z" />
      </g>
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="text-center">
      <p className="text-xs uppercase tracking-[0.34em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-3 font-display text-3xl italic sm:text-4xl" style={{ color: GREEN }}>
        {title}
      </h2>
      <span className="mx-auto mt-4 block h-px w-16" style={{ background: TERRA }} aria-hidden="true" />
    </header>
  )
}

export function SundaneseNature({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? GREEN
  const quote = resolveQuote("sundanese-nature", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#f0ead8] text-[#33402c]">
      <BambooStalk className="pointer-events-none absolute -left-2 top-6 h-40 w-14" color={GREEN} />
      <BambooStalk className="pointer-events-none absolute -right-2 top-6 h-40 w-14 -scale-x-100" color={GREEN} />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.44em]" style={{ color: TERRA }}>
          Bismillah, Wilujeng Sumping
        </p>
        <h1 className="mt-8 font-display text-5xl italic leading-[1.05] sm:text-6xl" style={{ color: GREEN }}>
          {invitation.groomName}
          <span className="mx-3 not-italic" style={{ color: TERRA }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        {invitation.eventDate ? (
          <p className="mt-8 font-serif text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-10 font-serif text-sm italic opacity-70">Kepada Yang Terhormat</p>
        <p className="mt-1 font-display text-2xl italic" style={{ color: accent }}>
          {recipient}
        </p>
      </header>

      {/* Cover figure */}
      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-2xl px-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border-4 border-white shadow-sm">
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority />
          </div>
        </figure>
      ) : null}

      {/* Quote */}
      <section className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <blockquote className="font-display text-xl italic leading-snug sm:text-2xl" style={{ color: GREEN }}>
          &ldquo;{quote}&rdquo;
        </blockquote>
      </section>

      {/* Couple */}
      <section className="relative mx-auto max-w-3xl px-6 py-16">
        <Heading kicker="Anu Bade Tepang Jodo" title="Calon Pangantén" accent={accent} />
        <div className="mt-12">
          <CoupleColumns
            accent={accent}
            variant="stacked"
            groom={{ label: "Calon Pangantén Pria", name: invitation.groomName, parents: groomParents }}
            bride={{ label: "Calon Pangantén Wanita", name: invitation.brideName, parents: brideParents }}
          />
        </div>
      </section>

      {/* Schedule */}
      {c.schedule && c.schedule.length > 0 ? (
        <section className="relative mx-auto max-w-3xl px-6 py-16">
          <Heading kicker="Acara" title="Waktos sareng Tempat" accent={accent} />
          <div className="mt-12">
            <ScheduleList
              schedule={c.schedule}
              accent={accent}
              variant="cards"
              surfaceClassName="rounded-2xl border bg-white/60 p-6"
            />
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <Heading kicker="Ngantosan" title="Hitung Mundur" accent={accent} />
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
              mapClassName="aspect-[4/3] w-full overflow-hidden rounded-2xl border-4 border-white shadow-sm"
              buttonClassName="inline-block rounded-full px-6 py-2.5 text-sm font-medium text-white"
              buttonStyle={{ background: accent }}
            />
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {c.galleryUrls && c.galleryUrls.length > 0 ? (
        <section className="relative mx-auto max-w-4xl px-6 py-16">
          <Heading kicker="Galeri" title="Lalampahan Kami" accent={accent} />
          <div className="mt-12">
            <GalleryBlock urls={c.galleryUrls} variant="polaroid" />
          </div>
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && c.giftAccounts && c.giftAccounts.length > 0 ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Tawis Asih" title="Hadiah" accent={accent} />
          <div className="mt-10">
            <GiftList
              accounts={c.giftAccounts}
              accent={accent}
              itemClassName="rounded-2xl border bg-white/60 p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kasumpingan" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-2xl border bg-white/60 p-6">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan kanggo Kami" accent={accent} />
          <div className="mt-10 rounded-2xl border bg-white/60 p-6">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <span className="mx-auto block h-px w-16" style={{ background: TERRA }} aria-hidden="true" />
        <p className="mt-8 font-serif text-base italic opacity-80">
          Hatur nuhun kana sadaya perhatosan sareng kasumpinganana.
        </p>
        <p className="mt-6 font-display text-3xl italic" style={{ color: GREEN }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
