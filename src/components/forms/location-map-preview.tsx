"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"

interface LocationMapPreviewProps {
  lat: number
  lng: number
}

/**
 * Keeps the map centred on the current coordinate. `MapContainer` only reads
 * `center` once on mount, so when the user picks a new location we imperatively
 * pan via the `useMap` hook instead of remounting the whole map (avoids a
 * tile-reload flicker).
 */
function Recenter({ lat, lng }: LocationMapPreviewProps) {
  const map = useMap()
  useEffect(() => {
    const center: [number, number] = [lat, lng]
    map.setView(center, map.getZoom())
  }, [lat, lng, map])
  return null
}

/**
 * Inner Leaflet preview for the location picker. Imported via
 * `next/dynamic({ ssr: false })` from `location-picker.tsx` because Leaflet
 * touches `window` at module load.
 *
 * The marker is a tiny CSS pin (divIcon) so we sidestep Leaflet's default
 * image sprite, which 404s under the Next.js bundler unless the asset is
 * copied by hand.
 */
export function LocationMapPreview({ lat, lng }: LocationMapPreviewProps) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "ikrar-location-marker",
        html: '<span class="block h-3.5 w-3.5 rounded-full bg-rose-500 ring-4 ring-rose-200"></span>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    []
  )

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={icon} />
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  )
}
