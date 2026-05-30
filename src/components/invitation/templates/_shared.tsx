/**
 * Shared building blocks for invitation templates.
 *
 * The 30 templates each own their visual language - palette, typography,
 * ornaments, backgrounds, section ordering and layout variants. What they do
 * NOT need to re-implement is the wiring for the interactive / data-bound
 * sections (map, gallery lazy-loading, countdown, RSVP, guest messages, gift
 * accounts). Those live here once, wrapped in a per-section error boundary so
 * a single failure never blanks the whole page.
 *
 * Everything in this module is server-renderable (no hooks). Client pieces
 * are delegated to the section components under `../sections/`.
 */
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { type CSSProperties, type ReactNode } from "react"
import { type InvitationContent, getDefaultOpeningQuote } from "./types"
import { SectionBoundary } from "./_section-boundary"
import { Countdown } from "../sections/countdown"
import { Gallery } from "../sections/gallery"
import { MapEmbed, buildGoogleMapsHref } from "../sections/map-embed"
import { PublicRsvpForm } from "../sections/rsvp-form"
import { PublicGuestMessageForm } from "../sections/guest-message-form"
import { GuestMessagesList } from "../sections/guest-messages-list"
import {
  formatScheduleDate,
  formatScheduleRange,
  type ScheduleItemData,
} from "../sections/section-helpers"
import { type FormTone } from "../sections/public-form-styles"

export type GalleryVariant = "mosaic" | "polaroid" | "cinema" | "circle"
export type CountdownVariant = "classic" | "minimal" | "soft"

interface GiftAccountView {
  bankName: string
  accountNumber: string
  accountHolder: string
}

// Heavier galleries get their own chunk so a 20-photo invitation does not
// inflate the first paint. `next/dynamic` (no `ssr:false` - this stays
// server-renderable) gives us the split point.
const LazyGallery = dynamic(() => import("../sections/gallery").then((m) => m.Gallery))

// ─── Pure helpers ────────────────────────────────────────────────────────────

/** Opening quote with a template-specific fallback when the owner left it blank. */
export function resolveQuote(theme: string, content: InvitationContent): string {
  const written = content.openingQuote?.trim()
  return written && written.length > 0 ? written : getDefaultOpeningQuote(theme)
}

/** Collect the non-empty parent names of one side into a clean array. */
export function coupleParents(father?: string, mother?: string): string[] {
  return [father, mother].filter((n): n is string => Boolean(n && n.trim().length > 0))
}

/** Two-letter monogram from the couple names, used for graceful photo fallbacks. */
export function coupleInitials(groom: string, bride: string): string {
  const g = groom.trim()[0] ?? ""
  const b = bride.trim()[0] ?? ""
  return `${g}${b}`.toUpperCase() || "&"
}

/** A single side's parental line, rendered identically wherever it appears. */
export function parentLine(parents: string[]): string | null {
  if (parents.length === 0) return null
  if (parents.length === 1) return `Putra/i dari Bapak/Ibu ${parents[0]}`
  return `Putra/i dari Bapak ${parents[0]} & Ibu ${parents[1]}`
}

// ─── Small presentational atoms ──────────────────────────────────────────────

/**
 * Initials medallion. Stands in for a couple portrait - the data model has no
 * per-person photo field, so rather than ship a broken <img> we render a
 * tasteful monogram that inherits the template accent.
 */
export function Monogram({
  initials,
  accent,
  className,
}: {
  initials: string
  accent: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={
        className ??
        "inline-grid h-20 w-20 place-items-center rounded-full border text-2xl font-medium"
      }
      style={{ borderColor: accent, color: accent }}
    >
      {initials}
    </span>
  )
}

// ─── Cover photo ─────────────────────────────────────────────────────────────

/**
 * Cover image with a graceful fallback. When no cover URL is set the template
 * supplies its own `fallback` (usually a tinted gradient or ornament) so the
 * hero never collapses to an empty box.
 */
export function CoverPhoto({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 768px",
  priority = false,
  fallback = null,
}: {
  src: string | null | undefined
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  fallback?: ReactNode
}) {
  if (!src) return <>{fallback}</>
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className ?? "object-cover"}
      priority={priority}
    />
  )
}

// ─── Schedule ────────────────────────────────────────────────────────────────

/**
 * Schedule renderer. Four layouts so templates do not all read as the same
 * stack of cards: `ribbon` (rounded pills), `cards` (bordered blocks),
 * `timeline` (left rail + dots), `list` (hairline rows).
 */
export function ScheduleList({
  schedule,
  accent,
  variant = "cards",
  surfaceClassName,
}: {
  schedule: ScheduleItemData[]
  accent: string
  variant?: "ribbon" | "cards" | "timeline" | "list"
  surfaceClassName?: string
}) {
  if (!schedule || schedule.length === 0) return null

  if (variant === "timeline") {
    return (
      <ol className="relative mx-auto max-w-xl space-y-8 pl-8">
        <span
          className="absolute bottom-2 left-[6px] top-2 w-px"
          style={{ background: `${accent}55` }}
          aria-hidden="true"
        />
        {schedule.map((item, i) => (
          <li key={i} className="relative">
            <span
              className="absolute -left-[26px] top-1.5 block h-3 w-3 rounded-full"
              style={{ background: accent }}
              aria-hidden="true"
            />
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: accent }}>
              {item.label}
            </p>
            <p className="mt-1 font-display text-lg">{formatScheduleDate(item)}</p>
            <p className="text-sm opacity-75">{formatScheduleRange(item)}</p>
            {item.notes ? <p className="mt-1 text-sm italic opacity-70">{item.notes}</p> : null}
          </li>
        ))}
      </ol>
    )
  }

  if (variant === "list") {
    return (
      <div className="mx-auto max-w-2xl divide-y" style={{ borderColor: `${accent}33` }}>
        {schedule.map((item, i) => (
          <div
            key={i}
            className="grid items-baseline gap-2 py-6 sm:grid-cols-[180px_1fr]"
            style={i === 0 ? undefined : { borderColor: `${accent}33` }}
          >
            <p className="font-display text-xl" style={{ color: accent }}>
              {item.label}
            </p>
            <div>
              <p className="font-serif text-lg">{formatScheduleDate(item)}</p>
              <p className="text-sm opacity-70">{formatScheduleRange(item)}</p>
              {item.notes ? <p className="mt-1 text-sm italic opacity-70">{item.notes}</p> : null}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "ribbon") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        {schedule.map((item, i) => (
          <div
            key={i}
            className={
              surfaceClassName ?? "rounded-full border px-7 py-5 text-center sm:px-12"
            }
            style={{ borderColor: `${accent}33` }}
          >
            <p className="text-xs uppercase tracking-[0.32em]" style={{ color: accent }}>
              {item.label}
            </p>
            <p className="mt-2 font-display text-xl">{formatScheduleDate(item)}</p>
            <p className="text-sm opacity-75">{formatScheduleRange(item)}</p>
            {item.notes ? <p className="mt-1 text-sm italic opacity-70">{item.notes}</p> : null}
          </div>
        ))}
      </div>
    )
  }

  // cards (default)
  return (
    <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
      {schedule.map((item, i) => (
        <div
          key={i}
          className={surfaceClassName ?? "rounded-2xl border p-6"}
          style={{ borderColor: `${accent}33` }}
        >
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: accent }}>
            {item.label}
          </p>
          <p className="mt-3 font-display text-xl">{formatScheduleDate(item)}</p>
          <p className="text-sm opacity-75">{formatScheduleRange(item)}</p>
          {item.notes ? <p className="mt-2 text-sm italic opacity-70">{item.notes}</p> : null}
        </div>
      ))}
    </div>
  )
}

// ─── Couple ──────────────────────────────────────────────────────────────────

interface CouplePerson {
  label: string
  name: string
  parents: string[]
}

function CouplePersonFigure({
  person,
  align,
  accent,
  showMonogram,
}: {
  person: CouplePerson
  align: "left" | "center" | "right"
  accent: string
  showMonogram: boolean
}) {
  const alignClass =
    align === "right"
      ? "text-right items-end"
      : align === "left"
        ? "text-left items-start"
        : "text-center items-center"
  const line = parentLine(person.parents)
  return (
    <figure className={`flex flex-col gap-3 ${alignClass}`}>
      {showMonogram ? (
        <Monogram initials={person.name.trim()[0]?.toUpperCase() ?? "•"} accent={accent} />
      ) : null}
      <figcaption>
        <p className="text-[11px] uppercase tracking-[0.32em] opacity-60">{person.label}</p>
        <h3 className="mt-2 font-display text-3xl" style={{ color: accent }}>
          {person.name}
        </h3>
        {line ? (
          <p className="mt-2 max-w-xs font-serif text-base italic opacity-80">{line}</p>
        ) : null}
      </figcaption>
    </figure>
  )
}

/**
 * Couple detail. `facing` puts the two sides either side of a centre "&",
 * `stacked` flows them vertically with a divider, `split` is a plain 2-col
 * grid. Each renders a monogram medallion as the graceful portrait stand-in.
 */
export function CoupleColumns({
  groom,
  bride,
  accent,
  variant = "split",
  showMonogram = true,
}: {
  groom: CouplePerson
  bride: CouplePerson
  accent: string
  variant?: "split" | "stacked" | "facing"
  showMonogram?: boolean
}) {
  if (variant === "facing") {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center">
        <CouplePersonFigure person={groom} align="right" accent={accent} showMonogram={showMonogram} />
        <span className="font-display text-4xl opacity-40" aria-hidden="true">
          &amp;
        </span>
        <CouplePersonFigure person={bride} align="left" accent={accent} showMonogram={showMonogram} />
      </div>
    )
  }

  if (variant === "stacked") {
    return (
      <div className="mx-auto max-w-md space-y-10">
        <CouplePersonFigure person={groom} align="center" accent={accent} showMonogram={showMonogram} />
        <div className="mx-auto h-px w-16" style={{ background: `${accent}66` }} aria-hidden="true" />
        <CouplePersonFigure person={bride} align="center" accent={accent} showMonogram={showMonogram} />
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-10 sm:grid-cols-2">
      <CouplePersonFigure person={groom} align="center" accent={accent} showMonogram={showMonogram} />
      <CouplePersonFigure person={bride} align="center" accent={accent} showMonogram={showMonogram} />
    </div>
  )
}

// ─── Countdown ───────────────────────────────────────────────────────────────

export function CountdownBlock({
  target,
  variant = "classic",
}: {
  target: string
  variant?: CountdownVariant
}) {
  return (
    <SectionBoundary>
      <Countdown target={target} variant={variant} />
    </SectionBoundary>
  )
}

// ─── Map ─────────────────────────────────────────────────────────────────────

export function MapBlock({
  latitude,
  longitude,
  mapsUrl,
  venueName,
  mapClassName,
  buttonClassName,
  buttonStyle,
  buttonLabel = "Buka di Google Maps",
}: {
  latitude: number | null
  longitude: number | null
  mapsUrl?: string
  venueName: string | null
  mapClassName?: string
  buttonClassName: string
  buttonStyle?: CSSProperties
  buttonLabel?: string
}) {
  return (
    <SectionBoundary>
      <div>
        <MapEmbed
          latitude={latitude}
          longitude={longitude}
          mapsUrl={mapsUrl}
          venueName={venueName ?? "Lokasi acara"}
          className={mapClassName ?? "aspect-[4/3] w-full overflow-hidden rounded-2xl border border-current/20"}
        />
        <div className="mt-6 text-center">
          <Link
            href={buildGoogleMapsHref({ latitude, longitude, mapsUrl })}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName}
            style={buttonStyle}
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </SectionBoundary>
  )
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export function GalleryBlock({
  urls,
  variant = "mosaic",
  caption,
}: {
  urls: string[] | undefined
  variant?: GalleryVariant
  caption?: string
}) {
  if (!urls || urls.length === 0) return null
  // Past six photos we defer the gallery to its own chunk via next/dynamic.
  if (urls.length > 6) {
    return (
      <SectionBoundary>
        <LazyGallery urls={urls} variant={variant} caption={caption} />
      </SectionBoundary>
    )
  }
  return (
    <SectionBoundary>
      <Gallery urls={urls} variant={variant} caption={caption} />
    </SectionBoundary>
  )
}

// ─── Gift ────────────────────────────────────────────────────────────────────

export function GiftList({
  accounts,
  accent,
  itemClassName,
}: {
  accounts: GiftAccountView[] | undefined
  accent: string
  itemClassName?: string
}) {
  if (!accounts || accounts.length === 0) return null
  return (
    <ul className="mx-auto max-w-md space-y-4">
      {accounts.map((g, i) => (
        <li
          key={i}
          className={itemClassName ?? "rounded-xl border border-current/15 bg-white/60 p-5 text-center"}
        >
          <p className="text-xs uppercase tracking-[0.28em] opacity-60">{g.bankName}</p>
          <p className="mt-1 font-mono text-lg" style={{ color: accent }}>
            {g.accountNumber}
          </p>
          <p className="text-sm opacity-80">a.n. {g.accountHolder}</p>
        </li>
      ))}
    </ul>
  )
}

// ─── RSVP ────────────────────────────────────────────────────────────────────

export function RsvpBlock({
  invitationId,
  tone,
  accent,
}: {
  invitationId: string
  tone: FormTone
  accent: string
}) {
  return (
    <SectionBoundary>
      <PublicRsvpForm invitationId={invitationId} tone={tone} accent={accent} />
    </SectionBoundary>
  )
}

// ─── Guest messages ──────────────────────────────────────────────────────────

export function MessagesBlock({
  invitationId,
  tone,
  accent,
}: {
  invitationId: string
  tone: FormTone
  accent: string
}) {
  return (
    <SectionBoundary>
      <div className="space-y-10">
        <PublicGuestMessageForm invitationId={invitationId} tone={tone} accent={accent} />
        <GuestMessagesList invitationId={invitationId} tone={tone} />
      </div>
    </SectionBoundary>
  )
}
