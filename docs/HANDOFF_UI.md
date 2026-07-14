# UI 핸드오프 — 사용자 확정 레이아웃·기능 결정 목록

> 마지막 갱신: 2026-07-14 (v0.12.1 기준)
> **용도**: 디자인 리스킨/대량 수정 후 이 목록과 대조해 기능·레이아웃 결정이 롤백되지 않았는지 확인한다.
> 색상·타이포 토큰은 디자이너 영역이라 여기 없음 — 아래는 전부 **사용자가 명시적으로 요청·확정한 동작/레이아웃**이며, 임의로 되돌리면 안 된다(CLAUDE.md 작업 원칙).
> 각 항목의 `앵커`는 index.html의 CSS 클래스/컴포넌트명 — 리스킨 후 grep으로 생존 확인 가능.

## 전역

| # | 결정 | 앵커 |
|---|---|---|
| G1 | 이모지 절대 금지(✓ ✕ → › 같은 기능 글리프만 예외) | — |
| G2 | 설정 시트 하단에 `APP_VERSION · APP_BUILD` 표기, head의 `?v=` 캐시 태그 3곳(manifest/words.js 등)과 항상 동시 갱신 | `APP_VERSION` |
| G3 | 안내 문구는 핵심을 볼드(`**중요**` → `renderBold`가 `<b>`로) | `renderBold` |
| G4 | **키보드가 하단 컨트롤(힌트·확인 버튼)을 가리지 않음** — visualViewport로 키보드 높이를 `--kb` CSS 변수로 갱신, `.content` 바닥 패딩이 그만큼 확장 (v0.12.1) ※ iOS 실기기 검증 필요 | `--kb`, `.content` padding calc |
| G5 | 정답 효과음: 단어 고정=짧은 블립, 문장 완성=띠링 2음 — Web Audio 사인톤(에셋 없음) | `playDing` |
| G6 | 굴절형→표제어 역추적: 불규칙 맵(children→child, geese→goose, went→go 등)+접미사 규칙(s/es/ies/ves/ses/ing/ed/er/est/ly). 후보가 실제 사전에 있을 때만 채택 | `dictLookup`, `DICT_IRREGULAR` |

## 사전 탭

| # | 결정 | 앵커 |
|---|---|---|
| D1 | 카테고리별 보기: 진입 시 목록을 쏟아내지 않음 — **선택 화면 먼저**(CEFR 레벨 카드 6개 그리드 / 어근 행 목록), 선택한 것만 목록 | `.lv-card`, `.rootrow`, `catSel` |
| D2 | 긴 목록은 100개 단위 분할 렌더 + "더 보기" 버튼(전체 렌더 시 프리즈) | `WList`, `LIST_CHUNK`, `.more-btn` |
| D3 | 목록에서 뒤로가기 = 허브가 아니라 **선택 화면으로 먼저** 복귀 | `listhead .back` 분기 |
| D4 | 굴절형 검색 폴백: children/geese/ran 검색 → `"OO"은(는) XX의 변화형이에요` 안내 + 표제어 행. 검색어 자체가 표제어면(예: running=달리기) 안내 없음 | `lemmaHit` |

## 학습카드 (CardSession)

| # | 결정 | 앵커 |
|---|---|---|
| C1 | 빈칸 = 회색 솔리드 + 살짝 라운드(8px), **문장 글자 크기 그대로**(inherit), 네이티브 캐럿 깜빡임. 포커스 링 없음(배경 반 단계 톤만) | `.qbox`, `caret-color` |
| C2 | 글자수 힌트 셀: 작은 회색 솔리드(26×36), **다음 입력 칸에 캐럿 깜빡임**, 입력된 칸은 옅은 강조 톤 | `.cell`, `.cell.cur::after`, `caretblink` |
| C3 | 힌트 버튼 줄(글자수/첫 글자)은 **카드 아래·확인 버튼 바로 위** | `.qhintrow` 위치 |

## 듣기 세션 (DictationSession)

| # | 결정 | 앵커 |
|---|---|---|
| L1 | **학습 형식** — 완전정답까지 재시도(퀴즈처럼 오답이어도 넘어가는 방식 아님). 오답 시 정답 비공개, 틀린 칸 색만 표시 | `complete`, `check`, `wrongMask` |
| L2 | 빈칸 = 정답 글자 수 기준 **고정폭 통짜 블록**(자모 분할 없음, 입력해도 폭 안 늘어남) | `.dict-box`, `size={t.core.length}` |
| L3 | 단어를 맞게 타이핑하는 **즉시 그 칸이 고정 텍스트로 전환**(팝 모션+블립) + 다음 미고정 칸 자동 포커스 | `.dict-fixed`, `onTypeWord` |
| L4 | 마지막 단어까지 고정되면 **확인 버튼 없이 자동 정답 처리**(띠링 2음) | `complete(!hadWrongAttempt)` |
| L5 | 확인 버튼 = 막혔을 때 틀린 칸 표시 용도만(누르면 오답 사용 기록 → SRS 첫시도 판정) | `check()` |
| L6 | 음절보기 힌트 = 자모 셀이 아니라 **단어 아래 얇은 막대 몇 개**(음절 수 추정, 대략 길이감만) | `.syl-row`, `syllableChunks` |
| L7 | 힌트 = 다시듣기/음절보기 2개, 위치는 학습카드와 동일(카드 아래·확인 위) | `.qhintrow` |
| L8 | 다시듣기 패널티: 매회 다음 문제를 **듣기 난이도 기준** 다운그레이드, 3회째 강제 재학습(오답 처리+세션 끝 재배치) | `downgradeNext`, `forceRelearn` |
| L9 | 듣기 난이도 뱃지: **A1~C2+ 12단계**(어휘 CEFR과 별개 — 연음 지점 수·문장 길이 반영), 카드 상단 | `listeningDifficulty`, `.tag.dl1~3` |
| L10 | 정답 화면: 단어 탭 → 사전 상세(굴절형 역추적 포함), **단어별 재생 버튼 없음**(문장 단위 다시듣기만), 연음 해설은 그 문장의 실제 연음 지점(예: with others)만 — 뻔한 gonna/gimme 사전 목록 아님 | `.dict-rword`, `findLiaisonNotes` |

## 레벨 테스트

| # | 결정 | 앵커 |
|---|---|---|
| T1 | 진입점 2곳: 학습 탭 메뉴 + **설정 시트**("다시하기" + 지난 결과 부제). 상태는 App 레벨 공유 | `onStartLevelTest`, `ltOpen` |
| T2 | know↔meaning 전환 시 **카드 크기·폰트 고정**(min-height 150px, 단어 24px 동일) | `.lt-qcard`, `.lt-word` |
| T3 | 뜻 4지선다 오답은 **같은 품사**(품사 섞이면 소거법으로 너무 쉬움) | `ltPos`, `posPool` |
| T4 | **한 단계 뒤로가기**(진행바 옆 chevron) — 실수 응답을 같은 문항으로 복원(엔진 스냅샷 undo). 첫 문항 비활성 | `t.undo()`, `canUndo` |
| T5 | 산출(타이핑) 문항에 **모름 버튼**(빈 답 오답 처리) | produce `.ghost` |
| T6 | Part B 적응형 출제: A2 시작, 오탭 1개 이하 완성 → 한 단계 위 문장(고정 순서 금지) | `createLevelTestB` |
| T7 | Part B 칩: 탭해도 **자리 유지**(흐림 처리만 — 남은 칩이 당겨지면 오탭 유발) + **실행취소** 버튼 | `.lchip.picked`, `undoPick` |
| T8 | 오탭 칩은 잠깐 빨갛게 흔들림(errors만 증가, 답에 안 들어감) | `.lchip.wrong`, `lt-shake` |
| T9 | 결과: 어휘력/문장구사력 **분리 표시**(합산 금지) + **"추정치" 라벨 필수** + 분포 곡선 + "나" 마커(극단 백분위 클램프) | `LtDistCurve`, `.lt-note` |
| T10 | 구사력 부분측정 각주("어순 배열만으로 부분 측정"), 격차 문구는 방향 구분(어휘>구사=산출 조언 / 반대=어휘 조언) | `gapNote` |

## 리스킨 시 검증 방법

1. `node build.js`(검증 하네스) → Playwright로 위 앵커 렌더 확인 — 세션 스크립트: `run_fix.js`(듣기 고정·효과음·사전연결·설정 진입), `run_fix2.js`(카드 고정·undo·모름·칩 자리·실행취소), `run_lt.js`(레벨테스트 전체 플로우), `run5/6.js`(딕테이션 완전정답 게이트).
2. 빠른 grep 생존 체크: `dict-fixed` `playDing` `dictLookup` `canUndo` `lt-qcard` `picked` `syl-row` `listeningDifficulty` `LIST_CHUNK` `lv-card` `onStartLevelTest` — 각 1개 이상 매칭이면 로직 생존.
3. v0.12.0 리스킨은 diff 검증 결과 위 항목 전부 보존 확인됨(색 토큰 교체만). 이후 리스킨도 같은 방식으로 확인할 것.

## 미해결 / 실기기 확인 필요

- **G4 키보드 가림**: visualViewport 대응은 넣었으나 iOS Safari 실기기 검증 필요(JP 앱 전례상 iOS 키보드/뷰포트는 시뮬레이션과 다르게 동작 가능). 재현되면 다음 후보: 포커스된 입력을 `scrollIntoView({block:"center"})`로 끌어올리기.
- 듣기 세션 오답 노트·즐겨찾기 출제 소스: 해당 기능(퀴즈·즐겨찾기) 생기면 연결 (PLAN 4.3.5).
- 레벨테스트 EI·순간영작: STT/LLM 프록시 후 (PLAN 4.3).
