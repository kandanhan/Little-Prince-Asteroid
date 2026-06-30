# Orblet 개발 환경 · 동기화 (집 ↔ 회사, USB 백업)

> 작업은 **로컬 디스크**에서, 동기화는 **개인 GitHub**로, USB는 **백업·이동·비밀키 보관**용.
> 전부 **개인 계정(kandanhan)**. 회사 PC엔 개인 프로젝트 흔적을 최소화(개인 GitHub로만 push).

## 원칙
- 작업 폴더 = 로컬 디스크 (예: `C:\dev\Orblet`). **플래시 USB에서 Unity 직접 실행 ❌**(느림·손상 위험).
- 집 ↔ 회사 동기화 = **GitHub pull/push** (USB 없이도 됨).
- USB(F:) = ① git bundle 백업 ② keystore/secret 오프라인 보관.

## 레포
- 웹 프로토타입(레퍼런스): `kandanhan/Little-Prince-Asteroid`
- Unity 신규(제품): `kandanhan/Orblet-Unity` (ROADMAP P0에서 생성)
- 현재 Orblet 작업 브랜치: `claude/ecstatic-brahmagupta-c173cc` (정리되면 `main` 병합)

## 1) 기기마다 최초 1회 (개인 GitHub 로그인 상태에서)
```bash
mkdir C:\dev 2>nul
cd /d C:\dev
git clone https://github.com/kandanhan/Little-Prince-Asteroid.git Orblet
cd Orblet
git config user.name  "kandanhan"
git config user.email "<개인-이메일>"        # ⚠️ 회사 이메일 금지 (이 repo 한정 로컬 설정)
git checkout claude/ecstatic-brahmagupta-c173cc
npm install                                   # 웹 프로토타입 의존성 (Unity repo면 생략)
```

## 2) 매일 작업 흐름 (어디서나 동일)
```bash
git pull            # 시작 전 항상 최신화
# ...작업...
git add -A
git commit -m "작업 내용"
git push            # 끝나면 항상 push  (= 동기화 + 1차 백업)
```
> 집에서 `push` → 회사에서 `pull` → 이어서 작업. **USB 불필요.**

## 3) USB(F:) 백업 — `git bundle` (히스토리 통째, 단일 파일)
작업 폴더를 통째로 복사하지 말 것(Library/node_modules가 거대·불필요).
```bash
git bundle create F:\backup\orblet-YYYY-MM-DD.bundle --all
# 복원(아무 PC):  git clone F:\backup\orblet-YYYY-MM-DD.bundle Orblet
```

## 4) USB = 비밀키 오프라인 보관 (git에 절대 금지)
- Android **upload keystore**(.jks/.keystore) + 비밀번호 → **분실 시 앱 업데이트 영구 불가**, 반드시 2곳 이상.
- Supabase **service key** 등. (클라이언트·git엔 anon/publishable 키만)
- 7-Zip **AES-256** 암호화 압축 후 USB + 다른 1곳(암호관리자/개인 클라우드)에 이중 보관.

## 5) Unity repo도 동일
`Orblet-Unity` 생성 후 같은 방식(clone → pull/push). `.gitignore`가 `Library/`·`Temp/`를 제외하므로 GitHub/USB엔 **소스만** 올라감.

## 주의
- 로컬 작업이 원칙. 작업 중 USB를 뽑지 말 것(USB에서 직접 작업했다면 손상 가능).
- 회사 PC: 이 repo의 git 사용자/인증을 **개인 계정**으로. Supabase·Vercel도 개인 로그인만.
- Supabase는 클라우드라 저장 위치(로컬/USB)와 무관. 연결 문제는 별도로 진단(키·Exposed schemas·프로젝트 pause 등).
