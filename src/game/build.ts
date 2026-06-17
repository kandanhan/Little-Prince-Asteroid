import type { BuildShape } from '../store/useGame'

// 한 칸의 크기 (반지름 방향 높이 = 가로 footprint)
export const BUILD_UNIT = 0.32

export const BUILD_PALETTE: { shape: BuildShape; name: string; emoji: string }[] = [
  { shape: 'cube',   name: '벽돌',   emoji: '🧱' },
  { shape: 'slab',   name: '바닥',   emoji: '⬜' },
  { shape: 'pillar', name: '기둥',   emoji: '🏛️' },
  { shape: 'roof',   name: '지붕',   emoji: '🔺' },
  { shape: 'fence',  name: '울타리', emoji: '🚧' },
  { shape: 'window', name: '창문',   emoji: '🪟' },
]

// 색 팔레트
export const BUILD_COLORS = [
  '#e9c46a', '#f4a261', '#e76f51', '#c1453b',
  '#a7c957', '#52b788', '#2a9d8f', '#457b9d',
  '#cdb4db', '#ffafcc', '#f1faee', '#6d6875',
]
