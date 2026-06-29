# 내부명 정리 체크리스트 (Orblet) — 실행은 🙋 당신 (선택·저위험)

> 사용자 노출·스토어·공개 문서는 이미 Orblet로 정리됨. 아래는 **내부 식별자**(repo명·DB 스키마·코드 심볼) 정리 — 비공개라 법적 위험은 낮으니 **급하지 않음**. 브랜드 일관성을 원할 때 진행.

## 1) GitHub 레포 (🙋)
- **웹 프로토타입** `kandanhan/Little-Prince-Asteroid`: 비공개 설계 레퍼런스로 유지 권장. 공개 배포 시에만 Orblet 표기(이미 README/메타 반영됨). 원하면 Settings→Rename → `Orblet-web` (URL 자동 리다이렉트되나 package.json `homepage`/`repository`/`bugs` URL은 수동 갱신).
- **Unity 신규 레포**: `kandanhan/Orblet-Unity` 로 생성(ROADMAP P0). `unity/` 자재 복사.

## 2) Supabase 스키마 `little_prince` → `orblet` (🙋, 개인 프로젝트 확인 후에만)
> ⚠️ 원격 세션이 회사 프로젝트에 연결됐을 수 있음 — **개인 `kandanhan_creative` 연결을 SQL로 먼저 확인**한 뒤 실행(CLAUDE.md 규칙). 운영 데이터가 없을 때(=지금) 하면 안전.

```sql
-- 개인 Supabase SQL Editor 에서:
alter schema little_prince rename to orblet;

-- 노출/권한 재확인 (스키마명만 바뀌면 객체·정책·RLS는 따라옴)
grant usage on schema orblet to anon, authenticated, service_role;
grant all on all tables    in schema orblet to anon, authenticated, service_role;
grant all on all routines  in schema orblet to anon, authenticated, service_role;
grant all on all sequences in schema orblet to anon, authenticated, service_role;
```
그 후:
- Settings → API → **Exposed schemas** 에서 `little_prince` 제거하고 `orblet` 추가.
- 클라이언트 `SupabaseConfig.schema` 값을 `little_prince` → `orblet` 로 변경.
- Storage 버킷 `lp-paintings` 는 그대로 둬도 무방(원하면 `orblet-paintings` 신설 후 정책 복제).

## 3) 코드 심볼 (선택, 낮은 우선순위)
- C#: `GameData.cs`/Cloud 의 주석 중 `little_prince` 표기 → `orblet`(주석만).
- 웹 프로토타입: `Prince.tsx`/`princeName`/`princeReply`/`princeDir` 등 **내부 식별자**는 유지 가능(렌더 텍스트 아님). 공개 데모를 정식 배포할 계획이면 `PrinceModel`의 **금발+초록코트+목도리 비주얼만** 별지기/별솜이 룩으로 리스킨 권장(코드 식별자는 그대로 둬도 됨).

## 4) 패키지/앱 ID (이미 반영됨)
- `capacitor.config.ts` appId = `com.kandanhan.orblet` ✅ / Unity 패키지명도 동일하게.

— 위 1·2만 해두면 브랜드 일관성은 충분. 3은 여유 있을 때.
