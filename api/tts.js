/* ============================================================================
   NoEnglish — Vercel 서버리스 프록시: POST /api/tts { text, lang, rate } -> audio/mpeg
   Google Cloud TTS 프록시. Gemini와 함께 백엔드를 Vercel 한 곳으로 통합(2026-07-17) —
   기존 Cloudflare Worker(noenglish-proxy)는 이 배포가 확인되면 삭제해도 됨.
   환경변수: GOOGLE_TTS_KEY(필수), APP_SHARED_SECRET(권장 — api/gemini.js 참고).
============================================================================ */

const { setCors, isSecretValid } = require("./gemini.js");

const TTS_VOICES = {
  "en-US": "en-US-Neural2-C",
  "en-GB": "en-GB-Neural2-A",
  "en-AU": "en-AU-Neural2-A",
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
  const voiceName = TTS_VOICES[lang];
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
