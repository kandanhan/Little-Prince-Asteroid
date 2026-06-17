# CLAUDE.md

이 프로젝트는 개인 계정(kandanhan) 전용. 커밋/배포는 개인 GitHub·Vercel로.

## 계정 라우팅 (필수)
- **전부 개인 계정(kandanhan)**: GitHub · Vercel · Supabase 모두 개인.
- 회사 계정(kimdh@heung-a.co.kr / Heung-A)은 흥아 업무용. 어린왕자 코드·데이터는 절대 회사로 보내지 않는다.
- AI 작업은 회사(유료) Claude로 할 수 있어도, **코드 push·인프라(Supabase/Vercel)는 개인 계정으로**.
- ⚠️ 주의: 일부 원격/클라우드 세션은 **회사 Supabase("Heung-A Portal System")에만 연결**돼 있을 수 있다.
  Supabase 생성·마이그레이션 전 반드시 연결 계정을 확인하고, 개인 프로젝트가 아니면 실행하지 말 것.
- service key 등 비밀키는 절대 커밋 금지(클라이언트는 anon/publishable key만).

## Unity 재구축
- 이 웹 버전(Vite+React+R3F)은 **검증된 설계 레퍼런스**로 보존. 최종 목표는 Unity(6 LTS + URP)로 재구축 후 Google Play 출시.
- Unity 이식 자재(중력보행·3인칭카메라·표면배치 C# + Supabase 스키마 + .gitignore/LFS)는 **`unity/` 폴더** 참고.
  → 새 개인 repo `kandanhan/Little-Prince-Unity` 로 옮겨 진행. 자세한 절차는 `unity/README.md`.
