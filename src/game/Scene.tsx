import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, N8AO, wrapEffect } from '@react-three/postprocessing'
import { Effect, EffectAttribute } from 'postprocessing'
import * as THREE from 'three'
import { Planet } from './Planet'
import { Prince } from './Prince'
import { Decoration, GrassField, Petals } from './Decorations'
import { Structures } from './Structures'
import { Courier } from './Courier'
import { AdBlimp } from './AdBlimp'
import { THEME_BY_KEY } from './planets'
import { useGame } from '../store/useGame'
import { styleParams } from './useStyle'

// 하루 위상(0..1)에 따른 색 보간
function skyColor(phase: number): THREE.Color {
  // 0 자정(짙은 남색) → 0.25 새벽(보라/주황) → 0.5 정오(하늘색) → 0.75 노을(주황) → 1 자정
  const stops: [number, string][] = [
    [0.0, '#0d0c24'],
    [0.22, '#3a2a5a'],
    [0.3, '#ff9e7d'],
    [0.5, '#8fd3ff'],
    [0.7, '#ffb37d'],
    [0.8, '#7a4a8a'],
    [1.0, '#0d0c24'],
  ]
  let a = stops[0], b = stops[stops.length - 1]
  for (let i = 0; i < stops.length - 1; i++) {
    if (phase >= stops[i][0] && phase <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break }
  }
  const t = (phase - a[0]) / Math.max(1e-6, b[0] - a[0])
  return new THREE.Color(a[1]).lerp(new THREE.Color(b[1]), t)
}

// 태양 방향과 밝기
function sunInfo(phase: number) {
  const ang = (phase - 0.25) * Math.PI * 2 // 0.25에 떠서 0.75에 짐
  const dir = new THREE.Vector3(Math.cos(ang), Math.sin(ang), 0.3).normalize()
  const daylight = THREE.MathUtils.clamp(Math.sin(ang) * 1.2 + 0.2, 0, 1)
  return { dir, daylight }
}

function DayNight() {
  const { scene } = useThree()
  const gl = useThree((s) => s.gl)
  const dirLight = useRef<THREE.DirectionalLight>(null)
  const ambient = useRef<THREE.AmbientLight>(null)
  const dayPhase = useGame((s) => s.dayPhase)
  const autoTime = useGame((s) => s.autoTime)
  const setDayPhase = useGame((s) => s.setDayPhase)
  const skyTint = useGame((s) => THEME_BY_KEY[s.planets.find((p) => p.id === s.currentPlanetId)?.theme ?? 'meadow'].skyTint)
  const phaseRef = useRef(dayPhase)

  useFrame((_, dt) => {
    if (autoTime) {
      // 약 4분에 하루
      phaseRef.current = (phaseRef.current + dt / 240) % 1
      // 스토어 갱신은 가끔만 (렌더 폭주 방지)
      if (Math.random() < 0.02) setDayPhase(phaseRef.current)
    } else {
      phaseRef.current = dayPhase
    }
    const phase = phaseRef.current
    // 낮일수록 행성 테마 색을 더 섞어 별마다 분위기를 다르게
    const daySky = skyColor(phase)
    const { daylight: dl } = sunInfo(phase)
    const sky = daySky.clone().lerp(new THREE.Color(skyTint), dl * 0.3)
    scene.background = sky
    // 행성만 살짝 감싸는 옅은 안개 (먼 별들은 보이도록 far를 크게)
    if (!scene.fog) scene.fog = new THREE.Fog(sky, 11, 80)
    else (scene.fog as THREE.Fog).color.copy(sky)

    const { dir, daylight } = sunInfo(phase)
    if (dirLight.current) {
      dirLight.current.position.copy(dir.clone().multiplyScalar(10))
      dirLight.current.intensity = 0.3 + daylight * 1.3
      dirLight.current.color.setHSL(0.09, 0.4, 0.7 + daylight * 0.2)
    }
    if (ambient.current) ambient.current.intensity = 0.35 + daylight * 0.5

    // --- 그래픽 스타일 연속 반영 ---
    const sp = styleParams(useGame.getState().styleLevel)
    scene.environmentIntensity = sp.envIntensity
    gl.toneMappingExposure = sp.exposure
    if (dirLight.current) dirLight.current.shadow.radius = sp.shadowRadius
  })

  return (
    <>
      <directionalLight
        ref={dirLight}
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0004}
      />
      <ambientLight ref={ambient} />
      <hemisphereLight args={['#bfe3ff', '#4a6b3a', 0.4]} />
    </>
  )
}

// 반딧불이 입자 (밤의 분위기)
function Fireflies({ count = 40 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const dayPhase = useGame((s) => s.dayPhase)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(3.2 + Math.random() * 1.2)
      arr.set([v.x, v.y, v.z], i * 3)
    }
    return arr
  }, [count])

  useFrame((st) => {
    if (!ref.current) return
    ref.current.rotation.y = st.clock.elapsedTime * 0.04
    const mat = ref.current.material as THREE.PointsMaterial
    // 밤(0.8~0.2)에 밝게
    const night = dayPhase > 0.78 || dayPhase < 0.22 ? 1 : 0
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, night * 0.9, 0.05)
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#fff3b0" size={0.08} transparent opacity={0} sizeAttenuation />
    </points>
  )
}

// ---- 만화쪽 후처리: 깊이 외곽선 + 셀밴딩 (커스텀 Effect) ----
const stylizeFrag = /* glsl */ `
uniform float uMix;          // 만화 정도 0..1
uniform float uBands;        // 셀 밴딩 단계
uniform float uOutline;      // 외곽선 강도
uniform vec3  uLineColor;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec3 col = inputColor.rgb;

  // 셀 밴딩 (포스터화)
  vec3 banded = floor(col * uBands + 0.5) / uBands;
  col = mix(col, banded, uMix);

  // 깊이 기반 외곽선 (실루엣)
  vec2 t = texelSize;
  float d0 = readDepth(uv);
  float dl = readDepth(uv - vec2(t.x, 0.0));
  float dr = readDepth(uv + vec2(t.x, 0.0));
  float dd = readDepth(uv - vec2(0.0, t.y));
  float du = readDepth(uv + vec2(0.0, t.y));
  float edge = abs(d0 - dl) + abs(d0 - dr) + abs(d0 - dd) + abs(d0 - du);
  float e = smoothstep(0.0006, 0.0035, edge) * uOutline * uMix;
  col = mix(col, uLineColor, e);

  outputColor = vec4(col, inputColor.a);
}
`

class StylizeEffect extends Effect {
  constructor() {
    super('StylizeEffect', stylizeFrag, {
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map<string, THREE.Uniform>([
        ['uMix', new THREE.Uniform(0.0)],
        ['uBands', new THREE.Uniform(5.0)],
        ['uOutline', new THREE.Uniform(1.0)],
        ['uLineColor', new THREE.Uniform(new THREE.Color('#2b2b3a'))],
      ]),
    })
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Stylize = wrapEffect(StylizeEffect) as any

function Post() {
  const lowSpec = useGame((s) => s.lowSpec)
  const stylize = useRef<StylizeEffect>(null)
  const bloom = useRef<{ intensity: number }>(null)
  const ao = useRef<{ configuration?: { intensity: number }; intensity?: number }>(null)
  const dof = useRef<{ bokehScale: number }>(null)

  useFrame(() => {
    const sp = styleParams(useGame.getState().styleLevel)
    if (stylize.current) (stylize.current.uniforms.get('uMix') as THREE.Uniform).value = sp.cartoonFx
    if (bloom.current) bloom.current.intensity = sp.bloom
    if (ao.current) {
      const cfg = ao.current.configuration ?? ao.current
      cfg.intensity = sp.realFx * 1.4
    }
    if (dof.current) dof.current.bokehScale = sp.realFx * 3.2
  })

  if (lowSpec) return null

  return (
    <EffectComposer multisampling={2}>
      <N8AO ref={ao as never} aoRadius={0.7} distanceFalloff={1} intensity={0} quality="performance" halfRes />
      <DepthOfField ref={dof as never} focusDistance={0.012} focalLength={0.04} bokehScale={0} />
      <Bloom ref={bloom as never} intensity={0.3} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
      <Stylize ref={stylize} />
    </EffectComposer>
  )
}

export function Scene() {
  const items = useGame((s) => s.items)
  const tool = useGame((s) => s.tool)
  const removeItem = useGame((s) => s.removeItem)
  const theme = useGame((s) => s.planets.find((p) => p.id === s.currentPlanetId)?.theme ?? 'meadow')
  const grassy = theme === 'meadow' || theme === 'rose'

  const onItemClick = (id: string) => {
    if (tool === 'remove') removeItem(id)
  }

  return (
    <>
      {/* 로컬 베이크 환경맵 (네트워크 의존 없음) — 지브리풍 파스텔 */}
      <Environment resolution={128} frames={1} background={false}>
        <Lightformer intensity={1.5} color="#fff3e0" position={[0, 6, 3]} scale={[8, 8, 1]} />
        <Lightformer intensity={0.9} color="#cfe8ff" position={[5, 1, -4]} scale={[6, 6, 1]} />
        <Lightformer intensity={0.7} color="#ffd9ec" position={[-5, -2, 2]} scale={[6, 6, 1]} />
      </Environment>

      <DayNight />
      <Stars radius={45} depth={30} count={1800} factor={3} saturation={0} fade speed={0.4} />
      <Fireflies />
      <Planet />
      {grassy && <GrassField theme={theme} />}
      <Petals theme={theme} />
      <Prince />
      <Structures />
      <Courier />
      <AdBlimp />
      {items.map((it) => (
        <Decoration key={it.id} item={it} onClick={onItemClick} />
      ))}

      <Post />
    </>
  )
}
