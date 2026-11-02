import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { usePois } from '#/data/use-pois'
import { distanceKm } from '#/data/pois'
import { listPublicItineraries } from '#/server/itineraries'

import type { Poi } from '#/data/pois'
import type { Itinerary } from '#/lib/itineraries'

/** Published itineraries; loaded by the pages that show them. */
export const itinerariesQuery = queryOptions({
  queryKey: ['itineraries'],
  queryFn: () => listPublicItineraries(),
  staleTime: 5 * 60_000,
})

export const useItineraries = () => useSuspenseQuery(itinerariesQuery).data

export interface ResolvedStop {
  poi: Poi
  note: string
  /** Straight-line km from the previous stop; null for the first. */
  fromPrevious: number | null
}

/** The stops of an itinerary as places on the site: those unpublished or in hidden categories are skipped. */
export const useItineraryStops = (itinerary: Itinerary) => resolveStops(itinerary, usePois())

/** The same, from a list of places already at hand. */
export function resolveStops(itinerary: Itinerary, pois: Poi[]): ResolvedStop[] {
  const stops: ResolvedStop[] = []
  for (const stop of itinerary.stops) {
    const poi = pois.find((p) => p.id === stop.poiId)
    if (!poi) continue
    const previous = stops.at(-1)?.poi
    stops.push({ poi, note: stop.note, fromPrevious: previous ? distanceKm(previous, poi) : null })
  }
  return stops
}

/** Straight-line km along the stops, start to end. */
export const totalKm = (stops: ResolvedStop[]) => stops.reduce((sum, s) => sum + (s.fromPrevious ?? 0), 0)
