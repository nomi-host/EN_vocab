/* ============================================================================
   NoEnglish — Vercel 서버리스 프록시: POST /api/tts { text, lang, rate, gender } -> audio/mpeg
   Google Cloud TTS 프록시. Gemini와 함께 백엔드를 Vercel 한 곳으로 통합(2026-07-17) —
   기존 Cloudflare Worker(noenglish-proxy)는 이 배포가 확인되면 삭제해도 됨.
   환경변수: GOOGLE_TTS_KEY(필수), APP_SHARED_SECRET(권장 — api/gemini.js 참고).
============================================================================ */

const { setCors, isSecretValid } = require("./gemini.js");

/* 예전엔 lang당 목소리 1개(전부 여성 Neural2)라, 회화 페르소나가 "중장년 남성 의사"라고 설정해도
   실제로는 여성 목소리로 나오는 버그가 있었음(2026-07-20 발견 — 실제 서빙 경로가 여기 api/tts.js였는데
   worker/src/worker.js의 구 TTS_VOICES만 고치고 이 파일을 놓치면 재발함, 주의) — 성별별로 나눔.
   gender 미지정 시 기존 동작 유지를 위해 female을 기본값으로 유지(하위 호환). */
const TTS_VOICES = {
  "en-US": { female: "en-US-Neural2-C", male: "en-US-Neural2-D" },
  "en-GB": { female: "en-GB-Neural2-A", male: "en-GB-Neural2-B" },
  "en-AU": { female: "en-AU-Neural2-A", male: "en-AU-Neural2-B" },
};

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(404).json({ error: "not found" });
  if (!isSecretValid(req)) return res.status(403).json({ error: "forbidden" });
  if (!process.env.GOOGLE_TTS_KEY) return res.status(500).json({ error: "server not configured" });

  const text = (req.body && req.body.text || "").toString();
  if (!text || text.length > 500) return res.status(400).json({ error: "invalid text" });

  const lang = TTS_VOICES[req.body && req.body.lang] ? req.body.lang : "en-US";
  const gender = (req.body && req.body.gender) === "male" ? "male" : "female";
  const voiceName = TTS_VOICES[lang][gender];
  const speakingRate = Math.max(0.25, Math.min(4.0, Number(req.body && req.body.rate) || 1.0));

  const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_KEY}`;
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
    return res.status(502).json({ error: "tts upstream error", detail: detail.slice(0, 300) });
  }
  const data = await upstream.json();
  if (!data.audioContent) return res.status(502).json({ error: "tts empty response" });

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(Buffer.from(data.audioContent, "base64"));
};
