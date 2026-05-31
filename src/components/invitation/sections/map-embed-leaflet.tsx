"use client"

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import { useEffect, useMemo } from "react"
// Import the Leaflet stylesheet here (the client-only chunk) rather than in
// `map-embed.tsx`. Keeping it next to the component that actually touches
// `window` means the CSS never gets pulled into a server-side render pass.
// import "leaflet/dist/leaflet.css"

interface LeafletMapProps {
  latitude: number
  longitude: number
  venueName: string
}

/**
 * Inner cleanup helper.
 *
 * Leaflet stores its map instance directly on the DOM node it mounts into and
 * refuses to initialise a second map on the same element ("Map container is
 * already initialized."). React 19 strict mode plus the multi-step builder
 * (leaving Step 3 and coming back, or changing coordinates) can re-mount this
 * subtree against a node Leaflet still considers occupied. Calling
 * `map.remove()` on unmount releases the node so the next mount starts clean.
 */
function MapCleanup() {
  const map = useMap()
  useEffect(() => {
    return () => {
      map.remove()
    }
  }, [map])
  return null
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
      <MapCleanup />
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
