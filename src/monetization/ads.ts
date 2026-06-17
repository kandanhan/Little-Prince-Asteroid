// 수익화 토대 (광고 + 인앱결제).
// 현재는 전부 "시뮬레이션"이며, 실제 SDK는 아래 어댑터 인터페이스에 맞춰 끼우면 된다.
//
// ⚠️ 중요 / 정책 메모
// - 실제 보상형 광고는 Google AdMob(@capacitor-community/admob) 같은 광고 네트워크가 필요하다.
//   브랜드 광고(예: 음료 회사)는 "광고 네트워크가 자동 송출"한다 — 게임에 하드코딩하면 안 된다.
// - 특정 실제 브랜드 제품을 상점에 직접 넣어 팔려면 해당 브랜드와의 라이선스/제휴 계약이 필요하다.
// - Google Play 정책: 보상형 광고는 사용자가 명시적으로 선택해야 하고, 힐링 게임은
//   비침습적(선택형) 광고만 두는 것이 사용자 경험·정책 모두에 유리하다.

export interface RewardedAdAdapter {
  isReady(): boolean
  /** 광고를 보여주고, 끝까지 봤으면 true 반환 */
  show(): Promise<boolean>
}

export interface IapAdapter {
  /** 상품 구매. 성공 시 true */
  purchase(productId: string): Promise<boolean>
  restore(): Promise<string[]>   // 복원된 productId 목록
}

// IAP 상품 카탈로그 (실제 가격/ID는 Play Console에서 등록 후 매칭)
export interface IapProduct {
  id: string
  name: string
  desc: string
  emoji: string
  coins?: number       // 코인 팩일 경우 지급량
  removesAds?: boolean
  priceLabel: string   // 표시용 (실결제 시 스토어가 현지 통화로 대체)
}

export const IAP_PRODUCTS: IapProduct[] = [
  { id: 'coins_small',  name: '별빛 한 줌',   desc: '별빛 120',          emoji: '🪙', coins: 120,  priceLabel: '₩1,500' },
  { id: 'coins_medium', name: '별빛 한 주머니', desc: '별빛 400 (+보너스)', emoji: '💰', coins: 400,  priceLabel: '₩4,500' },
  { id: 'coins_large',  name: '별빛 한 자루',  desc: '별빛 1,000 (+보너스)', emoji: '🌟', coins: 1000, priceLabel: '₩9,900' },
  { id: 'remove_ads',   name: '광고 비행선 멈추기', desc: '광고 영구 제거 (보상형은 유지)', emoji: '🚫', removesAds: true, priceLabel: '₩3,300' },
]

// ----- 시뮬레이션 어댑터 (기본값) -----
// 실제 연결 시 setAdapters()로 교체.
let rewardedAdapter: RewardedAdAdapter | null = null
let iapAdapter: IapAdapter | null = null

export function setAdapters(opts: { rewarded?: RewardedAdAdapter; iap?: IapAdapter }) {
  if (opts.rewarded) rewardedAdapter = opts.rewarded
  if (opts.iap) iapAdapter = opts.iap
}

export function isRealAdsConnected() {
  return rewardedAdapter !== null
}

/** 보상형 광고 노출. 실제 어댑터가 없으면 호출 측(UI)이 시뮬레이션 오버레이를 띄운다. */
export async function showRewardedAd(): Promise<boolean> {
  if (rewardedAdapter && rewardedAdapter.isReady()) {
    return rewardedAdapter.show()
  }
  return false // UI 시뮬레이션 경로 사용
}

export async function purchaseProduct(productId: string): Promise<boolean> {
  if (iapAdapter) return iapAdapter.purchase(productId)
  // 시뮬레이션: 항상 성공 처리 (체험용)
  return true
}
