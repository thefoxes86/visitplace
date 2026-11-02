import type { ItineraryModeId } from '#/lib/itineraries'

/**
 * The outdoor map: hikes, crags and itineraries as one list of items with the same
 * attributes, filtered together. An item shows when it meets every active filter;
 * one without the data a filter asks for is left out.
 */

export const OUTDOOR_KINDS = {
  trekking: 'Trekking',
  climbing: 'Falesie',
  itinerary: 'Itinerari',
} as const

export type OutdoorKind = keyof typeof OUTDOOR_KINDS

export const OUTDOOR_KIND_IDS = Object.keys(OUTDOOR_KINDS) as OutdoorKind[]

export interface OutdoorItem {
  key: string
  kind: OutdoorKind
  /** Id of the place, or of the itinerary. */
  id: string
  name: string
  lat: number
  lon: number
  color: string
  /** Category id of a place, for its icon. */
  category: string | null
  /** The key figures, on one line: "E · 9,8 km · 800 m". */
  facts: string
  summary: string
  imageOf: { id: string; imageUrl: string | null } | null
  family: boolean
  rain: boolean
  /** Km of a hike or an itinerary; null when unknown or for crags. */
  lengthKm: number | null
  /** Ways to travel it: hikes are on foot, crags have none. */
  modes: ItineraryModeId[]
  /** Trekking difficulty: T, E, EE, EEA. */
  difficulty: string | null
  /** Crag grades as numbers (see gradeValue); null when unknown. */
  gradeMin: number | null
  gradeMax: number | null
}

export const LENGTHS = {
  any: 'Qualsiasi',
  short: 'Fino a 5 km',
  medium: '5–12 km',
  long: 'Oltre 12 km',
} as const

export const GRADES = {
  any: 'Qualsiasi',
  easy: 'Per iniziare (fino al 5c)',
  medium: 'Medio (6a–6c+)',
  hard: 'Duro (dal 7c)',
} as const

export const DIFFICULTIES = ['T', 'E', 'EE', 'EEA'] as const

export interface OutdoorFilters {
  kinds: OutdoorKind[]
  family: boolean
  rain: boolean
  length: keyof typeof LENGTHS
  mode: 'any' | ItineraryModeId
  difficulty: 'any' | (typeof DIFFICULTIES)[number]
  grade: keyof typeof GRADES
}

export const NO_FILTERS: OutdoorFilters = {
  kinds: [...OUTDOOR_KIND_IDS],
  family: false,
  rain: false,
  length: 'any',
  mode: 'any',
  difficulty: 'any',
  grade: 'any',
}

/** How many filters are set, besides the kinds. */
export const activeFilters = (f: OutdoorFilters) =>
  [f.family, f.rain, f.length !== 'any', f.mode !== 'any', f.difficulty !== 'any', f.grade !== 'any'].filter(Boolean).length

/**
 * A French climbing grade as a number that sorts right: six steps per degree,
 * a/b/c two apart and "+" one up. "6a" → 36, "6a+" → 37, "7c" → 46; "5+" sits near 5c.
 */
export function gradeValue(grade: unknown): number | null {
  const m = /^([3-9])([abc])?(\+)?/i.exec(String(grade ?? '').trim())
  if (!m) return null
  const base = Number(m[1]) * 6
  if (!m[2]) return base + (m[3] ? 3 : 1)
  return base + { a: 0, b: 2, c: 4 }[m[2].toLowerCase() as 'a' | 'b' | 'c'] + (m[3] ? 1 : 0)
}

const EASY_MAX = gradeValue('5c')!
const MEDIUM = [gradeValue('6a')!, gradeValue('6c+')!] as const
const HARD_MIN = gradeValue('7c')!

export function matches(item: OutdoorItem, f: OutdoorFilters) {
  if (!f.kinds.includes(item.kind)) return false
  if (f.family && !item.family) return false
  if (f.rain && !item.rain) return false
  if (f.length !== 'any') {
    const km = item.lengthKm
    if (km === null) return false
    if (f.length === 'short' && km > 5) return false
    if (f.length === 'medium' && (km < 5 || km > 12)) return false
    if (f.length === 'long' && km < 12) return false
  }
  if (f.mode !== 'any' && !item.modes.includes(f.mode)) return false
  if (f.difficulty !== 'any' && item.difficulty !== f.difficulty) return false
  if (f.grade !== 'any') {
    const { gradeMin: min, gradeMax: max } = item
    if (min === null || max === null) return false
    if (f.grade === 'easy' && min > EASY_MAX) return false
    if (f.grade === 'medium' && (min > MEDIUM[1] || max < MEDIUM[0])) return false
    if (f.grade === 'hard' && max < HARD_MIN) return false
  }
  return true
}
