import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useGame, type BuildBlock } from '../store/useGame'
import { latLonToDir, surfaceQuaternion, PLANET_RADIUS } from './sphereMath'
import { BUILD_UNIT } from './build'

const U = BUILD_UNIT

// 한 칸 안에 들어가는 블록 형상 (셀 중심이 원점, 위=+Y)
function ShapeMesh({ shape, color }: { shape: BuildBlock['shape']; color: string }) {
  switch (shape) {
    case 'cube':
      return <mesh castShadow><boxGeometry args={[U * 0.94, U * 0.94, U * 0.94]} /><meshStandardMaterial color={color} flatShading /></mesh>
    case 'slab':
      return <mesh position={[0, -U * 0.32, 0]}><boxGeometry args={[U * 0.96, U * 0.3, U * 0.96]} /><meshStandardMaterial color={color} flatShading /></mesh>
    case 'pillar':
      return <mesh><cylinderGeometry args={[U * 0.3, U * 0.34, U * 0.96, 8]} /><meshStandardMaterial color={color} /></mesh>
    case 'roof':
      return <mesh position={[0, U * 0.02, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[U * 0.72, U * 0.94, 4]} /><meshStandardMaterial color={color} flatShading /></mesh>
    case 'fence':
      return (
        <group>
          <mesh position={[0, -U * 0.1, 0]}><boxGeometry args={[U * 0.94, U * 0.12, U * 0.12]} /><meshStandardMaterial color={color} /></mesh>
          {[-0.32, 0, 0.32].map((x) => (
            <mesh key={x} position={[x * U, 0, 0]}><boxGeometry args={[U * 0.1, U * 0.7, U * 0.1]} /><meshStandardMaterial color={color} /></mesh>
          ))}
        </group>
      )
    case 'window':
      return (
        <group>
          <mesh><boxGeometry args={[U * 0.94, U * 0.94, U * 0.3]} /><meshStandardMaterial color={color} flatShading /></mesh>
          <mesh position={[0, 0, U * 0.08]}><boxGeometry args={[U * 0.5, U * 0.5, U * 0.32]} /><meshStandardMaterial color="#9bf6ff" transparent opacity={0.7} emissive="#48cae4" emissiveIntensity={0.4} /></mesh>
        </group>
      )
  }
}

function Block({ block }: { block: BuildBlock }) {
  const tool = useGame((s) => s.tool)
  const buildShape = useGame((s) => s.buildShape)
  const buildColor = useGame((s) => s.buildColor)
  const buildRot = useGame((s) => s.buildRot)
  const addBlock = useGame((s) => s.addBlock)
  const removeBlock = useGame((s) => s.removeBlock)

  const { position, quaternion } = useMemo(() => {
    const dir = latLonToDir(block.lat, block.lon)
    const r = PLANET_RADIUS + (block.height + 0.5) * U
    return {
      position: dir.clone().multiplyScalar(r),
      quaternion: surfaceQuaternion(dir, block.rot * Math.PI / 2),
    }
  }, [block.lat, block.lon, block.height, block.rot])

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (tool === 'remove') { removeBlock(block.id); return }
    if (tool === 'build') {
      // 이 블록 위에 한 칸 더 쌓기
      addBlock({ shape: buildShape, lat: block.lat, lon: block.lon, height: block.height + 1, color: buildColor, rot: buildRot })
    }
  }

  return (
    <group position={position} quaternion={quaternion} onPointerDown={onDown}>
      <ShapeMesh shape={block.shape} color={block.color} />
    </group>
  )
}

export function Structures() {
  const blocks = useGame((s) => s.blocks)
  return <>{blocks.map((b) => <Block key={b.id} block={b} />)}</>
}
