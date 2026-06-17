import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PLANET_RADIUS, surfaceQuaternion, moveOnSphere } from './sphereMath'
import { input } from './input'

const WALK_SPEED = 0.9     // 라디안/초
const TURN_SPEED = 1.8     // 라디안/초
const CHAR_HEIGHT = 0.0    // 발이 표면에 닿도록

// 어린왕자 캐릭터: 구 표면을 걷고, 3인칭 카메라가 뒤를 따른다.
export function Prince() {
  const groupRef = useRef<THREE.Group>(null)
  const dirRef = useRef(new THREE.Vector3(0, 1, 0))   // 표면 위 방향(=발 위치 단위벡터)
  const headingRef = useRef(0)
  const bobRef = useRef(0)
  const { camera } = useThree()

  // 카메라 보간용 임시 벡터
  const tmpCamPos = useRef(new THREE.Vector3())
  const tmpLookAt = useRef(new THREE.Vector3())

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)

    // 회전
    headingRef.current += input.turn * TURN_SPEED * dt
    // 이동
    const moving = Math.abs(input.move) > 0.05
    if (moving) {
      dirRef.current = moveOnSphere(dirRef.current, headingRef.current, input.move * WALK_SPEED * dt)
      bobRef.current += dt * 9
    }

    const dir = dirRef.current
    const up = dir.clone()
    const surfacePos = dir.clone().multiplyScalar(PLANET_RADIUS + CHAR_HEIGHT)

    // 캐릭터 배치 + 자세
    const quat = surfaceQuaternion(dir, headingRef.current)
    if (groupRef.current) {
      groupRef.current.position.copy(surfacePos)
      groupRef.current.quaternion.copy(quat)
      // 걸을 때 살짝 통통 튀는 느낌
      const bob = moving ? Math.abs(Math.sin(bobRef.current)) * 0.04 : 0
      groupRef.current.position.addScaledVector(up, bob)
    }

    // 입력 공유 (UI에서 사용)
    input.princeDir.copy(dir)
    input.princeHeading = headingRef.current

    // ----- 3인칭 카메라: 어린왕자 뒤·위에서 -----
    const fwdQuat = surfaceQuaternion(dir, headingRef.current)
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(fwdQuat)
    const camDist = 4.2
    const camHeight = 2.6
    const desired = surfacePos.clone()
      .add(up.clone().multiplyScalar(camHeight))
      .add(forward.clone().multiplyScalar(-camDist))
    tmpCamPos.current.lerp(desired, 1 - Math.pow(0.001, dt))
    if (tmpCamPos.current.lengthSq() < 1e-6) tmpCamPos.current.copy(desired)
    camera.position.copy(tmpCamPos.current)

    const lookTarget = surfacePos.clone().add(up.clone().multiplyScalar(0.6))
    tmpLookAt.current.lerp(lookTarget, 1 - Math.pow(0.0001, dt))
    if (tmpLookAt.current.lengthSq() < 1e-6) tmpLookAt.current.copy(lookTarget)
    camera.up.copy(up)
    camera.lookAt(tmpLookAt.current)
  })

  return (
    <group ref={groupRef}>
      <PrinceModel />
    </group>
  )
}

// 작고 귀여운 어린왕자 — 초록 외투 + 금발 + 목도리
function PrinceModel() {
  const scarf = useRef<THREE.Mesh>(null)
  useFrame((st) => {
    if (scarf.current) scarf.current.rotation.z = Math.sin(st.clock.elapsedTime * 2) * 0.15
  })
  return (
    <group scale={0.55}>
      {/* 다리 */}
      <mesh position={[-0.08, 0.12, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.24, 6]} />
        <meshStandardMaterial color="#2a3d66" />
      </mesh>
      <mesh position={[0.08, 0.12, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.24, 6]} />
        <meshStandardMaterial color="#2a3d66" />
      </mesh>
      {/* 몸통(외투) */}
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.22, 0.42, 8]} />
        <meshStandardMaterial color="#3a7d44" />
      </mesh>
      {/* 목도리 */}
      <mesh ref={scarf} position={[0, 0.58, 0.02]}>
        <torusGeometry args={[0.1, 0.035, 8, 16]} />
        <meshStandardMaterial color="#ffd60a" />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 0.74, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffe0bd" />
      </mesh>
      {/* 머리카락 */}
      <mesh position={[0, 0.83, 0]}>
        <sphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f6c453" />
      </mesh>
      {/* 눈 */}
      <mesh position={[-0.05, 0.74, 0.13]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#3d3d52" /></mesh>
      <mesh position={[0.05, 0.74, 0.13]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#3d3d52" /></mesh>
    </group>
  )
}
