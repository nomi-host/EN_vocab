/* ============================================================================
   NoEnglish — Cloudflare Worker 프록시 (Gemini + Google TTS)
   ----------------------------------------------------------------------------
   목적: Gemini/TTS API 키를 클라이언트에 노출하지 않고 서버(Worker)에서 대신 호출.
   엔드포인트:
     POST /gemini  { prompt: string }              -> { text: string }
     POST /tts     { text, lang, rate }             -> audio/mpeg (binary)
     POST /stt     { audio: base64, mimeType }      -> { text: string }  (Gemini 멀티모달 오디오 전사)
     GET  /health                                    -> { ok: true }
   시크릿(레포에 넣지 않음, wrangler secret 또는 대시보드로 등록):
     GEMINI_API_KEY, GOOGLE_TTS_KEY
     APP_SHARED_SECRET — 클라이언트(index.html의 PROXY_SECRET)와 반드시 같은 값. 미설정 시 검사
       생략(로컬 테스트용) — 실서비스는 반드시 설정할 것. 안 하면 URL만 아는 누구나 이 프록시를
       직접 두드려 Gemini/TTS 쿼터를 대신 써버릴 수 있음(2026-07-16, 실제로 겪은 문제).
   환경변수(wrangler.toml [vars]):
     ALLOWED_ORIGINS — 쉼표 구분 허용 오리진 목록(비우면 전부 허용 — 배포 후 반드시 좁힐 것)
     GEMINI_MODEL — 기본 gemini-2.5-flash-lite. gemini-2.0-flash는 이 계정에서 분당 요청 한도 자체가
       0/0으로 배정돼 있어(2026-07-16, Google AI Studio "모델별 비율 제한" 화면에서 확인 —
       사용량은 0인데도 첫 호출부터 429가 뜬 원인) 쓸 수 없었고, 그다음 시도한 gemini-2.5-flash는
       "no longer available to new users"(404)로 아예 막혀있음(신규 발급 키엔 구버전 flash 별칭이
       할당 안 되는 듯) — models.list API로 실제 사용 가능한 모델을 직접 조회해 확인한 결과
       gemini-2.5-flash-lite만 generateContent 지원 + stable 상태로 확인됨.
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
    "Access-Control-Allow-Headers": "Content-Type, X-App-Secret",
    "Vary": "Origin",
  };
}

/* CORS의 Origin 헤더는 서버-서버(curl 등) 요청에서 얼마든지 위조 가능해 실질적인 인증이 아님 —
   앱이 항상 함께 보내는 공유 시크릿(X-App-Secret)을 확인해, URL만 보고 직접 두드리는
   스캐너/봇이 Gemini·TTS 쿼터를 대신 써버리는 걸 막는다. APP_SHARED_SECRET이 설정 안 돼
   있으면(로컬 테스트 등) 검사를 건너뛴다. */
function isSecretValid(request, env) {
  if (!env.APP_SHARED_SECRET) return true;
  return request.headers.get("X-App-Secret") === env.APP_SHARED_SECRET;
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

  const model = env.GEMINI_MODEL || "gemini-2.5-flash-lite";
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

/* 음성 입력(STT) — 브라우저 내장 SpeechRecognition은 Safari(특히 iOS)에 아예 없어서,
   모든 브라우저에서 동작하도록 클라이언트가 녹음한 오디오를 Gemini 멀티모달로 전사.
   getUserMedia/MediaRecorder는 iOS Safari 14.3+에서도 지원되므로 녹음 자체는 어디서든 가능. */
async function handleStt(request, env, headers) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400, headers); }
  const audio = (body && body.audio || "").toString();
  const mimeType = (body && body.mimeType || "audio/webm").toString();
  if (!audio || audio.length > 8000000) return json({ error: "invalid audio" }, 400, headers);
  if (!env.GEMINI_API_KEY) return json({ error: "server not configured" }, 500, headers);

  const model = env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Transcribe the following English speech verbatim as plain text. Output only the transcription itself — no quotes, no commentary, no formatting. If nothing intelligible is said, output nothing." },
          { inline_data: { mime_type: mimeType, data: audio } },
        ],
      }],
      generationConfig: { temperature: 0, maxOutputTokens: 200 },
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
    if (!isSecretValid(request, env)) return json({ error: "forbidden" }, 403, headers);

    try {
      if (url.pathname === "/gemini" && request.method === "POST") return await handleGemini(request, env, headers);
      if (url.pathname === "/tts" && request.method === "POST") return await handleTts(request, env, headers);
      if (url.pathname === "/stt" && request.method === "POST") return await handleStt(request, env, headers);
      return json({ error: "not found" }, 404, headers);
    } catch (e) {
      return json({ error: "internal error" }, 500, headers);
    }
  },
};
