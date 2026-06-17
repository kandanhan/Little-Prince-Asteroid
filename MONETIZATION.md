# 💛 수익화 가이드 — 광고 & 인앱결제

이 게임에는 **수익화 토대**가 이미 들어 있습니다. 현재는 전부 *시뮬레이션(체험)* 이며,
출시 시 실제 SDK만 끼우면 동작하도록 어댑터 구조로 설계했습니다.

## 현재 구현된 것 (체험 모드)

| 요소 | 위치 | 동작 |
|------|------|------|
| 광고 비행선 (디제틱 광고) | `src/game/AdBlimp.tsx` | 별 위를 도는 비행선을 탭 → 보상형 광고 |
| 보상형 광고 플레이어 | `src/ui/AdOverlay.tsx` | 5초 카운트 후 별빛 +15 (체험) |
| "광고 보고 별빛 받기" | `src/ui/Shop.tsx` | 상점 내 보상형 광고 버튼 |
| 인앱결제 코인팩/광고제거 | `src/ui/Shop.tsx` + `src/monetization/ads.ts` | 코인 충전·광고 제거 (체험) |
| 어댑터 인터페이스 | `src/monetization/ads.ts` | 실제 SDK 연결 지점 |

## ⚠️ 꼭 알아야 할 정책 / 법적 사항

- **실제 브랜드 제품(예: 특정 음료)을 상점에 직접 넣어 팔 수 없습니다.** 상표권·라이선스 문제.
  브랜드 노출은 **광고 네트워크(AdMob 등)가 자동으로 송출**하는 형태여야 합니다.
  진짜 브랜드 상품을 두려면 해당 브랜드와의 **제휴/광고 계약**이 별도로 필요합니다.
- **Google Play 정책**: 보상형 광고는 사용자가 *명시적으로 선택*해야 합니다(강제 X).
  힐링 게임은 **비침습적·선택형 광고**만 두는 것이 사용자 경험과 정책 모두에 유리합니다.
- 어린이 대상이면 *가족 정책(Families Policy)* 과 광고 SDK의 아동 설정을 반드시 확인하세요.

## 실제 AdMob 보상형 광고 연결

1. 플러그인 설치:
   ```bash
   npm i @capacitor-community/admob
   npx cap sync android
   ```
2. AdMob에서 앱 등록 → **보상형 광고 단위 ID** 발급, `AndroidManifest.xml`에 App ID 추가.
3. 어댑터를 만들어 끼웁니다 (앱 시작 시 1회):
   ```ts
   import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob'
   import { setAdapters } from './monetization/ads'

   await AdMob.initialize()
   setAdapters({
     rewarded: {
       isReady: () => true,
       show: async () => {
         await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-xxx/yyy' })
         return new Promise((resolve) => {
           AdMob.addListener(RewardAdPluginEvents.Rewarded, () => resolve(true))
           AdMob.addListener(RewardAdPluginEvents.Dismissed, () => resolve(false))
           AdMob.showRewardVideoAd()
         })
       },
     },
   })
   ```
   `showRewardedAd()`가 실제 광고를 띄우고, 보상 시 `finishRewardedAd(true)`로 코인이 지급됩니다.
   (실 SDK 연결 시 `AdOverlay` 시뮬레이션은 표시되지 않도록 `isRealAdsConnected()`로 분기하세요.)

## 실제 인앱결제(IAP) 연결

1. 플러그인 예: `@capacitor-community/in-app-purchases` 또는 RevenueCat.
2. Play Console에서 상품 ID 등록 (`src/monetization/ads.ts`의 `IAP_PRODUCTS.id`와 일치시킬 것).
3. `setAdapters({ iap: { purchase, restore } })` 로 실제 결제/복원 로직 연결.
4. `remove_ads` 구매 시 `setRemoveAds(true)` → 광고 비행선 사라짐.

## 권장 수익 모델 (힐링 게임 기준)

1. **보상형 광고(선택형)** — "광고 보고 별빛 받기", 비행선 탭. 비침습적이라 이탈 적음.
2. **소액 IAP** — 별빛 코인팩, 계절 테마 팩(겨울 별/벚꽃 별), 희귀 장식.
3. **광고 제거 1회 결제** — 광고 비행선 제거(보상형은 선택지로 유지).
4. (선택) **시즌 패스 / 후원** — "이 별을 응원하기" 형태의 가벼운 후원.

> 핵심: 강제 전면광고·자동재생을 피하고, 사용자가 *원할 때만* 광고를 보게 하세요.
> 힐링이라는 정체성을 지키는 것이 장기 리텐션과 평점에 가장 이득입니다.
