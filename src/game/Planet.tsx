import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { PLANET_RADIUS, dirToLatLon } from './sphereMath'
import { useGame } from '../store/useGame'
import { ITEM_BY_KIND } from './items'
import { THEME_BY_KEY } from './planets'

// 약간의 언덕을 가진 부드러운 행성. value-noise 변위로 자연스러운 굴곡.
function makePlanetGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(PLANET_RADIUS, 24)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = v.clone().normalize()
    // 여러 사인 주파수 합 → 잔잔한 언덕
    const h =
      Math.sin(n.x * 3.1 + 0.5) * Math.cos(n.y * 2.7) * 0.06 +
      Math.sin(n.y * 5.3) * Math.cos(n.z * 4.1) * 0.035 +
      Math.sin(n.z * 7.7 + 1.0) * 0.02
    v.addScaledVector(n, h)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

export function Planet() {
  const geometry = useMemo(makePlanetGeometry, [])
  const tool = useGame((s) => s.tool)
  const selectedKind = useGame((s) => s.selectedKind)
  const addItem = useGame((s) => s.addItem)
  const buildShape = useGame((s) => s.buildShape)
  const buildColor = useGame((s) => s.buildColor)
  const buildRot = useGame((s) => s.buildRot)
  const addBlock = useGame((s) => s.addBlock)
  const theme = useGame((s) => s.planets.find((p) => p.id === s.currentPlanetId)?.theme ?? 'meadow')
  const themeDef = THEME_BY_KEY[theme]

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    const dir = e.point.clone().normalize()
    const { lat, lon } = dirToLatLon(dir)
    if (tool === 'place') {
      e.stopPropagation()
      const def = ITEM_BY_KIND[selectedKind]
      addItem({ kind: selectedKind, lat, lon, scale: def.scale * (0.85 + Math.random() * 0.3), hue: Math.random() })
    } else if (tool === 'build') {
      e.stopPropagation()
      // 바닥(height 0)에 새 블록
      addBlock({ shape: buildShape, lat, lon, height: 0, color: buildColor, rot: buildRot })
    }
  }

  return (
    <group>
      {/* 땅 */}
      <mesh geometry={geometry} onPointerDown={handlePointerDown} receiveShadow>
        <meshStandardMaterial color={themeDef.ground} roughness={0.95} flatShading />
      </mesh>
      {/* 물(작은 호수) — 약간 안쪽의 반투명 구 */}
      <mesh>
        <sphereGeometry args={[PLANET_RADIUS - 0.04, 48, 48]} />
        <meshStandardMaterial color="#4aa3c7" transparent opacity={0.0} />
      </mesh>
      {/* 핵심부 빛 */}
      <mesh>
        <sphereGeometry args={[PLANET_RADIUS * 0.4, 16, 16]} />
        <meshBasicMaterial color={themeDef.accent} />
      </mesh>
    </group>
  )
}
