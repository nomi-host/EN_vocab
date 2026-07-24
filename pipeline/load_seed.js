#!/usr/bin/env node
/* ============================================================================
   전체 SEED 로더 (2026-07-23, words.js 코어/청크 분할과 함께 도입)
   ----------------------------------------------------------------------------
   words.js는 이제 코어(A1~B2)만 담고, 나머지는 window.SEED_CHUNKS에 나열된
   JSON 청크(words_c.json 등)로 분리됐다. 파이프라인 스크립트가 words.js만
   require하면 코어만 보이므로, 전체 표제어가 필요한 스크립트는 반드시 이걸 쓸 것:
     const SEED = require("./load_seed.js")();
   (expansion/처럼 한 단계 아래면 require("../load_seed.js"))
============================================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

module.exports = function loadSeed() {
  const wordsPath = path.join(ROOT, "words.js");
  const prev = global.window;
  global.window = {};
  delete require.cache[require.resolve(wordsPath)];
  require(wordsPath);
  const seed = global.window.SEED || [];
  const chunks = global.window.SEED_CHUNKS || [];
  global.window = prev;
  for (const file of chunks) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) { console.warn(`load_seed: 청크 없음 — ${file} (코어만 반환될 수 있음)`); continue; }
    seed.push(...JSON.parse(fs.readFileSync(p, "utf8")));
  }
  return seed;
};
