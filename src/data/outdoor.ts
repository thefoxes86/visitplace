import { useMemo } from 'react'
import { queryOptions } from '@tanstack/react-query'

import { useCategories } from '#/data/categories'
import { resolveStops, totalKm, useItineraries } from '#/data/itineraries'
import { usePois } from '#/data/use-pois'
import { formatModes } from '#/lib/itineraries'
import { gradeValue } from '#/lib/outdoor'
import { listOutdoorTracks } from '#/server/pois'

import type { OutdoorItem } from '#/lib/outdoor'

/** Thinned GPS tracks of the hikes, drawn on the outdoor map. */
export const outdoorTracksQuery = queryOptions({
  queryKey: ['outdoor-tracks'],
  queryFn: () => listOutdoorTracks(),
  staleTime: 5 * 60_000,
})

const num = (value: unknown) => (typeof value === 'number' ? value : null)
const kmLabel = (km: number) => `${km.toLocaleString('it-IT', { maximumFractionDigits: 1 })} km`

/** Hikes, crags and itineraries as items of the outdoor map. */
export function useOutdoorItems(): OutdoorItem[] {
  const pois = usePois()
  const itineraries = useItineraries()
  const { categoryOf } = useCategories()

  return useMemo(() => {
    const items: OutdoorItem[] = []
    for (const poi of pois) {
      const category = categoryOf(poi.category)
      const d = poi.details
      const base = {
        id: poi.id,
        name: poi.name,
        lat: poi.lat,
        lon: poi.lon,
        color: category.color,
        category: category.id,
        summary: poi.summary,
        imageOf: poi,
        family: d.family === true,
        rain: d.rain === true,
      }
      if (category.type === 'trekking') {
        const length = num(d.length)
        const gain = num(d.elevationGain)
        items.push({
          ...base,
          key: `poi-${poi.id}`,
          kind: 'trekking',
          facts: [d.difficulty, length !== null && kmLabel(length), gain !== null && `${gain} m di dislivello`, d.duration].filter(Boolean).join(' · '),
          lengthKm: length,
          modes: ['walk'],
          difficulty: typeof d.difficulty === 'string' ? d.difficulty : null,
          gradeMin: null,
          gradeMax: null,
        })
      } else if (category.type === 'climbing') {
        const routes = num(d.routes)
        const approach = num(d.approach)
        items.push({
          ...base,
          key: `poi-${poi.id}`,
          kind: 'climbing',
          facts: [
            d.gradeMin && d.gradeMax ? `${d.gradeMin}–${d.gradeMax}` : null,
            routes !== null && `${routes} vie`,
            approach !== null && `${approach} min a piedi`,
          ]
            .filter(Boolean)
            .join(' · '),
          lengthKm: null,
          modes: [],
          difficulty: null,
          gradeMin: gradeValue(d.gradeMin),
          gradeMax: gradeValue(d.gradeMax),
        })
      }
    }
    for (const itinerary of itineraries) {
      const stops = resolveStops(itinerary, pois)
      if (!stops.length) continue
      const km = totalKm(stops)
      items.push({
        key: `itinerary-${itinerary.id}`,
        kind: 'itinerary',
        id: itinerary.id,
        name: itinerary.title,
        lat: stops[0].poi.lat,
        lon: stops[0].poi.lon,
        color: '#2f6e60',
        category: null,
        facts: [formatModes(itinerary.modes), itinerary.duration, `${stops.length} tappe`].filter(Boolean).join(' · '),
        summary: itinerary.summary,
        imageOf: stops.find((s) => s.poi.imageUrl)?.poi ?? stops[0].poi,
        family: itinerary.kidFriendly,
        rain: false,
        lengthKm: km >= 0.5 ? km : null,
        modes: itinerary.modes,
        difficulty: null,
        gradeMin: null,
        gradeMax: null,
      })
    }
    return items
  }, [pois, itineraries, categoryOf])
}

/** The stops of an itinerary of the outdoor map, for its route. */
export function useItineraryRoute(id: string | null) {
  const pois = usePois()
  const itineraries = useItineraries()
  return useMemo(() => {
    const itinerary = itineraries.find((i) => i.id === id)
    return itinerary ? resolveStops(itinerary, pois).map(({ poi }) => ({ lat: poi.lat, lng: poi.lon })) : []
  }, [id, itineraries, pois])
}
