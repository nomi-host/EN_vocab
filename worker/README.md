# NoEnglish 프록시 배포 가이드

Gemini·Google TTS 키를 숨기고 앱이 대신 부르는 Cloudflare Worker. 방법 A(대시보드, 컴퓨터 없이도 가능)와 방법 B(wrangler CLI, 컴퓨터에서 더 빠름) 중 편한 쪽으로.

키를 아직 안 받았다면 먼저 `../docs/SETUP_KEYS.md` 참고.

---

## 방법 A — Cloudflare 대시보드에서 붙여넣기 배포

1. https://dash.cloudflare.com 로그인 → **Workers & Pages** → **Create** → **Workers** → 이름을 `noenglish-proxy`로 만들고 **Deploy**(기본 템플릿으로 일단 생성).
2. 생성된 Worker 열기 → **Edit code**(Quick Edit) → 코드 전체 삭제 후 이 저장소의 `worker/src/worker.js` 내용을 **그대로 붙여넣기** → **Deploy**.
3. Worker 관리 화면 → **Settings → Variables and Secrets**:
   - **Secret** 추가: `GEMINI_API_KEY` = (발급받은 Gemini 키)
   - **Secret** 추가: `GOOGLE_TTS_KEY` = (발급받은 TTS 키)
   - **Secret** 추가: `APP_SHARED_SECRET` = `8668c5975ca9252dfa7b6c2306c7f4fb617a3b63aa073cff`
     (★중요★ — `index.html`의 `PROXY_SECRET`과 **반드시 똑같은 값**이어야 함. 이게 없으면 URL만 아는
     누구나 이 프록시를 직접 두드려 Gemini/TTS 쿼터를 대신 써버릴 수 있음 — 실제로 겪었던 문제.)
   - **Variable**(일반 변수) 추가: `ALLOWED_ORIGINS` = 앱 배포 주소(예: `https://en-vocab.vercel.app`). 여러 개면 쉼표로 구분. **비워두면 당장은 전부 허용**되니 나중에 꼭 채우기.
   - **`GEMINI_MODEL` Variable은 만들지 말 것(있으면 삭제).** 모델 선택은 이제 코드의 `MODEL_FALLBACKS`
     폴백 체인이 자동 처리 — 후보 모델을 순서대로 시도해서 404("no longer available")·429(한도 0 배정)로
     막힌 모델은 건너뛰고 되는 모델로 응답한다. Google이 예고 없이 모델을 막아도 앱이 계속 동작.
     (배경: 2026-07-16에 `gemini-2.0-flash`는 분당 한도 0/0, `gemini-2.5-flash`·`gemini-2.5-flash-lite`는
     models.list엔 stable로 나오는데 실제 호출은 404 — 모델 하나를 박아두는 구조로는 이런 변경에 매번
     수동 대응해야 해서 폴백 체인으로 교체. 또한 대시보드 Variable은 코드 기본값보다 항상 우선이라,
     옛날 값이 남아있으면 코드를 고쳐도 계속 그 값이 쓰이는 함정도 있었음. 특정 모델을 강제로 시험하고
     싶을 때만 임시로 설정 — 그 값이 폴백 체인의 최우선 후보가 됨.)
   - 저장하면 자동 재배포됨.
4. Worker 화면 상단에 뜨는 URL 확인 (`https://noenglish-proxy.<본인계정>.workers.dev` 형태). 이 URL을 **나에게 알려주면** `index.html`의 `PROXY_BASE`에 넣어서 SOS·TTS를 켭니다.
5. 확인: 브라우저에서 `https://<그 URL>/health` 접속 → `{"ok":true}` 나오면 정상 배포.

## 방법 B — wrangler CLI (컴퓨터에서)

```bash
cd worker
npm install -g wrangler   # 이미 있으면 생략
wrangler login
wrangler secret put GEMINI_API_KEY      # 값 입력 프롬프트
wrangler secret put GOOGLE_TTS_KEY      # 값 입력 프롬프트
wrangler secret put APP_SHARED_SECRET   # index.html의 PROXY_SECRET과 반드시 같은 값 입력
# wrangler.toml의 ALLOWED_ORIGINS를 앱 배포 주소로 채운 뒤:
wrangler deploy
```

배포 후 나오는 URL을 `PROXY_BASE`에 반영.

---

## 배포 후 앱에 연결

`index.html`에서 아래 상수를 배포된 Worker URL로 채우면 즉시 활성화됩니다(그 전엔 SOS는 "준비 중", TTS는 기존 브라우저 음성 그대로 — 앱 동작에 영향 없음):

```js
const PROXY_BASE = "https://noenglish-proxy.<본인계정>.workers.dev";
```

## 보안 체크

- 키는 이 레포 어디에도 없음(코드는 `env.GEMINI_API_KEY`로만 참조) — Worker 시크릿에만 존재.
- `ALLOWED_ORIGINS`를 실제 앱 주소로 좁히면, 다른 사이트가 이 프록시를 가져다 쓰는 걸 막음. 단, Origin 헤더는
  브라우저가 아닌 서버-서버 요청(curl 등)에서는 얼마든지 위조 가능해 이것만으로는 실제 인증이 안 됨.
- **`APP_SHARED_SECRET`을 반드시 설정할 것(2026-07-16 추가).** 이게 없으면 이 프록시는 사실상 인증 없는
  공개 엔드포인트라, `index.html`에 평문으로 박혀 있는 `PROXY_BASE` URL만 알면(=배포된 사이트를 한 번이라도
  열어본 사람은 누구나 페이지 소스에서 바로 볼 수 있음) 누구든 직접 `POST`로 두드려 Gemini/TTS 쿼터를
  대신 써버릴 수 있다 — "쓴 적 없는데 쿼터 초과" 문의가 실제로 이 문제였을 가능성이 높음.
  `APP_SHARED_SECRET`을 설정하면 `X-App-Secret` 헤더가 일치하지 않는 요청은 403으로 거부된다.
  단, 이 값도 결국 클라이언트 코드에 그대로 노출되므로(뷰 소스로 보임) 완벽한 인증은 아니고, 무작위
  스캐너·봇의 자동화된 남용을 막는 정도로 이해할 것 — 진짜 인증이 필요하면 PLAN.md 6.6의 P1 단계로.
- 지금 단계(P0)는 사용자별 사용량 카운트가 없음 — 개인용 규모 전제. 여러 명이 쓰게 되면 PLAN.md 6.6의 인증+`usage` 테이블 단계(P1)로 넘어갈 것.
