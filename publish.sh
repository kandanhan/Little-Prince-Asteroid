#!/usr/bin/env bash
# 어린왕자의 작은 소행성(little-prince/)을 별도 저장소로 발행/동기화한다.
#   대상: https://github.com/kandanhan/Little-Prince-Asteroid  (브랜치 main)
#
# 실행 위치: 부모 저장소(heung-a-smart) 루트.
# 사전 조건: 로컬에 GitHub 인증(https 토큰 또는 ssh)이 되어 있어야 함.
#   (이 클라우드 세션에는 github.com 자격증명이 없어 여기서는 푸시할 수 없습니다.)
set -euo pipefail

REMOTE="${REMOTE:-https://github.com/kandanhan/Little-Prince-Asteroid.git}"
BRANCH="${BRANCH:-main}"
PREFIX="little-prince"

echo "▶ '$PREFIX' 폴더 히스토리를 추출하는 중…"
git branch -D little-prince-export 2>/dev/null || true
git subtree split --prefix="$PREFIX" -b little-prince-export

echo "▶ $REMOTE ($BRANCH) 으로 푸시…"
# 최초 발행은 일반 푸시, 이후 재발행 시 충돌하면 FORCE=1 로 강제 푸시
if [ "${FORCE:-0}" = "1" ]; then
  git push --force "$REMOTE" little-prince-export:"$BRANCH"
else
  git push "$REMOTE" little-prince-export:"$BRANCH"
fi

git branch -D little-prince-export
echo "✅ 발행 완료: $REMOTE ($BRANCH)"
