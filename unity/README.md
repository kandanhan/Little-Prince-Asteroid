# 어린왕자의 작은 소행성 — Unity 이식 준비물 (staging)

이 폴더는 **Unity 재구축의 출발 자재**입니다. 웹 버전(이 레포)의 *검증된* 로직을 그대로
C#/SQL로 옮겨 두었으니, 집 Windows에서 Unity 프로젝트와 새 repo를 만든 뒤 **복사해 바로 출발**하면 됩니다.

> 이 자재가 왜 웹 레포 안에 있나요?
> 이 작업이 진행된 원격(클라우드) 세션은 **리눅스 컨테이너 + 웹 레포 + 회사 Supabase**에만 연결돼 있어서
> ① Unity 에디터(GUI) 작업, ② 개인 Supabase 프로젝트 생성, ③ 개인 계정의 새 repo 생성을 **직접 할 수 없었습니다.**
> 그래서 "코드·설정·SQL"만 만들어 개인 레포(`kandanhan/Little-Prince-Asteroid`)에 staging 해 둡니다.

---

## ⚠️ 계정 라우팅 (반드시)
- **전부 개인 계정(kandanhan)**: GitHub·Vercel·Supabase 모두 개인.
- `supabase/schema.sql` 은 **개인 Supabase 프로젝트에서만** 실행. 회사("Heung-A Portal System")에 절대 실행 금지.
- service key 는 **절대 커밋 금지**. 클라이언트는 anon(publishable) key 만 사용.

---

## 들어 있는 것
```
unity/
├─ .gitignore              ← 새 Unity repo 루트로 복사
├─ .gitattributes          ← 새 Unity repo 루트로 복사 (Git LFS)
├─ Assets/Scripts/
│  ├─ SphereMath.cs            구 표면 좌표/자세 수학 (sphereMath.ts 이식)
│  ├─ PlanetWalker.cs          중력 정렬 보행 컨트롤러 (Prince.tsx 이식)
│  ├─ ThirdPersonPlanetCamera.cs  3인칭 추적 카메라 (Prince.tsx 이식)
│  ├─ SurfacePlacer.cs         탭→표면 레이캐스트→위경도 배치 (Planet.tsx 이식)
│  ├─ GameData.cs              데이터 모델 DTO (useGame.ts ↔ Supabase 테이블)
│  └─ PlanetItemCatalog.cs     장식 13종·테마 6종·블록 6종 카탈로그 (items/planets.ts)
└─ supabase/schema.sql     7개 테이블 + RLS + 'paintings' 버킷
```

---

## Phase 0 — 프로젝트 · repo · LFS (집 Windows에서)
1. **Unity Hub** 설치 → **Unity 6 LTS** 설치 시 **Android Build Support**(+ OpenJDK, NDK, SDK) 체크.
2. New project → **Universal 3D (URP)** 템플릿 → 이름 `Little-Prince-Unity`.
3. 개인 GitHub(kandanhan)에 빈 repo **`Little-Prince-Unity`** 생성.
4. 프로젝트 폴더에서:
   ```bash
   git init
   # 이 폴더의 .gitignore / .gitattributes 를 프로젝트 루트로 복사한 뒤:
   git lfs install
   git add .gitignore .gitattributes
   git commit -m "chore: unity .gitignore + git lfs"
   git branch -M main
   git remote add origin https://github.com/kandanhan/Little-Prince-Unity.git
   git push -u origin main
   ```
5. `Assets/Scripts/` 의 `.cs` 6개를 Unity 프로젝트 `Assets/Scripts/` 로 복사.

## Phase 1 — 구형 행성 보행 + 3인칭 카메라 (씬 세팅)
1. **행성**: Hierarchy → 3D Object → **Sphere**. Transform position (0,0,0), **scale (6,6,6)**
   (스크립트의 `PlanetRadius = 3` 과 지름이 맞음). 이미 `SphereCollider` 포함.
   - 새 레이어 `Planet` 만들어 이 구에 지정(배치 레이캐스트용).
2. **어린왕자**: 빈 GameObject `Prince` 생성 → `PlanetWalker.cs` 부착.
   - 임시 모델로 자식에 Capsule 하나(위치 0,0.5,0 정도). **모델 +Z 가 전방, +Y 가 위**가 되도록.
3. **카메라**: Main Camera 에 `ThirdPersonPlanetCamera.cs` 부착 → `target` 에 `Prince` 드래그.
4. ▶ Play → 키보드(WASD/화살표)로 표면을 걸어보기.
   - 앞뒤가 반대면 `PlanetWalker.invertWalk`, 좌우가 반대면 `invertTurn` 체크(코드 수정 불필요).
   - 모바일 조이스틱 UI는 매 프레임 `walker.MoveInput` / `walker.TurnInput` 에 -1..1 을 넣으면 됨.
5. **배치 테스트**: 빈 GameObject 에 `SurfacePlacer.cs` 부착 → `planetMask` = Planet 레이어,
   `prefab` 에 장식 프리팹(없으면 Cube), `parent` = 행성. Play 중 표면 클릭 시 그 자리에 생성.

## Supabase (개인 계정에서)
1. 개인 Supabase 프로젝트 생성(서울 리전 권장).
2. Dashboard → **SQL Editor** → `supabase/schema.sql` 붙여넣고 **Run**.
3. Dashboard → **Authentication** → Email + Google 공급자 켜기.
4. Storage 에 `paintings` 버킷이 생성됐는지 확인(스크립트가 만들지만 비공개·RLS 적용됨).
5. Unity 연동: `supabase-csharp` 또는 REST + anon key. (Project Settings → API 에서 URL/anon key 복사)

---

## 다음 단계 (요약)
- **Phase 2**: 배치/조형 → Supabase 클라우드 세이브(로드 시 `SurfacePlacer.PlaceAt` 로 재현).
- **Phase 3**: 스타일라이즈 에셋(Synty/Kenney 또는 Meshy/Rodin AI) + 베이크드 라이팅 + URP 후처리(Bloom/AO/Vignette).
- **Phase 4**: 상점·빌드·내면대화(MBTI)·별지도 여행 이식.
- **Phase 5**: Android **AAB** 빌드 → Google Play(최초 등록 $25).

## 검증된 핵심 수치 (웹에서 그대로 가져옴)
| 항목 | 값 |
|---|---|
| 행성 반지름 | 3 (Sphere scale 6) |
| 걷기 / 회전 속도 | 0.9 / 1.8 rad·s⁻¹ |
| 카메라 거리 / 높이 / 시선높이 | 4.2 / 2.6 / 0.6 |
| 새 행성 비용 / 보상광고 코인 | 200 / 15 |
| 시작 코인 | 60 |
| 스타일 슬라이더 기본값 | 0.35 (0=만화 · 1=사실) |
