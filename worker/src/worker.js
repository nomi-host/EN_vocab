/* ============================================================================
   NoEnglish — Cloudflare Worker 프록시 (Gemini + Google TTS)
   ----------------------------------------------------------------------------
   목적: Gemini/TTS API 키를 클라이언트에 노출하지 않고 서버(Worker)에서 대신 호출.
   엔드포인트:
     POST /gemini  { prompt: string }              -> { text: string }
     POST /tts     { text, lang, rate, gender }      -> audio/mpeg (binary)
     POST /stt     { audio: base64, mimeType }      -> { text: string }  (Gemini 멀티모달 오디오 전사)
     GET  /health                                    -> { ok: true }
   시크릿(레포에 넣지 않음, wrangler secret 또는 대시보드로 등록):
     GEMINI_API_KEY, GOOGLE_TTS_KEY
     APP_SHARED_SECRET — 클라이언트(index.html의 PROXY_SECRET)와 반드시 같은 값. 미설정 시 검사
       생략(로컬 테스트용) — 실서비스는 반드시 설정할 것. 안 하면 URL만 아는 누구나 이 프록시를
       직접 두드려 Gemini/TTS 쿼터를 대신 써버릴 수 있음(2026-07-16, 실제로 겪은 문제).
   환경변수(wrangler.toml [vars]):
     ALLOWED_ORIGINS — 쉼표 구분 허용 오리진 목록(비우면 전부 허용 — 배포 후 반드시 좁힐 것)
     GEMINI_MODEL — (선택) 설정하면 폴백 체인의 최우선 후보로 끼워짐. 미설정 권장 — 모델 선택은
       MODEL_FALLBACKS 폴백 체인이 알아서 처리(하나가 404/429로 막혀도 다음 후보로 자동 전환).
       배경(2026-07-16): 이 계정(신규 발급 키)에서 gemini-2.0-flash는 분당 한도 0/0(429),
       gemini-2.5-flash·gemini-2.5-flash-lite는 models.list엔 stable로 나오는데 실제 호출은
       404 "no longer available to new users" — 모델 하나에 거는 구조 자체가 위험해 폴백 체인 도입.
   PLAN.md 6.6 참고: 지금은 P0 단계(사용량 DB 카운트 없음) — 개인용 규모 전제.
============================================================================ */

/* 예전엔 lang당 목소리 1개(전부 여성 Neural2)라, 회화 페르소나가 "중장년 남성 의사"라고 설정해도
   실제로는 여성 목소리로 나오는 버그가 있었음(2026-07-20 발견) — 성별별로 나눔.
   gender 미지정 시 기존 동작 유지를 위해 female을 기본값으로 유지(하위 호환). */
const TTS_VOICES = {
  "en-US": { female: "en-US-Neural2-C", male: "en-US-Neural2-D" },
  "en-GB": { female: "en-GB-Neural2-A", male: "en-GB-Neural2-B" },
  "en-AU": { female: "en-AU-Neural2-A", male: "en-AU-Neural2-B" },
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

/* Google이 모델을 예고 없이 막거나(404 "no longer available") 한도를 0으로 배정(429)하는 일이
   실제로 반복돼서(2026-07-16, 2.0-flash→429, 2.5-flash·2.5-flash-lite→404), 모델 하나에 걸지 않고
   후보 목록을 순서대로 시도한다. 404/429(모델 자체가 안 열린 경우)면 다음 후보로 자동 폴백 —
   Google이 또 이름을 바꿔도 앱은 계속 동작. env.GEMINI_MODEL이 있으면 최우선 후보로 끼워준다. */
/* 텍스트용 후보 — 2026-07 웹 서치로 확인된 사실 기반 순서:
   · 무료 티어는 "현세대 Flash 계열"만(Pro는 2026-04-01부터 유료 전용) → 3.5/3 Flash를 맨 앞에.
   · gemini-2.5-flash(-lite)는 공식 종료일(10-16) 전인 2026-07-09부터 신규 사용자에게 조기 404 —
     전 세계적 사건(포럼 다수 보고), 우리 계정 문제 아님.
   · Gemma는 무료 할당량이 별도지만 Cloudflare 경유 시 위치 거부(400)될 수 있어 Flash 뒤로.
   · 결제(선불 포함)가 연결된 프로젝트는 무료 티어가 소멸되므로 키는 결제 미연결 프로젝트 것 사용. */
const MODEL_FALLBACKS = ["gemini-3.5-flash", "gemini-3-flash", "gemini-3-flash-preview", "gemma-4-26b-a4b-it", "gemini-3-pro-preview", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
/* 오디오(STT)용 후보: Gemma는 오디오 입력을 지원하지 않아 Gemini 계열만. */
const AUDIO_MODEL_FALLBACKS = ["gemini-3.5-flash", "gemini-3-flash", "gemini-3-flash-preview", "gemini-3-pro-preview", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
function modelCandidates(env, fallbacks) {
  const list = env.GEMINI_MODEL ? [env.GEMINI_MODEL, ...fallbacks] : fallbacks.slice();
  return [...new Set(list)];
}
/* 후보를 차례로 시도해 첫 성공 응답의 텍스트를 반환. 전부 실패하면 "어떤 모델이 몇 번으로
   죽었는지" 전체 목록을 담아 throw — 마지막 모델 에러만 보여주면 진단이 안 돼서(2026-07-16). */
async function callGeminiWithFallback(env, contents, generationConfig, fallbacks) {
  const attempts = [];
  let lastDetail = "";
  for (const model of modelCandidates(env, fallbacks || MODEL_FALLBACKS)) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
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
    // 404(모델 없음/미개방)·429(한도 0 배정 포함)는 모델 단위 문제일 수 있으니 다음 후보 시도.
    // 400 중 "User location is not supported"(FAILED_PRECONDITION)도 모델/티어별로 달라서 스킵
    // (Gemma만 위치 거부되고 Gemini는 통과하는 사례 실제 확인, 2026-07-16).
    // 그 외(일반 400 잘못된 요청, 401/403 키 문제 등)는 모델을 바꿔도 똑같으므로 즉시 중단.
    const locationBlocked = upstream.status === 400 && lastDetail.includes("FAILED_PRECONDITION");
    if (upstream.status !== 404 && upstream.status !== 429 && !locationBlocked) break;
  }
  throw new Error(`gemini upstream error [${attempts.join(", ")}] last: ${lastDetail.slice(0, 250)}`);
}

async function handleGemini(request, env, headers) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400, headers); }
  const prompt = (body && body.prompt || "").toString();
  if (!prompt || prompt.length > 2000) return json({ error: "invalid prompt" }, 400, headers);
  if (!env.GEMINI_API_KEY) return json({ error: "server not configured" }, 500, headers);

  try {
    const text = await callGeminiWithFallback(env,
      [{ parts: [{ text: prompt }] }],
      { temperature: 0.4, maxOutputTokens: 300 });
    return json({ text }, 200, headers);
  } catch (e) {
    return json({ error: (e && e.message) || "gemini upstream error" }, 502, headers);
  }
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

  try {
    const text = await callGeminiWithFallback(env,
      [{
        parts: [
          { text: "Transcribe the following English speech verbatim as plain text. Output only the transcription itself — no quotes, no commentary, no formatting. If nothing intelligible is said, output nothing." },
          { inline_data: { mime_type: mimeType, data: audio } },
        ],
      }],
      { temperature: 0, maxOutputTokens: 200 },
      AUDIO_MODEL_FALLBACKS);
    return json({ text }, 200, headers);
  } catch (e) {
    return json({ error: (e && e.message) || "gemini upstream error" }, 502, headers);
  }
}

async function handleTts(request, env, headers) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "invalid json" }, 400, headers); }
  const text = (body && body.text || "").toString();
  if (!text || text.length > 500) return json({ error: "invalid text" }, 400, headers);
  if (!env.GOOGLE_TTS_KEY) return json({ error: "server not configured" }, 500, headers);

  const lang = TTS_VOICES[body && body.lang] ? body.lang : "en-US";
  const gender = (body && body.gender) === "male" ? "male" : "female";
  const voiceName = TTS_VOICES[lang][gender];
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
