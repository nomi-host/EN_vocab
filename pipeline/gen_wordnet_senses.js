#!/usr/bin/env node
/* 8000개 표제어에 대해 WordNet 의미 목록(sense inventory)을 오프라인 추출.
   출력: pipeline/wordnet_senses.json = { word: [{pos, def, syn:[...]}, ...] }
   소넷 에이전트가 다의어 분리의 "근거 구조"로 사용(누락·오분할 방지). */
const fs = require("fs");
const path = require("path");
const WordPOS = require("wordpos");
const wp = new WordPOS();
const ROOT = path.resolve(__dirname, "..");

const SEED = require("./load_seed.js")(); // 코어+청크 전체(분할 후 words.js만 읽으면 코어뿐)
const words = SEED.map(w => w.word);

const POS_KO = { n: "명사", v: "동사", a: "형용사", s: "형용사", r: "부사" };

async function run() {
  const out = {};
  let done = 0;
  for (const word of words) {
    try {
      const res = await wp.lookup(word.toLowerCase());
      // synset을 pos별로 묶고 def 간결화, 최대 12개까지만(과분할 방지 위해 상한)
      const senses = res.slice(0, 14).map(r => ({
        pos: POS_KO[r.pos] || r.pos,
        def: (r.def || "").split(";")[0].trim(),
        syn: (r.synonyms || []).filter(s => s.toLowerCase() !== word.toLowerCase()).slice(0, 4).map(s => s.replace(/_/g, " ")),
      }));
      if (senses.length) out[word.toLowerCase()] = senses;
    } catch (e) { /* skip */ }
    if (++done % 1000 === 0) console.log(`  ...${done}/${words.length}`);
  }
  const outPath = path.join(__dirname, "wordnet_senses.json");
  fs.writeFileSync(outPath, JSON.stringify(out));
  const multi = Object.values(out).filter(a => a.length > 1).length;
  console.log(`완료: ${Object.keys(out).length}개 단어 WordNet 의미 추출 (2개 이상 의미: ${multi}개) → ${path.relative(ROOT, outPath)}`);
}
run();
