/* ============================================================================
   NoEnglish — Vercel 서버리스 프록시: POST /api/stt { audio: base64, mimeType } -> { text }
   Gemini 멀티모달 오디오 전사. 배경·환경변수는 api/gemini.js 상단 주석 참고.
   Gemma는 오디오 입력을 지원하지 않아 Gemini 계열만 후보로 사용.
============================================================================ */

const { callGeminiWithFallback, setCors, isSecretValid } = require("./gemini.js");

const AUDIO_MODEL_FALLBACKS = ["gemini-3.5-flash", "gemini-3-flash", "gemini-3-flash-preview", "gemini-3-pro-preview", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(404).json({ error: "not found" });
  if (!isSecretValid(req)) return res.status(403).json({ error: "forbidden" });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "server not configured" });

  const audio = (req.body && req.body.audio || "").toString();
  const mimeType = (req.body && req.body.mimeType || "audio/webm").toString();
  if (!audio || audio.length > 4000000) return res.status(400).json({ error: "invalid audio" });

  try {
    const text = await callGeminiWithFallback(
      [{
        parts: [
          { text: "Transcribe the following English speech verbatim as plain text. Output only the transcription itself — no quotes, no commentary, no formatting. If nothing intelligible is said, output nothing." },
          { inline_data: { mime_type: mimeType, data: audio } },
        ],
      }],
      { temperature: 0, maxOutputTokens: 200 },
      AUDIO_MODEL_FALLBACKS);
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: (e && e.message) || "gemini upstream error" });
  }
};
