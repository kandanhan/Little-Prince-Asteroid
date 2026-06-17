import type { ItemKind, ItemDef } from './items'
import { ITEM_CATALOG } from './items'

export type ShopCategory = '식물' | '동물' | '구조물' | '특별'

export interface ShopItem extends ItemDef {
  price: number
  category: ShopCategory
  rare?: boolean
}

// 상점 전용 특별 아이템 (기존 무료 배치 아이템과 별개).
// 우주 배달부가 배달해 줍니다.
export const SHOP_CATALOG: ShopItem[] = [
  { kind: 'cat',      name: '검은 고양이', emoji: '🐈‍⬛', hint: '밤이면 눈이 별처럼 빛나요.',     scale: 1.0, price: 40, category: '동물' },
  { kind: 'bird',     name: '파랑새',     emoji: '🐦', hint: '행복을 물어다 준다는 새.',        scale: 1.0, price: 35, category: '동물' },
  { kind: 'fountain', name: '분수',       emoji: '⛲', hint: '물소리는 마음을 씻어줘요.',        scale: 1.1, price: 80, category: '구조물' },
  { kind: 'house',    name: '작은 집',     emoji: '🏠', hint: '돌아올 곳이 있다는 건 따뜻해요.',   scale: 1.1, price: 120, category: '구조물' },
  { kind: 'rainbow',  name: '무지개',     emoji: '🌈', hint: '비 갠 뒤에만 만날 수 있어요.',     scale: 1.0, price: 150, category: '특별', rare: true },
  { kind: 'crystal',  name: '빛의 수정',   emoji: '💎', hint: '오래 보면 소원이 이뤄진대요.',     scale: 1.1, price: 60, category: '특별', rare: true },
  { kind: 'star',     name: '떨어진 별',   emoji: '⭐', hint: '웃을 줄 아는 별 하나.',           scale: 1.0, price: 50, category: '특별' },
  { kind: 'well',     name: '사막의 우물',  emoji: '⛲', hint: '어딘가 우물을 숨기고 있어 아름답죠.', scale: 1.1, price: 70, category: '구조물' },
]

// 모든 아이템 정의(무료 + 상점)를 kind로 조회
const map = new Map<ItemKind, ItemDef>()
for (const d of ITEM_CATALOG) map.set(d.kind, d)
for (const s of SHOP_CATALOG) if (!map.has(s.kind)) map.set(s.kind, s)
export const ALL_ITEM_DEFS = map

export function defFor(kind: ItemKind): ItemDef {
  return ALL_ITEM_DEFS.get(kind) ?? { kind, name: '?', emoji: '✦', hint: '', scale: 1 }
}
