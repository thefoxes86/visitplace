import type { DetailValues } from '#/lib/category-types'
import type { RecurrenceId } from '#/lib/event-dates'
import type { GalleryPhoto, PhotoCredit, PoiLink } from '#/lib/media'

/** A point of the tourist map, as stored in the `pois` table. */
export interface Poi {
  /** Also the URL: /luoghi/<id>. */
  id: string
  /** Map number, the same everywhere on the site; null for places not on the map. */
  number: number | null
  name: string
  /** Id in the `categories` table, see useCategories(). */
  category: string
  summary: string
  description: string
  /** Part of the comune the place is in. */
  area: string
  lat: number
  lon: number
  /** Shown among the main attractions on the home page. */
  featured: boolean
  /** Shown and numbered on the tourist map. */
  showOnMap: boolean
  imageUrl: string | null
  /** Author, licence and source of the main photo. */
  imageCredit: PhotoCredit | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  /** Fields of the category's type (src/lib/category-types.ts). */
  details: DetailValues
  /** Events only, see src/lib/event-dates.ts. */
  startsAt: Date | null
  endsAt: Date | null
  allDay: boolean
  recurrence: RecurrenceId | null
  recurrenceUntil: Date | null
  /** Photos of the place's page, in order. */
  gallery: GalleryPhoto[]
  /** Pages about the place elsewhere, each with its name. */
  links: PoiLink[]
  /** Whether it has a GPS track: the points load with its page only (getPoiTrack). */
  hasTrack: boolean
}

/** A place in src/db/seed-data.ts: everything optional is left out. */
export type SeedPoi = Pick<Poi, 'id' | 'name' | 'category' | 'summary' | 'description' | 'area' | 'lat' | 'lon'> &
  Partial<Pick<Poi, 'featured' | 'showOnMap' | 'imageUrl' | 'imageCredit' | 'gallery' | 'address' | 'phone' | 'email' | 'website' | 'details' | 'links'>> & {
    /** Left out, a seeded place is published; false keeps a draft to complete in the admin. */
    published?: boolean
  }

/** Map number of a point, the same everywhere on the site. */
export const poiNumber = (poi: Pick<Poi, 'number'>) => (poi.number === null ? null : String(poi.number).padStart(2, '0'))

/** The place's photo, or a demo image until one is set in the admin. */
export const poiImage = (poi: Pick<Poi, 'id' | 'imageUrl'>, size = 800) =>
  poi.imageUrl || `https://picsum.photos/seed/camaiore-${poi.id}/${size}/${size}`

/** Straight-line distance in kilometres. */
export function distanceKm(a: Poi, b: Poi) {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLon = (b.lon - a.lon) * rad * Math.cos(((a.lat + b.lat) / 2) * rad)
  return Math.hypot(dLat, dLon) * 6371
}

/** "12 giugno 2026, 21:00" (time left out at midnight). */
export function formatEventDate(date: Date) {
  const timeZone = 'Europe/Rome'
  const midnight = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone }) === '00:00'
  return date.toLocaleString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(midnight ? {} : { hour: '2-digit', minute: '2-digit' }),
    timeZone,
  })
}
