# 키 발급·등록 셋업 가이드 (사용자 할 일)

> 목표: Gemini(LLM) + Google TTS(음성)를 **Cloudflare Workers 프록시** 뒤에 숨기고 앱에 연결.
> 원칙: **키는 절대 레포/코드/채팅에 붙여넣지 않는다.** 오직 Cloudflare Workers 시크릿으로만 등록.
> 이동 중이면 아래 1·2만 먼저 해두면 됩니다(3 TTS는 카드 등록이 필요해 나중에 해도 됨).

---

## 요약 — 지금 발급받을 키

| 키 | 용도 | 발급처 | 지금 필수? | 비용 |
|---|---|---|---|---|
| **Gemini API key** | 회화·작문 첨삭·레벨테스트 채점·SOS 번역·단어 자동생성 | Google AI Studio | ✅ 예 | 개인=무료 티어 |
| **Google Cloud TTS key** | 자연스러운 음성(현재는 브라우저 음성만) | Google Cloud Console | ⏳ 나중 가능 | 무료 쿼터 내 $0 (카드 등록 필요) |
| Cloudflare 계정 | 프록시(Workers) 호스팅 | Cloudflare | ✅ 예 | 무료(상업 이용까지 허용) |

> Free Dictionary·WordNet 등은 키 불필요. Supabase·카카오/구글 로그인·결제 키는 한참 뒤(백엔드 단계).

---

## 1. Gemini API key (필수, 5분)

1. https://aistudio.google.com/apikey 접속 → 구글 계정 로그인
2. **Create API key** 클릭 → 새 키 생성(문자열, `AIza...`로 시작)
3. **복사해서 안전한 곳(메모앱/비밀번호 관리자)에 보관.** 채팅·레포에 붙여넣지 말 것.
4. (참고) 개인용은 무료 티어로 충분. 단 무료 티어는 입력이 구글 학습에 쓰일 수 있어, 나중에 상용화하면 유료 티어로 전환(COMMERCIAL.md 기록).

## 2. Cloudflare 계정 (필수, 5분)

1. https://dash.cloudflare.com/sign-up 에서 무료 가입(도메인 불필요 — `*.workers.dev` 무료 서브도메인 제공)
2. 여기까지만 해두면 됩니다. 실제 Worker 배포는 아래 "내가(Claude가) 할 일" 참고 — 배포 방식(대시보드 붙여넣기 vs wrangler)은 그때 안내.

## 3. Google Cloud TTS key (나중에 가능, ~10분 + 카드 등록)

> 지금 앱은 브라우저 Web Speech로 음성이 나오므로 급하지 않음. 아래는 "진짜 자연스러운 음성"으로 올릴 때.

1. https://console.cloud.google.com 접속 → 프로젝트 생성(또는 기존 사용)
2. **Cloud Text-to-Speech API** 검색 → **사용 설정(Enable)**
3. **결제(Billing) 사용 설정** — TTS는 무료 쿼터가 있어도 카드 등록이 필요(쿼터 안에선 $0). 무료 쿼터: Neural2/WaveNet 월 100만 자, Standard 월 400만 자.
4. **사용자 인증 정보(Credentials) → API 키 만들기** → 그 키를 **Text-to-Speech API로만 제한(restrict)** → 복사 보관.
   - (대안) 서비스 계정 JSON도 가능하나, 프록시에선 API 키가 더 간단.

---

## 절대 하지 말 것 (보안)

- ❌ 키를 `index.html`·레포 파일·깃 커밋·채팅에 붙여넣기 → 정적 사이트라 **소스 보기로 노출**됨.
- ✅ 키는 **Cloudflare Workers 시크릿**(`GEMINI_API_KEY`, `GOOGLE_TTS_KEY`)으로만 등록. 클라이언트는 우리 프록시 URL만 호출.

---

## 내가(Claude가) 할 일 (키 준비되면)

1. `worker/` 에 Cloudflare Worker 프록시 코드 작성 — `/api/gemini`(LLM), `/api/tts`(음성) 엔드포인트. 웹 표준 fetch 핸들러라 나중에 Supabase로도 이식 가능.
2. 레이트리밋·CORS·간단한 사용량 캡 포함(어뷰징 방지).
3. 첫 소비 기능 연결(권장: **SOS 한→영 번역** — 회화 탭 미니도구) + 학습카드/듣기의 TTS를 프록시 음성으로 교체(폴백은 Web Speech 유지).
4. `wrangler.toml` + 배포 가이드 작성.

## 키 등록(배포) 방법 — 둘 중 편한 쪽 (그때 같이)

- **A. wrangler CLI**: `npm i -g wrangler` → `wrangler login` → `wrangler secret put GEMINI_API_KEY`(값 입력) → `wrangler deploy`.
- **B. Cloudflare 대시보드**: Workers & Pages → 프로젝트 생성 → Settings → Variables/Secrets에 키 추가 → 코드 붙여넣기/깃 연결로 배포.

> 어느 쪽이든 **키 입력은 사용자가 직접**(내 손·레포를 거치지 않음).

---

## 체크리스트

- [ ] Gemini API key 발급 + 안전 보관
- [ ] Cloudflare 무료 계정 생성
- [ ] (나중) Google Cloud 프로젝트 + TTS API 사용 설정 + 결제 등록 + TTS API 키
- [ ] 준비되면 알려주기 → Claude가 프록시 + 첫 기능 구현 → 사용자가 시크릿 등록·배포
