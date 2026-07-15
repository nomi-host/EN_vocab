/* ============================================================================
   NoEnglish — Cloudflare Worker 프록시 (Gemini + Google TTS)
   ----------------------------------------------------------------------------
   목적: Gemini/TTS API 키를 클라이언트에 노출하지 않고 서버(Worker)에서 대신 호출.
   엔드포인트:
     POST /gemini  { prompt: string }              -> { text: string }
     POST /tts     { text, lang, rate }             -> audio/mpeg (binary)
     GET  /health                                    -> { ok: true }
   시크릿(레포에 넣지 않음, wrangler secret 또는 대시보드로 등록):
     GEMINI_API_KEY, GOOGLE_TTS_KEY
   환경변수(wrangler.toml [vars]):
     ALLOWED_ORIGINS — 쉼표 구분 허용 오리진 목록(비우면 전부 허용 — 배포 후 반드시 좁힐 것)
     GEMINI_MODEL — 기본 gemini-2.0-flash
   PLAN.md 6.6 참고: 지금은 P0 단계(사용량 DB 카운트 없음) — 개인용 규모 전제.
============================================================================ */

const TTS_VOICES = {
  "en-US": "en-US-Neural2-C",
  "en-GB": "en-GB-Neural2-A",
  "en-AU": "en-AU-Neural2-A",
};

function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? origin || "*" : "null",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function isOriginAllowed(origin, env) {
  const list = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (list.length === 0) return true; // 미설정 시 전부 허용(초기 테스트용 — 배포 후 좁히기 권장)
  if (!origin) return false;
  if (list.includes(origin)) return true;
  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) return true;
  return false;
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: { ...headers, "Content-Type": "application/json" } });
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function handleGemini(request, env, headers) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400, headers); }
  const prompt = (body && body.prompt || "").toString();
  if (!prompt || prompt.length > 2000) return json({ error: "invalid prompt" }, 400, headers);
  if (!env.GEMINI_API_KEY) return json({ error: "server not configured" }, 500, headers);

  const model = env.GEMINI_MODEL || "gemini-2.0-flash";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
    }),
  });
  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return json({ error: "gemini upstream error", detail: detail.slice(0, 300) }, 502, headers);
  }
  const data = await upstream.json();
  const text = (data.candidates && data.candidates[0] && data.candidates[0].content &&
    (data.candidates[0].content.parts || []).map(p => p.text || "").join("")) || "";
  return json({ text: text.trim() }, 200, headers);
}

async function handleTts(request, env, headers) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400, headers); }
  const text = (body && body.text || "").toString();
  if (!text || text.length > 500) return json({ error: "invalid text" }, 400, headers);
  if (!env.GOOGLE_TTS_KEY) return json({ error: "server not configured" }, 500, headers);

  const lang = TTS_VOICES[body && body.lang] ? body.lang : "en-US";
  const voiceName = TTS_VOICES[lang];
  const speakingRate = Math.max(0.25, Math.min(4.0, Number(body && body.rate) || 1.0));

  const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`;
  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: lang, name: voiceName },
      audioConfig: { audioEncoding: "MP3", speakingRate },
    }),
  });
  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return json({ error: "tts upstream error", detail: detail.slice(0, 300) }, 502, headers);
  }
  const data = await upstream.json();
  if (!data.audioContent) return json({ error: "tts empty response" }, 502, headers);
  const bytes = base64ToBytes(data.audioContent);
  return new Response(bytes, { headers: { ...headers, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowed = isOriginAllowed(origin, env);
    const headers = corsHeaders(origin, allowed);

    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (url.pathname === "/health") return json({ ok: true }, 200, headers);
    if (!allowed) return json({ error: "origin not allowed" }, 403, headers);

    try {
      if (url.pathname === "/gemini" && request.method === "POST") return await handleGemini(request, env, headers);
      if (url.pathname === "/tts" && request.method === "POST") return await handleTts(request, env, headers);
      return json({ error: "not found" }, 404, headers);
    } catch (e) {
      return json({ error: "internal error" }, 500, headers);
    }
  },
};
