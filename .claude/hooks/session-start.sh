#!/bin/bash
# SessionStart 훅 — EN_vocab / NoEnglish
# 어떤 환경/계정에서 세션을 열더라도 레포만 연결되면 바로 작업 가능하도록
# 필요한 의존성을 자동 설치한다. (idempotent — 여러 번 실행해도 안전)
set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

# 앱 본체(index.html + words.js + manifest.json)는 정적 파일이라 빌드 불필요.
# 설치가 필요한 것은 pipeline/(시드 데이터 빌드, wordpos 의존성)뿐이다.
PIPELINE_DIR="$PROJECT_DIR/pipeline"

if command -v npm >/dev/null 2>&1; then
  if [ -f "$PIPELINE_DIR/package.json" ]; then
    echo "[session-start] pipeline 의존성 설치 중..."
    # 캐시 활용을 위해 npm ci 대신 npm install 사용
    (cd "$PIPELINE_DIR" && npm install --no-audit --no-fund)
    echo "[session-start] pipeline 의존성 설치 완료."
  fi
else
  echo "[session-start] npm 을 찾을 수 없어 pipeline 설치를 건너뜁니다 (앱 본체는 정적이라 영향 없음)." >&2
fi

echo "[session-start] 준비 완료."
