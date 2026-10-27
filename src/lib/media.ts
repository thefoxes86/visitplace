import { z } from 'zod'

/**
 * Media of places: GPS tracks, read from .gpx files in the admin and stored in `pois.track`
 * (the points are simplified to stay light, the figures come from the full track), and photo galleries.
 */

/** Latitude, longitude and elevation in metres (null when the file has none). */
export type TrackPoint = [lat: number, lon: number, ele: number | null]

export interface Track {
  /** Name in the file, if any. */
  name: string | null
  points: TrackPoint[]
  /** Kilometres. */
  length: number
  /** Metres climbed and descended; null without elevations. */
  gain: number | null
  loss: number | null
  minEle: number | null
  maxEle: number | null
}

/** Most points kept: enough for a smooth line on the map, light enough for the page. */
export const MAX_POINTS = 1500

export const trackSchema = z.object({
  name: z.string().max(200).nullable(),
  points: z.array(z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180), z.number().nullable()])).min(2).max(MAX_POINTS),
  length: z.number().min(0),
  gain: z.number().nullable(),
  loss: z.number().nullable(),
  minEle: z.number().nullable(),
  maxEle: z.number().nullable(),
})

const rad = Math.PI / 180

/** Metres between two points. */
function distance(a: TrackPoint, b: TrackPoint) {
  const dLat = (b[0] - a[0]) * rad
  const dLon = (b[1] - a[1]) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2
  return 2 * 6371000 * Math.asin(Math.sqrt(h))
}

/** Climb and descent, ignoring changes under a few metres: GPS elevations jitter. */
function climb(points: TrackPoint[]) {
  const elevations = points.map((p) => p[2]).filter((e): e is number => e !== null)
  if (elevations.length < 2) return { gain: null, loss: null, minEle: null, maxEle: null }
  const THRESHOLD = 3
  let gain = 0
  let loss = 0
  let ref = elevations[0]
  for (const e of elevations) {
    if (e - ref >= THRESHOLD) {
      gain += e - ref
      ref = e
    } else if (ref - e >= THRESHOLD) {
      loss += ref - e
      ref = e
    }
  }
  return {
    gain: Math.round(gain),
    loss: Math.round(loss),
    minEle: Math.round(Math.min(...elevations)),
    maxEle: Math.round(Math.max(...elevations)),
  }
}

/** Distance in metres of a point from the segment a–b, on a flat local projection. */
function offset(p: TrackPoint, a: TrackPoint, b: TrackPoint) {
  const k = Math.cos(a[0] * rad) * 111320
  const [x, y] = [(p[1] - a[1]) * k, (p[0] - a[0]) * 110540]
  const [dx, dy] = [(b[1] - a[1]) * k, (b[0] - a[0]) * 110540]
  const len = dx * dx + dy * dy
  const t = len ? Math.max(0, Math.min(1, (x * dx + y * dy) / len)) : 0
  return Math.hypot(x - t * dx, y - t * dy)
}

/** Douglas–Peucker: drops the points closer than `tolerance` metres to the line through their neighbours. */
function simplifyBy(points: TrackPoint[], tolerance: number) {
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack: [number, number][] = [[0, points.length - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()!
    let far = 0
    let index = -1
    for (let i = first + 1; i < last; i++) {
      const d = offset(points[i], points[first], points[last])
      if (d > far) [far, index] = [d, i]
    }
    if (index !== -1 && far > tolerance) {
      keep[index] = 1
      stack.push([first, index], [index, last])
    }
  }
  return points.filter((_, i) => keep[i])
}

/** As few points as keep the shape, at most MAX_POINTS. */
function simplify(points: TrackPoint[]) {
  let tolerance = 2
  let out = simplifyBy(points, tolerance)
  while (out.length > MAX_POINTS) out = simplifyBy(points, (tolerance *= 2))
  return out
}

const round = (p: TrackPoint): TrackPoint => [
  Math.round(p[0] * 1e5) / 1e5,
  Math.round(p[1] * 1e5) / 1e5,
  p[2] === null ? null : Math.round(p[2]),
]

/** Reads a .gpx file's track (or route) points. Runs in the browser: it needs DOMParser. */
export function parseGpx(text: string): Track {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error('Il file non è un GPX valido.')
  let nodes = [...doc.getElementsByTagName('trkpt')]
  if (nodes.length < 2) nodes = [...doc.getElementsByTagName('rtept')]
  const points: TrackPoint[] = nodes
    .map((node): TrackPoint => {
      const ele = node.getElementsByTagName('ele')[0]?.textContent
      return [Number(node.getAttribute('lat')), Number(node.getAttribute('lon')), ele ? Number(ele) : null]
    })
    .filter(([lat, lon, ele]) => Number.isFinite(lat) && Number.isFinite(lon) && (ele === null || Number.isFinite(ele)))
  if (points.length < 2) throw new Error('Nel file non c’è una traccia: servono almeno due punti.')

  let meters = 0
  for (let i = 1; i < points.length; i++) meters += distance(points[i - 1], points[i])
  const name = (doc.querySelector('trk > name') ?? doc.querySelector('metadata > name'))?.textContent?.trim() || null
  return {
    name: name ? name.slice(0, 200) : null,
    points: simplify(points).map(round),
    length: Math.round(meters / 10) / 100,
    ...climb(points),
  }
}

const escapeXml = (text: string) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** The track as a .gpx file, to download on the place's page. */
export function toGpx(track: Track, name: string) {
  const points = track.points
    .map(([lat, lon, ele]) => `      <trkpt lat="${lat}" lon="${lon}">${ele === null ? '' : `<ele>${ele}</ele>`}</trkpt>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Visit Camaiore" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>
`
}

/** Cumulative distance in km at each point, for the elevation profile. */
export function distances(points: TrackPoint[]) {
  const out = [0]
  for (let i = 1; i < points.length; i++) out.push(out[i - 1] + distance(points[i - 1], points[i]) / 1000)
  return out
}

// ── Gallery ──────────────────────────────────────────────────────────────────

export interface GalleryPhoto {
  url: string
  /** Shown under the photo and read by screen readers. */
  caption: string
}

export const MAX_PHOTOS = 40

export const gallerySchema = z
  .array(z.object({ url: z.url('Indirizzo non valido'), caption: z.string().trim().max(200, 'Al massimo 200 caratteri') }))
  .max(MAX_PHOTOS, `Al massimo ${MAX_PHOTOS} foto`)
