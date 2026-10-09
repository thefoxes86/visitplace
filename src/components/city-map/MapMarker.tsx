import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import type { Group, Mesh } from 'three'

import { categoryColors } from '#/data/places'
import type { Place } from '#/data/places'

const PIN_HEIGHT = 1.6
/** Marker size relative to camera distance, so pins keep a constant screen size. */
const SCREEN_SCALE = 0.02
/** Non-featured labels only appear once the camera is this close (metres). */
const LABEL_DISTANCE = 3500

interface MapMarkerProps {
  place: Place
  position: [number, number, number]
  selected: boolean
  onSelect: (id: string) => void
  labelsContainer: RefObject<HTMLElement>
}

export function MapMarker({ place, position, selected, onSelect, labelsContainer }: MapMarkerProps) {
  const root = useRef<Group>(null)
  const pin = useRef<Group>(null)
  const ring = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [near, setNear] = useState(false)
  useCursor(hovered)

  const color = categoryColors[place.category]
  // Offset the bobbing so markers don't move in lockstep.
  const phase = place.lat * 1000 + place.lon * 300

  useFrame(({ camera, clock }, delta) => {
    const t = clock.elapsedTime
    if (root.current) {
      const distance = camera.position.distanceTo(root.current.position)
      const emphasis = selected ? 1.35 : hovered ? 1.2 : 1
      root.current.scale.setScalar(distance * SCREEN_SCALE * emphasis)
      if (distance < LABEL_DISTANCE !== near) setNear(!near)
    }
    if (pin.current) {
      pin.current.position.y = PIN_HEIGHT + Math.sin(t * 2 + phase) * 0.12
      pin.current.rotation.y += delta * (selected ? 2 : 0.6)
    }
    if (ring.current) {
      const pulse = (t * 0.8 + phase) % 1
      ring.current.scale.setScalar(1 + pulse * 1.5)
      const material = ring.current.material as { opacity: number }
      material.opacity = (1 - pulse) * 0.6
    }
  })

  const select = () => onSelect(place.id)
  const showLabel = place.featured || near || hovered || selected

  return (
    <group ref={root} position={position}>
      <group
        ref={pin}
        onClick={(e) => {
          e.stopPropagation()
          select()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={selected || hovered ? 0.6 : 0.25}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, 0.35, 0.3]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0, -0.25, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.3, 0.8, 24]} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>
      </group>

      {/* Stem from the ground up to the pin */}
      <mesh position={[0, PIN_HEIGHT / 2 - 0.3, 0]}>
        <cylinderGeometry args={[0.025, 0.025, PIN_HEIGHT - 0.6, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[0.45, 0.6, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} />
      </mesh>

      <Html
        position={[0, PIN_HEIGHT + 1, 0]}
        center
        portal={labelsContainer}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <button
          type="button"
          onClick={select}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold shadow-md transition ${
            showLabel ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          } ${selected || hovered ? 'scale-110 bg-slate-900 text-white' : 'bg-white/90 text-slate-800'}`}
        >
          {place.name}
        </button>
      </Html>
    </group>
  )
}
