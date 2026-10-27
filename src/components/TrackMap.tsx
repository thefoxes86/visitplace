/// <reference types="google.maps" />
import { useEffect } from 'react'
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps'

import { API_KEY, CORAL, MAP_STYLES, PAPER } from '#/components/tourist-map/TouristMap'
import { distances, toGpx } from '#/lib/media'
import { slugify } from '#/lib/poi-input'

import type { Track } from '#/lib/media'

const TEAL = '#2f6e60'

/** The GPS track of a place: its route on the map, its figures, the elevation profile and the file. */
export function TrackMap({ track, name }: { track: Track; name: string }) {
  function download() {
    const url = URL.createObjectURL(new Blob([toGpx(track, name)], { type: 'application/gpx+xml' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `${slugify(name) || 'traccia'}.gpx` })
    a.click()
    URL.revokeObjectURL(url)
  }

  const figures = [
    ['Lunghezza', `${track.length.toLocaleString('it-IT')} km`],
    ...(track.gain !== null ? [['Salita', `${track.gain} m`], ['Discesa', `${track.loss} m`]] : []),
    ...(track.minEle !== null ? [['Quota', `${track.minEle}–${track.maxEle} m`]] : []),
  ]

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.15em] text-teal">Il percorso</h2>
      <div className="mt-6 aspect-[4/3] w-full overflow-hidden border-2 border-teal sm:aspect-[16/9]">
        {API_KEY ? (
          <APIProvider apiKey={API_KEY} language="it" region="IT">
            <Map
              defaultCenter={{ lat: track.points[0][0], lng: track.points[0][1] }}
              defaultZoom={13}
              styles={MAP_STYLES}
              mapTypeId="terrain"
              disableDefaultUI
              zoomControl
              gestureHandling="cooperative"
              clickableIcons={false}
              backgroundColor={PAPER}
              className="size-full"
            >
              <Route track={track} />
            </Map>
          </APIProvider>
        ) : (
          <p className="grid size-full place-items-center p-8 text-center font-serif italic text-teal">
            Imposta VITE_GOOGLE_MAPS_API_KEY in .env.local per vedere il percorso.
          </p>
        )}
      </div>

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
        {figures.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-light">{label}</dt>
            <dd className="font-display text-2xl font-semibold text-teal">{value}</dd>
          </div>
        ))}
      </dl>

      {track.minEle !== null && <Profile track={track} />}

      <button
        type="button"
        onClick={download}
        className="signpost-right mt-8 inline-block bg-mint py-3 pl-5 pr-12 font-display font-semibold uppercase tracking-[0.12em] text-teal transition-colors hover:bg-coral hover:text-white"
      >
        Scarica la traccia GPX
      </button>
    </section>
  )
}

/** Draws the route, with the start and the end, and frames it. */
function Route({ track }: { track: Track }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    const path = track.points.map(([lat, lng]) => ({ lat, lng }))
    const line = new google.maps.Polyline({ path, map, strokeColor: CORAL, strokeOpacity: 1, strokeWeight: 4 })
    const dot = (position: google.maps.LatLngLiteral, color: string, title: string) =>
      new google.maps.Marker({
        position,
        map,
        title,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: color, fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 },
      })
    const start = dot(path[0], TEAL, 'Partenza')
    const end = dot(path[path.length - 1], CORAL, 'Arrivo')
    const bounds = new google.maps.LatLngBounds()
    for (const p of path) bounds.extend(p)
    map.fitBounds(bounds, 32)
    return () => {
      line.setMap(null)
      start.setMap(null)
      end.setMap(null)
    }
  }, [map, track])
  return null
}

/** Elevation against distance, as a filled line. */
function Profile({ track }: { track: Track }) {
  const km = distances(track.points)
  const total = km[km.length - 1] || 1
  const elevations = track.points.map((p) => p[2])
  const min = track.minEle!
  const span = Math.max(track.maxEle! - min, 1)
  const [W, H] = [600, 140]
  let d = ''
  track.points.forEach((p, i) => {
    if (p[2] === null) return
    d += `${d ? 'L' : 'M'}${((km[i] / total) * W).toFixed(1)},${(H - ((p[2] - min) / span) * (H - 10)).toFixed(1)}`
  })
  const lastX = (km[elevations.map((e) => e !== null).lastIndexOf(true)] / total) * W
  const firstX = (km[elevations.findIndex((e) => e !== null)] / total) * W

  return (
    <figure className="mt-6">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-28 w-full" role="img" aria-label={`Profilo altimetrico: da ${track.minEle} a ${track.maxEle} metri in ${track.length} km`}>
        <path d={`${d}L${lastX.toFixed(1)},${H}L${firstX.toFixed(1)},${H}Z`} fill="#d5ebe3" />
        <path d={d} fill="none" stroke={TEAL} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="mt-1 flex justify-between text-xs font-light">
        <span>0 km · {track.minEle}–{track.maxEle} m</span>
        <span>{track.length.toLocaleString('it-IT')} km</span>
      </figcaption>
    </figure>
  )
}
