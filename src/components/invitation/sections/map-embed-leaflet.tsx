"use client"

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import L from "leaflet"
import { useMemo } from "react"

interface LeafletMapProps {
  latitude: number
  longitude: number
  venueName: string
}

/**
 * Inner Leaflet map component. Split into its own file so the parent
 * `MapEmbed` can `dynamic(... { ssr: false })` it - leaflet touches `window`
 * the moment it loads.
 */
export function LeafletMap({ latitude, longitude, venueName }: LeafletMapProps) {
  // Build the marker icon ad-hoc instead of relying on the default leaflet
  // sprite, which 404s under the Next.js bundler unless you copy the asset
  // by hand.
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "ikrar-map-marker",
        html: '<span class="block h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-200"></span>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
    []
  )

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={icon}>
        <Popup>{venueName}</Popup>
      </Marker>
    </MapContainer>
  )
}
