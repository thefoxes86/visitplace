/// <reference types="google.maps" />
import { useEffect } from 'react'
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps'

import { API_KEY, CAMAIORE, CORAL, HtmlMarker, MAP_STYLES, PAPER, ZoomControls } from '#/components/tourist-map/TouristMap'

import type { ResolvedStop } from '#/data/itineraries'

const TEAL = '#2f6e60'

/** The stops of an itinerary, numbered in order and joined by a dashed line. */
export function ItineraryMap({ stops }: { stops: ResolvedStop[] }) {
  if (!API_KEY) {
    return (
      <p className="grid size-full place-items-center p-8 text-center font-serif italic text-teal">
        Imposta VITE_GOOGLE_MAPS_API_KEY in .env.local per vedere la mappa.
      </p>
    )
  }
  return (
    <APIProvider apiKey={API_KEY} language="it" region="IT">
      <div className="relative size-full">
        <Map
          defaultCenter={stops[0] ? { lat: stops[0].poi.lat, lng: stops[0].poi.lon } : CAMAIORE}
          defaultZoom={13}
          styles={MAP_STYLES}
          disableDefaultUI
          gestureHandling="cooperative"
          clickableIcons={false}
          backgroundColor={PAPER}
          className="size-full"
        >
          <Route stops={stops} />
          {stops.map((stop, i) => (
            <HtmlMarker key={`${stop.poi.id}-${i}`} lat={stop.poi.lat} lng={stop.poi.lon} zIndex={stops.length - i}>
              <a
                href={`#tappa-${i + 1}`}
                aria-label={`Tappa ${i + 1}: ${stop.poi.name}`}
                className="grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-display text-sm font-semibold text-white shadow ring-[2.5px] ring-paper outline-none transition-transform hover:scale-110 focus-visible:ring-coral"
                style={{ backgroundColor: i === 0 ? TEAL : CORAL }}
              >
                {i + 1}
              </a>
            </HtmlMarker>
          ))}
        </Map>
        <ZoomControls />
      </div>
    </APIProvider>
  )
}

/** The dashed line through the stops, and the frame around them. */
function Route({ stops }: { stops: ResolvedStop[] }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !stops.length) return
    const path = stops.map(({ poi }) => ({ lat: poi.lat, lng: poi.lon }))
    const line = new google.maps.Polyline({
      path,
      map,
      strokeOpacity: 0,
      icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: TEAL, strokeWeight: 3, scale: 3 }, offset: '0', repeat: '14px' }],
    })
    const bounds = new google.maps.LatLngBounds()
    for (const p of path) bounds.extend(p)
    map.fitBounds(bounds, 56)
    // A single stop, or stops very close: don't zoom in further than a street.
    const once = google.maps.event.addListenerOnce(map, 'idle', () => {
      if ((map.getZoom() ?? 0) > 17) map.setZoom(17)
    })
    return () => {
      line.setMap(null)
      once.remove()
    }
  }, [map, stops])
  return null
}
