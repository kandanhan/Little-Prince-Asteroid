import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlacedItem } from '../store/useGame'
import { latLonToDir, surfaceQuaternion, PLANET_RADIUS } from './sphereMath'
import type { ItemKind } from './items'
import type { PlanetTheme } from './planets'
import { StyleMaterial } from './useStyle'

function hueColor(base: string, hue: number) {
  const c = new THREE.Color(base)
  const hsl = { h: 0, s: 0, l: 0 }
  c.getHSL(hsl)
  c.setHSL((hsl.h + hue * 0.25) % 1, hsl.s, hsl.l)
  return c
}

// 개별 장식 메쉬 — kind별 절차적 모델
function Model({ kind, hue }: { kind: ItemKind; hue: number }) {
  switch (kind) {
    case 'rose':
      return <Rose hue={hue} />
    case 'baobab':
      return (
        <group>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 0.36, 6]} />
            <meshStandardMaterial color="#774936" />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.18, 12, 12]} />
            <StyleMaterial color={hueColor('#52b788', hue).getStyle()} />
          </mesh>
        </group>
      )
    case 'tree':
      return (
        <group>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, 0.6, 7]} />
            <meshStandardMaterial color="#6f4518" />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <dodecahedronGeometry args={[0.3, 0]} />
            <StyleMaterial color={hueColor('#2d6a4f', hue).getStyle()} />
          </mesh>
          <mesh position={[0.15, 0.62, 0.1]} castShadow>
            <dodecahedronGeometry args={[0.2, 0]} />
            <StyleMaterial color={hueColor('#40916c', hue).getStyle()} />
          </mesh>
        </group>
      )
    case 'lamp':
      return (
        <group>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.8, 6]} />
            <meshStandardMaterial color="#3d3d52" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <octahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#fff3b0" emissive="#ffd60a" emissiveIntensity={1.2} />
          </mesh>
          <pointLight position={[0, 0.85, 0]} color="#ffd27f" intensity={1.4} distance={2.6} />
        </group>
      )
    case 'bench':
      return (
        <group>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.6, 0.04, 0.2]} />
            <meshStandardMaterial color={hueColor('#9c6644', hue)} />
          </mesh>
          <mesh position={[0, 0.3, -0.08]}>
            <boxGeometry args={[0.6, 0.18, 0.03]} />
            <meshStandardMaterial color={hueColor('#9c6644', hue)} />
          </mesh>
          {[-0.25, 0.25].map((x) => (
            <mesh key={x} position={[x, 0.07, 0]}>
              <boxGeometry args={[0.04, 0.16, 0.18]} />
              <meshStandardMaterial color="#774936" />
            </mesh>
          ))}
        </group>
      )
    case 'fox':
      return (
        <group>
          <mesh position={[0, 0.18, 0]}>
            <capsuleGeometry args={[0.12, 0.18, 4, 8]} />
            <meshStandardMaterial color={hueColor('#e76f51', hue)} />
          </mesh>
          <mesh position={[0, 0.34, 0.12]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color={hueColor('#f4a261', hue)} />
          </mesh>
          <mesh position={[-0.05, 0.45, 0.12]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.04, 0.1, 4]} />
            <meshStandardMaterial color="#e76f51" />
          </mesh>
          <mesh position={[0.05, 0.45, 0.12]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.04, 0.1, 4]} />
            <meshStandardMaterial color="#e76f51" />
          </mesh>
          <mesh position={[0, 0.14, -0.2]} rotation={[0.5, 0, 0]}>
            <coneGeometry args={[0.06, 0.24, 6]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </group>
      )
    case 'sheep':
      return (
        <group>
          <mesh position={[0, 0.2, 0]}>
            <dodecahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#f8f9fa" />
          </mesh>
          <mesh position={[0, 0.26, 0.13]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#3d3d52" />
          </mesh>
        </group>
      )
    case 'star':
      return <SpinStar hue={hue} />
    case 'crystal':
      return (
        <group>
          <mesh position={[0, 0.2, 0]}>
            <octahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color={hueColor('#9bf6ff', hue)} transparent opacity={0.8} metalness={0.3} roughness={0.1} emissive="#48cae4" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )
    case 'mushroom':
      return (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 0.2, 8]} />
            <meshStandardMaterial color="#fff0f3" />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.13, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={hueColor('#e63946', hue)} />
          </mesh>
        </group>
      )
    case 'flower':
      return (
        <group>
          {[0, 1, 2].map((i) => (
            <group key={i} position={[(i - 1) * 0.12, 0, (i % 2) * 0.08]}>
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.24, 4]} />
                <meshStandardMaterial color="#52b788" />
              </mesh>
              <mesh position={[0, 0.26, 0]}>
                <icosahedronGeometry args={[0.06, 0]} />
                <meshStandardMaterial color={hueColor(['#ffafcc', '#ffd166', '#bdb2ff'][i], hue)} />
              </mesh>
            </group>
          ))}
        </group>
      )
    case 'well':
      return (
        <group>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.2, 0.22, 0.24, 12]} />
            <meshStandardMaterial color={hueColor('#8d99ae', hue)} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 12]} />
            <meshStandardMaterial color="#1d3557" />
          </mesh>
          {[-0.2, 0.2].map((x) => (
            <mesh key={x} position={[x, 0.4, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.36, 5]} />
              <meshStandardMaterial color="#6f4518" />
            </mesh>
          ))}
          <mesh position={[0, 0.58, 0]}>
            <boxGeometry args={[0.5, 0.03, 0.3]} />
            <meshStandardMaterial color="#774936" />
          </mesh>
        </group>
      )
    case 'volcano':
      return <Volcano hue={hue} />
    case 'cat':
      return (
        <group>
          <mesh position={[0, 0.14, 0]} rotation={[0, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.16, 4, 8]} />
            <meshStandardMaterial color={hueColor('#3d3d52', hue)} />
          </mesh>
          <mesh position={[0, 0.3, 0.1]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color={hueColor('#3d3d52', hue)} />
          </mesh>
          <mesh position={[-0.05, 0.4, 0.1]} rotation={[0, 0, 0.4]}><coneGeometry args={[0.035, 0.09, 4]} /><meshStandardMaterial color={hueColor('#3d3d52', hue)} /></mesh>
          <mesh position={[0.05, 0.4, 0.1]} rotation={[0, 0, -0.4]}><coneGeometry args={[0.035, 0.09, 4]} /><meshStandardMaterial color={hueColor('#3d3d52', hue)} /></mesh>
          <mesh position={[-0.03, 0.31, 0.19]}><sphereGeometry args={[0.016, 8, 8]} /><meshStandardMaterial color="#ffd60a" emissive="#ffd60a" emissiveIntensity={0.5} /></mesh>
          <mesh position={[0.03, 0.31, 0.19]}><sphereGeometry args={[0.016, 8, 8]} /><meshStandardMaterial color="#ffd60a" emissive="#ffd60a" emissiveIntensity={0.5} /></mesh>
          <mesh position={[0, 0.16, -0.16]} rotation={[0.8, 0, 0]}><cylinderGeometry args={[0.02, 0.015, 0.26, 5]} /><meshStandardMaterial color={hueColor('#3d3d52', hue)} /></mesh>
        </group>
      )
    case 'bird':
      return <Bird hue={hue} />
    case 'fountain':
      return (
        <group>
          <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.26, 0.3, 0.16, 16]} /><meshStandardMaterial color="#cfd8e3" /></mesh>
          <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.22, 0.22, 0.03, 16]} /><meshStandardMaterial color="#4aa3c7" transparent opacity={0.7} /></mesh>
          <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.05, 0.07, 0.28, 8]} /><meshStandardMaterial color="#cfd8e3" /></mesh>
          <mesh position={[0, 0.44, 0]}><sphereGeometry args={[0.09, 12, 12]} /><meshStandardMaterial color={hueColor('#9bf6ff', hue)} transparent opacity={0.85} emissive="#48cae4" emissiveIntensity={0.5} /></mesh>
        </group>
      )
    case 'house':
      return (
        <group>
          <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.5, 0.4, 0.5]} /><meshStandardMaterial color={hueColor('#f4a261', hue)} /></mesh>
          <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.42, 0.3, 4]} /><meshStandardMaterial color={hueColor('#c1453b', hue)} /></mesh>
          <mesh position={[0, 0.12, 0.26]}><boxGeometry args={[0.14, 0.24, 0.02]} /><meshStandardMaterial color="#6f4518" /></mesh>
          <mesh position={[0.18, 0.55, 0]}><boxGeometry args={[0.06, 0.18, 0.06]} /><meshStandardMaterial color="#8d99ae" /></mesh>
        </group>
      )
    case 'rainbow':
      return <Rainbow />
    default:
      return null
  }
}

function Bird({ hue }: { hue: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((st) => {
    if (ref.current) ref.current.position.y = 0.5 + Math.sin(st.clock.elapsedTime * 2) * 0.06
  })
  return (
    <group ref={ref} position={[0, 0.5, 0]}>
      <mesh><sphereGeometry args={[0.1, 12, 12]} /><meshStandardMaterial color={hueColor('#90e0ef', hue)} /></mesh>
      <mesh position={[0, 0.09, 0.02]}><sphereGeometry args={[0.07, 10, 10]} /><meshStandardMaterial color={hueColor('#90e0ef', hue)} /></mesh>
      <mesh position={[0, 0.1, 0.11]} rotation={[1.2, 0, 0]}><coneGeometry args={[0.02, 0.06, 4]} /><meshStandardMaterial color="#ffb703" /></mesh>
      <mesh position={[0, 0, -0.1]} rotation={[0.6, 0, 0]}><coneGeometry args={[0.05, 0.16, 4]} /><meshStandardMaterial color={hueColor('#48cae4', hue)} /></mesh>
    </group>
  )
}

function Rainbow() {
  const colors = ['#e63946', '#f4a261', '#ffd166', '#52b788', '#48cae4', '#7209b7']
  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {colors.map((c, i) => (
        <mesh key={c} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55 - i * 0.06, 0.025, 8, 32, Math.PI]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  )
}

function SpinStar({ hue }: { hue: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.8 })
  return (
    <mesh ref={ref} position={[0, 0.4, 0]}>
      <octahedronGeometry args={[0.16, 0]} />
      <meshStandardMaterial color={hueColor('#ffd60a', hue)} emissive="#ffd60a" emissiveIntensity={0.8} />
    </mesh>
  )
}

function Volcano({ hue }: { hue: number }) {
  const glow = useRef<THREE.PointLight>(null)
  useFrame((st) => {
    if (glow.current) glow.current.intensity = 0.8 + Math.sin(st.clock.elapsedTime * 3) * 0.3
  })
  return (
    <group>
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.28, 0.4, 8, 1, true]} />
        <meshStandardMaterial color={hueColor('#6d6875', hue)} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.06, 8]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff4d00" emissiveIntensity={1.5} />
      </mesh>
      <pointLight ref={glow} position={[0, 0.45, 0]} color="#ff6b35" intensity={0.9} distance={1.6} />
    </group>
  )
}

// 장미 — 줄기/잎/꽃받침 + 여러 겹의 꽃잎 레이어
function Rose({ hue }: { hue: number }) {
  const petal = hueColor('#ff4d6d', hue).getStyle()
  const layers = [
    { y: 0.5, r: 0.12, tilt: 0.55, n: 5, s: 0.09 },
    { y: 0.535, r: 0.075, tilt: 0.95, n: 5, s: 0.075 },
    { y: 0.565, r: 0.035, tilt: 1.35, n: 4, s: 0.055 },
  ]
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.52, 6]} />
        <meshStandardMaterial color="#2d6a4f" />
      </mesh>
      <mesh position={[0.1, 0.34, 0]} rotation={[0, 0, -0.6]}>
        <coneGeometry args={[0.06, 0.18, 4]} />
        <meshStandardMaterial color="#40916c" />
      </mesh>
      <mesh position={[-0.09, 0.26, 0.03]} rotation={[0, 0.4, 0.7]}>
        <coneGeometry args={[0.05, 0.15, 4]} />
        <meshStandardMaterial color="#52b788" />
      </mesh>
      <mesh position={[0, 0.47, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#40916c" />
      </mesh>
      {layers.map((L, li) => (
        <group key={li} position={[0, L.y, 0]}>
          {Array.from({ length: L.n }).map((_, i) => {
            const a = (i / L.n) * Math.PI * 2 + li * 0.4
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * L.r, 0, Math.sin(a) * L.r]}
                rotation={[L.tilt, -a, 0]}
                scale={[L.s, L.s * 0.45, L.s]}
                castShadow
              >
                <sphereGeometry args={[1, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                <StyleMaterial color={petal} />
              </mesh>
            )
          })}
        </group>
      ))}
      <mesh position={[0, 0.565, 0]} castShadow>
        <icosahedronGeometry args={[0.05, 0]} />
        <StyleMaterial color={hueColor('#c9184a', hue).getStyle()} />
      </mesh>
    </group>
  )
}

// 축에 수직인 직교 기저 (꽃잎 공전용)
function perpBasis(axis: THREE.Vector3) {
  const a = axis.clone().normalize()
  let u = Math.abs(a.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
  u = u.sub(a.clone().multiplyScalar(u.dot(a))).normalize()
  const v = new THREE.Vector3().crossVectors(a, u).normalize()
  return { u, v }
}

// 인스턴싱 잔디 — 표면에 흩뿌려진 잎새 (테마별 색)
export function GrassField({ theme, count = 240 }: { theme: PlanetTheme; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const bladeGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.03, 0.24, 4)
    g.translate(0, 0.12, 0)
    return g
  }, [])
  const blades = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        dir: new THREE.Vector3().randomDirection(),
        rot: Math.random() * Math.PI * 2,
        sx: 0.6 + Math.random() * 0.7,
        sy: 0.7 + Math.random() * 0.9,
      })),
    [count],
  )
  useEffect(() => {
    if (!ref.current) return
    blades.forEach((b, i) => {
      dummy.position.copy(b.dir.clone().multiplyScalar(PLANET_RADIUS))
      dummy.quaternion.copy(surfaceQuaternion(b.dir, b.rot))
      dummy.scale.set(b.sx, b.sy, b.sx)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [blades, dummy])
  const color = theme === 'rose' ? '#7bbf8a' : '#5fa86b'
  return (
    <instancedMesh ref={ref} args={[bladeGeo, undefined, count]} castShadow receiveShadow>
      <StyleMaterial color={color} />
    </instancedMesh>
  )
}

// 인스턴싱 꽃잎 — 행성 둘레를 천천히 떠도는 꽃잎
export function Petals({ theme, count = 40 }: { theme: PlanetTheme; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const geo = useMemo(() => new THREE.PlaneGeometry(0.12, 0.16), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        basis: perpBasis(new THREE.Vector3().randomDirection()),
        phase: Math.random() * Math.PI * 2,
        speed: 0.05 + Math.random() * 0.08,
        r: PLANET_RADIUS + 0.5 + Math.random() * 1.7,
        tilt: Math.random() * Math.PI,
        spin: 0.4 + Math.random(),
      })),
    [count],
  )
  useFrame((st) => {
    if (!ref.current) return
    const t = st.clock.elapsedTime
    seeds.forEach((s, i) => {
      const a = s.phase + t * s.speed
      const p = s.basis.u.clone().multiplyScalar(Math.cos(a)).add(s.basis.v.clone().multiplyScalar(Math.sin(a)))
      const bob = Math.sin(t * 0.6 + s.phase) * 0.2
      dummy.position.copy(p.multiplyScalar(s.r + bob))
      dummy.rotation.set(t * s.spin, t * s.spin * 0.7 + s.tilt, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  const color = theme === 'rose' ? '#ff9ec4' : theme === 'snow' ? '#eaf4ff' : '#ffd6e8'
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]}>
      <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.9} flatShading />
    </instancedMesh>
  )
}

// 표면 위에 단일 아이템 배치 (위치/자세 + 등장 애니메이션)
export function Decoration({ item, onClick }: { item: PlacedItem; onClick?: (id: string) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const growRef = useRef(0)

  const { position, quaternion } = useMemo(() => {
    const dir = latLonToDir(item.lat, item.lon)
    const pos = dir.clone().multiplyScalar(PLANET_RADIUS)
    const quat = surfaceQuaternion(dir, 0)
    return { position: pos, quaternion: quat }
  }, [item.lat, item.lon])

  useFrame((_, dt) => {
    // 심은 직후 부드럽게 자라남
    const age = (Date.now() - item.bornAt) / 1000
    const target = Math.min(1, age / 0.8)
    growRef.current += (target - growRef.current) * Math.min(1, dt * 6)
    if (groupRef.current) {
      const sc = item.scale * (0.6 + 0.4 * growRef.current)
      groupRef.current.scale.setScalar(sc)
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      quaternion={quaternion}
      onClick={(e) => { e.stopPropagation(); onClick?.(item.id) }}
    >
      <Model kind={item.kind} hue={item.hue} />
    </group>
  )
}
