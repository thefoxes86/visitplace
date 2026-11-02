import { z } from 'zod'

/**
 * Themed itineraries: an ordered list of the site's places, each stop with a note,
 * shown on its own page with a map of the route.
 */

/** Ways of travelling an itinerary. */
export const ITINERARY_MODES = {
  walk: 'A piedi',
  car: 'In auto',
  bike: 'In bici',
  transit: 'Mezzi pubblici',
} as const

export type ItineraryModeId = keyof typeof ITINERARY_MODES

export const ITINERARY_MODE_IDS = Object.keys(ITINERARY_MODES) as [ItineraryModeId, ...ItineraryModeId[]]

/** Google Maps travel mode for each of ours. */
export const GOOGLE_TRAVEL_MODE: Record<ItineraryModeId, string> = { walk: 'walking', car: 'driving', bike: 'bicycling', transit: 'transit' }

/** The way that covers the most ground, for the route in Google Maps: car, then transit, bike, on foot. */
export function mainMode(modes: ItineraryModeId[]): ItineraryModeId {
  return (['car', 'transit', 'bike', 'walk'] as const).find((m) => modes.includes(m)) ?? 'walk'
}

/** "A piedi e in auto" */
export function formatModes(modes: ItineraryModeId[]) {
  const labels = ITINERARY_MODE_IDS.filter((m) => modes.includes(m)).map((m, i) => (i ? ITINERARY_MODES[m].toLowerCase() : ITINERARY_MODES[m]))
  return labels.length > 1 ? `${labels.slice(0, -1).join(', ')} e ${labels.at(-1)}` : (labels[0] ?? '')
}

export interface ItineraryStop {
  /** Id in the `pois` table. */
  poiId: string
  /** What to see or do there, in this itinerary. */
  note: string
}

export const MAX_STOPS = 25

const slug = z
  .string()
  .min(1, 'Obbligatorio')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo lettere minuscole, numeri e trattini')

export const itineraryInput = z.object({
  /** Also the URL: /itinerari/<id>. Fixed once created. */
  id: slug,
  title: z.string().trim().min(1, 'Obbligatorio').max(80, 'Al massimo 80 caratteri'),
  summary: z.string().trim().min(1, 'Obbligatorio').max(160, 'Al massimo 160 caratteri'),
  description: z.string().trim().min(1, 'Obbligatorio').max(4000, 'Al massimo 4000 caratteri'),
  /** Every way to travel it. */
  modes: z.array(z.enum(ITINERARY_MODE_IDS)).min(1, 'Scegli almeno un mezzo'),
  /** Free text: "Mezza giornata", "3 ore". */
  duration: z.string().trim().max(60, 'Al massimo 60 caratteri'),
  /** Free text: "Da maggio a ottobre". */
  season: z.string().trim().max(80, 'Al massimo 80 caratteri'),
  kidFriendly: z.boolean(),
  petFriendly: z.boolean(),
  stops: z
    .array(z.object({ poiId: z.string().min(1, 'Scegli un luogo'), note: z.string().trim().max(500, 'Al massimo 500 caratteri') }))
    .min(2, 'Servono almeno due tappe')
    .max(MAX_STOPS, `Al massimo ${MAX_STOPS} tappe`),
  published: z.boolean(),
  sortOrder: z.number().int().min(0),
})

export type ItineraryInput = z.infer<typeof itineraryInput>

/** An itinerary as the site and the admin read it. */
export type Itinerary = ItineraryInput
