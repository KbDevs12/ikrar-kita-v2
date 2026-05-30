"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"

interface MapEmbedProps {
  /** Latitude on the invitation row, may be null for older drafts. */
  latitude?: number | null
  /** Longitude on the invitation row, may be null. */
  longitude?: number | null
  /**
   * Optional Google Maps URL pasted into the builder. We try to extract
   * lat/lng from common patterns: `?q=lat,lng`, `@lat,lng,...`, `!3dlat!4dlng`.
   */
  mapsUrl?: string
  /** Marker label so screen readers know what this map points at. */
  venueName?: string
  /** Tailwind height utility. Templates pick what fits their rhythm. */
  className?: string
  accent?: string
}

const RLeaflet = dynamic(async () => (await import("./map-embed-leaflet")).LeafletMap, {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-xs text-stone-500">
      Memuat peta…
    </div>
  ),
})

const GOOGLE_MAPS_PATTERNS: RegExp[] = [
  /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
  /@(-?\d+\.\d+),(-?\d+\.\d+),/,
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
  /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
]

function extractLatLng(url?: string): [number, number] | null {
  if (!url) return null
  for (const re of GOOGLE_MAPS_PATTERNS) {
    const m = url.match(re)
    if (m && m[1] && m[2]) {
      const lat = Number(m[1])
      const lng = Number(m[2])
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng]
    }
  }
  return null
}

/**
 * Renders an interactive Leaflet map when we have coordinates, otherwise
 * falls back to a static OpenStreetMap iframe. Either way the user gets a
 * "Buka di Google Maps" button below.
 *
 * Templates wrap this in their own framing (rounded card, gilt frame, etc.)
 * so the box itself stays visually unopinionated.
 */
export function MapEmbed({
  latitude,
  longitude,
  mapsUrl,
  venueName,
  className,
}: MapEmbedProps) {
  const coords = useMemo<[number, number] | null>(() => {
    if (typeof latitude === "number" && typeof longitude === "number") {
      return [latitude, longitude]
    }
    return extractLatLng(mapsUrl)
  }, [latitude, longitude, mapsUrl])

  if (!coords) {
    return (
      <div
        className={
          className ??
          "aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 text-sm text-stone-500"
        }
      >
        <div className="grid h-full place-items-center px-6 text-center">
          Lokasi belum disertakan koordinat. Silakan buka tautan Google Maps
          di tombol bawah.
        </div>
      </div>
    )
  }

  return (
    <div
      className={
        className ??
        "aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stone-200"
      }
      role="img"
      aria-label={venueName ? `Peta lokasi ${venueName}` : "Peta lokasi acara"}
    >
      <RLeaflet
        latitude={coords[0]}
        longitude={coords[1]}
        venueName={venueName ?? "Lokasi acara"}
      />
    </div>
  )
}

/**
 * External-link button used together with MapEmbed. Kept here so templates
 * import a single helper and never need to know how the URL is built.
 */
export function buildGoogleMapsHref(opts: {
  latitude?: number | null
  longitude?: number | null
  mapsUrl?: string
}): string {
  if (opts.mapsUrl) return opts.mapsUrl
  if (typeof opts.latitude === "number" && typeof opts.longitude === "number") {
    return `https://www.google.com/maps?q=${opts.latitude},${opts.longitude}`
  }
  return "https://www.google.com/maps"
}
