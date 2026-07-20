/* ============================================================================
   NoEnglish — Vercel 서버리스 프록시: POST /api/gemini { prompt } -> { text }
   ----------------------------------------------------------------------------
   왜 Vercel인가: Cloudflare Worker 경유 시 Google 무료 티어가 서버 위치를 거부하는
   문제가 있음(홍콩 등으로 라우팅되는 알려진 이슈, 2026-07-16 실측 — Flash 계열이
   400 FAILED_PRECONDITION "User location is not supported"). Vercel은 vercel.json의
   "regions": ["icn1"](서울)로 실행 위치를 고정할 수 있어 위치 판정을 통과한다.
   키는 Vercel 환경변수(GEMINI_API_KEY)에만 존재 — 레포/클라이언트에 없음.
   환경변수: GEMINI_API_KEY(필수), APP_SHARED_SECRET(권장 — index.html의 PROXY_SECRET과
   같은 값, 미설정 시 검사 생략), GEMINI_MODEL(선택 — 폴백 체인 최우선 후보로 끼어듦).
   TTS는 기존 Cloudflare Worker(noenglish-proxy)가 계속 담당(위치 문제 없음).
============================================================================ */

/* worker/src/worker.js의 MODEL_FALLBACKS와 동일 원리 — 무료 티어는 현세대 Flash 계열만
   (Pro는 2026-04부터 유료 전용), 404/429/위치거부(400 FAILED_PRECONDITION)면 다음 후보로. */
const MODEL_FALLBACKS = ["gemini-3.5-flash", "gemini-3-flash", "gemini-3-flash-preview", "gemma-4-26b-a4b-it", "gemini-3-pro-preview", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

function modelCandidates(fallbacks) {
  const list = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL, ...fallbacks] : fallbacks.slice();
  return [...new Set(list)];
}

async function callGeminiWithFallback(contents, generationConfig, fallbacks) {
  const attempts = [];
  let lastDetail = "";
  /* 대시보드에서 복사-붙여넣기할 때 앞뒤 공백/줄바꿈이 딸려 들어가면 그것만으로 401이 나므로 trim */
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  for (const model of modelCandidates(fallbacks || MODEL_FALLBACKS)) {
    /* 키는 ?key= 쿼리가 아니라 x-goog-api-key 헤더로 — 신형 "AQ." 키는 쿼리 방식이면
       401("Expected OAuth 2 access token...")로 거부됨(2026-07-17 실측+웹 서치 확인). */
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents, generationConfig }),
    });
    if (upstream.ok) {
      const data = await upstream.json();
      const text = (data.candidates && data.candidates[0] && data.candidates[0].content &&
        (data.candidates[0].content.parts || []).map(p => p.text || "").join("")) || "";
      return text.trim();
    }
    attempts.push(`${model}→${upstream.status}`);
    lastDetail = await upstream.text().catch(() => "");
    const locationBlocked = upstream.status === 400 && lastDetail.includes("FAILED_PRECONDITION");
    /* 503(UNAVAILABLE, "high demand")·500/502/504도 다음 후보로 폴백(2026-07-20) — 예전엔 404/429/
       위치거부만 넘어가고 503은 즉시 중단해서, gemini-3.5-flash가 과부하일 때 뒤 후보를 시도조차
       안 하고 사용자에게 에러가 그대로 노출됐음("첨삭을 받아오지 못했어요 …→503", 실사용 리포트). */
    const retryableServer = upstream.status === 500 || upstream.status === 502 || upstream.status === 503 || upstream.status === 504;
    if (upstream.status !== 404 && upstream.status !== 429 && !locationBlocked && !retryableServer) break;
  }
  /* "v4" 마커: 이 문자열이 에러에 보이면 x-goog-api-key 헤더 방식의 새 코드가 실제로 배포된 것
     (Vercel 배포가 옛 코드로 멈춰있는 경우를 에러 메시지만으로 판별하기 위함) */
  throw new Error(`gemini upstream error v4 [${attempts.join(", ")}] last: ${lastDetail.slice(0, 250)}`);
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-App-Secret");
}

function isSecretValid(req) {
  if (!process.env.APP_SHARED_SECRET) return true;
  return req.headers["x-app-secret"] === process.env.APP_SHARED_SECRET;
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(404).json({ error: "not found" });
  if (!isSecretValid(req)) return res.status(403).json({ error: "forbidden" });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "server not configured" });

  const prompt = (req.body && req.body.prompt || "").toString();
  if (!prompt || prompt.length > 4000) return res.status(400).json({ error: "invalid prompt" });

  try {
    /* maxOutputTokens는 3.x 세대 Flash의 "thinking" 토큰과 합산 예산 — 300 정도로 짧게
       잡으면 thinking이 대부분을 먹어 실제 답변이 문장 중간에서 끊김(2026-07-17 실측,
       SOS 번역이 "It was so frustrating because it hasn"처럼 잘려서 나옴). 1024로 올렸다가,
       작문 첨삭(문장별 원문+교정문+코멘트가 여러 개 붙는 응답)에서도 같은 증상으로 또 잘려서
       2048로 재상향(2026-07-18, "첨삭을 불러오지 못했어요" 원인 확인 — geminiJSON이 닫는 괄호
       없는 잘린 JSON은 정규식 폴백으로도 못 살림). 짧은 SOS/대화 응답엔 여유일 뿐 비용 영향 없음
       (실제 쓴 토큰만 과금, cap은 상한선일 뿐). */
    const text = await callGeminiWithFallback(
      [{ parts: [{ text: prompt }] }],
      { temperature: 0.4, maxOutputTokens: 2048 });
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: (e && e.message) || "gemini upstream error" });
  }
};

module.exports.callGeminiWithFallback = callGeminiWithFallback;
module.exports.setCors = setCors;
module.exports.isSecretValid = isSecretValid;
