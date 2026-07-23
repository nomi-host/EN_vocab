#!/usr/bin/env node
/* ============================================================================
   단어 네트워크(반의어·파생어) 보강 스크립트
   ----------------------------------------------------------------------------
   입력: words.js (window.SEED) — 이미 병합된 단어별 word/pos
   출력: pipeline/cefrj/network.json — { "word": { ant: [...], forms: [{word,pos}] } }
   방식: WordNet 3.0 원시 포인터(! = 반의어, + = 파생 관련 형태)를 각 synset에서
         읽어 대상 synset의 표제어로 역참조. 순수 오프라인 추출, LLM 불필요.
   실행: node pipeline/enrich_network.js
         이후 node pipeline/merge_cefrj.js 로 words.js 재생성해야 반영됨.
============================================================================ */
const fs = require("fs");
const path = require("path");
const WordPOS = require("wordpos");
const wp = new WordPOS();

const ROOT = path.resolve(__dirname, "..");

const POS_MAP = { n: "noun", v: "verb", a: "adj", s: "adj", r: "adv" };
const DATA_KEY = { n: "nounData", v: "verbData", a: "adjData", s: "adjData", r: "advData" };
// 우리 words.js의 pos 표기(noun/verb/adj/adv) -> WordNet 결과의 pos(single letter) 비교용
const OUR_POS_TO_WN = { noun: "n", verb: "v", adj: "a", adv: "r" };

function lookupWord(word) {
  return new Promise(resolve => wp.lookup(word, results => resolve(results || [])));
}
function lookupOffset(posChar, offset) {
  const key = DATA_KEY[posChar];
  return new Promise(resolve => wp[key].lookup(offset, (err, res) => resolve(err ? null : res)));
}

function pickBest(results, ourPos) {
  // wp.lookup()이 4개 POS 조회를 동시에(Promise.all) 실행하므로 results 배열 순서가
  // 실행마다 달라질 수 있음 — ourPos(우리 표제어의 품사 우선순위)를 기준으로 직접 순회해
  // 항상 같은 의미를 고르도록 결정론적으로 처리.
  const order = (ourPos || []).map(p => OUR_POS_TO_WN[p]).filter(Boolean);
  for (const wn of order) {
    const match = results.find(r => r.pos === wn || (wn === "a" && r.pos === "s"));
    if (match) return match;
  }
  return results[0] || null;
}

async function resolvePointers(best, symbol, word) {
  const out = []; // {word, pos(display)}
  const seen = new Set();
  // best.synonyms는 한 synset 안의 동의어 묶음(예: ["large","big"]) — 어휘 특정 포인터는
  // "이 synset의 몇 번째 단어"에서 나온 관계인지를 sourceTarget 앞 2자리로 표시하므로,
  // 우리 표제어 자신의 인덱스와 다르면(=다른 동의어 쪽 관계) 건너뛰어야 함.
  const ownIdx = (best.synonyms || []).findIndex(s => s.toLowerCase() === word.toLowerCase());
  for (const p of best.ptrs || []) {
    if (p.pointerSymbol !== symbol) continue;
    if (p.sourceTarget === "0000") continue; // 어휘 특정 관계가 아니면(전체 synset 관계) 스킵
    const sourceIdx = parseInt(p.sourceTarget.slice(0, 2), 16) - 1;
    if (ownIdx !== -1 && sourceIdx !== ownIdx) continue; // 같은 synset의 다른 동의어에 대한 관계는 제외
    const target = await lookupOffset(p.pos, p.synsetOffset);
    if (!target || !target.synonyms || !target.synonyms.length) continue;
    const targetIdx = parseInt(p.sourceTarget.slice(2, 4), 16) - 1;
    const raw = target.synonyms[targetIdx] ?? target.synonyms[0];
    const w = raw.replace(/_/g, " ");
    if (w.toLowerCase() === word.toLowerCase()) continue;
    const key = w.toLowerCase() + "|" + p.pos;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ word: w, pos: POS_MAP[p.pos] || p.pos });
  }
  return out;
}

async function enrichWord(item) {
  const results = await lookupWord(item.word);
  if (!results.length) return null;
  const best = pickBest(results, item.pos);
  if (!best) return null;

  const antForms = await resolvePointers(best, "!", item.word);
  const derivForms = await resolvePointers(best, "+", item.word);

  const ant = antForms.map(a => a.word).slice(0, 4);
  const forms = derivForms.filter(f => f.word.toLowerCase() !== item.word.toLowerCase()).slice(0, 6);

  if (!ant.length && !forms.length) return null;
  return { ant, forms };
}

async function main() {
  const SEED = require("./load_seed.js")(); // 코어+청크 전체(분할 후 words.js만 읽으면 코어뿐)
  console.log(`총 ${SEED.length}개 단어 처리 시작`);

  const out = {};
  let done = 0;
  const CONCURRENCY = 24;
  let idx = 0;
  async function worker() {
    while (idx < SEED.length) {
      const i = idx++;
      const item = SEED[i];
      try {
        const res = await enrichWord(item);
        if (res) out[item.word.toLowerCase()] = res;
      } catch (e) { /* 개별 단어 실패는 스킵 */ }
      done++;
      if (done % 500 === 0) console.log(`  ${done}/${SEED.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const outPath = path.join(__dirname, "cefrj", "network.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
  console.log(`완료: ${Object.keys(out).length}개 단어에 반의어/파생어 데이터 → ${path.relative(ROOT, outPath)}`);
}
main();
