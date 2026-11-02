/// <reference types="google.maps" />
import { useEffect } from 'react'
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps'

import { TypeIcon } from '#/components/tourist-map/CategoryIcon'
import { API_KEY, CAMAIORE, CORAL, HtmlMarker, MAP_STYLES, PAPER, RouteLine, ZoomControls } from '#/components/tourist-map/TouristMap'

import type { OutdoorItem } from '#/lib/outdoor'

interface OutdoorMapProps {
  items: OutdoorItem[]
  selected: OutdoorItem | null
  onSelect: (item: OutdoorItem) => void
  /** Thinned GPS tracks of the hikes, by place id. */
  tracks: { id: string; points: [number, number][] }[]
  /** Stops of the selected itinerary, drawn as a dashed line. */
  route: { lat: number; lng: number }[]
  /** Changes whenever the results do: the map frames them again. */
  frameKey: string
}

const ICON: Record<OutdoorItem['kind'], string> = { trekking: 'trekking', climbing: 'climbing', itinerary: 'list' }

/** Hikes, crags and itineraries on a map, with the hikes' tracks. */
export function OutdoorMap(props: OutdoorMapProps) {
  if (!API_KEY) {
    return (
      <div className="grid size-full place-items-center p-8 text-center font-serif italic text-teal">
        Imposta VITE_GOOGLE_MAPS_API_KEY in .env.local per vedere la mappa.
      </div>
    )
  }
  const { items, selected, onSelect, tracks, route, frameKey } = props
  const shown = new Set(items.filter((i) => i.kind === 'trekking').map((i) => i.id))
  return (
    <APIProvider apiKey={API_KEY} language="it" region="IT">
      <div className="relative size-full bg-paper">
        <Map
          defaultCenter={CAMAIORE}
          defaultZoom={12}
          styles={MAP_STYLES}
          mapTypeId="terrain"
          disableDefaultUI
          gestureHandling="greedy"
          clickableIcons={false}
          backgroundColor={PAPER}
          className="size-full"
        >
          {tracks
            .filter((t) => shown.has(t.id))
            .map((t) => (
              <Track key={t.id} points={t.points} strong={selected?.kind === 'trekking' && selected.id === t.id} />
            ))}
          {route.length > 1 && <RouteLine path={route} />}
          {items.map((item) => {
            const active = selected?.key === item.key
            return (
              <HtmlMarker key={item.key} lat={item.lat} lng={item.lon} zIndex={active ? 2 : 1}>
                <button
                  type="button"
                  aria-label={item.name}
                  aria-pressed={active}
                  onClick={() => onSelect(item)}
                  className="group relative grid -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center outline-none"
                >
                  {active && <span className="absolute size-12 animate-ping rounded-full opacity-30" style={{ backgroundColor: item.color }} />}
                  <span
                    className={`relative grid place-items-center text-white shadow ring-[2.5px] ring-paper transition-all duration-300 group-focus-visible:ring-coral ${
                      item.kind === 'itinerary' ? 'rounded-sm' : 'rounded-full'
                    } ${active ? 'size-9' : 'size-7'}`}
                    style={{ backgroundColor: item.color }}
                  >
                    <TypeIcon type={ICON[item.kind]} className={active ? 'size-5' : 'size-4'} />
                  </span>
                  {active && (
                    <span className="absolute bottom-full mb-1 whitespace-nowrap font-display text-sm font-semibold text-ink [paint-order:stroke] [-webkit-text-stroke:4px_var(--color-paper)]">
                      {item.name}
                    </span>
                  )}
                </button>
              </HtmlMarker>
            )
          })}
          <Frame items={items} frameKey={frameKey} />
          <Focus selected={selected} />
        </Map>
        <ZoomControls />
      </div>
    </APIProvider>
  )
}

/** A hike's track, bolder when the hike is selected. */
function Track({ points, strong }: { points: [number, number][]; strong: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    const line = new google.maps.Polyline({
      path: points.map(([lat, lng]) => ({ lat, lng })),
      map,
      strokeColor: CORAL,
      strokeOpacity: strong ? 1 : 0.6,
      strokeWeight: strong ? 5 : 3,
      zIndex: strong ? 2 : 1,
    })
    return () => line.setMap(null)
  }, [map, points, strong])
  return null
}

/** Frames the results whenever they change. */
function Frame({ items, frameKey }: { items: OutdoorItem[]; frameKey: string }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !items.length) return
    const bounds = new google.maps.LatLngBounds()
    for (const item of items) bounds.extend({ lat: item.lat, lng: item.lon })
    map.fitBounds(bounds, 72)
    const once = google.maps.event.addListenerOnce(map, 'idle', () => {
      if ((map.getZoom() ?? 0) > 15) map.setZoom(15)
    })
    return () => once.remove()
    // Only when the results change, not on every render of the same ones.
  }, [map, frameKey])
  return null
}

/** Brings the selected item into view. */
function Focus({ selected }: { selected: OutdoorItem | null }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !selected) return
    map.panTo({ lat: selected.lat, lng: selected.lon })
    if ((map.getZoom() ?? 0) < 14) map.setZoom(14)
  }, [map, selected?.key])
  return null
}
