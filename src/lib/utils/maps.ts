/**
 * Google Maps URL parsing helpers.
 *
 * The invitation builder lets a non-technical user paste a Google Maps link
 * instead of typing raw latitude/longitude. We parse the coordinates fully
 * on the client - no server round-trip - so the flow stays instant.
 *
 * Deliberately NOT handled here: shortened links such as
 * `https://maps.app.goo.gl/...` or `https://goo.gl/maps/...`. Those only
 * resolve to coordinates after an HTTP redirect, which we will not perform
 * from the browser. `parseLatLngFromMapsUrl` returns `null` for them and the
 * UI asks the user to paste the full link instead. See `isShortMapsUrl`.
 */

export interface LatLng {
  lat: number
  lng: number
}

/** A decimal coordinate component, optionally signed. */
const NUM = "(-?\\d{1,3}(?:\\.\\d+)?)"

/**
 * Ordered list of patterns, most specific first. Each must capture lat in
 * group 1 and lng in group 2.
 */
const COORD_PATTERNS: readonly RegExp[] = [
  // ?q=-6.2,106.8  or  &q=-6.2,106.8
  new RegExp(`[?&]q=${NUM},${NUM}`),
  // ?api=1&query=-6.2,106.8  (Maps "search" deep link)
  new RegExp(`[?&]query=${NUM},${NUM}`),
  // @-6.2,106.8,17z  (the viewport segment in /maps/place/.../@lat,lng,zoom)
  new RegExp(`@${NUM},${NUM}`),
  // !3d-6.2!4d106.8  (place data segment)
  new RegExp(`!3d${NUM}!4d${NUM}`),
  // ?ll=-6.2,106.8  (legacy)
  new RegExp(`[?&]ll=${NUM},${NUM}`),
]

/** Last-resort: a bare "lat,lng" decimal pair anywhere in the string. */
const RAW_PAIR = new RegExp(`${NUM},${NUM}`)

function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

/**
 * Returns true when the URL is a Google short link that cannot be parsed
 * client-side. The UI uses this to show a more specific hint.
 */
export function isShortMapsUrl(url: string): boolean {
  return /(?:maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(url)
}

/**
 * Extract `{ lat, lng }` from a Google Maps URL, or `null` when no valid
 * coordinate pair can be found. Coordinates outside the valid geographic
 * range are rejected (returns `null`).
 */
export function parseLatLngFromMapsUrl(url: string): LatLng | null {
  if (typeof url !== "string") return null
  const trimmed = url.trim()
  if (trimmed.length === 0) return null

  for (const pattern of COORD_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match && match[1] && match[2]) {
      const lat = Number(match[1])
      const lng = Number(match[2])
      if (isValidLatLng(lat, lng)) return { lat, lng }
    }
  }

  const raw = trimmed.match(RAW_PAIR)
  if (raw && raw[1] && raw[2]) {
    const lat = Number(raw[1])
    const lng = Number(raw[2])
    if (isValidLatLng(lat, lng)) return { lat, lng }
  }

  return null
}


/**
 * Build a safe "open in Google Maps" href. Prefers the user-pasted URL, then
 * falls back to a coordinate query, then to a bare Maps link. Mirrors the
 * helper used by the public invitation templates so the builder preview and
 * the rendered invitation point at the same place.
 */
export function buildGoogleMapsHref(opts: {
  latitude?: number | null
  longitude?: number | null
  mapsUrl?: string
}): string {
  if (opts.mapsUrl && opts.mapsUrl.trim().length > 0) return opts.mapsUrl
  if (typeof opts.latitude === "number" && typeof opts.longitude === "number") {
    return `https://www.google.com/maps?q=${opts.latitude},${opts.longitude}`
  }
  return "https://www.google.com/maps"
}
