import * as THREE from 'three'

// 행성은 반지름 PLANET_RADIUS 의 구.
// 모든 캐릭터/장식은 구 표면(법선 방향 = 위쪽)에 정렬된다.
export const PLANET_RADIUS = 3

/** 위도(lat: -PI/2..PI/2), 경도(lon: -PI..PI) → 단위 방향 벡터 */
export function latLonToDir(lat: number, lon: number): THREE.Vector3 {
  const cosLat = Math.cos(lat)
  return new THREE.Vector3(
    cosLat * Math.sin(lon),
    Math.sin(lat),
    cosLat * Math.cos(lon),
  )
}

/** 단위 방향 벡터 → 위도/경도 */
export function dirToLatLon(dir: THREE.Vector3): { lat: number; lon: number } {
  const v = dir.clone().normalize()
  return { lat: Math.asin(THREE.MathUtils.clamp(v.y, -1, 1)), lon: Math.atan2(v.x, v.z) }
}

/**
 * 표면 위 한 점에서, 그 점의 법선(up)에 정렬되고 heading(라디안) 방향을 바라보는
 * 쿼터니언을 만든다. heading 0 = 북쪽(위도 증가 방향).
 */
export function surfaceQuaternion(dir: THREE.Vector3, heading: number): THREE.Quaternion {
  const up = dir.clone().normalize()
  // 임의의 기준에서 표면 접선 정북(north) 벡터 구하기
  const worldUp = new THREE.Vector3(0, 1, 0)
  let north = worldUp.clone().sub(up.clone().multiplyScalar(worldUp.dot(up)))
  if (north.lengthSq() < 1e-6) north = new THREE.Vector3(0, 0, 1) // 극점 예외
  north.normalize()
  const east = new THREE.Vector3().crossVectors(up, north).normalize()

  // heading 방향의 전방 벡터
  const forward = north.clone().multiplyScalar(Math.cos(heading))
    .add(east.clone().multiplyScalar(Math.sin(heading)))
    .normalize()

  const m = new THREE.Matrix4()
  // 모델은 +Z를 전방, +Y를 위로 가정
  const zAxis = forward
  const yAxis = up
  const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize()
  m.makeBasis(xAxis, yAxis, zAxis)
  return new THREE.Quaternion().setFromRotationMatrix(m)
}

/** 현재 방향에서 heading 방향으로 각거리 angle 만큼 표면을 따라 이동한 새 방향 */
export function moveOnSphere(dir: THREE.Vector3, heading: number, angle: number): THREE.Vector3 {
  const up = dir.clone().normalize()
  const worldUp = new THREE.Vector3(0, 1, 0)
  let north = worldUp.clone().sub(up.clone().multiplyScalar(worldUp.dot(up)))
  if (north.lengthSq() < 1e-6) north = new THREE.Vector3(0, 0, 1)
  north.normalize()
  const east = new THREE.Vector3().crossVectors(up, north).normalize()
  const forward = north.clone().multiplyScalar(Math.cos(heading))
    .add(east.clone().multiplyScalar(Math.sin(heading)))
    .normalize()
  // 회전축 = up × forward (오른손) → 표면을 따라 forward 방향으로 굴림
  const axis = new THREE.Vector3().crossVectors(forward, up).normalize()
  const q = new THREE.Quaternion().setFromAxisAngle(axis, angle)
  return up.clone().applyQuaternion(q).normalize()
}
