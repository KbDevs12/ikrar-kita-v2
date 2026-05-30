"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { MapPin, Search, Loader2 } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { isShortMapsUrl, parseLatLngFromMapsUrl } from "@/lib/utils/maps"

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
const SHORT_URL_HINT =
  "Link pendek Google Maps tidak bisa dibaca otomatis. Buka link itu di browser, lalu salin URL lengkap dari address bar."

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
 * state and a live Leaflet preview confirms the spot. Lat/lng are shown
 * read-only - the user never types raw coordinates.
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
      return
    }
    const parsed = parseLatLngFromMapsUrl(trimmed)
    if (parsed) {
      setUrlError(null)
      onChange({ latitude: parsed.lat, longitude: parsed.lng })
      return
    }
    // Only surface the error once the input actually looks like a pasted URL,
    // so we don't nag mid-typing.
    if (/^https?:\/\//i.test(trimmed)) {
      setUrlError(isShortMapsUrl(trimmed) ? SHORT_URL_HINT : URL_ERROR)
    } else {
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
  }

  return (
    <div className="mt-3 space-y-5">
      {/* Primary: Google Maps URL */}
      <div>
        <Label htmlFor="location-maps-url">Link Google Maps</Label>
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
        ) : (
          <p id="location-maps-help" className="mt-1.5 text-xs text-stone-500">
            Buka lokasi di Google Maps, tekan Bagikan, salin tautannya, lalu tempel di sini.
            Koordinat akan terisi otomatis.
          </p>
        )}
      </div>

      {/* Secondary: address search */}
      <div>
        <Label htmlFor="location-search">Atau cari alamat</Label>
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

      {/* Read-only coordinates + live preview */}
      <div>
        <Label>Koordinat lokasi</Label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            readOnly
            value={typeof latitude === "number" ? latitude.toFixed(6) : ""}
            placeholder="Latitude"
            aria-label="Latitude (otomatis)"
            tabIndex={-1}
            className="bg-stone-50 text-stone-600"
          />
          <Input
            readOnly
            value={typeof longitude === "number" ? longitude.toFixed(6) : ""}
            placeholder="Longitude"
            aria-label="Longitude (otomatis)"
            tabIndex={-1}
            className="bg-stone-50 text-stone-600"
          />
        </div>

        <div
          className={cn(
            "mt-3 aspect-[16/10] w-full overflow-hidden rounded-xl border border-rose-200",
            !(typeof latitude === "number" && typeof longitude === "number") &&
              "grid place-items-center bg-stone-50"
          )}
        >
          {typeof latitude === "number" && typeof longitude === "number" ? (
            <LocationMapPreview key="location-map" lat={latitude} lng={longitude} />
          ) : (
            <p className="px-6 text-center text-xs text-stone-500">
              Peta akan muncul di sini setelah koordinat terisi dari link Google Maps atau hasil
              pencarian.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
