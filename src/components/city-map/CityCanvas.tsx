import { useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { Box3, Vector3 } from 'three'

import { places } from '#/data/places'
import { Atmosphere, Land, Sea, useMapBuild } from './CityModel'
import { MAP_DEPTH, MAP_WIDTH, project, sampleHeight } from './geo'
import { MapMarker } from './MapMarker'

/** Looking north-east from above the sea, with Lido, Camaiore and Monte Prana in view. */
const OVERVIEW = {
  position: [-3200, 6200, 9200] as const,
  target: [600, 0, -300] as const,
}
/** Camera offset from a selected place when flying in (metres). */
const CLOSE_UP = [320, 420, 720] as const
/** Height of the pier deck, where its marker stands. */
const PIER_DECK = 3.2

interface CityCanvasProps {
  selectedId?: string
  onSelect: (id: string) => void
}

function CameraRig({ target }: { target?: [number, number, number] }) {
  const controls = useRef<CameraControls>(null)

  useEffect(() => {
    controls.current?.setBoundary(
      new Box3(new Vector3(-MAP_WIDTH / 2, -50, -MAP_DEPTH / 2), new Vector3(MAP_WIDTH / 2, 1500, MAP_DEPTH / 2)),
    )
  }, [])

  const [tx, ty, tz] = target ?? []
  useEffect(() => {
    const c = controls.current
    if (!c) return
    if (tx !== undefined && ty !== undefined && tz !== undefined) {
      void c.setLookAt(tx + CLOSE_UP[0], ty + CLOSE_UP[1], tz + CLOSE_UP[2], tx, ty, tz, true)
    } else {
      void c.setLookAt(...OVERVIEW.position, ...OVERVIEW.target, true)
    }
  }, [tx, ty, tz])

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={80}
      maxDistance={20000}
      maxPolarAngle={1.38}
      dollyToCursor
      smoothTime={0.8}
    />
  )
}

export default function CityCanvas({ selectedId, onSelect }: CityCanvasProps) {
  // Stable container for marker labels: drei's <Html> otherwise switches
  // target once R3F events connect, leaving two React roots on one element.
  const labels = useRef<HTMLDivElement>(null!)
  const { build, error } = useMapBuild()

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
        // Start far away so the first overview transition reads as a fly-in.
        camera={{ position: [-9000, 16000, 24000], fov: 40, near: 1, far: 200000 }}
      >
        <Atmosphere />
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
        <CameraRig target={selectedId ? positions?.get(selectedId) : undefined} />
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
