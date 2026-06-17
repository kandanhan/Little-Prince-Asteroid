import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../store/useGame'
import { PLANET_RADIUS } from './sphereMath'

// 별 위를 천천히 도는 광고 비행선. 탭하면 보상형 광고(별빛 +).
// removeAds 구매 시 사라진다.
export function AdBlimp() {
  const group = useRef<THREE.Group>(null)
  const removeAds = useGame((s) => s.removeAds)
  const adPlaying = useGame((s) => s.adPlaying)
  const requestRewardedAd = useGame((s) => s.requestRewardedAd)

  useFrame((st) => {
    if (!group.current) return
    const t = st.clock.elapsedTime * 0.12
    const r = PLANET_RADIUS + 2.6
    const tilt = 0.5
    group.current.position.set(
      Math.cos(t) * r,
      Math.sin(t * 0.7) * 0.8 + 1.2,
      Math.sin(t) * r * tilt,
    )
    group.current.rotation.y = -t + Math.PI / 2
    group.current.position.y += Math.sin(st.clock.elapsedTime) * 0.05
  })

  if (removeAds) return null

  const onTap = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!adPlaying) requestRewardedAd()
  }

  return (
    <group ref={group} onPointerDown={onTap}>
      {/* 기구 본체 */}
      <mesh scale={[1.6, 0.7, 0.7]}>
        <sphereGeometry args={[0.4, 16, 12]} />
        <meshStandardMaterial color="#ff6f91" />
      </mesh>
      {/* 광고 배너 */}
      <mesh position={[0, -0.42, 0]}>
        <boxGeometry args={[1.0, 0.26, 0.02]} />
        <meshStandardMaterial color="#fff7e0" emissive="#ffcf56" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.42, 0.012]}>
        <boxGeometry args={[0.5, 0.12, 0.02]} />
        <meshStandardMaterial color="#ffcf56" />
      </mesh>
      {/* 곤돌라 */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.3, 0.12, 0.16]} />
        <meshStandardMaterial color="#6d6875" />
      </mesh>
      <pointLight position={[0, 0, 0]} color="#ffd27f" intensity={0.5} distance={2} />
    </group>
  )
}
