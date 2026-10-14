/// <reference types="google.maps" />
import { useEffect, useRef } from 'react'
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps'

import { API_KEY, CAMAIORE, CORAL, MAP_STYLES, PAPER } from '#/components/tourist-map/TouristMap'

interface LocationPickerProps {
  lat: number | null
  lon: number | null
  onChange: (lat: number, lon: number) => void
}

const round = (n: number) => Math.round(n * 1e6) / 1e6

/** Drag the map under the pin to choose a place's position. */
export function LocationPicker(props: LocationPickerProps) {
  if (!API_KEY) {
    return (
      <p className="grid h-full place-items-center rounded-md bg-mint-light p-6 text-center font-serif text-sm italic text-teal">
        Imposta VITE_GOOGLE_MAPS_API_KEY in .env.local per scegliere la posizione sulla mappa.
      </p>
    )
  }
  const center = props.lat !== null && props.lon !== null ? { lat: props.lat, lng: props.lon } : CAMAIORE
  return (
    <APIProvider apiKey={API_KEY} language="it" region="IT">
      <div className="relative h-full overflow-hidden rounded-md border border-ink/20">
        <Map
          defaultCenter={center}
          defaultZoom={props.lat !== null ? 16 : 12}
          styles={MAP_STYLES}
          disableDefaultUI
          zoomControl
          gestureHandling="greedy"
          clickableIcons={false}
          backgroundColor={PAPER}
          className="size-full"
        >
          <Sync {...props} />
        </Map>
        {/* The pin stays in the middle: its tip marks the map's centre. */}
        <svg
          aria-hidden
          viewBox="0 0 24 32"
          className="pointer-events-none absolute left-1/2 top-1/2 h-9 w-7 -translate-x-1/2 -translate-y-full drop-shadow"
        >
          <path d="M12 31s10-11.6 10-19A10 10 0 0 0 2 12c0 7.4 10 19 10 19z" fill={CORAL} stroke="white" strokeWidth={2} />
          <circle cx={12} cy={12} r={3.5} fill="white" />
        </svg>
      </div>
    </APIProvider>
  )
}

/**
 * Reports the centre as the position once the map has been dragged (so a new
 * place gets no position until one is chosen), and follows coordinates typed in by hand.
 */
function Sync({ lat, lon, onChange }: LocationPickerProps) {
  const map = useMap()
  const reported = useRef<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    if (!map) return
    let dragged = false
    const drag = map.addListener('dragstart', () => {
      dragged = true
    })
    const idle = map.addListener('idle', () => {
      if (!dragged) return
      const center = map.getCenter()
      if (!center) return
      const next = { lat: round(center.lat()), lon: round(center.lng()) }
      if (reported.current?.lat === next.lat && reported.current.lon === next.lon) return
      reported.current = next
      onChange(next.lat, next.lon)
    })
    return () => {
      drag.remove()
      idle.remove()
    }
  }, [map, onChange])

  useEffect(() => {
    if (!map || lat === null || lon === null) return
    if (reported.current?.lat === lat && reported.current.lon === lon) return
    reported.current = { lat, lon }
    map.panTo({ lat, lng: lon })
  }, [map, lat, lon])

  return null
}
