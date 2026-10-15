/// <reference types="google.maps" />
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps'

import { useCategories } from '#/data/categories'

import type { Poi } from '#/data/pois'

export const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

/** Where the map should go: frame some points, or zoom in on one. */
export type MapTarget = { fit: Poi[] } | { poi: Poi }

// Tourist-map palette, as in styles.css.
export const PAPER = '#f4f2ed'
const MINT = '#a8d5c7'
const MINT_LIGHT = '#d5ebe3'
const TEAL = '#2f6e60'
export const CORAL = '#e5775d'

/** Google Maps styled like a printed tourist map: paper land, mint town, white streets. */
export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: PAPER }] },
  { elementType: 'labels.text.fill', stylers: [{ color: TEAL }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: PAPER }, { weight: 3 }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: MINT }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: PAPER }] },
  { featureType: 'landscape.natural.terrain', elementType: 'geometry', stylers: [{ color: '#e9efe9' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: TEAL }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ visibility: 'on' }, { color: MINT }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: CORAL }, { weight: 1 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: MINT_LIGHT }] },
]

export const CAMAIORE = { lat: 43.92, lng: 10.27 }

interface TouristMapProps {
  pois: Poi[]
  selected: Poi | null
  onSelect: (poi: Poi) => void
  /** The map moves whenever this changes. */
  target: MapTarget | null
  numberOf: (poi: Poi) => number
}

export function TouristMap(props: TouristMapProps) {
  if (!API_KEY) {
    return (
      <div className="grid size-full place-items-center p-8 text-center font-serif italic text-teal">
        Imposta VITE_GOOGLE_MAPS_API_KEY in .env.local per vedere la mappa.
      </div>
    )
  }
  return (
    <APIProvider apiKey={API_KEY} language="it" region="IT">
      <div className="relative size-full bg-paper">
        <Map
          defaultCenter={CAMAIORE}
          defaultZoom={13}
          styles={MAP_STYLES}
          disableDefaultUI
          gestureHandling="greedy"
          clickableIcons={false}
          backgroundColor={PAPER}
          className="size-full"
        >
          <Markers {...props} />
          <Camera target={props.target} />
        </Map>
        <ZoomControls />
        <Compass className="pointer-events-none absolute bottom-6 left-4 size-20 sm:size-28" />
      </div>
    </APIProvider>
  )
}

function Camera({ target }: { target: MapTarget | null }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !target) return
    if ('poi' in target) {
      map.panTo({ lat: target.poi.lat, lng: target.poi.lon })
      if ((map.getZoom() ?? 0) < 16) map.setZoom(16)
      return
    }
    if (!target.fit.length) return
    const bounds = new google.maps.LatLngBounds()
    for (const poi of target.fit) bounds.extend({ lat: poi.lat, lng: poi.lon })
    map.fitBounds(bounds, 80)
  }, [map, target])
  return null
}

function Markers({ pois, selected, onSelect, numberOf }: Omit<TouristMapProps, 'target'>) {
  const { categoryOf } = useCategories()
  return pois.map((poi) => {
    const active = selected?.id === poi.id
    const { color } = categoryOf(poi.category)
    return (
      <HtmlMarker key={poi.id} lat={poi.lat} lng={poi.lon} zIndex={active ? 2 : 1}>
        <button
          type="button"
          aria-label={poi.name}
          aria-pressed={active}
          onClick={() => onSelect(poi)}
          className="group relative grid -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center outline-none"
        >
          {active && (
            <span className="absolute size-11 animate-ping rounded-full opacity-30" style={{ backgroundColor: color }} />
          )}
          <span
            className={`relative grid place-items-center rounded-full font-display font-semibold text-white shadow ring-[2.5px] ring-paper transition-all duration-300 group-focus-visible:ring-coral ${
              active ? 'size-8 text-[13px]' : 'size-6 text-[10px]'
            }`}
            style={{ backgroundColor: color }}
          >
            {String(numberOf(poi)).padStart(2, '0')}
          </span>
          {active && (
            <span className="absolute bottom-full mb-1 whitespace-nowrap font-display text-sm font-semibold text-ink [paint-order:stroke] [-webkit-text-stroke:4px_var(--color-paper)]">
              {poi.name}
            </span>
          )}
        </button>
      </HtmlMarker>
    )
  })
}

/**
 * React content pinned to a map position. A plain OverlayView, so it works with
 * a styled map (AdvancedMarker needs a Map ID, which ignores `styles`).
 */
function HtmlMarker({ lat, lng, zIndex, children }: { lat: number; lng: number; zIndex: number; children: React.ReactNode }) {
  const map = useMap()
  const [el, setEl] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!map) return
    const div = document.createElement('div')
    div.style.position = 'absolute'
    const overlay = new google.maps.OverlayView()
    overlay.onAdd = () => {
      google.maps.OverlayView.preventMapHitsAndGesturesFrom(div)
      overlay.getPanes()!.overlayMouseTarget.appendChild(div)
    }
    overlay.draw = () => {
      const point = overlay.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(lat, lng))
      if (point) div.style.transform = `translate(${point.x}px, ${point.y}px)`
    }
    overlay.onRemove = () => div.remove()
    overlay.setMap(map)
    setEl(div)
    return () => overlay.setMap(null)
  }, [map, lat, lng])

  useEffect(() => {
    if (el) el.style.zIndex = String(zIndex)
  }, [el, zIndex])

  return el ? createPortal(children, el) : null
}

function ZoomControls() {
  const map = useMap()
  return (
    <div className="absolute right-4 top-4 flex flex-col overflow-hidden rounded-sm bg-paper shadow ring-1 ring-mint lg:top-24">
      {(
        [
          ['+', 'Ingrandisci', 1],
          ['−', 'Riduci', -1],
        ] as const
      ).map(([label, name, step]) => (
        <button
          key={name}
          type="button"
          aria-label={name}
          onClick={() => map?.setZoom((map.getZoom() ?? 13) + step)}
          className="grid size-10 place-items-center text-xl font-semibold text-teal transition-colors hover:bg-mint-light"
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function Compass({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 120" className={className}>
      <circle cx={60} cy={60} r={34} className="fill-mint" />
      <circle cx={60} cy={60} r={28} className="fill-none stroke-paper" strokeWidth={1.5} />
      <path d="M60 60 L84 36 L64 60 L84 84 L60 64 L36 84 L56 60 L36 36 Z" className="fill-teal" />
      <path d="M60 14 L66 54 L106 60 L66 66 L60 106 L54 66 L14 60 L54 54 Z" className="fill-coral" />
      <circle cx={60} cy={60} r={6} className="fill-teal" />
      <g className="fill-teal font-display text-[11px] font-extrabold" textAnchor="middle">
        <text x={60} y={9}>N</text>
        <text x={60} y={119}>S</text>
        <text x={115} y={64}>E</text>
        <text x={5} y={64}>O</text>
      </g>
    </svg>
  )
}
