# 🪐 어린왕자의 작은 소행성 (B-612)

> 오직 당신만을 위한 작은 별. 자유롭게 거닐며 꽃을 심고, AI로 그림을 그리고,
> 나만의 음악을 지으며 천천히 쉬어가는 **힐링 게임**입니다.

생텍쥐페리의 『어린왕자』에서 영감을 받은, 작지만 완벽한 행복을 담은 3D 힐링 게임.
외부 에셋·서버·계정 없이 **완전히 오프라인으로 동작**하며, 구글 플레이 출시를 목표로 만들었습니다.

---

## ✨ 무엇을 할 수 있나요

| 기능 | 설명 |
|------|------|
| 🚶 **작은 별 거닐기** | 둥근 소행성 표면을 조이스틱으로 자유롭게 산책. 캐릭터는 늘 발밑이 아래가 되도록 중력에 정렬됩니다. |
| 🌹 **행성 꾸미기** | 장미·바오바브·여우·양·가로등·벤치·우물·화산 등 13종을 표면 어디든 심고 배치. |
| 🛍️ **별빛 상점** | 별빛(코인)으로 고양이·파랑새·분수·작은 집·무지개 등 특별 아이템 구매. 매일 접속 선물 지급. |
| 🚀 **우주 배달부** | 상점에서 산 물건은 작은 배달 로켓이 우주에서 날아와 별에 내려놓아 줘요. |
| 🔨 **조형/빌드** | 블록(벽돌·기둥·지붕·창문 등)을 쌓아 집·다리·탑을 직접 짓는 건축 모드. |
| 🗺️ **별과 별 사이 여행** | 여러 행성(초원·사막·바다·눈·장미·밤 테마)을 만들고 워프로 오가요. |
| 🌟 **내 안의 어린왕자** | 성격(MBTI)을 나와 닮게 설정하고 내면과 대화하는 셀프 리플렉션. |
| 🎬 **선택형 수익화** | 광고 비행선·보상형 광고·코인팩(체험). 비침습적 설계 + 실 SDK 연결 토대. |
| 🎨 **AI 그림** | 떠오르는 풍경을 적으면 세상에 하나뿐인 생성형 그림이 태어나요. (수채화/별의 바다/바람의 결/장미 정원) |
| 🎵 **AI 작곡** | 버튼을 누를 때마다 즉흥 앰비언트 선율이 생성되어 행성의 BGM으로 흐릅니다. |
| 📖 **별의 일기** | 이 별에서의 마음을 조용히 기록. |
| 🌅 **하루의 흐름** | 새벽·낮·노을·별밤이 자동으로 순환하거나 직접 고를 수 있어요. |
| 💛 **행복도** | 별을 가꿀수록 차오르는 마음의 게이지. |

모든 데이터(심은 것, 그림, 음악, 일기)는 기기 `localStorage`에만 저장됩니다. 서버 전송 없음.

---

## 🛠 기술 스택

- **Vite + React 18 + TypeScript**
- **React Three Fiber / three.js** — 구면 위 이동·3인칭 카메라·절차적 장식 메쉬 (외부 3D 에셋 0)
- **Web Audio API** — 시드 기반 생성형 작곡 엔진 (`src/audio/composer.ts`)
- **Canvas 2D** — 생성형 그림 엔진 (`src/art/generativeArt.ts`)
- **vite-plugin-pwa** — 설치형 PWA + 오프라인 캐싱
- **Capacitor** — 구글 플레이용 안드로이드 패키징

## 📁 구조

```
src/
  game/      3D 로직 — Planet, Prince, Decorations, Scene, sphereMath, input
  audio/     생성형 작곡 엔진
  art/       생성형 그림 엔진
  ui/        HUD, 조이스틱, 패널(심기/그림/작곡/갤러리/일기/메뉴), 인트로
  store/     zustand 전역 상태 + localStorage 저장
scripts/
  gen-icons.mjs   의존성 없는 PWA 아이콘 생성기
```

---

> **저장소**: https://github.com/kandanhan/Little-Prince-Asteroid
> 이 게임은 `heung-a-smart` 모노레포의 `little-prince/` 폴더에서 개발되며, 위 독립 저장소로 발행됩니다.
> 발행/동기화: 부모 저장소 루트에서 `bash little-prince/publish.sh` (로컬 GitHub 인증 필요).

## 🚀 개발 & 실행

```bash
cd little-prince
npm install
npm run dev        # 개발 서버 (모바일은 같은 와이파이에서 표시되는 주소로 접속)
npm run build      # 타입체크 + 프로덕션 빌드 → dist/
npm run preview    # 빌드 결과 미리보기
```

PWA 아이콘 재생성: `node scripts/gen-icons.mjs`
스토어 마케팅 그래픽(SVG) 생성: `node scripts/gen-marketing.mjs` → `marketing/` (브라우저/디자인툴에서 PNG로 내보내기)

---

## 📱 구글 플레이 출시

- 출시 전체 과정: [`RELEASE_GUIDE.md`](./RELEASE_GUIDE.md)
- 광고/인앱결제 연결: [`MONETIZATION.md`](./MONETIZATION.md)

요약:

```bash
npm run build
npx cap add android      # 최초 1회 (Android Studio/SDK 필요)
npx cap sync android
npx cap open android     # Android Studio에서 서명된 AAB 빌드 → Play Console 업로드
```

---

## 🔌 실제 외부 AI 연결 (선택)

현재 그림·음악은 **기기 내 생성형 엔진**으로 100% 무료·오프라인 동작합니다.
실제 이미지 생성 API로 바꾸고 싶다면 `src/art/generativeArt.ts`의 `generate()` 시그니처를
그대로 유지한 채 내부만 교체하면 UI 변경 없이 연동됩니다. (API 키·비용·콘텐츠 정책 검토 필요)

---

“가장 중요한 것은 눈에 보이지 않아.” — 어린왕자
