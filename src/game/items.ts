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

export const ITEM_CATALOG: ItemDef[] = [
  { kind: 'rose',     name: '장미',       emoji: '🌹', hint: '세상에 단 하나뿐인 나의 장미.',           scale: 1.0 },
  { kind: 'baobab',   name: '바오바브 새싹', emoji: '🌱', hint: '작을 때 돌봐주면 친구가 돼요.',          scale: 0.9 },
  { kind: 'tree',     name: '나무',       emoji: '🌳', hint: '그늘을 만들어 주는 친구.',               scale: 1.1 },
  { kind: 'lamp',     name: '가로등',     emoji: '🏮', hint: '밤이 오면 스스로 불을 밝혀요.',           scale: 1.0 },
  { kind: 'bench',    name: '벤치',       emoji: '🪑', hint: '노을을 마흔네 번 바라보던 자리.',         scale: 1.0 },
  { kind: 'fox',      name: '여우',       emoji: '🦊', hint: '길들인다는 건 관계를 맺는 것.',           scale: 0.9 },
  { kind: 'sheep',    name: '양',         emoji: '🐑', hint: '상자 속에 잠든 나의 양.',               scale: 0.9 },
  { kind: 'star',     name: '별',         emoji: '⭐', hint: '웃을 줄 아는 별 하나.',                 scale: 0.8 },
  { kind: 'crystal',  name: '수정',       emoji: '💎', hint: '빛을 머금은 작은 결정.',                scale: 0.8 },
  { kind: 'mushroom', name: '버섯',       emoji: '🍄', hint: '비 온 뒤 돋아난 작은 우산.',             scale: 0.8 },
  { kind: 'flower',   name: '들꽃',       emoji: '🌼', hint: '바람에 흔들리는 들꽃 무리.',             scale: 0.8 },
  { kind: 'well',     name: '우물',       emoji: '⛲', hint: '사막을 아름답게 하는 건 어딘가 숨은 우물.', scale: 1.0 },
  { kind: 'volcano',  name: '화산',       emoji: '🌋', hint: '매일 청소하면 따뜻한 아침밥을 지어줘요.',   scale: 1.0 },
]

export const ITEM_BY_KIND: Record<ItemKind, ItemDef> = Object.fromEntries(
  ITEM_CATALOG.map((d) => [d.kind, d]),
) as Record<ItemKind, ItemDef>
