/**
 * Turns the baked map data in public/map into GPU-ready buffers off the main
 * thread: terrain, the painted ground texture, buildings, roads and trees.
 */
import earcut from 'earcut'

import {
  AREA_KINDS,
  BUILDING_KINDS,
  MAP_DEPTH,
  MAP_WIDTH,
  ROAD_KINDS,
  TERRAIN_COLS,
  TERRAIN_ROWS,
  TREE_KINDS,
  sampleHeight,
} from './geo'
import type { AreaKind, BuildingKind, Heights, MapFeatures, RoadKind, TreeKind } from './geo'

export interface MeshBuffers {
  position: Float32Array
  normal: Float32Array
  color?: Uint8Array
  uv?: Float32Array
  index: Uint32Array
}

export interface TreeBuffers {
  kind: TreeKind
  matrices: Float32Array
  colors: Float32Array
}

export interface MapBuild {
  heights: Heights
  terrain: MeshBuffers
  skirt: MeshBuffers
  /** RGBA pixels of the painted ground; row 0 is the northern edge. */
  ground: { width: number; height: number; data: Uint8Array }
  buildings: MeshBuffers
  roads: MeshBuffers
  trees: TreeBuffers[]
}

export type MapWorkerResponse = { ok: true; build: MapBuild } | { ok: false; error: string }

// ---------------------------------------------------------------- helpers

type RGB = [number, number, number]

const hex = (value: string): RGB => {
  const n = parseInt(value.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Vertex and instance colours are read as linear values by three.js. */
const toLinear = (c: number) => {
  const v = Math.min(Math.max(c, 0), 255) / 255
  return (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4) * 255
}

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

const hash = (n: number) => {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}

const pick = <T,>(list: readonly T[], seed: number) => list[Math.floor(hash(seed) * list.length)]

/** Growable vertex/index storage for flat-shaded meshes. */
class MeshBuilder {
  position: number[] = []
  normal: number[] = []
  color: number[] = []
  index: number[] = []

  /** Adds a convex face; flips its winding so the normal agrees with `facing`. */
  face(points: number[][], color: RGB, facing: [number, number, number]) {
    const [a, b, c] = points
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2]
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2]
    let nx = uy * vz - uz * vy
    let ny = uz * vx - ux * vz
    let nz = ux * vy - uy * vx
    const len = Math.hypot(nx, ny, nz)
    if (len < 1e-9) return
    nx /= len
    ny /= len
    nz /= len
    if (nx * facing[0] + ny * facing[1] + nz * facing[2] < 0) {
      points = points.slice().reverse()
      nx = -nx
      ny = -ny
      nz = -nz
    }
    const start = this.position.length / 3
    for (const p of points) {
      this.position.push(p[0], p[1], p[2])
      this.normal.push(nx, ny, nz)
      this.color.push(color[0], color[1], color[2])
    }
    for (let i = 1; i + 1 < points.length; i++) this.index.push(start, start + i, start + i + 1)
  }

  toBuffers(): MeshBuffers {
    return {
      position: new Float32Array(this.position),
      normal: new Float32Array(this.normal),
      color: new Uint8Array(this.color.map((c) => Math.round(toLinear(c)))),
      index: new Uint32Array(this.index),
    }
  }
}

// ---------------------------------------------------------------- terrain

function buildTerrain(heights: Heights): MeshBuffers {
  const count = TERRAIN_COLS * TERRAIN_ROWS
  const position = new Float32Array(count * 3)
  const normal = new Float32Array(count * 3)
  const uv = new Float32Array(count * 2)
  const dx = MAP_WIDTH / (TERRAIN_COLS - 1)
  const dz = MAP_DEPTH / (TERRAIN_ROWS - 1)
  const h = (i: number, j: number) =>
    heights[Math.min(Math.max(j, 0), TERRAIN_ROWS - 1) * TERRAIN_COLS + Math.min(Math.max(i, 0), TERRAIN_COLS - 1)]

  for (let j = 0; j < TERRAIN_ROWS; j++) {
    for (let i = 0; i < TERRAIN_COLS; i++) {
      const k = j * TERRAIN_COLS + i
      position[k * 3] = -MAP_WIDTH / 2 + i * dx
      position[k * 3 + 1] = heights[k]
      position[k * 3 + 2] = -MAP_DEPTH / 2 + j * dz
      const nx = -(h(i + 1, j) - h(i - 1, j)) / (2 * dx)
      const nz = -(h(i, j + 1) - h(i, j - 1)) / (2 * dz)
      const len = Math.hypot(nx, 1, nz)
      normal[k * 3] = nx / len
      normal[k * 3 + 1] = 1 / len
      normal[k * 3 + 2] = nz / len
      uv[k * 2] = i / (TERRAIN_COLS - 1)
      uv[k * 2 + 1] = j / (TERRAIN_ROWS - 1)
    }
  }

  // Same split as sampleHeight(): (a, b, d) and (b, c, d).
  const index = new Uint32Array((TERRAIN_COLS - 1) * (TERRAIN_ROWS - 1) * 6)
  let n = 0
  for (let j = 0; j < TERRAIN_ROWS - 1; j++) {
    for (let i = 0; i < TERRAIN_COLS - 1; i++) {
      const a = j * TERRAIN_COLS + i
      const b = a + TERRAIN_COLS
      const c = b + 1
      const d = a + 1
      index.set([a, b, d, b, c, d], n)
      n += 6
    }
  }
  return { position, normal, uv, index }
}

/** Earth-coloured walls around the edge of the terrain block. */
function buildSkirt(heights: Heights): MeshBuffers {
  const mesh = new MeshBuilder()
  const bottom = -60
  const soil = hex('#7a6448')
  const edge = (points: [number, number][], facing: [number, number, number]) => {
    for (let k = 1; k < points.length; k++) {
      const [x0, z0] = points[k - 1]
      const [x1, z1] = points[k]
      mesh.face(
        [
          [x0, bottom, z0],
          [x1, bottom, z1],
          [x1, sampleHeight(heights, x1, z1), z1],
          [x0, sampleHeight(heights, x0, z0), z0],
        ],
        soil,
        facing,
      )
    }
  }
  const xs = Array.from({ length: TERRAIN_COLS }, (_, i) => -MAP_WIDTH / 2 + (i / (TERRAIN_COLS - 1)) * MAP_WIDTH)
  const zs = Array.from({ length: TERRAIN_ROWS }, (_, j) => -MAP_DEPTH / 2 + (j / (TERRAIN_ROWS - 1)) * MAP_DEPTH)
  edge(xs.map((x) => [x, -MAP_DEPTH / 2]), [0, 0, -1])
  edge(xs.map((x) => [x, MAP_DEPTH / 2]), [0, 0, 1])
  edge(zs.map((z) => [-MAP_WIDTH / 2, z]), [-1, 0, 0])
  edge(zs.map((z) => [MAP_WIDTH / 2, z]), [1, 0, 0])
  return mesh.toBuffers()
}

// ---------------------------------------------------------------- ground texture

const AREA_COLORS: Record<AreaKind, string[]> = {
  farmland: ['#bdb878', '#a9b26b', '#c8bc84', '#9fad66', '#b4a76d'],
  meadow: ['#9fb468', '#a6b86f'],
  orchard: ['#8f9b5f', '#97a265'],
  scrub: ['#7e8e54', '#86935a'],
  forest: ['#4a6a33', '#557a3a', '#43602f'],
  residential: ['#cbc1b0', '#c6bcab'],
  industrial: ['#beb8ae'],
  quarry: ['#d8d4cb'],
  park: ['#8db05a'],
  parking: ['#a9a49b'],
  pitch: ['#7ea85a'],
  beach: ['#e8d8a9'],
  water: ['#4a86a6'],
}

function paintGround(heights: Heights, features: MapFeatures): MapBuild['ground'] {
  const width = 4096
  const height = Math.round((width * MAP_DEPTH) / MAP_WIDTH)
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  // Slope per terrain vertex, used to expose rock on steep hillsides.
  const slope = new Float32Array(heights.length)
  const dx = MAP_WIDTH / (TERRAIN_COLS - 1)
  for (let j = 1; j < TERRAIN_ROWS - 1; j++) {
    for (let i = 1; i < TERRAIN_COLS - 1; i++) {
      const k = j * TERRAIN_COLS + i
      slope[k] = Math.hypot(heights[k + 1] - heights[k - 1], heights[k + TERRAIN_COLS] - heights[k - TERRAIN_COLS]) / (2 * dx)
    }
  }

  // Tileable value noise for natural patchiness; x and y are in grid cells.
  const NOISE = 64
  const noiseGrid = Float32Array.from({ length: NOISE * NOISE }, (_, i) => hash(i + 7))
  const noise = (x: number, y: number) => {
    const i = Math.floor(x)
    const j = Math.floor(y)
    const fx = x - i
    const fy = y - j
    const at = (a: number, b: number) => noiseGrid[(((b % NOISE) + NOISE) % NOISE) * NOISE + (((a % NOISE) + NOISE) % NOISE)]
    const a = at(i, j)
    const b = at(i + 1, j)
    const c = at(i, j + 1)
    const d = at(i + 1, j + 1)
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
  }

  const lowland = hex('#b2b47c')
  const upland = hex('#6d8748')
  const rock = hex('#9b968a')
  const shallow = hex('#d6c79e')
  const midSea = hex('#3f8792')
  const deepSea = hex('#21506d')
  const image = ctx.createImageData(width, height)
  const data = image.data
  for (let py = 0; py < height; py++) {
    const v = (py + 0.5) / height
    const z = -MAP_DEPTH / 2 + v * MAP_DEPTH
    for (let px = 0; px < width; px++) {
      const u = (px + 0.5) / width
      const x = -MAP_WIDTH / 2 + u * MAP_WIDTH
      const h = sampleHeight(heights, x, z)
      let color: RGB
      if (h < 0) {
        const t = Math.min(-h / 20, 1)
        color = t < 0.3 ? mix(shallow, midSea, t / 0.3) : mix(midSea, deepSea, (t - 0.3) / 0.7)
      } else {
        const k = Math.round(v * (TERRAIN_ROWS - 1)) * TERRAIN_COLS + Math.round(u * (TERRAIN_COLS - 1))
        color = mix(lowland, upland, Math.min(Math.max((h - 15) / 250, 0), 1))
        color = mix(color, rock, Math.min(Math.max((slope[k] - 0.55) / 0.4, 0), 0.7))
        const n = noise(u * 40, v * 26) * 0.6 + noise(u * 300, v * 200) * 0.4
        color = mix(color, [color[0] * 0.85, color[1] * 0.9, color[2] * 0.8], n)
      }
      const grain = (hash(py * width + px) - 0.5) * 10
      const o = (py * width + px) * 4
      data[o] = color[0] + grain
      data[o + 1] = color[1] + grain
      data[o + 2] = color[2] + grain
      data[o + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)

  const scale = width / MAP_WIDTH
  ctx.setTransform(scale, 0, 0, scale, width / 2, height / 2)

  for (const [n, area] of features.areas.entries()) {
    const kind = AREA_KINDS[area.k]
    const path = new Path2D()
    for (const ring of area.r) {
      path.moveTo(ring[0], ring[1])
      for (let i = 2; i < ring.length; i += 2) path.lineTo(ring[i], ring[i + 1])
      path.closePath()
    }
    ctx.globalAlpha = kind === 'residential' || kind === 'industrial' ? 0.75 : 0.9
    ctx.fillStyle = pick(AREA_COLORS[kind], n)
    ctx.fill(path, 'evenodd')
  }

  ctx.globalAlpha = 1
  ctx.strokeStyle = AREA_COLORS.water[0]
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const waterway of features.waterways) {
    ctx.lineWidth = waterway.w
    ctx.beginPath()
    ctx.moveTo(waterway.p[0], waterway.p[1])
    for (let i = 2; i < waterway.p.length; i += 2) ctx.lineTo(waterway.p[i], waterway.p[i + 1])
    ctx.stroke()
  }

  // Raw pixels rather than an ImageBitmap: GPU-backed bitmaps transferred
  // from a worker canvas intermittently fail to upload in Chrome.
  return { width, height, data: new Uint8Array(ctx.getImageData(0, 0, width, height).data.buffer) }
}

// ---------------------------------------------------------------- buildings

const WALLS: Record<BuildingKind, string[]> = {
  house: ['#ead9bb', '#f1e3c6', '#e4c69a', '#ebd3a9', '#f3ecdd', '#dbbb8e', '#e8c4a3', '#efe0bd'],
  block: ['#ebe3d5', '#dad2c4', '#e9d8c0', '#d1c8bb', '#e6cfae'],
  church: ['#e9dfca', '#e2d5bb'],
  industrial: ['#cbc8c1', '#bab7b0', '#d4d0c7'],
  tower: ['#e3d4b6'],
  pier: ['#c4b9a8'],
}
const TERRACOTTA = ['#b5563b', '#a74c35', '#c06b4c', '#9f4b36', '#c47b5b', '#b0604a']
const FLAT_ROOFS: Record<BuildingKind, string[]> = {
  house: TERRACOTTA,
  block: ['#b9b1a6', '#a69f95', '#b5563b', '#c1b8ac'],
  church: TERRACOTTA,
  industrial: ['#9c9a95', '#a9a69f', '#8e8c88', '#b4b1aa'],
  tower: TERRACOTTA,
  pier: ['#a88a68'],
}

function isConvex(ring: [number, number][]) {
  let sign = 0
  for (let i = 0; i < ring.length; i++) {
    const [ax, az] = ring[i]
    const [bx, bz] = ring[(i + 1) % ring.length]
    const [cx, cz] = ring[(i + 2) % ring.length]
    const cross = (bx - ax) * (cz - bz) - (bz - az) * (cx - bx)
    if (Math.abs(cross) < 1e-6) continue
    if (sign === 0) sign = Math.sign(cross)
    else if (Math.sign(cross) !== sign) return false
  }
  return true
}

function buildBuildings(buffer: ArrayBuffer, heights: Heights): MeshBuffers {
  const view = new DataView(buffer)
  const count = view.getUint32(0, true)
  const mesh = new MeshBuilder()
  let offset = 4

  for (let b = 0; b < count; b++) {
    const n = view.getUint16(offset, true)
    const height = view.getUint16(offset + 2, true) / 10
    const kind = BUILDING_KINDS[view.getUint8(offset + 4)]
    offset += 5
    const ring: [number, number][] = []
    for (let i = 0; i < n; i++) {
      ring.push([view.getInt16(offset, true) / 2, view.getInt16(offset + 2, true) / 2])
      offset += 4
    }
    if (ring.length < 3) continue

    const grounds = ring.map(([x, z]) => sampleHeight(heights, x, z))
    const base = kind === 'pier' ? -3 : Math.min(...grounds) - 1.5
    const top = kind === 'pier' ? 3.2 : Math.max(...grounds) + height
    const wall = hex(pick(WALLS[kind], b))
    const cx = ring.reduce((s, p) => s + p[0], 0) / n
    const cz = ring.reduce((s, p) => s + p[1], 0) / n

    let signedArea = 0
    for (let i = 0; i < n; i++) {
      const [x0, z0] = ring[i]
      const [x1, z1] = ring[(i + 1) % n]
      signedArea += x0 * z1 - x1 * z0
    }
    const outward = signedArea > 0 ? 1 : -1

    for (let i = 0; i < n; i++) {
      const [x0, z0] = ring[i]
      const [x1, z1] = ring[(i + 1) % n]
      mesh.face(
        [[x0, base, z0], [x1, base, z1], [x1, top, z1], [x0, top, z0]],
        wall,
        [(z1 - z0) * outward, 0, -(x1 - x0) * outward],
      )
    }

    const pitched = kind === 'house' || kind === 'church' || kind === 'tower' || (kind === 'block' && hash(b + 3) < 0.5)
    if (pitched && n === 4) {
      // Hip roof on (roughly) rectangular footprints.
      const roof = hex(pick(TERRACOTTA, b + 1))
      const [p0, p1, p2, p3] = ring
      const len = (a: [number, number], c: [number, number]) => Math.hypot(c[0] - a[0], c[1] - a[1])
      const longFirst = len(p0, p1) + len(p2, p3) >= len(p1, p2) + len(p3, p0)
      const [q0, q1, q2, q3] = longFirst ? [p0, p1, p2, p3] : [p1, p2, p3, p0]
      const short = (len(q1, q2) + len(q3, q0)) / 2
      const m1: [number, number] = [(q1[0] + q2[0]) / 2, (q1[1] + q2[1]) / 2]
      const m3: [number, number] = [(q3[0] + q0[0]) / 2, (q3[1] + q0[1]) / 2]
      const ridge = len(m1, m3) || 1
      const inset = Math.min(short / 2, ridge * 0.45) / ridge
      const r1 = [m1[0] + (m3[0] - m1[0]) * inset, top + short * 0.17, m1[1] + (m3[1] - m1[1]) * inset]
      const r3 = [m3[0] + (m1[0] - m3[0]) * inset, top + short * 0.17, m3[1] + (m1[1] - m3[1]) * inset]
      const at = (p: [number, number]) => [p[0], top, p[1]]
      mesh.face([at(q0), at(q1), r1, r3], roof, [0, 1, 0])
      mesh.face([at(q2), at(q3), r3, r1], roof, [0, 1, 0])
      mesh.face([at(q1), at(q2), r1], roof, [0, 1, 0])
      mesh.face([at(q3), at(q0), r3], roof, [0, 1, 0])
    } else if (pitched && n <= 8 && isConvex(ring)) {
      // Pyramid roof on small convex footprints.
      const roof = hex(pick(TERRACOTTA, b + 1))
      const radius = Math.sqrt(Math.abs(signedArea) / 2)
      const apex = [cx, top + Math.min(radius * 0.35, 4), cz]
      for (let i = 0; i < n; i++) {
        const [x0, z0] = ring[i]
        const [x1, z1] = ring[(i + 1) % n]
        mesh.face([[x0, top, z0], [x1, top, z1], apex], roof, [0, 1, 0])
      }
    } else {
      const roof = hex(pick(FLAT_ROOFS[kind], b + 1))
      const triangles = earcut(ring.flat())
      for (let t = 0; t < triangles.length; t += 3) {
        const [a, c, d] = [ring[triangles[t]], ring[triangles[t + 1]], ring[triangles[t + 2]]]
        mesh.face([[a[0], top, a[1]], [c[0], top, c[1]], [d[0], top, d[1]]], roof, [0, 1, 0])
      }
    }
  }
  return mesh.toBuffers()
}

// ---------------------------------------------------------------- roads

const ROAD_STYLE: Record<RoadKind, { width: number; color: string }> = {
  motorway: { width: 24, color: '#5d5e61' },
  trunk: { width: 16, color: '#646568' },
  primary: { width: 11, color: '#6c6c6e' },
  secondary: { width: 9, color: '#737375' },
  tertiary: { width: 8, color: '#79797b' },
  minor: { width: 6, color: '#828281' },
  pedestrian: { width: 6, color: '#bcae96' },
  service: { width: 4, color: '#8a8987' },
  track: { width: 3, color: '#b19f7c' },
  rail: { width: 4, color: '#6b5d52' },
}

function buildRoads(features: MapFeatures, heights: Heights): MeshBuffers {
  const position: number[] = []
  const color: number[] = []
  const index: number[] = []
  const STEP = 12

  for (const road of features.roads) {
    const kind = ROAD_KINDS[road.k]
    const { width, color: hexColor } = ROAD_STYLE[kind]
    const rgb = hex(hexColor)
    // Bigger roads float a little higher so they win at junctions.
    const lift = 0.5 + (ROAD_KINDS.length - road.k) * 0.08

    // Subdivide so the ribbon follows the terrain between OSM nodes.
    const pts: [number, number][] = []
    for (let i = 0; i < road.p.length; i += 2) {
      const x = road.p[i]
      const z = road.p[i + 1]
      if (pts.length) {
        const [px, pz] = pts[pts.length - 1]
        const steps = Math.floor(Math.hypot(x - px, z - pz) / STEP)
        for (let s = 1; s <= steps; s++) {
          const t = s / (steps + 1)
          pts.push([px + (x - px) * t, pz + (z - pz) * t])
        }
      }
      pts.push([x, z])
    }
    if (pts.length < 2) continue

    const start = position.length / 3
    for (let i = 0; i < pts.length; i++) {
      const [ax, az] = pts[Math.max(i - 1, 0)]
      const [bx, bz] = pts[Math.min(i + 1, pts.length - 1)]
      const len = Math.hypot(bx - ax, bz - az) || 1
      const nx = -(bz - az) / len
      const nz = (bx - ax) / len
      const half = width / 2
      const [x, z] = pts[i]
      for (const side of [1, -1]) {
        const sx = x + nx * half * side
        const sz = z + nz * half * side
        position.push(sx, sampleHeight(heights, sx, sz) + lift, sz)
        color.push(...rgb)
      }
      if (i > 0) {
        const a = start + (i - 1) * 2
        index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
      }
    }
  }

  const normal = new Float32Array(position.length)
  for (let i = 1; i < normal.length; i += 3) normal[i] = 1
  return {
    position: new Float32Array(position),
    normal,
    color: new Uint8Array(color.map((c) => Math.round(toLinear(c)))),
    index: new Uint32Array(index),
  }
}

// ---------------------------------------------------------------- trees

const TREE_COLORS: Record<TreeKind, string[]> = {
  broadleaf: ['#3f5f2a', '#4b6d31', '#56783a', '#3a5626', '#5f7f3c'],
  pine: ['#3b5a2c', '#46663a', '#344f27'],
  olive: ['#7d8a5c', '#8a9666', '#748256'],
}

function buildTrees(buffer: ArrayBuffer, heights: Heights): TreeBuffers[] {
  const view = new DataView(buffer)
  const count = view.getUint32(0, true)
  const byKind = TREE_KINDS.map(() => ({ matrices: [] as number[], colors: [] as number[] }))
  for (let t = 0; t < count; t++) {
    const o = 4 + t * 5
    const x = view.getInt16(o, true) / 2
    const z = view.getInt16(o + 2, true) / 2
    const k = view.getUint8(o + 4)
    const y = sampleHeight(heights, x, z)
    if (y < 1) continue
    const s = 0.75 + hash(t) * 0.55
    const angle = hash(t + 1) * Math.PI * 2
    const c = Math.cos(angle) * s
    const sn = Math.sin(angle) * s
    const target = byKind[k]
    target.matrices.push(c, 0, -sn, 0, 0, s, 0, 0, sn, 0, c, 0, x, y - 0.3, z, 1)
    const rgb = hex(pick(TREE_COLORS[TREE_KINDS[k]], t + 2))
    target.colors.push(toLinear(rgb[0]) / 255, toLinear(rgb[1]) / 255, toLinear(rgb[2]) / 255)
  }
  return TREE_KINDS.map((kind, k) => ({
    kind,
    matrices: new Float32Array(byKind[k].matrices),
    colors: new Float32Array(byKind[k].colors),
  }))
}

// ---------------------------------------------------------------- entry

async function build(base: string): Promise<MapBuild> {
  const load = async (file: string) => {
    const res = await fetch(base + file)
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`)
    return res
  }
  const [terrainBin, features, buildingsBin, treesBin] = await Promise.all([
    load('terrain.bin').then((r) => r.arrayBuffer()),
    load('features.json').then((r) => r.json() as Promise<MapFeatures>),
    load('buildings.bin').then((r) => r.arrayBuffer()),
    load('trees.bin').then((r) => r.arrayBuffer()),
  ])

  const heights = Float32Array.from(new Int16Array(terrainBin), (dm) => dm / 10)
  return {
    heights,
    terrain: buildTerrain(heights),
    skirt: buildSkirt(heights),
    ground: paintGround(heights, features),
    buildings: buildBuildings(buildingsBin, heights),
    roads: buildRoads(features, heights),
    trees: buildTrees(treesBin, heights),
  }
}

function transferables(build: MapBuild): Transferable[] {
  const meshes = [build.terrain, build.skirt, build.buildings, build.roads]
  return [
    build.heights.buffer,
    build.ground.data.buffer,
    ...meshes.flatMap((m) => [m.position, m.normal, m.color, m.uv, m.index].filter((a) => a !== undefined).map((a) => a.buffer)),
    ...build.trees.flatMap((t) => [t.matrices.buffer, t.colors.buffer]),
  ] as Transferable[]
}

self.onmessage = async (event: MessageEvent<{ base: string }>) => {
  try {
    const result = await build(event.data.base)
    self.postMessage({ ok: true, build: result } satisfies MapWorkerResponse, { transfer: transferables(result) })
  } catch (error) {
    self.postMessage({ ok: false, error: (error as Error).message } satisfies MapWorkerResponse)
  }
}
