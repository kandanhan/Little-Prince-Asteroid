import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { PLANET_RADIUS, dirToLatLon, latLonToDir, surfaceQuaternion } from './sphereMath'
import { useGame } from '../store/useGame'
import { ITEM_BY_KIND } from './items'
import { THEME_BY_KEY, type PlanetTheme } from './planets'
import { StyleMaterial } from './useStyle'

// 약간의 언덕을 가진 부드러운 행성. value-noise 변위로 자연스러운 굴곡.
function makePlanetGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(PLANET_RADIUS, 32)
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

// 행성 위를 흐르는 구름 — 부드러운 퍼프 덩어리가 천천히 공전
function Clouds({ count = 5 }: { count?: number }) {
  const ref = useRef<THREE.Group>(null)
  const puffs = useMemo(() => {
    const arr: { dir: THREE.Vector3; r: number; blobs: [number, number, number, number][] }[] = []
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3().randomDirection()
      const r = PLANET_RADIUS + 1.4 + Math.random() * 0.8
      const blobs: [number, number, number, number][] = []
      const n = 3 + Math.floor(Math.random() * 3)
      for (let b = 0; b < n; b++) {
        blobs.push([
          (Math.random() - 0.5) * 0.7,
          (Math.random() - 0.5) * 0.18,
          (Math.random() - 0.5) * 0.5,
          0.18 + Math.random() * 0.18,
        ])
      }
      arr.push({ dir, r, blobs })
    }
    return arr
  }, [count])

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.012
  })

  return (
    <group ref={ref}>
      {puffs.map((p, i) => {
        const pos = p.dir.clone().multiplyScalar(p.r)
        const quat = surfaceQuaternion(p.dir, Math.random() * Math.PI)
        return (
          <group key={i} position={pos} quaternion={quat}>
            {p.blobs.map((b, j) => (
              <mesh key={j} position={[b[0], b[1], b[2]]}>
                <sphereGeometry args={[b[3], 10, 10]} />
                <meshStandardMaterial color="#fdfdff" transparent opacity={0.82} roughness={1} flatShading />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

// 호수 — 잔물결이 이는 물 셰이더 (표면에 평평하게 얹힌 원반)
function Lake({ lat, lon, radius = 0.95 }: { lat: number; lon: number; radius?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { position, quaternion } = useMemo(() => {
    const dir = latLonToDir(lat, lon)
    return {
      position: dir.clone().multiplyScalar(PLANET_RADIUS + 0.012),
      quaternion: surfaceQuaternion(dir, 0),
    }
  }, [lat, lon])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uShallow: { value: new THREE.Color('#7fd4ec') },
          uDeep: { value: new THREE.Color('#1d3f6e') },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying vec3 vN;
          void main() {
            vUv = uv;
            vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          varying vec3 vN;
          uniform float uTime;
          uniform vec3 uShallow;
          uniform vec3 uDeep;
          void main() {
            vec2 c = vUv - 0.5;
            float r = length(c);
            if (r > 0.5) discard;
            // 동심 잔물결 + 흐르는 결
            float ripple = 0.5 + 0.5 * sin(r * 46.0 - uTime * 2.4);
            float flow = 0.5 + 0.5 * sin((vUv.x + vUv.y) * 18.0 + uTime * 1.6);
            float mixv = clamp(0.35 + 0.4 * ripple + 0.25 * flow * (1.0 - r), 0.0, 1.0);
            vec3 col = mix(uDeep, uShallow, mixv);
            // 림 하이라이트 + 가장자리 페이드
            float rim = smoothstep(0.5, 0.36, r);
            col += vec3(0.12) * pow(ripple, 3.0) * vN.z;
            gl_FragColor = vec4(col, rim * 0.92);
          }
        `,
      }),
    [],
  )

  useFrame((st) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = st.clock.elapsedTime
  })

  return (
    <mesh position={position} quaternion={quaternion} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 48]} />
      <primitive object={material} ref={matRef} attach="material" />
    </mesh>
  )
}

const LAKE_THEMES: PlanetTheme[] = ['meadow', 'ocean', 'rose']

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
      {/* 땅 — 공용 스타일 머티리얼 (Toon↔Standard 교차) */}
      <mesh geometry={geometry} onPointerDown={handlePointerDown} receiveShadow castShadow>
        <StyleMaterial color={themeDef.ground} />
      </mesh>
      {/* 핵심부 빛 */}
      <mesh>
        <sphereGeometry args={[PLANET_RADIUS * 0.4, 16, 16]} />
        <meshBasicMaterial color={themeDef.accent} />
      </mesh>
      {/* 호수 (테마에 따라) */}
      {LAKE_THEMES.includes(theme) && <Lake lat={-0.35} lon={0.7} radius={theme === 'ocean' ? 1.2 : 0.9} />}
      {/* 흐르는 구름 */}
      <Clouds />
    </group>
  )
}
