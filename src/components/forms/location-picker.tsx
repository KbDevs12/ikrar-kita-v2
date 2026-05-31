"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { MapPin, Search, Loader2, CheckCircle2, ExternalLink, AlertTriangle } from "lucide-react"
// import "leaflet/dist/leaflet.css"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { buildGoogleMapsHref, isShortMapsUrl, parseLatLngFromMapsUrl } from "@/lib/utils/maps"

const LocationMapPreview = dynamic(
  () => import("./location-map-preview").then((m) => m.LocationMapPreview),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center text-xs text-stone-500">Memuat peta…</div>
    ),
  }
)

const URL_ERROR = "URL tidak valid. Salin link lengkap dari Google Maps lalu paste di sini."

export interface LocationValue {
  mapsUrl?: string
  latitude?: number
  longitude?: number
  venueAddress?: string
}

export interface LocationPickerProps {
  mapsUrl: string
  latitude: number | undefined
  longitude: number | undefined
  venueAddress: string
  onChange: (patch: LocationValue) => void
  disabled?: boolean
}

interface NominatimResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
}

function isNominatimResult(value: unknown): value is NominatimResult {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.place_id === "number" &&
    typeof v.lat === "string" &&
    typeof v.lon === "string" &&
    typeof v.display_name === "string"
  )
}

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; results: NominatimResult[] }

/**
 * UX-friendly location picker. Primary flow: paste a Google Maps URL and the
 * coordinates fill in automatically. Secondary flow: search an address via
 * Nominatim (OpenStreetMap). Either way `latitude`/`longitude` end up in form
 * state and a live Leaflet preview confirms the spot. Lat/lng are shown as a
 * read-only pill - the user never types raw coordinates.
 */
export function LocationPicker({
  mapsUrl,
  latitude,
  longitude,
  venueAddress,
  onChange,
  disabled,
}: LocationPickerProps) {
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isShortUrl, setIsShortUrl] = useState(false)
  const [parseSuccess, setParseSuccess] = useState(false)
  const [query, setQuery] = useState("")
  const [search, setSearch] = useState<SearchState>({ status: "idle" })
  const abortRef = useRef<AbortController | null>(null)

  // Cancel any in-flight search if the component unmounts.
  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  function handleUrlChange(next: string) {
    onChange({ mapsUrl: next })
    const trimmed = next.trim()
    if (trimmed.length === 0) {
      setUrlError(null)
      setIsShortUrl(false)
      setParseSuccess(false)
      return
    }
    const parsed = parseLatLngFromMapsUrl(trimmed)
    if (parsed) {
      setUrlError(null)
      setIsShortUrl(false)
      setParseSuccess(true)
      onChange({ latitude: parsed.lat, longitude: parsed.lng })
      return
    }
    setParseSuccess(false)
    // Only surface an error once the input actually looks like a pasted URL,
    // so we don't nag mid-typing.
    if (/^https?:\/\//i.test(trimmed)) {
      const short = isShortMapsUrl(trimmed)
      setIsShortUrl(short)
      setUrlError(short ? null : URL_ERROR)
    } else {
      setIsShortUrl(false)
      setUrlError(null)
    }
  }

  async function runSearch() {
    const q = query.trim()
    if (q.length === 0) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setSearch({ status: "loading" })
    try {
      const endpoint =
        "https://nominatim.openstreetmap.org/search" +
        `?format=json&limit=5&accept-language=id&q=${encodeURIComponent(q)}`
      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      })
      if (!res.ok) {
        setSearch({ status: "error", message: "Pencarian gagal. Coba lagi sebentar." })
        return
      }
      const data: unknown = await res.json()
      const results = Array.isArray(data) ? data.filter(isNominatimResult).slice(0, 5) : []
      setSearch({ status: "done", results })
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setSearch({ status: "error", message: "Tidak dapat terhubung ke layanan peta." })
    }
  }

  function chooseResult(result: NominatimResult) {
    const lat = Number(result.lat)
    const lng = Number(result.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    const patch: LocationValue = { latitude: lat, longitude: lng }
    // Only fill the address if the user has not written one yet.
    if (venueAddress.trim().length === 0) {
      patch.venueAddress = result.display_name
    }
    onChange(patch)
    setSearch({ status: "idle" })
    setQuery("")
    setUrlError(null)
    setIsShortUrl(false)
    setParseSuccess(false)
  }

  const hasCoords = typeof latitude === "number" && typeof longitude === "number"

  return (
    <div className="mt-3 space-y-5">
      {/* Primary: Google Maps URL (recommended) */}
      <div className="rounded-xl border-2 border-rose-200 bg-rose-50/50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-medium text-white">
            Rekomendasi
          </span>
          <Label htmlFor="location-maps-url">Paste link Google Maps</Label>
        </div>
        <Input
          id="location-maps-url"
          type="url"
          inputMode="url"
          placeholder="https://maps.google.com/?q=-6.2088,106.8456"
          value={mapsUrl}
          disabled={disabled}
          onChange={(e) => handleUrlChange(e.target.value)}
          aria-invalid={urlError !== null}
          aria-describedby={urlError ? "location-maps-error" : "location-maps-help"}
        />
        {urlError ? (
          <p id="location-maps-error" className="mt-1.5 text-xs text-rose-600" role="alert">
            {urlError}
          </p>
        ) : parseSuccess ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 duration-200 animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Koordinat berhasil dibaca
          </p>
        ) : (
          <p id="location-maps-help" className="mt-1.5 text-xs text-stone-500">
            Buka lokasi di Google Maps, tekan Bagikan, salin tautannya, lalu tempel di sini.
            Koordinat akan terisi otomatis.
          </p>
        )}

        {isShortUrl ? (
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <p className="mb-1 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              Link pendek tidak bisa dibaca otomatis
            </p>
            <ol className="list-inside list-decimal space-y-0.5 text-amber-700">
              <li>Buka link itu di browser</li>
              <li>Tunggu halaman Google Maps terbuka penuh</li>
              <li>Salin URL dari address bar browser</li>
              <li>Tempel di sini</li>
            </ol>
          </div>
        ) : null}
      </div>

      {/* Separator */}
      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-stone-200" />
        <span className="px-3 text-xs text-stone-400">atau cari manual</span>
        <div className="flex-1 border-t border-stone-200" />
      </div>

      {/* Secondary: address search */}
      <div>
        <Label htmlFor="location-search">Cari alamat</Label>
        <div className="flex gap-2">
          <Input
            id="location-search"
            type="text"
            placeholder="Contoh: Gedung Kesenian Jakarta"
            value={query}
            disabled={disabled}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                void runSearch()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || query.trim().length === 0 || search.status === "loading"}
            onClick={() => void runSearch()}
          >
            {search.status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Search className="h-4 w-4" aria-hidden />
            )}
            <span>Cari di peta</span>
          </Button>
        </div>

        {search.status === "error" ? (
          <p className="mt-1.5 text-xs text-rose-600" role="alert">
            {search.message}
          </p>
        ) : null}

        {search.status === "done" ? (
          search.results.length === 0 ? (
            <p className="mt-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-500">
              Alamat tidak ditemukan. Coba kata kunci lain atau tempel link Google Maps di atas.
            </p>
          ) : (
            <ul className="mt-2 overflow-hidden rounded-lg border border-rose-200">
              {search.results.map((r) => (
                <li key={r.place_id}>
                  <button
                    type="button"
                    onClick={() => chooseResult(r)}
                    className="flex w-full items-start gap-2 border-b border-rose-100 px-3 py-2 text-left text-sm text-stone-700 last:border-b-0 hover:bg-rose-50"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden />
                    <span className="leading-snug">{r.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>

      {/* Coordinates pill + live preview */}
      <div>
        <Label>Titik lokasi</Label>
        {typeof latitude === "number" && typeof longitude === "number" ? (
          <div className="mt-1.5 flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2">
            <MapPin className="h-4 w-4 shrink-0 text-rose-400" aria-hidden />
            <span className="text-sm tabular-nums text-stone-600">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </span>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-stone-500">
            Koordinat akan terisi otomatis dari link Google Maps atau hasil pencarian.
          </p>
        )}

        <div
          className={cn(
            "mt-3 aspect-[4/3] w-full overflow-hidden rounded-xl border border-rose-200",
            !hasCoords && "grid place-items-center bg-stone-50"
          )}
        >
          {typeof latitude === "number" && typeof longitude === "number" ? (
            <LocationMapPreview lat={latitude} lng={longitude} />
          ) : (
            <p className="px-6 text-center text-xs text-stone-500">
              Peta akan muncul di sini setelah koordinat terisi dari link Google Maps atau hasil
              pencarian.
            </p>
          )}
        </div>

        {hasCoords ? (
          <a
            href={buildGoogleMapsHref({ latitude, longitude, mapsUrl })}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-600"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Buka di Google Maps
          </a>
        ) : null}
      </div>
    </div>
  )
}
