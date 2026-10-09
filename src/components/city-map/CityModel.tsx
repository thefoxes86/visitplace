import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Sky } from '@react-three/drei'
import type { CameraControls } from '@react-three/drei'
import {
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  DataTexture,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  SphereGeometry,
  Vector3,
} from 'three'
import type { BufferGeometry as Geometry, DirectionalLight } from 'three'

import type { TreeKind } from './geo'
import type { MapBuild, MapWorkerResponse, MeshBuffers, TreeBuffers } from './mapWorker'

/** Afternoon sun over the sea, from the south-west. */
export const SUN_DIRECTION = new Vector3(-0.55, 0.5, 0.67).normalize()

export function useMapBuild() {
  const [state, setState] = useState<{ build?: MapBuild; error?: string }>({})
  useEffect(() => {
    const worker = new Worker(new URL('./mapWorker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<MapWorkerResponse>) => {
      setState(event.data.ok ? { build: event.data.build } : { error: event.data.error })
      worker.terminate()
    }
    worker.onerror = (event) => setState({ error: event.message })
    worker.postMessage({ base: '/map/' })
    return () => worker.terminate()
  }, [])
  return state
}

function toGeometry(buffers: MeshBuffers) {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(buffers.position, 3))
  geometry.setAttribute('normal', new BufferAttribute(buffers.normal, 3))
  if (buffers.color) geometry.setAttribute('color', new BufferAttribute(buffers.color, 3, true))
  if (buffers.uv) geometry.setAttribute('uv', new BufferAttribute(buffers.uv, 2))
  geometry.setIndex(new BufferAttribute(buffers.index, 1))
  geometry.computeBoundingSphere()
  return geometry
}

// ---------------------------------------------------------------- atmosphere

const SKY = { turbidity: 5, rayleigh: 1.4, mieCoefficient: 0.004, mieDirectionalG: 0.85 }

export function Atmosphere() {
  const sun = SUN_DIRECTION.toArray()
  return (
    <>
      <Sky distance={60000} sunPosition={sun} {...SKY} />
      {/* The same sky, baked once into an environment map for reflections. */}
      <Environment resolution={128} frames={1} environmentIntensity={0.45}>
        <Sky distance={800} sunPosition={sun} {...SKY} />
      </Environment>
      <fog attach="fog" args={['#cfdde8', 14000, 70000]} />
      <hemisphereLight args={['#d6e6f5', '#7a6f55', 0.5]} />
      <Sun />
    </>
  )
}

/** Directional sunlight whose shadow frustum follows what the camera looks at. */
function Sun() {
  const light = useRef<DirectionalLight>(null)
  const controls = useThree((state) => state.controls) as CameraControls | null
  const target = useMemo(() => new Vector3(), [])

  useFrame(({ camera }) => {
    const l = light.current
    if (!l) return
    if (controls) controls.getTarget(target)
    const size = Math.min(Math.max(camera.position.distanceTo(target) * 0.8, 400), 9000)
    const shadowCamera = l.shadow.camera
    if (shadowCamera.right !== size) {
      shadowCamera.left = shadowCamera.bottom = -size
      shadowCamera.right = shadowCamera.top = size
      shadowCamera.updateProjectionMatrix()
    }
    l.position.copy(target).addScaledVector(SUN_DIRECTION, 20000)
    l.target.position.copy(target)
    l.target.updateMatrixWorld()
  })

  return (
    <directionalLight
      ref={light}
      castShadow
      intensity={2.1}
      color="#fff0db"
      shadow-mapSize={[4096, 4096]}
      shadow-camera-near={100}
      shadow-camera-far={40000}
      shadow-bias={-0.0003}
      shadow-normalBias={0.5}
    />
  )
}

// ---------------------------------------------------------------- sea

/** Tileable ripple normals from a handful of integer-frequency waves. */
function waterNormals() {
  const size = 128
  const waves = [
    [3, 1, 0.9], [1, 4, 0.7], [-5, 2, 0.45], [7, -3, 0.3], [-2, -9, 0.2], [11, 6, 0.12],
  ].map(([kx, ky, amp], i) => ({ kx, ky, amp, phase: i * 1.7 }))
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let dx = 0
      let dy = 0
      for (const w of waves) {
        const c = Math.cos((2 * Math.PI * (w.kx * x + w.ky * y)) / size + w.phase) * w.amp
        dx += c * w.kx
        dy += c * w.ky
      }
      const len = Math.hypot(dx * 0.05, dy * 0.05, 1)
      const o = (y * size + x) * 4
      data[o] = ((-dx * 0.05) / len) * 127 + 128
      data[o + 1] = ((-dy * 0.05) / len) * 127 + 128
      data[o + 2] = (1 / len) * 127 + 128
      data[o + 3] = 255
    }
  }
  const texture = new DataTexture(data, size, size)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(800, 800)
  texture.generateMipmaps = true
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

export function Sea() {
  const normalMap = useMemo(waterNormals, [])
  const material = useRef<MeshPhysicalMaterial>(null)
  useFrame(({ camera }, delta) => {
    normalMap.offset.x += delta * 0.001
    normalMap.offset.y += delta * 0.0006
    // Ripples alias into moiré from high up, so calm the sea with altitude.
    material.current?.normalScale.setScalar(Math.min(Math.max(150 / camera.position.y, 0.02), 0.25))
  })
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} renderOrder={1}>
        <planeGeometry args={[120000, 120000]} />
        <meshPhysicalMaterial
          ref={material}
          color="#1e5d7d"
          roughness={0.06}
          metalness={0}
          transparent
          opacity={0.8}
          normalMap={normalMap}
        />
      </mesh>
      {/* Opaque floor so the open sea never shows the sky through it. */}
      <mesh rotation-x={-Math.PI / 2} position-y={-26}>
        <planeGeometry args={[120000, 120000]} />
        <meshBasicMaterial color="#16405a" />
      </mesh>
    </>
  )
}

// ---------------------------------------------------------------- land

const TREE_SHAPES: Record<TreeKind, { crown: () => Geometry; trunk: () => Geometry }> = {
  broadleaf: {
    crown: () => new IcosahedronGeometry(4.2, 0).scale(1, 0.9, 1).translate(0, 7, 0),
    trunk: () => new CylinderGeometry(0.35, 0.45, 4, 5).translate(0, 2, 0),
  },
  // Stone pines along the coast: tall bare trunk, flat umbrella crown.
  pine: {
    crown: () => new SphereGeometry(5.5, 8, 4).scale(1, 0.38, 1).translate(0, 10.5, 0),
    trunk: () => new CylinderGeometry(0.35, 0.5, 10.5, 5).translate(0, 5.25, 0),
  },
  olive: {
    crown: () => new IcosahedronGeometry(2.4, 0).scale(1, 0.75, 1).translate(0, 3, 0),
    trunk: () => new CylinderGeometry(0.22, 0.32, 2.4, 5).translate(0, 1.2, 0),
  },
}

function makeTrees({ kind, matrices, colors }: TreeBuffers) {
  const count = matrices.length / 16
  const shape = TREE_SHAPES[kind]
  const crown = new InstancedMesh(shape.crown(), new MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), count)
  const trunk = new InstancedMesh(shape.trunk(), new MeshStandardMaterial({ color: '#5a4632', roughness: 1 }), count)
  crown.instanceMatrix = new InstancedBufferAttribute(matrices, 16)
  crown.instanceColor = new InstancedBufferAttribute(colors, 3)
  trunk.instanceMatrix = crown.instanceMatrix
  for (const mesh of [crown, trunk]) {
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.computeBoundingSphere()
  }
  return [crown, trunk]
}

export function Land({ build }: { build: MapBuild }) {
  const meshes = useMemo(() => {
    const { width, height, data } = build.ground
    const ground = new DataTexture(data, width, height)
    ground.colorSpace = SRGBColorSpace
    ground.generateMipmaps = true
    ground.minFilter = LinearMipmapLinearFilter
    ground.magFilter = LinearFilter
    ground.anisotropy = 8
    ground.needsUpdate = true
    return {
      ground,
      terrain: toGeometry(build.terrain),
      skirt: toGeometry(build.skirt),
      buildings: toGeometry(build.buildings),
      roads: toGeometry(build.roads),
      trees: build.trees.flatMap(makeTrees),
    }
  }, [build])

  return (
    <group>
      <mesh geometry={meshes.terrain} receiveShadow>
        <meshStandardMaterial map={meshes.ground} roughness={0.95} />
      </mesh>
      <mesh geometry={meshes.skirt}>
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>
      <mesh geometry={meshes.roads} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.85} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <mesh geometry={meshes.buildings} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.8} />
      </mesh>
      {meshes.trees.map((mesh) => (
        <primitive key={mesh.uuid} object={mesh} />
      ))}
    </group>
  )
}
