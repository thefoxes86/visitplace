import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

import { places } from '#/data/places'
import { Atmosphere, Land, Sea, useMapBuild } from './CityModel'
import { project, sampleHeight } from './geo'
import { MapMarker } from './MapMarker'

/** Looking north-east from above the sea, with Lido, Camaiore and Monte Prana in view. */
const OVERVIEW = {
  position: new Vector3(-3200, 6200, 9200),
  target: new Vector3(600, 0, -300),
}
/** Where the camera starts, so the first move to the overview reads as a fly-in. */
const START = new Vector3(-9000, 16000, 24000)
/** Close-up framing of a selected place: direction and distance from it (metres). */
const CLOSE_UP_DIRECTION = new Vector3(0.38, 0.5, 0.78).normalize()
const CLOSE_UP_DISTANCE = 650
/** Slow cinematic orbit around a place once the camera has arrived (rad/s). */
const ORBIT_SPEED = 0.04
/** Height of the pier deck, where its marker stands. */
const PIER_DECK = 3.2

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

interface Flight {
  fromPosition: Vector3
  fromTarget: Vector3
  toPosition: Vector3
  toTarget: Vector3
  /** Bezier control point that lifts the path between distant places. */
  control: Vector3
  elapsed: number
  duration: number
}

interface CityCanvasProps {
  selectedId?: string
  onSelect: (id: string) => void
  /** Called once the camera has finished flying to the selected place. */
  onArrive?: (id: string) => void
}

/**
 * Scripted camera: the visitor can't pan or zoom; selecting a place flies the
 * camera in along a curve and then slowly orbits around it.
 */
interface CameraRigProps {
  target?: [number, number, number]
  focus: Vector3
  onArrive: () => void
}

function CameraRig({ target, focus, onArrive }: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const flight = useRef<Flight | null>(null)
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  const [tx, ty, tz] = target ?? []
  const selected = tx !== undefined && ty !== undefined && tz !== undefined

  useEffect(() => {
    const toTarget = selected ? new Vector3(tx, ty, tz) : OVERVIEW.target.clone()
    const toPosition = selected
      ? toTarget.clone().addScaledVector(CLOSE_UP_DIRECTION, CLOSE_UP_DISTANCE)
      : OVERVIEW.position.clone()
    const fromPosition = camera.position.clone()
    const travel = focus.distanceTo(toTarget)
    // Hop between places with an arc; dive straight in when coming from high up.
    const lift = Math.max(0, travel * 0.35 - Math.abs(fromPosition.y - toPosition.y) * 0.5)
    const control = fromPosition.clone().lerp(toPosition, 0.5)
    control.y = Math.max(fromPosition.y, toPosition.y) * 0.5 + control.y * 0.5 + lift
    flight.current = {
      fromPosition,
      fromTarget: focus.clone(),
      toPosition,
      toTarget,
      control,
      elapsed: 0,
      duration: reducedMotion ? 0.001 : Math.min(Math.max(1.6 + travel / 4000, 1.8), 4.2),
    }
  }, [tx, ty, tz, selected, camera, focus, reducedMotion])

  useFrame((_, delta) => {
    const f = flight.current
    if (f) {
      f.elapsed += delta
      const t = Math.min(f.elapsed / f.duration, 1)
      const e = easeInOutCubic(t)
      // Quadratic Bezier from the start, through the lift, to the close-up.
      const a = (1 - e) * (1 - e)
      const b = 2 * (1 - e) * e
      const c = e * e
      camera.position.set(
        a * f.fromPosition.x + b * f.control.x + c * f.toPosition.x,
        a * f.fromPosition.y + b * f.control.y + c * f.toPosition.y,
        a * f.fromPosition.z + b * f.control.z + c * f.toPosition.z,
      )
      focus.lerpVectors(f.fromTarget, f.toTarget, e)
      camera.lookAt(focus)
      if (t === 1) {
        flight.current = null
        if (selected) onArrive()
      }
    } else if (selected && !reducedMotion) {
      // Orbit the place around the vertical axis through it.
      const angle = delta * ORBIT_SPEED
      const dx = camera.position.x - focus.x
      const dz = camera.position.z - focus.z
      camera.position.x = focus.x + dx * Math.cos(angle) - dz * Math.sin(angle)
      camera.position.z = focus.z + dx * Math.sin(angle) + dz * Math.cos(angle)
      camera.lookAt(focus)
    }
  })

  return null
}

export default function CityCanvas({ selectedId, onSelect, onArrive }: CityCanvasProps) {
  // Stable container for marker labels: drei's <Html> otherwise switches
  // target once R3F events connect, leaving two React roots on one element.
  const labels = useRef<HTMLDivElement>(null!)
  const { build, error } = useMapBuild()
  // What the camera looks at; shared with the sun so shadows follow the view.
  const focus = useMemo(() => OVERVIEW.target.clone(), [])

  const positions = useMemo(() => {
    if (!build) return undefined
    return new Map(
      places.map((place) => {
        const [x, z] = project(place.lat, place.lon)
        const ground = sampleHeight(build.heights, x, z)
        return [place.id, [x, ground < 0 ? PIER_DECK : ground, z] as [number, number, number]]
      }),
    )
  }, [build])

  return (
    <div ref={labels} className="relative h-full w-full">
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        gl={{ logarithmicDepthBuffer: true }}
        camera={{ position: START.toArray(), fov: 40, near: 1, far: 200000 }}
      >
        <Atmosphere focus={focus} />
        <Sea />
        {build && positions && (
          <>
            <Land build={build} />
            {places.map((place) => (
              <MapMarker
                key={place.id}
                place={place}
                position={positions.get(place.id)!}
                selected={place.id === selectedId}
                onSelect={onSelect}
                labelsContainer={labels}
              />
            ))}
          </>
        )}
        <CameraRig
          target={selectedId ? positions?.get(selectedId) : undefined}
          focus={focus}
          onArrive={() => selectedId && onArrive?.(selectedId)}
        />
      </Canvas>

      {!build && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <p className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow backdrop-blur">
            {error ? `Could not load the map: ${error}` : 'Building the 3D map of Camaiore…'}
          </p>
        </div>
      )}

      <p className="absolute bottom-1 right-2 z-10 text-[10px] text-slate-700/80">
        ©{' '}
        <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          OpenStreetMap
        </a>{' '}
        contributors · Elevation:{' '}
        <a
          className="underline"
          href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md"
          target="_blank"
          rel="noreferrer"
        >
          Terrain Tiles
        </a>
      </p>
    </div>
  )
}
