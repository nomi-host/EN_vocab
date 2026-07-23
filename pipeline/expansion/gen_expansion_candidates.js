#!/usr/bin/env node
/* ============================================================================
   표제어 확장 후보 생성 스크립트 (VOCAB_20K_PLAN.md 트랙 A의 후보 추출 단계)
   ----------------------------------------------------------------------------
   소스: SUBTLEX-US 구어(자막) 빈도 74,286어 (npm subtlex-word-frequencies —
         pipeline/package.json dependencies에 포함, 세션 훅이 자동 설치)
   필터: ① 소문자 형태만(고유명사 제외) ② WordNet 레마 존재(굴절형·비표준 제외)
         ③ 기존 SEED 미보유 ④ 원형이 SEED에 있는 규칙 굴절형 제외
   출력: pipeline/expansion/candidates.json — 빈도 랭크 순 신규 후보
         (밴드별로 묶음. 이 목록은 "기계 필터 통과분"일 뿐이며, 남은 노이즈
         — 파생형·비속어·영국철자 — 는 LLM 큐레이션 배치가 걸러낸다.)
   실행: node pipeline/expansion/gen_expansion_candidates.js
============================================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const SUB = require("subtlex-word-frequencies");
const DICT = path.join(ROOT, "pipeline", "node_modules", "wordnet-db", "dict");
const SEED = require("../load_seed.js")(); // 코어+청크 전체
const have = new Set(SEED.map(w => w.word.toLowerCase()));

const wnLemma = new Set();
for (const f of ["index.noun", "index.verb", "index.adj", "index.adv"]) {
  for (const line of fs.readFileSync(path.join(DICT, f), "utf8").split("\n")) {
    if (line.startsWith(" ") || !line.trim()) continue;
    wnLemma.add(line.split(/\s+/)[0]);
  }
}

// 원형이 이미 SEED에 있는 규칙 굴절형(복수·과거·진행·비교급·부사화)은 신규 표제어로 안 잡음
function isInflectionOfHave(w) {
  const c = [];
  if (w.endsWith("ies")) c.push(w.slice(0, -3) + "y");
  if (w.endsWith("es")) c.push(w.slice(0, -2));
  if (w.endsWith("s")) c.push(w.slice(0, -1));
  if (w.endsWith("ed")) c.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith("ing")) c.push(w.slice(0, -3), w.slice(0, -3) + "e");
  if (w.endsWith("er")) c.push(w.slice(0, -2));
  if (w.endsWith("est")) c.push(w.slice(0, -3));
  if (w.endsWith("ly")) c.push(w.slice(0, -2));
  return c.some(x => have.has(x));
}

const BANDS = [[0, 5000], [5000, 10000], [10000, 15000], [15000, 20000], [20000, 30000], [30000, 45000], [45000, 75000]];
const out = BANDS.map(b => ({ range: b, words: [] }));
let rank = 0;
for (const { word } of SUB) {
  rank++;
  if (word !== word.toLowerCase()) continue;
  if (!/^[a-z][a-z'-]*$/.test(word)) continue;
  if (have.has(word)) continue;
  if (!wnLemma.has(word)) continue;
  if (isInflectionOfHave(word)) continue;
  const bi = BANDS.findIndex(([a, b]) => rank > a && rank <= b);
  if (bi >= 0) out[bi].words.push({ word, rank });
}

fs.writeFileSync(path.join(__dirname, "candidates.json"), JSON.stringify(out, null, 1));
let cum = 0;
for (const b of out) { cum += b.words.length; console.log(`rank ${String(b.range[0]).padStart(5)}~${String(b.range[1]).padEnd(5)}: 신규 ${String(b.words.length).padStart(5)} | 누적 ${String(cum).padStart(5)} | 총 표제어 ${SEED.length + cum}`); }
