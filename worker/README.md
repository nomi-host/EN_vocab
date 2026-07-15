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
   - **Variable**(일반 변수) 추가: `ALLOWED_ORIGINS` = 앱 배포 주소(예: `https://en-vocab.vercel.app`). 여러 개면 쉼표로 구분. **비워두면 당장은 전부 허용**되니 나중에 꼭 채우기.
   - **Variable**: `GEMINI_MODEL` = `gemini-2.0-flash` (없어도 코드 기본값 사용)
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
- `ALLOWED_ORIGINS`를 실제 앱 주소로 좁히면, 다른 사이트가 이 프록시를 가져다 쓰는 걸 막음.
- 지금 단계(P0)는 사용자별 사용량 카운트가 없음 — 개인용 규모 전제. 여러 명이 쓰게 되면 PLAN.md 6.6의 인증+`usage` 테이블 단계(P1)로 넘어갈 것.
