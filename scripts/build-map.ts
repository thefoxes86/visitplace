/**
 * Bakes the data behind the 3D map of Camaiore into public/map/.
 *
 *   npm run build:map
 *
 * Sources (downloads are cached in .cache/map, delete it to refresh):
 * - OpenStreetMap via the Overpass API (© OpenStreetMap contributors, ODbL)
 * - Elevation: Terrarium tiles from the AWS Terrain Tiles open dataset
 *   (https://github.com/tilezen/joerd/blob/master/docs/attribution.md)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PNG } from 'pngjs'

import {
  AREA_KINDS,
  BBOX,
  BUILDING_KINDS,
  MAP_DEPTH,
  MAP_WIDTH,
  ROAD_KINDS,
  TERRAIN_COLS,
  TERRAIN_ROWS,
  TREE_KINDS,
  project,
  unproject,
} from '../src/components/city-map/geo.ts'
import type {
  AreaKind,
  BuildingKind,
  MapFeatures,
  RoadKind,
  TreeKind,
} from '../src/components/city-map/geo.ts'

const CACHE = '.cache/map'
const OUT = 'public/map'
const DEM_ZOOM = 14

type Tags = Record<string, string | undefined>
interface LatLon {
  lat: number
  lon: number
}
interface OsmWay {
  type: 'way'
  id: number
  tags?: Tags
  geometry?: LatLon[]
}
interface OsmRelation {
  type: 'relation'
  id: number
  tags?: Tags
  members: { type: string; role: string; geometry?: LatLon[] }[]
}
type OsmElement = OsmWay | OsmRelation
type Point = [number, number]

// ---------------------------------------------------------------- downloads

const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function overpass(name: string, body: string): Promise<OsmElement[]> {
  const file = join(CACHE, `${name}.json`)
  try {
    return JSON.parse(await readFile(file, 'utf8')).elements
  } catch {
    // not cached yet
  }
  const bbox = `${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}`
  const query = `[out:json][timeout:180][bbox:${bbox}];${body}`
  for (let attempt = 0; attempt < 9; attempt++) {
    const url = OVERPASS[attempt % OVERPASS.length]
    console.log(`  ${name}: querying ${new URL(url).host} (attempt ${attempt + 1})`)
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: new URLSearchParams({ data: query }),
        headers: { 'User-Agent': 'visitcamaiore-map-builder/1.0' },
      })
      const text = await res.text()
      if (res.ok && text.startsWith('{')) {
        const json = JSON.parse(text)
        if (!String(json.remark ?? '').includes('error')) {
          await writeFile(file, text)
          return json.elements
        }
        console.warn(`  ${name}: ${json.remark}`)
      } else {
        console.warn(`  ${name}: HTTP ${res.status}`)
      }
    } catch (error) {
      console.warn(`  ${name}: ${(error as Error).message}`)
    }
    await sleep(10_000 * (attempt + 1))
  }
  throw new Error(`Overpass query "${name}" failed`)
}

async function demTile(x: number, y: number) {
  const file = join(CACHE, `terrarium-${DEM_ZOOM}-${x}-${y}.png`)
  let buffer: Buffer
  try {
    buffer = await readFile(file)
  } catch {
    const res = await fetch(
      `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${DEM_ZOOM}/${x}/${y}.png`,
    )
    if (!res.ok) throw new Error(`DEM tile ${x}/${y}: HTTP ${res.status}`)
    buffer = Buffer.from(await res.arrayBuffer())
    await writeFile(file, buffer)
  }
  const png = PNG.sync.read(buffer)
  const heights = new Float32Array(256 * 256)
  for (let i = 0; i < heights.length; i++) {
    const [r, g, b] = [png.data[i * 4], png.data[i * 4 + 1], png.data[i * 4 + 2]]
    heights[i] = r * 256 + g + b / 256 - 32768
  }
  return heights
}

// ---------------------------------------------------------------- geometry

function mercator(lat: number, lon: number): Point {
  const n = 2 ** DEM_ZOOM * 256
  const latRad = (lat * Math.PI) / 180
  return [
    ((lon + 180) / 360) * n,
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  ]
}

function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack: [number, number][] = [[0, points.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()!
    const [ax, az] = points[a]
    const [bx, bz] = points[b]
    const len = Math.hypot(bx - ax, bz - az)
    let max = 0
    let index = -1
    for (let i = a + 1; i < b; i++) {
      // Closed rings start and end on the same point: use plain distance.
      const d = len
        ? Math.abs((bx - ax) * (az - points[i][1]) - (ax - points[i][0]) * (bz - az)) / len
        : Math.hypot(points[i][0] - ax, points[i][1] - az)
      if (d > max) {
        max = d
        index = i
      }
    }
    if (max > tolerance) {
      keep[index] = 1
      stack.push([a, index], [index, b])
    }
  }
  return points.filter((_, i) => keep[i])
}

const toPoints = (geometry: LatLon[]) => geometry.map(({ lat, lon }) => project(lat, lon))
const flat = (points: Point[], precision = 1) =>
  points.flatMap(([x, z]) => [Math.round(x * precision) / precision, Math.round(z * precision) / precision])

function polygonArea(points: Point[]) {
  let area = 0
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    area += (points[j][0] - points[i][0]) * (points[j][1] + points[i][1])
  }
  return area / 2
}

/** Joins the member ways of a multipolygon into closed rings. */
function assembleRings(parts: LatLon[][]): LatLon[][] {
  const same = (a: LatLon, b: LatLon) => a.lat === b.lat && a.lon === b.lon
  const open = parts.filter((p) => p.length > 1).map((p) => p.slice())
  const rings: LatLon[][] = []
  while (open.length) {
    let ring = open.pop()!
    let joined = true
    while (joined && !same(ring[0], ring[ring.length - 1])) {
      joined = false
      for (let i = 0; i < open.length; i++) {
        const p = open[i]
        const first = ring[0]
        const last = ring[ring.length - 1]
        if (same(last, p[0])) ring = ring.concat(p.slice(1))
        else if (same(last, p[p.length - 1])) ring = ring.concat(p.reverse().slice(1))
        else if (same(first, p[p.length - 1])) ring = p.concat(ring.slice(1))
        else if (same(first, p[0])) ring = p.reverse().concat(ring.slice(1))
        else continue
        open.splice(i, 1)
        joined = true
        break
      }
    }
    if (ring.length >= 4) rings.push(ring)
  }
  return rings
}

function elementRings(element: OsmElement): LatLon[][] {
  if (element.type === 'way') {
    const g = element.geometry
    return g && g.length >= 4 && g[0].lat === g[g.length - 1].lat && g[0].lon === g[g.length - 1].lon
      ? [g]
      : []
  }
  return assembleRings(element.members.filter((m) => m.type === 'way' && m.geometry).map((m) => m.geometry!))
}

/** x coordinates where a horizontal line at z crosses any of the rings. */
function crossings(rings: Point[][], z: number) {
  const xs: number[] = []
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x1, z1] = ring[j]
      const [x2, z2] = ring[i]
      if (z1 > z !== z2 > z) xs.push(x1 + ((z - z1) / (z2 - z1)) * (x2 - x1))
    }
  }
  return xs.sort((a, b) => a - b)
}

// Deterministic randomness so re-running the bake gives identical output.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------- classification

function areaKind(t: Tags): AreaKind | undefined {
  const { landuse: l, natural: n, leisure: le } = t
  if (n === 'water' || l === 'reservoir' || l === 'basin' || t.waterway === 'riverbank') return 'water'
  if (n === 'beach' || n === 'sand') return 'beach'
  if (l === 'forest' || n === 'wood') return 'forest'
  if (n === 'scrub' || n === 'heath') return 'scrub'
  if (l === 'orchard' || l === 'vineyard') return 'orchard'
  if (['farmland', 'farmyard', 'greenhouse_horticulture', 'plant_nursery', 'allotments'].includes(l!))
    return 'farmland'
  if (['meadow', 'grass', 'village_green', 'recreation_ground', 'cemetery'].includes(l!) || n === 'grassland')
    return 'meadow'
  if (le === 'park' || le === 'garden' || le === 'golf_course') return 'park'
  if (le === 'pitch' || le === 'sports_centre' || le === 'stadium') return 'pitch'
  if (t.amenity === 'parking') return 'parking'
  if (l === 'residential') return 'residential'
  if (['commercial', 'industrial', 'retail', 'railway', 'construction', 'military', 'brownfield'].includes(l!))
    return 'industrial'
  if (l === 'quarry' || n === 'bare_rock' || n === 'scree') return 'quarry'
  return undefined
}

function roadKind(t: Tags): RoadKind | undefined {
  if (t.railway === 'rail') return 'rail'
  const h = t.highway?.replace(/_link$/, '')
  if (h === 'motorway' || h === 'trunk' || h === 'primary' || h === 'secondary' || h === 'tertiary') return h
  if (h === 'unclassified' || h === 'residential' || h === 'living_street' || h === 'road') return 'minor'
  if (h === 'pedestrian') return 'pedestrian'
  if (h === 'service') return 'service'
  if (h === 'track') return 'track'
  return undefined
}

function buildingKind(t: Tags): BuildingKind {
  const b = t.building ?? ''
  if (t['tower:type'] === 'bell_tower' || ['bell_tower', 'campanile', 'tower'].includes(b) || t.man_made === 'tower')
    return 'tower'
  if (['church', 'cathedral', 'chapel', 'basilica', 'religious'].includes(b) || t.amenity === 'place_of_worship')
    return 'church'
  if (
    ['industrial', 'warehouse', 'garage', 'garages', 'shed', 'roof', 'hangar', 'farm_auxiliary', 'barn',
      'greenhouse', 'service', 'carport', 'manufacture', 'storage_tank'].includes(b)
  )
    return 'industrial'
  if (
    ['apartments', 'commercial', 'hotel', 'retail', 'office', 'public', 'school', 'hospital', 'civic',
      'university', 'government', 'dormitory'].includes(b)
  )
    return 'block'
  return 'house'
}

function buildingHeight(t: Tags, kind: BuildingKind, rand: () => number) {
  const height = parseFloat(t.height ?? '')
  if (height > 0) return height
  const levels = parseFloat(t['building:levels'] ?? '')
  if (levels > 0) return levels * 3.2 + 1.2
  switch (kind) {
    case 'tower':
      return 28
    case 'church':
      return 13 + rand() * 4
    case 'block':
      return 11 + rand() * 7
    case 'industrial':
      return ['shed', 'garage', 'garages', 'roof', 'carport'].includes(t.building!) ? 3 : 6 + rand() * 3
    default:
      return 6 + rand() * 3.5
  }
}

// ---------------------------------------------------------------- main

async function main() {
  await mkdir(CACHE, { recursive: true })
  await mkdir(OUT, { recursive: true })

  console.log('Downloading OpenStreetMap data…')
  const coast = await overpass('coastline', 'way[natural=coastline];out geom;')
  const areaElements = await overpass(
    'areas',
    `(way[landuse];relation[landuse][type=multipolygon];
      way[natural~"^(water|beach|sand|wood|scrub|heath|grassland|bare_rock|scree)$"];
      relation[natural~"^(water|beach|sand|wood|scrub|heath|grassland|bare_rock)$"][type=multipolygon];
      way[leisure~"^(park|garden|golf_course|pitch|sports_centre|stadium)$"];
      way[amenity=parking];way[waterway=riverbank];);out geom;`,
  )
  const roadElements = await overpass(
    'roads',
    `(way[highway~"^(motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified|residential|living_street|pedestrian|service|track|road)$"][area!=yes];
      way[railway=rail];);out geom;`,
  )
  const waterElements = await overpass('waterways', 'way[waterway~"^(river|stream|canal|ditch|drain)$"];out geom;')
  const buildingElements = await overpass('buildings', '(way[building];way[man_made=pier];);out geom;')

  // ---- terrain
  console.log('Building terrain…')
  const [left, top] = mercator(BBOX.north, BBOX.west)
  const [right, bottom] = mercator(BBOX.south, BBOX.east)
  const tiles = new Map<string, Float32Array>()
  for (let ty = Math.floor(top / 256); ty <= Math.floor(bottom / 256); ty++) {
    for (let tx = Math.floor(left / 256); tx <= Math.floor(right / 256); tx++) {
      tiles.set(`${tx}/${ty}`, await demTile(tx, ty))
    }
  }
  const demPixel = (px: number, py: number) => {
    const tile = tiles.get(`${Math.floor(px / 256)}/${Math.floor(py / 256)}`)!
    return tile[(py % 256) * 256 + (px % 256)]
  }
  const dem = (lat: number, lon: number) => {
    const [mx, my] = mercator(lat, lon)
    const x0 = Math.floor(mx - 0.5)
    const y0 = Math.floor(my - 0.5)
    const u = mx - 0.5 - x0
    const v = my - 0.5 - y0
    return (
      demPixel(x0, y0) * (1 - u) * (1 - v) +
      demPixel(x0 + 1, y0) * u * (1 - v) +
      demPixel(x0, y0 + 1) * (1 - u) * v +
      demPixel(x0 + 1, y0 + 1) * u * v
    )
  }

  // The coastline is an open line with the sea to the west: an even number of
  // crossings west of a point means it is at sea.
  const coastLines = coast.flatMap((e) => (e.type === 'way' && e.geometry ? [toPoints(e.geometry)] : []))
  const coastSegments = coastLines.map((line) => [...line, ...line.slice(0, -1).reverse()])
  const heights = new Int16Array(TERRAIN_COLS * TERRAIN_ROWS)
  const coastX = new Float32Array(TERRAIN_ROWS)
  for (let j = 0; j < TERRAIN_ROWS; j++) {
    const z = -MAP_DEPTH / 2 + (j / (TERRAIN_ROWS - 1)) * MAP_DEPTH
    // Each open line is closed onto itself, which counts every crossing twice.
    const xs = crossings(coastSegments, z).filter((_, i) => i % 2 === 0)
    coastX[j] = xs[0] ?? -Infinity
    for (let i = 0; i < TERRAIN_COLS; i++) {
      const x = -MAP_WIDTH / 2 + (i / (TERRAIN_COLS - 1)) * MAP_WIDTH
      const west = xs.filter((cx) => cx < x).length
      // Near the shore the height is proportional to the (horizontal) distance
      // from the coastline, so the waterline interpolates into a straight line
      // instead of following the grid.
      const SHORE = 50
      const SLOPE = 0.03
      let h: number
      if (west % 2 === 0 && xs.length) {
        const d = (xs.find((cx) => cx > x) ?? x) - x
        h = d < SHORE ? -d * SLOPE : -Math.min(25, SHORE * SLOPE + (d - SHORE) * 0.012)
      } else {
        const d = x - (xs.filter((cx) => cx < x).pop() ?? -Infinity)
        const [lat, lon] = unproject(x, z)
        h = d < SHORE ? d * SLOPE : Math.max(dem(lat, lon), SHORE * SLOPE)
      }
      heights[j * TERRAIN_COLS + i] = Math.round(h * 10)
    }
  }
  await writeFile(join(OUT, 'terrain.bin'), Buffer.from(heights.buffer))

  // ---- areas
  console.log('Processing land use…')
  const features: MapFeatures = { areas: [], roads: [], waterways: [] }
  const treeAreas: { kind: TreeKind; rings: Point[][] }[] = []
  for (const element of areaElements) {
    const kind = areaKind(element.tags ?? {})
    if (!kind) continue
    const rings = elementRings(element)
      .map((ring) => simplify(toPoints(ring), 2))
      .filter((ring) => ring.length >= 4)
    if (!rings.length) continue
    features.areas.push({ k: AREA_KINDS.indexOf(kind), r: rings.map((r) => flat(r)) })
    if (kind === 'forest') {
      const needle = element.tags?.leaf_type === 'needleleaved'
      const cx = rings[0].reduce((s, p) => s + p[0], 0) / rings[0].length
      const cz = rings[0].reduce((s, p) => s + p[1], 0) / rings[0].length
      const row = Math.round(((cz + MAP_DEPTH / 2) / MAP_DEPTH) * (TERRAIN_ROWS - 1))
      const nearCoast = cx - coastX[Math.min(Math.max(row, 0), TERRAIN_ROWS - 1)] < 2500
      treeAreas.push({ kind: needle || nearCoast ? 'pine' : 'broadleaf', rings })
    } else if (kind === 'orchard') {
      treeAreas.push({ kind: 'olive', rings })
    }
  }
  // Draw large areas first so small details stay visible on top.
  features.areas.sort((a, b) => a.k - b.k)

  // ---- roads & waterways
  console.log('Processing roads…')
  for (const element of roadElements) {
    if (element.type !== 'way' || !element.geometry || element.tags?.tunnel) continue
    const kind = roadKind(element.tags ?? {})
    if (!kind) continue
    features.roads.push({ k: ROAD_KINDS.indexOf(kind), p: flat(simplify(toPoints(element.geometry), 0.7), 2) })
  }
  const waterWidth: Record<string, number> = { river: 14, canal: 8, stream: 4, ditch: 2, drain: 2 }
  for (const element of waterElements) {
    if (element.type !== 'way' || !element.geometry || element.tags?.tunnel) continue
    features.waterways.push({
      w: waterWidth[element.tags?.waterway ?? ''] ?? 3,
      p: flat(simplify(toPoints(element.geometry), 1.5)),
    })
  }
  await writeFile(join(OUT, 'features.json'), JSON.stringify(features))

  // ---- buildings: [u32 count] then per building
  //      [u16 vertices][u16 height dm][u8 kind][(i16 x*2, i16 z*2) × vertices]
  console.log('Processing buildings…')
  const rand = mulberry32(1)
  const chunks: Buffer[] = []
  let buildingCount = 0
  const pushBuilding = (ring: Point[], height: number, kind: BuildingKind) => {
    const n = ring.length
    const buf = Buffer.alloc(5 + n * 4)
    buf.writeUInt16LE(n, 0)
    buf.writeUInt16LE(Math.min(Math.round(height * 10), 65535), 2)
    buf.writeUInt8(BUILDING_KINDS.indexOf(kind), 4)
    ring.forEach(([x, z], i) => {
      buf.writeInt16LE(Math.round(x * 2), 5 + i * 4)
      buf.writeInt16LE(Math.round(z * 2), 7 + i * 4)
    })
    chunks.push(buf)
    buildingCount++
  }
  for (const element of buildingElements) {
    if (element.type !== 'way' || !element.geometry) continue
    const tags = element.tags ?? {}
    const points = toPoints(element.geometry)
    const closed = elementRings(element).length > 0
    if (tags.man_made === 'pier') {
      if (closed) {
        pushBuilding(points.slice(0, -1), 0, 'pier')
      } else {
        // Line piers become one deck slab per segment.
        const half = (parseFloat(tags.width ?? '') || 6) / 2
        for (let i = 1; i < points.length; i++) {
          const [ax, az] = points[i - 1]
          const [bx, bz] = points[i]
          const len = Math.hypot(bx - ax, bz - az) || 1
          const nx = (-(bz - az) / len) * half
          const nz = ((bx - ax) / len) * half
          pushBuilding(
            [[ax + nx, az + nz], [bx + nx, bz + nz], [bx - nx, bz - nz], [ax - nx, az - nz]],
            0,
            'pier',
          )
        }
      }
      continue
    }
    if (!closed) continue
    const ring = points.slice(0, -1)
    const kind = buildingKind(tags)
    if (Math.abs(polygonArea(ring)) < 12 && kind !== 'tower') continue
    pushBuilding(ring, buildingHeight(tags, kind, rand), kind)
  }
  const header = Buffer.alloc(4)
  header.writeUInt32LE(buildingCount)
  await writeFile(join(OUT, 'buildings.bin'), Buffer.concat([header, ...chunks]))

  // ---- trees: scanline-fill forests and olive groves on a jittered grid
  //      [u32 count] then per tree [i16 x*2][i16 z*2][u8 kind]
  console.log('Planting trees…')
  const spacing: Record<TreeKind, number> = { broadleaf: 15, pine: 15, olive: 10 }
  const MAX_TREES = 60_000
  let trees: [number, number, number][] = []
  const treeRand = mulberry32(2)
  for (const { kind, rings } of treeAreas) {
    const s = spacing[kind]
    const zs = rings.flat().map((p) => p[1])
    const z0 = Math.max(Math.min(...zs), -MAP_DEPTH / 2)
    const z1 = Math.min(Math.max(...zs), MAP_DEPTH / 2)
    for (let z = Math.ceil(z0 / s) * s; z < z1; z += s) {
      const xs = crossings(rings, z)
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const from = Math.max(xs[k], -MAP_WIDTH / 2)
        const to = Math.min(xs[k + 1], MAP_WIDTH / 2)
        for (let x = Math.ceil(from / s) * s; x < to; x += s) {
          const px = x + (treeRand() - 0.5) * s * 0.8
          const pz = z + (treeRand() - 0.5) * s * 0.8
          trees.push([px, pz, TREE_KINDS.indexOf(kind)])
        }
      }
    }
  }
  if (trees.length > MAX_TREES) {
    const keep = MAX_TREES / trees.length
    trees = trees.filter(() => treeRand() < keep)
  }
  const treeBuf = Buffer.alloc(4 + trees.length * 5)
  treeBuf.writeUInt32LE(trees.length)
  trees.forEach(([x, z, k], i) => {
    treeBuf.writeInt16LE(Math.round(x * 2), 4 + i * 5)
    treeBuf.writeInt16LE(Math.round(z * 2), 6 + i * 5)
    treeBuf.writeUInt8(k, 8 + i * 5)
  })
  await writeFile(join(OUT, 'trees.bin'), treeBuf)

  console.log(
    `Done: ${buildingCount} buildings, ${features.roads.length} roads, ` +
      `${features.areas.length} areas, ${features.waterways.length} waterways, ${trees.length} trees.`,
  )
}

await main()
