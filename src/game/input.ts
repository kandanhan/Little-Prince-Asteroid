import * as THREE from 'three'

// 조이스틱/터치 입력을 3D 루프와 공유하는 모듈 전역 상태.
export const input = {
  move: 0,      // -1..1  앞(+)/뒤(-)
  turn: 0,      // -1..1  좌(-)/우(+)
  // 어린왕자의 현재 표면 방향 (UI에서 "발밑에 심기" 등에 사용)
  princeDir: new THREE.Vector3(0, 1, 0),
  princeHeading: 0,
}

export function resetInput() {
  input.move = 0
  input.turn = 0
}
