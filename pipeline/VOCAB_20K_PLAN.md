# 어휘 20,000 확장 — 실측 기반 실행 계획

작성: 2026-07-23 · 상태: **실측 완료, 실행 대기(사용자 승인 후 착수)** · 선행 문서: `NGSL_IMPORT_PLAN.md`(이 계획에 흡수됨)

## 0. 배경 — 무엇이 문제였나

사용자가 드라마·일상에서 수집한 미지 단어 38개를 대조한 결과(2026-07-23):

- **표제어 자체가 없음**: oligarch, foster, iffy, premature, insinuate, surplus, workforce, trespass, edible, stoppage, prostitution, catastrophically, true-blue, DUI …
- **표제어는 있는데 그 뜻(sense)이 없음**: summer(동사 "여름을 보내다" 없음 — 명사만), transient(명사 "노숙자·뜨내기" 없음 — 형용사만), matching("커플의" 용법 없음)
- **숙어·생활표현 전멸**: take the fifth, ring up, pull in, hail from, pull one's leg, on the side, high season, to the fullest, in the mood for …

원인: 표제어 원천이 CEFR-J(일본 교육과정용 학습자 리스트) 하나뿐이라 **뉴스어·구어·생활법률어·숙어가 구조적으로 빠짐**. 갭은 "없는 단어"와 "있는 단어의 없는 뜻" 2중 구조다. → 트랙을 나눠서 공략한다.

## 1. 실측 결과 (2026-07-23, 이 레포에서 재현 가능)

### 1.1 표제어 갭 — `node pipeline/expansion/gen_expansion_candidates.js`

SUBTLEX-US 구어(자막) 빈도 74,286어 × 기계 필터(소문자만·WordNet 레마 존재·SEED 미보유·기보유 원형의 규칙 굴절형 제외) 통과 후보:

| 구어빈도 랭크 | 신규 후보 | 누적 | 도달 표제어 수 |
|---|---|---|---|
| 0~5,000 | 280 | 280 | 9,267 |
| 5,000~10,000 | 1,008 | 1,288 | 10,275 |
| 10,000~15,000 | 1,538 | 2,826 | 11,813 |
| 15,000~20,000 | 1,821 | 4,647 | 13,634 |
| 20,000~30,000 | 3,856 | 8,503 | 17,490 |
| 30,000~45,000 | 5,582 | 14,085 | **23,072** |
| 45,000~74,286 | 8,612 | 22,697 | 31,684 |

- **20,000 도달 = 랭크 약 37,000까지의 후보를 큐레이션해 +11,013 채택**하면 됨.
- 사용자 갭 단어의 실제 랭크: foster 3.8k · fetch 4.1k · premature 8.6k · prostitution 10.7k · surplus 11.8k · trespass 14.3k · edible 14.6k · insinuate 21.6k · iffy 24.2k · congregate 28.2k · workforce 29.2k · stoppage 33.5k · oligarch 68.5k — **대부분 5k~35k 대역**. 이 대역을 채우는 것이 곧 사용자 체감 갭을 채우는 것.
- 기계 필터 통과분에도 노이즈 잔존(실측 샘플: whispering·reaching 같은 파생·굴절형, cocksucker·floozy 같은 비속어, defence 같은 영국철자) → **LLM 큐레이션 패스 필수**(2단계 참고). 예상 채택률 65~80%.
- 후보 전체는 `pipeline/expansion/candidates.json`(랭크 포함)에 저장됨.

### 1.2 sense 갭 — `node pipeline/expansion/measure_sense_gap.js`

기존 8,987 표제어를 WordNet 품사 인덱스와 대조:

| 층위 | 규모 | 내용 |
|---|---|---|
| 품사 갭(엄격) | **589단어** | 코퍼스(SemCor) 실출현 품사가 통째로 빠짐 (예: average 동사, dark 명사, couple 동사) — 바로 작업 가능 |
| 품사 갭(느슨) | **~1,000단어** | WordNet엔 있으나 코퍼스 출현 0 — summer(동사)·transient(명사)가 여기. 큐레이션으로 절반쯤 채택 예상 |
| 뜻 개수 갭(참고) | 1,785단어 | WordNet tagged 뜻 수 ≫ 우리 senses 수. 2차 심화용(이번 목표엔 미포함) |

산출 파일: `pos_gap.json` / `pos_gap_loose.json` / `sense_cnt_gap.json` (전부 `pipeline/expansion/`).

## 2. 소스 전략 (라이선스 검증 완료, 2026-07-23 웹 확인)

| 소스 | 역할 | 라이선스 | 확보 상태 |
|---|---|---|---|
| **SUBTLEX-US** (npm `subtlex-word-frequencies`) | 후보 추출·순서 결정 (구어 빈도 백본) | 연구용 무료. **빈도 수치는 앱에 미포함** — 선정 기준으로만 내부 사용 | **확보됨** (`pipeline/package.json` 의존성) |
| **WordNet 3.0** (wordpos, 기존 사용 중) | 레마 필터 + en/syn/senses 뼈대 + ant/forms | Princeton (기존 고지 유지) | 확보됨 |
| **CMUdict** (기존 사용 중) | IPA | ISC | 확보됨 |
| **NGSL 패밀리** (NGSL 2,809 + NGSL-S 구어 822 + NAWL·TSL·BSL) | 큐레이션 우선순위 부스트 태그 (있으면 무조건 채택) | **CC BY-SA 4.0 명시** | **미확보** — 이 실행환경 네트워크 정책이 newgeneralservicelist.org 차단. 사용자가 CSV를 받아 `pipeline/expansion/`에 넣어주거나, 네트워크 정책 넓은 세션에서 확보 |
| **Nation BNC/COCA 25k** | 교차 검증(선택) | 무료 공개(빅토리아대) | 미확보 — 동일하게 차단(wgtn.ac.nz). 없어도 계획 진행엔 지장 없음 |
| Oxford 3000/5000 | (탈락) CEFR 참고만 | © OUP, 재배포 불가 | 편입 금지 |
| COCA 60k (wordfrequency.info) | (탈락) | 유료·재배포 금지·워터마크 | 사용 안 함 |

> NGSL/Nation 파일이 확보되면 큐레이션 정확도가 오르지만(특히 NGSL-S 구어 822어 부스트), **SUBTLEX+WordNet만으로도 전 단계 진행 가능**하도록 설계했다. 확보 시 `gen_expansion_candidates.js`에 부스트 태그 필드만 추가하면 됨.

## 3. 실행 트랙

### 트랙 A — 표제어 +11,013 (8,987 → 20,000) ★규모 본체★

기존 `NGSL_IMPORT_PLAN.md`의 파이프라인 메커니즘(enriched 파일+배치 둘 다 필요, merge→gen_work 순서 함정)을 그대로 쓴다. 소스만 NGSL 단독 → SUBTLEX 백본으로 확장.

1. **[완료] 후보 추출** — `expansion/candidates.json` (랭크≤45k에서 14,085개).
2. **큐레이션 배치** (LLM, ~500개/배치 × 29배치): 각 후보를 채택/기각 판정.
   - 기각: 기보유 단어의 파생·굴절형(명백한 것), 비속어(학습앱 부적합 수위), 영국철자 변형(미국철자가 이미 있으면), 화석어.
   - 채택 시 CEFR 근사 태깅: 랭크 0~10k→B1·B2, 10~20k→C1, 20k+→C2 (근사임을 주석으로, 추후 레벨테스트 데이터로 보정).
   - 산출: `expansion/curated_NN.json`. 채택 누계가 +11,013 도달하면 중단(45k 풀로 부족하면 45k+ 밴드 추가 큐레이션).
3. **enriched 생성** (무LLM 스크립트): 채택분을 `enrich_wordnet.js` 방식으로 `cefrj/subtlex_enriched.json` 생성 — pos/en/syn 자동. WordNet 미존재는 이 단계에서 자동 탈락.
4. **한국어 뜻·예문 작성** (LLM, 150개/배치 × ~74배치): `batches/subtlex_batchNN.json`. 기존 배치 포맷·규칙 그대로(사전식 간결 뜻, 이모지 금지, 자연스러운 예문+번역, 음차뿐인 뜻 지양, 100% 커버, 확신 낮으면 `review_parts/`).
5. **재빌드 + 자동 필드 재생성** (무LLM — "유의어·반의어·어원 타고타고" 학습 대응):
   ```
   node pipeline/merge_cefrj.js          # 신규어 words.js 편입
   node pipeline/enrich_network.js       # 반의어(ant)·파생어(forms) — WordNet 포인터, 20k 전체 재추출
   node pipeline/enrich_roots.js         # 어근(접두·접미) — affixes.json 매칭, 신규어의 오탐은 EXCLUDE 목록 보강
   node pipeline/merge_cefrj.js          # network/roots 반영 재병합
   ```
   ipa는 merge가 CMUdict로 자동 채움(저빈도어는 빈 문자열 허용 — 기존 규칙). **enrich_roots의 EXCLUDE 오탐 목록은 신규 1만 단어에서 새 오탐이 반드시 나오므로, 재실행 후 접사별 샘플 검수 1회 필요.**
6. **다의어 합류**: `node pipeline/gen_wordnet_senses.js` → `node pipeline/gen_work.js` 재실행 — senses 없는 신규어가 기존 미완분과 함께 `work/`에 재분할됨(신규어 중 다의어는 WordNet sense 2개 이상 기준 약 30% 추정 = ~3,300개 → ~22배치). `AGENT_INSTRUCTIONS.md` 규약으로 작성.

### 트랙 B — 기존 단어 sense 갭 메우기 (summer 동사·transient 명사류)

1. **엄격 589단어** (품사 갭, 코퍼스 실출현): 큐레이션 불필요, 바로 senses 추가 작성. `pos_gap.json`을 150개 단위로 잘라 **4배치**. 형식은 기존 `senses_parts/` 스키마(기존 senses에 새 품사 sense를 추가하는 방식 — 기존 뜻을 덮어쓰지 말 것).
2. **느슨 ~1,000단어**: 큐레이션 **2배치**(채택 예상 40~60% ≈ 400~600) → 작성 **4배치**. summer(동사)·transient(명사)는 여기서 회수됨.
3. 참고: 뜻 개수 갭 1,785단어(2차 뜻 심화)는 이번 범위에서 제외 — 20k 이후 별도 계획.

### 트랙 C — 숙어·생활표현 (+300~500)

- 진행 중인 IDIOM 트랙(PHaVE 2차 IDIOM_03/04)과 별개로, 사용자 갭 유형(식당 주문 hold the/on the side, 운전 pull in/ring up, 법률 take the fifth/DUI, 관용구 pull one's leg/to the fullest)을 **주제별 생성+검수** 방식으로 IDIOM_05+ 배치화 — 큐레이션된 공개 소스가 없는 영역이라 기존 비즈니스 구동사 24개 선정과 같은 방식. **3~4배치**.
- Wiktionary 숙어 카테고리(CC BY-SA)를 후보 소스로 쓸 수 있으나 이 환경에선 네트워크 차단 — 확보되면 후보 풀로 추가.

### 트랙 D — 사용자 수집 인입 (즉시 실행 가능, 1배치)

사용자의 38개 리스트를 첫 배치로 정식 시드에 편입. 분류:
- 신규 표제어(트랙 A에 선행 편입): oligarch, foster, iffy, premature, insinuate, catastrophically, surplus, workforce, trespass, edible, stoppage, prostitution, true-blue, DUI
- sense 추가(트랙 B에 선행 편입): summer(동사), transient(명사 "뜨내기·노숙자"), matching(형용사 "커플의" 용법)
- 숙어·표현(트랙 C에 선행 편입): high season, a drink, against one's will, pull one's leg, hail from, indicative of, in the mood for/to, hold the N·leave out·no N, on the side, ring up, pull in, take the fifth, fall into, waiting to happen, enter the workforce, to the fullest, edible arrangement, AC(air con)
- 문법 패턴(문법 트랙으로): There's no V-ing
- 이후에도 "드라마에서 적은 단어 → USER_NN 배치 → merge"를 상시 트랙으로 유지. (앱의 "새 단어 등록"(EXTRA)은 기기 로컬이라 시드 승격이 필요.)

## 4. 작업량 총괄

| 항목 | 배치 수 | 성격 | 권장 모델 |
|---|---|---|---|
| A-2 큐레이션 (14,085개 판정) | ~29 | 가벼움(판정만) | Sonnet 5 |
| A-4 한국어 뜻·예문 (+11,013) | ~74 | 본 작업 | Sonnet 5 |
| A-6 신규어 다의어 senses (~3,300) | ~22 | 본 작업 | Sonnet 5 |
| B sense 갭 (589+느슨 채택분) | ~10 | 본 작업 | Sonnet 5 |
| C 숙어·생활표현 | ~4 | 생성+검수 | Sonnet 5 |
| D 사용자 38개 | 1 | 즉시 가능 | Sonnet 5 |
| 자동 스크립트 재실행·검수 | — | 무LLM (enrich_network 20k는 수십 분) | — |
| **합계** | **~140배치** | | |

- 실행 규약은 기존과 동일: 병렬 서브에이전트 2개씩 라운드 → 커버리지 diff 검증 → 다음 라운드. 세션당 2배치 기본 제한, "배치작업 이어서 해줘" 오버라이드 시 연속 실행 (CLAUDE.md 규칙).
- 트랙 순서 권장: **D(1배치, 즉시) → B-1(4배치) → A 큐레이션 → A 작성 → A senses → C** — 사용자 체감 갭부터 회수하고 규모 작업은 뒤에.

## 5. 선행 기술 작업 — words.js 분할 로딩 (★대량 작성 전에 반드시★)

현재 words.js = 8,987개에 9.2MB(gzip 2.0MB). 20,000개면 **약 20MB(gzip ~4.5MB)** — 단일 파일 전체 로드 구조로는 PWA 첫 로드·메모리·버전 갱신(전체 재다운로드)에 무리.

- 방향: **코어/확장 2단 로딩** — 코어(현행 8,987 또는 A1~B2)는 지금처럼 즉시 로드, 확장분(신규 1.1만)은 청크 분할(레벨별 또는 빈도 밴드별) + 지연 로드 + IndexedDB 캐시. 검색·사전 탭은 경량 인덱스(word→청크 매핑)만 선로드.
- `?v=` 캐시 무효화 태그·`version.json` 강제 새로고침 체계에 청크 파일들도 편입해야 함.
- 이건 앱 코드 작업(파이프라인 아님) — 별도 세션에서 설계·구현 후 대량 편입 시작. **분할 전에 1만 단어를 편입하면 안 됨.**

## 6. 출처 고지 · 규칙

- words.js 헤더에 추가: SUBTLEX-US(Brysbaert & New 2009 — 후보 선정 참고, 빈도 수치 미포함), NGSL(CC BY-SA 4.0, 확보 시).
- 상업 배포 전 SUBTLEX 사용 조건 재확인(연구용 무료 — 현재는 선정 참고 용도라 데이터 재배포에 해당 안 되지만, 유료화 시점에 재검토).
- words.js 직접 수정 금지 원칙 유지 — 모든 신규 데이터는 `pipeline/` 산출물 수정 후 재빌드.
- 진행 중 `docs/PLAN.md` 0장 수치(표제어 수)와 이 문서의 상태를 함께 갱신할 것.
