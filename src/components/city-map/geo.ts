/**
 * Geographic helpers shared by the map bake script (scripts/build-map.ts) and
 * the browser. World units are metres: x grows east, z grows south, y is
 * elevation above sea level.
 */

export const BBOX = { south: 43.875, west: 10.185, north: 43.965, east: 10.375 }

export const ORIGIN = {
  lat: (BBOX.south + BBOX.north) / 2,
  lon: (BBOX.west + BBOX.east) / 2,
}

const RAD = Math.PI / 180
const METERS_PER_DEG_LAT = 111132.954 - 559.822 * Math.cos(2 * ORIGIN.lat * RAD)
const METERS_PER_DEG_LON =
  111412.84 * Math.cos(ORIGIN.lat * RAD) - 93.5 * Math.cos(3 * ORIGIN.lat * RAD)

export const MAP_WIDTH = (BBOX.east - BBOX.west) * METERS_PER_DEG_LON
export const MAP_DEPTH = (BBOX.north - BBOX.south) * METERS_PER_DEG_LAT

/** Distance between terrain samples, in metres. */
export const TERRAIN_SPACING = 25
export const TERRAIN_COLS = Math.round(MAP_WIDTH / TERRAIN_SPACING) + 1
export const TERRAIN_ROWS = Math.round(MAP_DEPTH / TERRAIN_SPACING) + 1

export function project(lat: number, lon: number): [x: number, z: number] {
  return [(lon - ORIGIN.lon) * METERS_PER_DEG_LON, -(lat - ORIGIN.lat) * METERS_PER_DEG_LAT]
}

export function unproject(x: number, z: number): [lat: number, lon: number] {
  return [ORIGIN.lat - z / METERS_PER_DEG_LAT, ORIGIN.lon + x / METERS_PER_DEG_LON]
}

/** Row-major grid of elevations (metres), row 0 is the northern edge. */
export type Heights = Float32Array

/**
 * Elevation at (x, z), interpolated on exactly the same triangles the terrain
 * mesh uses so that roads, buildings and markers sit on the visible surface.
 */
export function sampleHeight(heights: Heights, x: number, z: number) {
  const fx = Math.min(Math.max(((x + MAP_WIDTH / 2) / MAP_WIDTH) * (TERRAIN_COLS - 1), 0), TERRAIN_COLS - 1.0001)
  const fz = Math.min(Math.max(((z + MAP_DEPTH / 2) / MAP_DEPTH) * (TERRAIN_ROWS - 1), 0), TERRAIN_ROWS - 1.0001)
  const i = Math.floor(fx)
  const j = Math.floor(fz)
  const u = fx - i
  const v = fz - j
  const h00 = heights[j * TERRAIN_COLS + i]
  const h10 = heights[j * TERRAIN_COLS + i + 1]
  const h01 = heights[(j + 1) * TERRAIN_COLS + i]
  const h11 = heights[(j + 1) * TERRAIN_COLS + i + 1]
  if (u + v <= 1) return h00 + (h10 - h00) * u + (h01 - h00) * v
  return h11 + (h01 - h11) * (1 - u) + (h10 - h11) * (1 - v)
}

export const AREA_KINDS = [
  'farmland',
  'meadow',
  'orchard',
  'scrub',
  'forest',
  'residential',
  'industrial',
  'quarry',
  'park',
  'parking',
  'pitch',
  'beach',
  'water',
] as const
export type AreaKind = (typeof AREA_KINDS)[number]

export const ROAD_KINDS = [
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'tertiary',
  'minor',
  'pedestrian',
  'service',
  'track',
  'rail',
] as const
export type RoadKind = (typeof ROAD_KINDS)[number]

export const BUILDING_KINDS = ['house', 'block', 'church', 'industrial', 'tower', 'pier'] as const
export type BuildingKind = (typeof BUILDING_KINDS)[number]

export const TREE_KINDS = ['broadleaf', 'pine', 'olive'] as const
export type TreeKind = (typeof TREE_KINDS)[number]

export interface MapFeatures {
  /** Polygons as rings of flat [x, z, x, z, …] coordinates (metres). */
  areas: { k: number; r: number[][] }[]
  roads: { k: number; p: number[] }[]
  waterways: { w: number; p: number[] }[]
}
