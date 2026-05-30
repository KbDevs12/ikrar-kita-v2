/**
 * Minang Adat template.
 *
 * Visual identity:
 *   - Deep merah (#8b1a1a) and gold on a warm cream ground, ink-dark text.
 *   - The gonjong roofline of a rumah gadang arcs across the hero; a geometric
 *     sulur band divides the sections.
 *   - Bold serif names, strong and ceremonial.
 *   - Couple facing layout; schedule on a vertical timeline.
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

const MAROON = "#8b1a1a"
const GOLD = "#c8a35a"

function Gonjong({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 240 60" fill="none" aria-hidden="true">
      <g stroke={color} strokeWidth="2.4" fill="none" strokeOpacity="0.85">
        <path d="M10 58 C 30 58 40 18 56 6 C 50 26 56 40 78 44" />
        <path d="M86 58 C 106 58 116 18 132 6 C 126 26 132 40 154 44" />
        <path d="M162 58 C 182 58 192 18 208 6 C 202 26 208 40 230 44" />
      </g>
    </svg>
  )
}

function SulurBand({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
      <g stroke={color} strokeWidth="1.4" fill="none" strokeOpacity="0.6">
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d={`M${i * 20} 6 q 5 -7 10 0 q 5 7 10 0`} />
        ))}
      </g>
    </svg>
  )
}

function Heading({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <header className="flex flex-col items-center text-center">
      <p className="text-xs uppercase tracking-[0.36em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl" style={{ color: accent }}>
        {title}
      </h2>
      <SulurBand className="mt-4 h-3 w-40" color={GOLD} />
    </header>
  )
}

export function MinangAdat({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? MAROON
  const quote = resolveQuote("minang-adat", c)
  const groomParents = coupleParents(c.groomFatherName, c.groomMotherName)
  const brideParents = coupleParents(c.brideFatherName, c.brideMotherName)

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-[#f6efe2] text-[#2a1a16]">
      {/* Hero */}
      <header className="relative mx-auto flex min-h-[92vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <Gonjong className="h-16 w-60" color={accent} />
        <p className="mt-6 text-xs uppercase tracking-[0.44em]" style={{ color: GOLD }}>
          Walimatul &lsquo;Urs
        </p>
        <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl" style={{ color: accent }}>
          {invitation.groomName}
          <span className="mx-3 font-normal" style={{ color: "#2a1a16" }}>
            &amp;
          </span>
          {invitation.brideName}
        </h1>
        {invitation.eventDate ? (
          <p className="mt-8 font-serif text-base">
            <time dateTime={invitation.eventDate}>{formatDateID(invitation.eventDate)}</time>
          </p>
        ) : null}
        <p className="mt-10 font-serif text-sm italic opacity-70">Kepada Bapak/Ibu/Saudara/i</p>
        <p className="mt-1 font-display text-2xl" style={{ color: accent }}>
          {recipient}
        </p>
      </header>

      {invitation.coverImageUrl ? (
        <figure className="relative mx-auto max-w-2xl px-6">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border-2" style={{ borderColor: accent }}>
            <CoverPhoto src={invitation.coverImageUrl} alt={`${invitation.groomName} & ${invitation.brideName}`} priority />
          </div>
        </figure>
      ) : null}

      {/* Quote */}
      <section className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <blockquote className="font-serif text-xl italic leading-snug sm:text-2xl">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </section>

      {/* Couple */}
      <section className="relative mx-auto max-w-3xl px-6 py-16">
        <Heading kicker="Anak Daro jo Marapulai" title="Kedua Mempelai" accent={accent} />
        <div className="mt-12">
          <CoupleColumns
            accent={accent}
            variant="facing"
            groom={{ label: "Marapulai", name: invitation.groomName, parents: groomParents }}
            bride={{ label: "Anak Daro", name: invitation.brideName, parents: brideParents }}
          />
        </div>
      </section>

      {/* Schedule */}
      {c.schedule && c.schedule.length > 0 ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16">
          <Heading kicker="Baralek" title="Susunan Acara" accent={accent} />
          <div className="mt-12">
            <ScheduleList schedule={c.schedule} accent={accent} variant="timeline" />
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <Heading kicker="Manjalang Hari" title="Hitung Mundur" accent={accent} />
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
              buttonClassName="inline-block rounded-md px-6 py-2.5 text-sm font-medium text-white"
              buttonStyle={{ background: accent }}
            />
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {c.galleryUrls && c.galleryUrls.length > 0 ? (
        <section className="relative mx-auto max-w-4xl px-6 py-16">
          <Heading kicker="Galeri" title="Kenangan Kami" accent={accent} />
          <div className="mt-12">
            <GalleryBlock urls={c.galleryUrls} variant="mosaic" />
          </div>
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && c.giftAccounts && c.giftAccounts.length > 0 ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Tando Kasiah" title="Hadiah" accent={accent} />
          <div className="mt-10">
            <GiftList
              accounts={c.giftAccounts}
              accent={accent}
              itemClassName="rounded-xl border bg-white/60 p-5 text-center"
            />
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Konfirmasi Kehadiran" title="RSVP" accent={accent} />
          <div className="mt-10 rounded-xl border bg-white/60 p-6">
            <RsvpBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Guest messages */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative mx-auto max-w-xl px-6 py-16">
          <Heading kicker="Ucapan &amp; Doa" title="Pesan untuk Kami" accent={accent} />
          <div className="mt-10 rounded-xl border bg-white/60 p-6">
            <MessagesBlock invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Closing */}
      <footer className="relative mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <Gonjong className="mx-auto h-14 w-52 -scale-y-100" color={accent} />
        <p className="mt-6 font-serif text-base italic opacity-80">
          Ateh sagalo paratian sarato kahadiran, kami mangucapkan tarimo kasih.
        </p>
        <p className="mt-6 font-display text-3xl font-semibold" style={{ color: accent }}>
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}
