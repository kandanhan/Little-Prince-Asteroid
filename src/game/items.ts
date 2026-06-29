// 행성에 심거나 놓을 수 있는 장식 카탈로그.
// 각 아이템은 절차적(procedural) three.js 메쉬로 그려진다 (외부 에셋 0).

export type ItemKind =
  | 'rose'
  | 'baobab'
  | 'lamp'
  | 'bench'
  | 'fox'
  | 'sheep'
  | 'star'
  | 'mushroom'
  | 'flower'
  | 'well'
  | 'volcano'
  | 'tree'
  | 'crystal'
  // 상점 전용(특별) 아이템
  | 'cat'
  | 'bird'
  | 'fountain'
  | 'house'
  | 'rainbow'

export interface ItemDef {
  kind: ItemKind
  name: string       // 한국어 이름
  emoji: string      // UI 아이콘
  hint: string       // 짧은 설명/대사
  scale: number      // 기본 크기
}

// 힌트 문구는 Orblet 오리지널 카피(어린왕자 인용 미사용) — unity/BRAND.md §5
export const ITEM_CATALOG: ItemDef[] = [
  { kind: 'rose',     name: '장미',       emoji: '🌹', hint: '오늘도 한 송이, 별이 환해졌어요',   scale: 1.0 },
  { kind: 'baobab',   name: '새싹',       emoji: '🌱', hint: '작은 떡잎, 내일이 기대돼요',        scale: 0.9 },
  { kind: 'tree',     name: '나무',       emoji: '🌳', hint: '그늘 아래 잠깐 쉬어가요',           scale: 1.1 },
  { kind: 'lamp',     name: '가로등',     emoji: '🏮', hint: '밤이 오면 깜빡, 스스로 불을 켜요',   scale: 1.0 },
  { kind: 'bench',    name: '벤치',       emoji: '🪑', hint: '나란히 앉아 노을을 봐요',           scale: 1.0 },
  { kind: 'fox',      name: '여우',       emoji: '🦊', hint: '천천히 다가가면, 어느새 친구',      scale: 0.9 },
  { kind: 'sheep',    name: '양',         emoji: '🐑', hint: '포근한 털뭉치가 데구르르',          scale: 0.9 },
  { kind: 'star',     name: '별',         emoji: '⭐', hint: '콕 놓으면 반짝, 웃는 별',           scale: 0.8 },
  { kind: 'crystal',  name: '수정',       emoji: '💎', hint: '빛을 머금은 작은 결정',             scale: 0.8 },
  { kind: 'mushroom', name: '버섯',       emoji: '🍄', hint: '비 온 뒤 쏙 돋은 우산',             scale: 0.8 },
  { kind: 'flower',   name: '들꽃',       emoji: '🌼', hint: '바람에 살랑이는 들꽃 무리',         scale: 0.8 },
  { kind: 'well',     name: '우물',       emoji: '⛲', hint: '별 어딘가 숨어 있는 시원한 우물',   scale: 1.0 },
  { kind: 'volcano',  name: '화산',       emoji: '🌋', hint: '아침마다 보글보글, 따뜻한 김',      scale: 1.0 },
]

export const ITEM_BY_KIND: Record<ItemKind, ItemDef> = Object.fromEntries(
  ITEM_CATALOG.map((d) => [d.kind, d]),
) as Record<ItemKind, ItemDef>
