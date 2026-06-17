import { createElement, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGame } from '../store/useGame'

// '만화 ↔ 사실' 그래픽 스타일을 styleLevel(0..1) 하나로 연속 보간.
// 0 = 지브리풍 셀룩(툰), 1 = 사실적 PBR.

const { lerp, smoothstep, clamp } = THREE.MathUtils

export interface StyleParams {
  realistic: boolean        // 0.5 지점에서 Toon↔Standard 교차
  flatShading: boolean
  roughness: number
  metalness: number
  envMapIntensity: number
  envIntensity: number      // scene.environmentIntensity
  exposure: number          // toneMappingExposure
  shadowRadius: number      // 사실쪽일수록 선명(작게)
  cartoonFx: number         // 0..1 — 외곽선 + 셀밴딩 양
  realFx: number            // 0..1 — AO + DoF 양
  bloom: number             // 블룸 강도
}

export function styleParams(sRaw: number): StyleParams {
  const s = clamp(sRaw, 0, 1)
  return {
    realistic: s >= 0.5,
    flatShading: s < 0.5,
    roughness: lerp(0.95, 0.38, s),
    metalness: lerp(0.0, 0.18, s),
    envMapIntensity: lerp(0.15, 1.15, s),
    envIntensity: lerp(0.28, 1.0, s),
    exposure: lerp(0.95, 1.18, s),
    shadowRadius: lerp(7, 1, s),
    cartoonFx: 1 - smoothstep(0.0, 0.55, s),
    realFx: smoothstep(0.45, 1.0, s),
    bloom: lerp(0.22, 0.95, s),
  }
}

/** Scene 단위 컴포넌트에서 현재 스타일 수치를 구독 (값이 바뀔 때만 리렌더) */
export function useStyleParams(): StyleParams {
  const styleLevel = useGame((s) => s.styleLevel)
  return styleParams(styleLevel)
}

// 셀 셰이딩용 3단계 그라데이션 (툰 머티리얼 밴딩)
function makeToonGradient(steps = 3): THREE.DataTexture {
  const data = new Uint8Array(steps)
  for (let i = 0; i < steps; i++) data[i] = Math.round((i / (steps - 1)) * 255)
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}
const TOON_GRADIENT = makeToonGradient(3)

// 연속 PBR 파라미터를 머티리얼에 직접 반영 (리렌더 없이)
function applyContinuous(mat: THREE.Material | null, s: number) {
  if (!mat) return
  const p = styleParams(s)
  const m = mat as THREE.MeshStandardMaterial
  if ('roughness' in m) m.roughness = p.roughness
  if ('metalness' in m) m.metalness = p.metalness
  if ('envMapIntensity' in m) m.envMapIntensity = p.envMapIntensity
}

export interface StyleMaterialProps {
  color?: THREE.ColorRepresentation
  emissive?: THREE.ColorRepresentation
  emissiveIntensity?: number
  transparent?: boolean
  opacity?: number
  side?: THREE.Side
  flat?: boolean   // flatShading 강제 (예: 땅)
}

/**
 * styleLevel 에 따라 0.5 지점에서 Toon↔Standard 로 교차하는 공용 머티리얼.
 * 연속값(roughness/metalness/envMapIntensity)은 store 구독으로 즉시 반영한다.
 * JSX 의존을 피하려고 createElement 로 작성 (.ts 파일).
 */
export function StyleMaterial(props: StyleMaterialProps) {
  const realistic = useGame((s) => s.styleLevel >= 0.5)
  const ref = useRef<THREE.Material>(null)

  useEffect(() => {
    applyContinuous(ref.current, useGame.getState().styleLevel)
    const unsub = useGame.subscribe((st, prev) => {
      if (st.styleLevel === prev.styleLevel) return
      applyContinuous(ref.current, st.styleLevel)
    })
    return unsub
  }, [realistic])

  const common = {
    ref,
    color: props.color,
    emissive: props.emissive,
    emissiveIntensity: props.emissiveIntensity,
    transparent: props.transparent,
    opacity: props.opacity,
    side: props.side,
  }

  if (realistic) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createElement('meshStandardMaterial', {
      ...common,
      flatShading: props.flat ?? false,
    } as any)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement('meshToonMaterial', {
    ...common,
    gradientMap: TOON_GRADIENT,
    flatShading: props.flat ?? true,
  } as any)
}
