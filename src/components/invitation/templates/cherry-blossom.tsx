/**
 * Cherry Blossom template.
 *
 * Visual identity:
 *   - Soft pink (#c25e7a accent), white, warm wood brown and a touch of sage.
 *   - A long sakura branch arcs over the hero; petals drift on the dividers.
 *   - Display italic with a poetic, Japanese-inflected calm.
 *   - Couple stacked; schedule hairline list; polaroid gallery.
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

const PINK = "#c25e7a"
const WOOD = "#6b3a2a"

function SakuraBranch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 60" fill="none" aria-hidden="true">
      <path d="M2 50 C 40 40 80 44 158 10" stroke={WOOD} strokeWidth="2" strokeOpacity="0.55" />
      {[
        [40, 40],
        [78, 40],
        [118, 24],
        [150, 12],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          {Array.from({ length: 5 }).map((_, p) => (
            <ellipse key={p} cx="0" cy="-5" rx="3" ry="5.5" fill="#f2a0b0" transform={`rotate(${p * 72})`} />
          ))}
          <circle r="1.8" fill={PINK} />
        </g>
      ))}
    </svg>
  )
}

function Petal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 1 C 16 6 16 14 10 19 C 4 14 4 6 10 1Z" fill="#f2a0b0" fillOpacity="0.8" />
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Petal className="h-5 w-5" />
      <p className="mt-3 text-xs uppercase tracking-[0.34em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl italic sm:text-4xl" style={{ color: WOOD }}>
        {title}
      </h2>
    </header>
  )
}

export function CherryBlossom({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? PINK
  const quote = resolveQuote("cherry-blossom", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#fdf6f7] text-[#4a3a36]">
      <SakuraBranch className="pointer-events-none absolute left-0 top-0 h-24 w-64" />
      <SakuraBranch className="pointer-events-none absolute right-0 top-10 h-20 w-52 -scale-x-100" />

      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.46em]" style={{ color: accent }}>
          Haru no Hi &middot; Hari Bahagia
        </p>
        <h1 className="mt-8 font-display text-5xl italic leading-[1.05] sm:text-7xl" style={{ color: WOOD }}>
          {invitation.groomName}
          <span className="mx-3 not-italic" style={{ color: accent }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        <Petal className="mt-8 h-5 w-5" />
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
        <blockquote className="font-display text-xl italic leading-snug sm:text-2xl" style={{ color: WOOD }}>
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
        <Petal className="mx-auto h-6 w-6" />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Arigatou. Terima kasih atas kehadiran dan doa restu yang tulus untuk kami.
        </p>
        <p className="mt-6 font-display text-3xl italic" style={{ color: WOOD }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
