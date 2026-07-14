#!/usr/bin/env node
/* ============================================================================
   숙어·구동사 시드 편입 생성기
   ----------------------------------------------------------------------------
   입력: pipeline/work/IDIOM_*.json      — 큐레이션 251개(word/ko/pos) + WordNet 의미(wn)
         pipeline/senses_parts/IDIOM_*.json — 에이전트가 작성한 senses(뜻/예문/cefr)
   출력: pipeline/cefrj/idiom_enriched.json — merge_cefrj.js가 읽는 enriched 형식
         pipeline/batches/idiom_batch01.json — merge가 요구하는 authored(ko·ex) 형식
   ※ CEFR-J 원본에 없는 구동사(give up 등)를 표제어로 추가하기 위한 브리지.
      유의어(syn)는 WordNet wn에서 추출(전 의미 합집합, 8개 상한).
      대표 cefr = 첫 sense의 cefr(가장 흔한 뜻 기준). 실행: node pipeline/gen_idiom_seed.js
============================================================================ */
const fs = require("fs");
const path = require("path");

const workDir = path.join(__dirname, "work");
const sensesDir = path.join(__dirname, "senses_parts");

const items = [];
for (const f of fs.readdirSync(workDir).filter(f => /^IDIOM_\d+\.json$/.test(f)).sort()) {
  items.push(...JSON.parse(fs.readFileSync(path.join(workDir, f), "utf8")));
}
const senses = {};
for (const f of fs.readdirSync(sensesDir).filter(f => /^IDIOM_\d+\.json$/.test(f)).sort()) {
  Object.assign(senses, JSON.parse(fs.readFileSync(path.join(sensesDir, f), "utf8")));
}

const enriched = [];
const authored = [];
let missing = 0;
for (const it of items) {
  const key = it.word.toLowerCase();
  const ss = senses[key];
  if (!ss || !ss.length || !(ss[0].ex || []).length) { missing++; console.warn("senses/예문 없음, 건너뜀:", key); continue; }
  // 유의어: 의미별 라운드로빈으로 골고루 채집(한 의미의 syn이 상한을 독식하지 않게 —
  // give up처럼 첫 synset이 희귀 의미(forfeit류)면 흔한 의미의 surrender가 잘리는 문제 방지), 8개 상한
  const syn = [];
  const lists = (it.wn || []).map(w => (w.syn || []).slice());
  for (let round = 0; syn.length < 8 && lists.some(l => l.length); round++) {
    for (const l of lists) {
      if (!l.length || syn.length >= 8) continue;
      const s = l.shift();
      const c = s.toLowerCase();
      if (c !== key && !syn.includes(s)) syn.push(s);
    }
  }
  enriched.push({ word: it.word, pos: it.pos && it.pos.length ? it.pos : ["verb"], cefr: ss[0].cefr || "B1", en: ss[0].en || "", syn });
  authored.push({ word: it.word, ko: ss[0].ko, ex: ss[0].ex[0] });
}

fs.writeFileSync(path.join(__dirname, "cefrj", "idiom_enriched.json"), JSON.stringify(enriched, null, 1));
fs.writeFileSync(path.join(__dirname, "batches", "idiom_batch01.json"), JSON.stringify(authored, null, 1));
console.log(`숙어 편입 생성: ${enriched.length}개 (누락 ${missing}) → cefrj/idiom_enriched.json + batches/idiom_batch01.json`);
