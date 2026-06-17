// 여러 소행성의 테마. 반지름은 공통(이동/장식 수식 보존), 색·분위기만 달라진다.
export type PlanetTheme = 'meadow' | 'desert' | 'ocean' | 'snow' | 'rose' | 'night'

export interface ThemeDef {
  theme: PlanetTheme
  name: string
  emoji: string
  ground: string   // 지표 색
  accent: string   // 강조(언덕/하이라이트)
  skyTint: string  // 하늘 보정색
}

export const PLANET_THEMES: ThemeDef[] = [
  { theme: 'meadow', name: '초원의 별', emoji: '🌱', ground: '#5fa86b', accent: '#a7ecb0', skyTint: '#8fd3ff' },
  { theme: 'desert', name: '사막의 별', emoji: '🏜️', ground: '#e9c46a', accent: '#f4d58d', skyTint: '#ffd6a5' },
  { theme: 'ocean',  name: '바다의 별', emoji: '🌊', ground: '#4aa3c7', accent: '#90e0ef', skyTint: '#caf0f8' },
  { theme: 'snow',   name: '눈의 별',   emoji: '❄️', ground: '#e8eef2', accent: '#ffffff', skyTint: '#cde7ff' },
  { theme: 'rose',   name: '장미의 별', emoji: '🌹', ground: '#c97b97', accent: '#ffb3c6', skyTint: '#ffc8dd' },
  { theme: 'night',  name: '밤의 별',   emoji: '🌙', ground: '#5a5378', accent: '#b8b3d9', skyTint: '#3a2a5a' },
]

export const THEME_BY_KEY: Record<PlanetTheme, ThemeDef> = Object.fromEntries(
  PLANET_THEMES.map((t) => [t.theme, t]),
) as Record<PlanetTheme, ThemeDef>

export const NEW_PLANET_COST = 200
