# 📱 구글 플레이 출시 가이드 — Orblet : 별마실

이 문서는 웹 빌드를 **Capacitor로 안드로이드 앱(AAB)** 으로 만들어 구글 플레이 콘솔에 올리는 전체 과정을 다룹니다.

---

## 0. 준비물 (로컬 PC)

- **Node.js 18+**
- **Android Studio** (최신) + Android SDK (API 34 이상)
- **JDK 17** (Android Studio에 포함된 것 사용 가능)
- **구글 플레이 개발자 계정** (1회 등록비 $25)

> ⚠️ 안드로이드 빌드는 이 클라우드 환경이 아니라 **로컬 PC(또는 macOS)** 에서 진행해야 합니다.
> 이 저장소에는 출시에 필요한 웹 빌드·설정·아이콘이 모두 준비되어 있습니다.

---

## 1. 안드로이드 프로젝트 생성 (최초 1회)

```bash
cd little-prince
npm install
npm run build            # dist/ 생성
npx cap add android      # android/ 네이티브 프로젝트 생성
npx cap sync android
```

## 2. 앱 아이콘 / 스플래시

- 앱 아이콘 원본: `public/icons/icon-512.png` (마스커블: `icon-512-maskable.png`)
- Android Studio에서 `Image Asset` 마법사로 적용하거나
  [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets) 사용:
  ```bash
  npm i -D @capacitor/assets
  npx capacitor-assets generate --android
  ```

## 3. 앱 정보 설정

- `capacitor.config.ts`
  - `appId`: `com.b612.littleprince` → **본인 도메인 기반 고유 ID로 변경 권장**
  - `appName`: 표시 이름
- 버전: `android/app/build.gradle` 의 `versionCode`(정수, 업로드마다 +1), `versionName`(예: `1.0.0`)

## 4. 서명 키 생성 (최초 1회)

```bash
keytool -genkey -v -keystore b612-release.keystore \
  -alias b612 -keyalg RSA -keysize 2048 -validity 10000
```
- 생성된 `.keystore` 파일과 비밀번호는 **절대 분실 금지** (업데이트 시 동일 키 필요).
- `android/app` 에 두고 `android/key.properties` (gitignore) 에 경로/비밀번호 기재 후
  `build.gradle` 의 `signingConfigs`에 연결. (Android 공식 문서 참고)

## 5. 릴리스 AAB 빌드

Android Studio에서:
1. `Build > Generate Signed Bundle / APK > Android App Bundle`
2. 위에서 만든 keystore 선택
3. `release` 빌드 → `app-release.aab` 생성

또는 CLI:
```bash
cd android
./gradlew bundleRelease
# 결과: android/app/build/outputs/bundle/release/app-release.aab
```

## 6. 구글 플레이 콘솔 업로드

1. [Play Console](https://play.google.com/console) → **앱 만들기**
2. 스토어 등록정보 작성:
   - 앱 이름, 짧은 설명, 자세한 설명 (아래 `스토어 문구` 참고)
   - 그래픽: 아이콘(512), 피처 그래픽(1024×500), 스크린샷(폰 2장 이상)
3. **앱 콘텐츠**: 개인정보처리방침 URL, 광고 여부(없음), 콘텐츠 등급 설문(전체 이용가),
   타겟층, 데이터 보안 양식(→ "데이터 수집 안 함" 으로 정직하게 작성 가능: 모든 데이터는 기기 내 저장)
4. **프로덕션 트랙** 또는 먼저 **비공개 테스트 트랙** 에 `.aab` 업로드
5. 검토 제출 → 보통 며칠 내 승인

---

## 📝 스토어 문구 (초안)

**짧은 설명 (80자)**
> 별에서 별로 마실 다니며 꽃을 심고, 그림을 그리고, 음악을 짓는 힐링 게임.

**자세한 설명**
> 🪐 별에서 별로, 마실 다니듯 가꾸는 나의 작은 별.
>
> 작은 별을 천천히 가꾸는 코지 힐링 게임입니다.
> 둥근 소행성 위를 자유롭게 거닐며, 장미와 여우와 가로등으로 별을 꾸미고,
> 마음에 떠오르는 풍경으로 세상에 하나뿐인 그림을 그리고,
> 버튼 하나로 즉흥 앰비언트 음악을 지어 나만의 BGM으로 흐르게 하세요.
>
> ✦ 인터넷 없이 즐기는 완전한 오프라인 플레이
> ✦ 광고 없음 · 결제 없음 · 데이터 수집 없음 (모든 기록은 내 기기에만)
> ✦ 새벽, 낮, 노을, 별밤이 천천히 흐르는 작은 우주
>
> 작지만 완벽한 행복과 쉼을 선물합니다.

**카테고리**: 시뮬레이션 / 캐주얼  ·  **콘텐츠 등급**: 전체 이용가

---

## ⚖️ 출시 전 체크리스트

- [ ] `appId`를 본인 고유값으로 변경했는가
- [ ] 서명 keystore를 안전하게 백업했는가
- [ ] 개인정보처리방침 페이지를 준비했는가 (데이터 미수집이라도 URL 필요)
- [ ] 폰 스크린샷 2장 이상, 피처 그래픽(1024×500) 준비
- [ ] `versionCode`를 업로드마다 증가시켰는가
- [ ] 실제 기기에서 `npx cap run android` 로 동작 확인

> 향후 업데이트: 코드 수정 → `npm run build` → `npx cap sync android` → 버전 올리고 재빌드 → 업로드.
