# NGSL 상용어 대량 보강 — 실행 계획 (다른 세션이 그대로 실행)

작성: 2026-07-14 · 상태: 승인됨(사용자), 미실행 · 담당: 별도 세션

## 배경 / 문제

현재 표제어는 **CEFR-J Wordlist 한 곳**에서만 옴(8,638개). 그래서 `norm(규범)`,
`dataset`, `framework`, `login`, `nuance`, `leverage` 같은 **아주 흔한 상용어가 통째로 빠져** 있다.
CEFR-J 표제어 목록에 그 레마가 없으면 파생형(normal/normally/norms)만 있고 원형(norm)은 없다.

## 소스 결정 (★ 원시 빈도 목록 쓰지 말 것)

`wordfreq` 같은 **원시 빈도 코퍼스(웹·자막)는 부적합**. 실측(2026-07-14):
빈도 top-6000 중 미보유 2,452 → 굴절형 제거 1,005 → WordNet+정제 767 → 고유명사·불규칙·비속어까지 빼도 633,
그런데 그 633도 절반이 **고유명사(paris, twitter, michigan)·불규칙 굴절(sold, broke, chosen)·
영국식 철자 변형(centre, labour, theatre)·비속어**. 학습어휘로 못 씀.

→ **큐레이션된 NGSL(New General Service List)을 소스로 쓴다.**
- NGSL v1.2, 약 2,801 표제어. 고유명사·굴절형·비속어를 배제하고 **레마(원형)만** 담은 학습자용 리스트.
- 라이선스: **CC BY-SA 4.0** (Browne, C., Culligan, B. & Phillips, J. 2013). words.js 헤더 출처 고지에 추가할 것.
- 획득: 공식 http://www.newgeneralservicelist.org (CSV/xlsx) 또는 GitHub 미러. 네트워크 정책상
  직접 다운로드가 막히면 `pip install wordfreq` 후보를 **NGSL 목록으로 교차 필터**하는 폴백은 금지
  (위 노이즈 재발). 반드시 큐레이션 원본을 확보해서 시작한다.
- (선택) NAWL(New Academic Word List, ~960어)까지 합치면 학술어까지 커버 — 1차는 NGSL만 권장.

## 통합 방침 (★ 사용자 지시 2026-07-14)

**별도 트랙으로 만들지 말고, 어차피 다시 나눠야 하는 다의어(senses) 배치 재분할에 얹는다.**
근거: `gen_work.js`는 **words.js(SEED)에서 senses 없는 단어를** ~150개씩 잘라 다의어 작업 파일
(`work/<lvl>_NN.json`)을 만든다. 따라서 NGSL 신규어를 words.js에 편입시키기만 하면, 다음
다의어 재분할 때 신규어가 **자동으로 같은 배치에 딸려 들어온다.** 그러면 에이전트가 한 자리에서
그 단어의 **flat 뜻(ko)+예문(ex) + 다의어(senses)** 를 함께 작성 → 작성 트랙이 하나로 합쳐진다.
(숙어(idiom/phrase) 배치를 나중에 세팅하면, NGSL의 구·연어 항목도 같은 방식으로 그 배치에 태운다.
현재 숙어 배치는 미존재 — 생기면 붙이고, 없으면 1차는 단어만.)

## 파이프라인 메커니즘 (반드시 이해하고 시작 — 함정 있음)

`merge_cefrj.js`는 **`cefrj/*_enriched.json`(표제어 마스터)에 있는 단어만** words.js로 배출한다.
`batches/`에 한국어(ko)를 써도, 그 단어가 어느 enriched 파일에도 없으면 **영원히 안 나온다.**
→ 신규어는 **enriched 파일 + 배치 파일 둘 다** 만들어야 한다.
`gen_work.js`도 words.js를 읽으므로, **신규어가 words.js에 들어온 뒤에야** 다의어 배치에 나타난다
(순서 주의: enriched+flat배치 → merge → gen_work 재실행 → 다의어 배치에 신규어 포함).

merge가 각 표제어에 채우는 값:
- `word, cefr, en, syn` = enriched 파일에서 (WordNet 기계 추출)
- `pos` = enriched의 pos(noun/verb/adjective/adverb만 유지, 정렬)
- `ko, ex` = `batches/`의 authored 항목에서 (`ex`는 단일 객체, merge가 `[a.ex]`로 감쌈)
- `ipa`="" , `ant/forms` = network.json, `roots` = roots.json (없으면 빈 배열 — 신규어는 대개 비어도 됨)

## 실행 단계

### 1) NGSL 확보 + diff
- NGSL 표제어 목록(소문자, 레마)을 `pipeline/cefrj/ngsl_wordlist.json`으로 저장(+ 빈도 랭크 보존).
- 현재 표제어 로드: `node -e 'global.window=global;require("./words.js");...'` → `SEED.map(w=>w.word.toLowerCase())`.
- diff → **미보유 NGSL 레마 집합** = 이번에 추가할 대상. (정제된 소스라 이게 곧 최종 목록. 예상 규모 수백 개.)

### 2) enriched 파일 생성 — `cefrj/ngsl_enriched.json` (무LLM 스크립트)
각 미보유 단어를 `enrich_wordnet.js` 방식(wordpos)으로 처리해 `{word, pos, cefr, en, syn}` 생성:
- `pos`: WordNet lookup 결과의 품사(n/v/a/r → noun/verb/adjective/adverb). WordNet에 없으면 **제외**
  (고유명사·비표제어 자동 탈락).
- `en`: 대표 synset의 학습자용 정의 한 문장(`enrich_wordnet.js`의 exp/def 선택 로직 재사용).
- `syn`: WordNet 동의어 상위 4개(자기 자신 제외).
- `cefr`: NGSL 빈도 밴드 근사 매핑 **[결정: 아래 표]**. NGSL엔 CEFR가 없으므로 랭크로 근사.
  | NGSL 랭크 | cefr |
  |---|---|
  | 1–800 | A2 |
  | 801–1600 | B1 |
  | 1601–2400 | B2 |
  | 2401–2801 | C1 |
  (대부분 A1/저빈도는 이미 CEFR-J로 보유 → 신규분은 중상위 밴드로 떨어지는 게 자연스러움.
   과함/부족은 이후 레벨테스트 데이터로 보정 가능. 표는 근사치임을 주석으로 남길 것.)
- 산출물은 기존 enriched와 **동일 스키마**(word/pos/cefr/en/syn[/exp])로 저장.

### 3) 한국어 뜻·예문 작성 — `batches/ngsl_batchNN.json` (★유일한 실제 작업)
- 포맷은 기존 배치와 정확히 동일:
  ```json
  [{"word":"norm","ko":"규범, 기준","ex":{"en":"Punctuality is the norm in this office.","ko":"이 사무실에서는 시간 엄수가 규범이에요."}}]
  ```
- 규칙(CLAUDE.md + AGENT_INSTRUCTIONS 준수):
  - 뜻은 **사전식 간결체**, 필요하면 콤마로 2~3개.
  - **이모지 절대 금지.**
  - 예문은 그 단어를 실제로 보여주는 자연스러운 문장 + 자연스러운 한국어 번역(직역·딱딱한 투 금지).
  - **외래어 음차뿐인 뜻 지양**(예: `router→라우터`만 X → `라우터, 경로 지정 장치`처럼 네이티브 뜻 병기).
    이유: 레벨테스트 산출 문항이 첫 뜻을 보여주는데 음차뿐이면 자명해짐(index.html `isPureLoanword` 참고).
  - (선택) 다의어가 뚜렷하면 `senses[]`도 가능하나 1차는 flat `ko`+`ex`로 충분.
- **100% 커버**(하나도 건너뛰지 말 것), 유효 JSON. 분량이 크면 batch01, batch02…로 분할.
- 확신 낮은 단어는 `review_parts/`에 사유 기록(기존 규약).
- 권장 모델: **Sonnet 5**(PLAN 0.5 — 품질 필요한 한국어 배치). 대량이면 배치별 병렬 서브에이전트.

### 4) 재빌드 → 신규어 words.js 편입
- `node pipeline/merge_cefrj.js` → `words.js` 재생성.
- 검증: `norm` 등 표본이 SEED에 들어왔는지, 총 표제어 수 증가분이 추가 대상 수와 일치하는지 확인.
- words.js 헤더 출처 고지에 **NGSL(CC BY-SA 4.0)** 한 줄 추가(merge_cefrj.js의 header 템플릿 수정).

### 5) 다의어 배치 재분할에 합류 (통합 방침의 핵심)
- `node pipeline/gen_work.js` **재실행** → 이제 SEED에 신규어가 있으므로, senses 없는 신규어가
  기존 미완 표제어와 함께 `work/<lvl>_NN.json`으로 다시 나뉜다(다의어 배치가 어차피 재분할됨).
- 에이전트(Sonnet 5, AGENT_INSTRUCTIONS.md 규약)가 그 배치의 senses를 작성 →
  `senses_parts/`. 신규어의 다의어까지 이 한 패스에서 처리(별도 트랙 없음).
- 다시 `node pipeline/merge_cefrj.js` → senses 반영된 words.js.
- (숙어 배치가 세팅돼 있으면 같은 재분할·작성 흐름에 NGSL 구·연어 항목을 얹는다.)

### 6) 앱 버전 + 커밋
- `index.html` `APP_VERSION`·`<head>` `?v=` 캐시 태그 동반 갱신(CLAUDE.md 규칙), `APP_BUILD`=작업일.
- 브랜치는 그때 지정된 작업 브랜치로 커밋·푸시. words.js 파일은 CC BY-SA 유지 주석 확인.

## 결정 사항 (사용자 추천안 채택 완료)
- 소스: **큐레이션 NGSL** (원시 빈도 금지) ✔
- CEFR: **빈도 밴드 근사 매핑**(위 표) ✔
- 작업: 한국어 뜻·예문 **배치 분할 작성**(Sonnet 5, 대량 시 병렬) ✔

## 검증 스니펫 (규모 재확인용)
```bash
# 현재 표제어 로드 + NGSL diff
node -e 'global.window=global;require("./words.js");
  const have=new Set(SEED.map(w=>w.word.toLowerCase()));
  const ngsl=require("./pipeline/cefrj/ngsl_wordlist.json"); // [{word,rank},...]
  const missing=ngsl.filter(x=>!have.has(x.word.toLowerCase()));
  console.log("추가 대상:",missing.length); console.log(missing.slice(0,50).map(x=>x.word).join(", "));'
```
