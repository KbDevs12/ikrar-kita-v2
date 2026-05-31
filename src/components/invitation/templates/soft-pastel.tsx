/**
 * Soft Pastel template.
 *
 * Visual identity:
 *   - Peach + lilac wash with watercolor-feel splotches
 *   - Soft rounded shapes (everything is at least 16px radius)
 *   - Display serif italic for couple names
 *   - Layout: vertical-centric, intimate, wedding-stationery feel
 *   - Uses small floating cards that overlap softly
 */
import Link from "next/link"
import Image from "next/image"
import {
  type InvitationContent,
  type InvitationTemplateProps,
  getDefaultOpeningQuote,
  readContent,
} from "./types"
import { Gallery } from "../sections/gallery"
import { MapEmbed, buildGoogleMapsHref } from "../sections/map-embed"
import { BackToTop } from "../sections/back-to-top"
import { Countdown } from "../sections/countdown"
import { formatScheduleDate, formatScheduleRange } from "../sections/section-helpers"
import { PublicRsvpForm } from "../sections/rsvp-form"
import { PublicGuestMessageForm } from "../sections/guest-message-form"
import { GuestMessagesList } from "../sections/guest-messages-list"
import { formatDateID } from "@/lib/utils"


export function SoftPastel({ invitation, recipient }: InvitationTemplateProps) {
  const c = readContent(invitation.content)
  const accent = invitation.primaryColor ?? "#b65538"
  const quote = c.openingQuote?.trim() || getDefaultOpeningQuote("soft-pastel")

  return (
    <article id="top" className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fdf6f3] via-[#fbeae5] to-[#f6e7ee] text-rose-900">
      {/* Soft watercolour blobs - decorative only */}
      <div
        className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-rose-300/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-12 left-12 h-72 w-72 rounded-full bg-[#e7d3e5]/45 blur-3xl"
        aria-hidden
      />

      {/* Hero */}
      <header className="relative z-10 mx-auto flex min-h-[90vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <span className="rounded-full bg-white/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-rose-700 ring-1 ring-rose-200">
          Save the date
        </span>
        <h1 className="mt-10 font-display text-5xl italic leading-[0.95] sm:text-6xl">
          {invitation.groomName}
          <span className="mx-2 not-italic text-rose-400">&amp;</span>
          {invitation.brideName}
        </h1>
        {invitation.eventDate ? (
          <p className="mt-6 font-serif text-base italic">
            {formatDateID(invitation.eventDate)}
          </p>
        ) : null}
        <div
          className="mx-auto mt-10 inline-flex items-center gap-2 rounded-full bg-white/70 px-5 py-2 text-sm shadow-sm ring-1 ring-rose-200/70 backdrop-blur"
          aria-label="recipient"
        >
          <span className="text-xs uppercase tracking-widest text-rose-500">untuk</span>
          <span className="font-medium">{recipient}</span>
        </div>
      </header>

      {/* Quote */}
      <section className="relative z-10 mx-auto max-w-xl px-6 py-16 text-center">
        <blockquote className="font-serif text-xl italic leading-snug text-rose-700 sm:text-2xl">
          “{quote}”
        </blockquote>
      </section>

      {/* Couple - overlapping pastel cards */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <div className="flex flex-col gap-6 sm:flex-row">
          <PersonCard
            label="Sang Mempelai Pria"
            name={invitation.groomName}
            parents={[c.groomFatherName, c.groomMotherName].filter(Boolean) as string[]}
            tilt="-rotate-[1deg]"
          />
          <PersonCard
            label="Sang Mempelai Wanita"
            name={invitation.brideName}
            parents={[c.brideFatherName, c.brideMotherName].filter(Boolean) as string[]}
            tilt="rotate-[1.5deg] sm:translate-y-6"
          />
        </div>
      </section>

      {/* Schedule */}
      {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16">
          <SoftHeading kicker="Susunan Acara" title="Hari yang kami nantikan" />
          <div className="mt-10 space-y-5">
            {c.schedule.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-rose-200/60 backdrop-blur"
              >
                <p
                  className="text-xs uppercase tracking-[0.25em]"
                  style={{ color: accent }}
                >
                  {item.label}
                </p>
                <p className="mt-2 font-display text-xl italic">{formatScheduleDate(item)}</p>
                <p className="mt-0.5 text-sm text-rose-700/80">{formatScheduleRange(item)}</p>
                {item.notes ? (
                  <p className="mt-2 text-sm italic text-rose-700/70">{item.notes}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Countdown */}
      {invitation.eventDate ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-12">
          <SoftHeading kicker="Menuju Hari" title="Hitung mundur" />
          <div className="mt-8">
            <Countdown target={invitation.eventDate} variant="soft" />
          </div>
        </section>
      ) : null}

      {/* Map */}
      {invitation.venueName ? (
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-16">
          <SoftHeading kicker="Lokasi Acara" title={invitation.venueName} />
          {invitation.venueAddress ? (
            <p className="mt-3 text-center font-serif text-base italic text-rose-700/80">
              {invitation.venueAddress}
            </p>
          ) : null}
          <div className="mt-8">
            <MapEmbed
              latitude={invitation.latitude}
              longitude={invitation.longitude}
              mapsUrl={c.mapsUrl}
              venueName={invitation.venueName}
              className="aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-rose-200/60"
            />
          </div>
          <div className="mt-6 text-center">
            <Link
              href={buildGoogleMapsHref({
                latitude: invitation.latitude,
                longitude: invitation.longitude,
                mapsUrl: c.mapsUrl,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-rose-700/90 px-5 py-2.5 text-sm text-rose-50 shadow-sm hover:bg-rose-800"
            >
              Buka di Google Maps
            </Link>
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {Array.isArray(c.galleryUrls) && c.galleryUrls.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
          <SoftHeading kicker="Galeri Manis" title="Catatan momen" />
          <div className="mt-10">
            <Gallery urls={c.galleryUrls} variant="polaroid" />
          </div>
        </section>
      ) : null}

      {/* Gift */}
      {c.giftEnabled && Array.isArray(c.giftAccounts) && c.giftAccounts.length > 0 ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <SoftHeading kicker="Tanda Kasih" title="Bila berkenan" />
          <p className="mt-3 text-center text-sm text-rose-700/80">
            Doa restu Anda jauh lebih bermakna daripada apa pun.
          </p>
          <ul className="mt-8 space-y-4">
            {c.giftAccounts.map((g, i) => (
              <li
                key={i}
                className="rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-rose-200/60"
              >
                <p className="text-xs uppercase tracking-widest text-rose-500">{g.bankName}</p>
                <p className="mt-1 font-mono text-lg" style={{ color: accent }}>
                  {g.accountNumber}
                </p>
                <p className="text-sm">a.n. {g.accountHolder}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* RSVP */}
      {c.rsvpEnabled !== false ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <SoftHeading kicker="Konfirmasi Kehadiran" title="RSVP" />
          <p className="mt-3 text-center text-sm text-rose-700/80">
            Mohon konfirmasi agar kami dapat menyiapkan tempat dengan baik.
          </p>
          <div className="mt-8 rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-rose-200/60 backdrop-blur sm:p-6">
            <PublicRsvpForm invitationId={invitation.id} tone="light" accent={accent} />
          </div>
        </section>
      ) : null}

      {/* Ucapan */}
      {c.guestMessageEnabled !== false ? (
        <section className="relative z-10 mx-auto max-w-xl px-6 py-16">
          <SoftHeading kicker="Ucapan &amp; Doa" title="Pesan untuk pasangan" />
          <div className="mt-8 rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-rose-200/60 backdrop-blur sm:p-6">
            <PublicGuestMessageForm
              invitationId={invitation.id}
              tone="light"
              accent={accent}
            />
          </div>
          <div className="mt-8">
            <GuestMessagesList invitationId={invitation.id} tone="light" />
          </div>
        </section>
      ) : null}

      <footer className="relative z-10 mx-auto max-w-xl px-6 pb-24 pt-12 text-center">
        <p className="font-display text-2xl italic">
          {invitation.groomName} &amp; {invitation.brideName}
        </p>
        <p className="mt-3 text-sm text-rose-700/70">
          Terima kasih atas doa dan kehadiran Anda.
        </p>
        <p className="mt-6 text-xs">
          <a href="#top" className="text-rose-700/60 underline-offset-4 hover:text-rose-900 hover:underline">
            Kembali ke atas ↑
          </a>
        </p>
      </footer>

      <BackToTop tone="light" />
    </article>
  )
}

function SoftHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <header className="text-center">
      <span className="text-[10px] uppercase tracking-[0.32em] text-rose-500">{kicker}</span>
      <h2 className="mt-2 font-display text-3xl italic text-rose-900">{title}</h2>
    </header>
  )
}

function PersonCard({
  label,
  name,
  parents,
  tilt,
}: {
  label: string
  name: string
  parents: string[]
  tilt: string
}) {
  return (
    <div
      className={`relative flex-1 rounded-3xl bg-white/75 p-7 text-center shadow-sm ring-1 ring-rose-200/60 backdrop-blur transition ${tilt}`}
    >
      <p className="text-[10px] uppercase tracking-[0.32em] text-rose-500">{label}</p>
      <h3 className="mt-3 font-display text-3xl italic">{name}</h3>
      {parents.length > 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-rose-700/80">
          Putra/i dari Bapak {parents[0]}
          {parents[1] ? ` dan Ibu ${parents[1]}` : ""}
        </p>
      ) : null}
    </div>
  )
}
