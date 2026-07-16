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
  for (const model of modelCandidates(fallbacks || MODEL_FALLBACKS)) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    if (upstream.status !== 404 && upstream.status !== 429 && !locationBlocked) break;
  }
  throw new Error(`gemini upstream error [${attempts.join(", ")}] last: ${lastDetail.slice(0, 250)}`);
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
  if (!prompt || prompt.length > 2000) return res.status(400).json({ error: "invalid prompt" });

  try {
    const text = await callGeminiWithFallback(
      [{ parts: [{ text: prompt }] }],
      { temperature: 0.4, maxOutputTokens: 300 });
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: (e && e.message) || "gemini upstream error" });
  }
};

module.exports.callGeminiWithFallback = callGeminiWithFallback;
module.exports.setCors = setCors;
module.exports.isSecretValid = isSecretValid;
