#!/usr/bin/env node
/* ============================================================================
   sense 갭 실측 스크립트 (VOCAB_20K_PLAN.md 트랙 B의 측정 단계)
   ----------------------------------------------------------------------------
   기존 words.js 표제어를 WordNet index.{noun,verb,adj,adv}와 대조해
   "실제 영어에서 쓰이는데 우리 사전에 뜻이 없는 품사"를 찾는다.
   - 엄격(tagCnt>=1): SemCor 코퍼스에 실제 태깅된 품사가 통째로 빠짐 → 우선 작업 대상
   - 느슨(tag무관):   WordNet에 그 품사 항목이 있으나 코퍼스 출현 0 → LLM 큐레이션 필요
     (summer(동사)·transient(명사)가 이 층에 있음 — tagCnt=0이라도 드라마/뉴스 어휘 다수)
   출력: pipeline/expansion/pos_gap.json      — 품사 갭(엄격) 단어 목록
         pipeline/expansion/pos_gap_loose.json — 품사 갭(느슨) 단어 목록
         pipeline/expansion/sense_cnt_gap.json — 뜻 개수 갭(참고 지표)
   실행: node pipeline/expansion/measure_sense_gap.js
============================================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const DICT = path.join(ROOT, "pipeline", "node_modules", "wordnet-db", "dict");
const SEED = require("../load_seed.js")(); // 코어+청크 전체

const POS_FILES = { noun: "index.noun", verb: "index.verb", adj: "index.adj", adv: "index.adv" };
// WordNet index 행: lemma pos synset_cnt p_cnt [ptr...] sense_cnt tagsense_cnt offsets...
const wn = {};
for (const [pos, file] of Object.entries(POS_FILES)) {
  for (const line of fs.readFileSync(path.join(DICT, file), "utf8").split("\n")) {
    if (line.startsWith(" ") || !line.trim()) continue;
    const t = line.trim().split(/\s+/);
    const pCnt = parseInt(t[3], 10);
    (wn[t[0]] = wn[t[0]] || {})[pos] = { senseCnt: parseInt(t[4 + pCnt], 10), tagCnt: parseInt(t[5 + pCnt], 10) };
  }
}

const KO2POS = { "명사": "noun", "동사": "verb", "형용사": "adj", "부사": "adv" };
const strict = [], loose = [], senseGap = [];
for (const w of SEED) {
  const entry = wn[w.word.toLowerCase().replace(/ /g, "_")];
  if (!entry) continue;
  const ours = new Set(w.pos || []);
  for (const s of w.senses || []) { const p = KO2POS[s.pos]; if (p) ours.add(p); }
  if (!ours.size) continue; // 순수 기능어(pos 비어있음)는 제외
  const missStrict = [], missLoose = [];
  for (const [pos, info] of Object.entries(entry)) {
    if (ours.has(pos)) continue;
    (info.tagCnt >= 1 ? missStrict : missLoose).push({ pos, tagCnt: info.tagCnt, senseCnt: info.senseCnt });
  }
  if (missStrict.length) strict.push({ word: w.word, cefr: w.cefr, have: [...ours], missing: missStrict });
  if (missLoose.length) loose.push({ word: w.word, cefr: w.cefr, have: [...ours], missing: missLoose });
  const totalTagged = Object.values(entry).reduce((a, b) => a + b.tagCnt, 0);
  const oursSenses = (w.senses || []).length || 1;
  if (totalTagged >= oursSenses + 2) senseGap.push({ word: w.word, cefr: w.cefr, ours: oursSenses, wnTagged: totalTagged });
}

fs.writeFileSync(path.join(__dirname, "pos_gap.json"), JSON.stringify(strict, null, 1));
fs.writeFileSync(path.join(__dirname, "pos_gap_loose.json"), JSON.stringify(loose, null, 1));
fs.writeFileSync(path.join(__dirname, "sense_cnt_gap.json"), JSON.stringify(senseGap, null, 1));
console.log(`품사 갭(엄격, tagCnt>=1): ${strict.length}단어 / (느슨, tag무관): ${loose.length}단어 / 뜻 개수 갭(참고): ${senseGap.length}단어`);
