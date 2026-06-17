import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame, type PendingDelivery } from '../store/useGame'
import { latLonToDir, surfaceQuaternion, PLANET_RADIUS } from './sphereMath'

const TRAVEL_SEC = 5

// 별빛 배달부: 우주에서 날아와 표면에 소포를 떨어뜨리는 작은 로켓.
function Rocket({ delivery }: { delivery: PendingDelivery }) {
  const group = useRef<THREE.Group>(null)
  const flame = useRef<THREE.Mesh>(null)
  const tRef = useRef(0)
  const doneRef = useRef(false)
  const completeDelivery = useGame((s) => s.completeDelivery)

  const { target, start, swirlAxis } = useMemo(() => {
    const dir = latLonToDir(delivery.lat, delivery.lon)
    const target = dir.clone().multiplyScalar(PLANET_RADIUS + 0.25)
    // 시작점: 표면 법선에서 살짝 비낀 먼 우주
    const off = new THREE.Vector3().randomDirection()
    const startDir = dir.clone().multiplyScalar(2).add(off).normalize()
    const start = startDir.multiplyScalar(13)
    const swirlAxis = dir.clone()
    return { target, start, swirlAxis }
  }, [delivery])

  useFrame((st, dt) => {
    if (doneRef.current) return
    tRef.current = Math.min(1, tRef.current + dt / TRAVEL_SEC)
    const t = tRef.current
    const ease = 1 - Math.pow(1 - t, 3) // easeOutCubic

    // 직선 보간 + 접근하며 줄어드는 나선
    const pos = start.clone().lerp(target, ease)
    const swirl = (1 - ease) * 0.8
    if (swirl > 0.001) {
      const q = new THREE.Quaternion().setFromAxisAngle(swirlAxis, st.clock.elapsedTime * 3 * swirl)
      const radial = pos.clone().sub(target)
      radial.applyQuaternion(q)
      pos.copy(target).add(radial)
    }

    if (group.current) {
      group.current.position.copy(pos)
      // 진행 방향을 바라보게
      const lookAt = target.clone()
      group.current.lookAt(lookAt)
    }
    if (flame.current) {
      flame.current.scale.setScalar(0.6 + Math.sin(st.clock.elapsedTime * 30) * 0.25)
    }

    if (t >= 1 && !doneRef.current) {
      doneRef.current = true
      completeDelivery(delivery.id) // 소포가 별에 안착 → 아이템으로 전환
    }
  })

  return (
    <group ref={group}>
      {/* 동체 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.12, 0.28, 6, 12]} />
        <meshStandardMaterial color="#f1f1f6" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.2, 12]} />
        <meshStandardMaterial color="#ff6f91" />
      </mesh>
      {/* 창문 */}
      <mesh position={[0, 0.06, 0.12]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#90e0ef" emissive="#48cae4" emissiveIntensity={0.6} />
      </mesh>
      {/* 핀 */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos((i / 3) * Math.PI * 2) * 0.12, Math.sin((i / 3) * Math.PI * 2) * 0.12, -0.16]} rotation={[Math.PI / 2, 0, (i / 3) * Math.PI * 2]}>
          <coneGeometry args={[0.05, 0.14, 4]} />
          <meshStandardMaterial color="#ffb703" />
        </mesh>
      ))}
      {/* 매달린 소포 */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshStandardMaterial color="#e0a92e" />
      </mesh>
      {/* 화염 */}
      <mesh ref={flame} position={[0, 0, -0.3]}>
        <coneGeometry args={[0.08, 0.3, 8]} />
        <meshBasicMaterial color="#ffd166" transparent opacity={0.85} />
      </mesh>
      <pointLight color="#ffd27f" intensity={1.2} distance={2} />
    </group>
  )
}

// 막 도착해 안착하는 소포의 반짝임 (배달 완료 직후 잠깐)
export function Courier() {
  const deliveries = useGame((s) => s.deliveries)
  return (
    <>
      {deliveries.map((d) => <Rocket key={d.id} delivery={d} />)}
    </>
  )
}

// 표면 자세 헬퍼(사용처: 향후 확장)
export function surfacePose(lat: number, lon: number) {
  const dir = latLonToDir(lat, lon)
  return { position: dir.clone().multiplyScalar(PLANET_RADIUS), quaternion: surfaceQuaternion(dir, 0) }
}
