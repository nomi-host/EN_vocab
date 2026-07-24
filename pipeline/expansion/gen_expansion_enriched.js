#!/usr/bin/env node
/* 트랙 A 3단계(엔리치 생성, 무LLM) — pipeline/VOCAB_20K_PLAN.md 3장.
   curation_batches_done/*.json에서 accept:true인 단어를 랭크 오름차순으로 모아
   상위 11,013개(20k 목표분)만 취해 WordNet(wordpos)으로 pos/en/syn을 기계 추출하고
   랭크 기반 근사 CEFR을 매긴다. 나머지(초과 채택분, 랭크 37,981~)는 예비로 남기고
   이번 작성 배치엔 편입하지 않는다(reserve_accepted.json에 별도 기록).
   출력:
     pipeline/cefrj/expansion_enriched.json — {word,pos,cefr,en,syn} 배열(merge_cefrj.js 입력 포맷)
     pipeline/expansion/reserve_accepted.json — 예비로 남긴 채택 단어(향후 라운드용)
     pipeline/work_expansion/EXP_NN.json — 한국어 작성 배치(150개씩, ~74배치)
   실행: node pipeline/expansion/gen_expansion_enriched.js */
const fs = require("fs");
const path = require("path");
const WordPOS = require("wordpos");
const wp = new WordPOS();
const ROOT = path.resolve(__dirname, "..", "..");
const DONE_DIR = path.join(__dirname, "curation_batches_done");

const POS_MAP = { n: "noun", v: "verb", a: "adjective", s: "adjective", r: "adverb" };
const TARGET = 11013;

function cefrForRank(rank) {
  if (rank <= 5000) return "B1";
  if (rank <= 10000) return "B2";
  if (rank <= 20000) return "C1";
  return "C2";
}

function enrichOne(word) {
  return new Promise(resolve => {
    wp.lookup(word.toLowerCase(), results => {
      if (!results || !results.length) { resolve({ pos: [], en: "", syn: [] }); return; }
      const posSet = [];
      for (const r of results) {
        const p = POS_MAP[r.pos];
        if (p && !posSet.includes(p)) posSet.push(p);
      }
      const best = results[0];
      const syn = (best.synonyms || []).filter(s => s.toLowerCase() !== word.toLowerCase()).slice(0, 4).map(s => s.replace(/_/g, " "));
      resolve({ pos: posSet, en: (best.def || "").trim(), syn });
    });
  });
}

async function main() {
  const files = fs.readdirSync(DONE_DIR).filter(f => f.endsWith(".json")).sort();
  let accepted = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(DONE_DIR, f), "utf8"));
    accepted = accepted.concat(d.filter(w => w.accept));
  }
  accepted.sort((a, b) => a.rank - b.rank);
  console.log(`전체 채택: ${accepted.length}개`);

  const take = accepted.slice(0, TARGET);
  const reserve = accepted.slice(TARGET);
  console.log(`작성 대상(이번 라운드): ${take.length}개 / 예비(다음 라운드): ${reserve.length}개`);

  const enriched = [];
  let done = 0;
  for (const item of take) {
    const e = await enrichOne(item.word);
    if (!e.pos.length) { done++; continue; } // WordNet 레마 자체가 없으면 스킵(방어적, 이론상 0건이어야 함)
    enriched.push({ word: item.word, pos: e.pos, cefr: cefrForRank(item.rank), en: e.en, syn: e.syn, rank: item.rank });
    if (++done % 1000 === 0) console.log(`  ...${done}/${take.length}`);
  }
  console.log(`enrich 완료: ${enriched.length}개 (WordNet 레마 없어 탈락: ${take.length - enriched.length}개)`);

  fs.mkdirSync(path.join(__dirname), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "reserve_accepted.json"), JSON.stringify(reserve, null, 1));

  const cefrjDir = path.join(ROOT, "pipeline", "cefrj");
  fs.writeFileSync(path.join(cefrjDir, "expansion_enriched.json"), JSON.stringify(enriched.map(({ rank, ...rest }) => rest), null, 1));

  const workDir = path.join(ROOT, "pipeline", "work_expansion");
  fs.mkdirSync(workDir, { recursive: true });
  const BATCH = 150;
  let n = 0;
  for (let i = 0; i < enriched.length; i += BATCH) {
    n++;
    const chunk = enriched.slice(i, i + BATCH).map(({ word, pos, cefr, en, syn }) => ({ word, pos, cefr, en, syn }));
    fs.writeFileSync(path.join(workDir, `EXP_${String(n).padStart(2, "0")}.json`), JSON.stringify(chunk, null, 1));
  }
  console.log(`작성 배치: ${n}개 → ${workDir}`);
}
main();
