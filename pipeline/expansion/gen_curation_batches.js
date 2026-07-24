#!/usr/bin/env node
/* 트랙 A 2단계(큐레이션) 배치 생성 — pipeline/VOCAB_20K_PLAN.md 3장.
   candidates.json의 rank<=45000 버킷(누적 14,085개, 채택 목표 +11,013 커버 풀)을
   랭크 순서 그대로 ~500개씩 잘라 curation_batches/CUR_NN.json으로 출력.
   45k~74k 버킷(8,612개)은 이번 1차엔 포함 안 함 — 채택분이 11,013에 못 미치면
   그때 추가 배치(CUR_30~)로 생성.
   실행: node pipeline/expansion/gen_curation_batches.js */
const fs = require("fs");
const path = require("path");
const candidates = JSON.parse(fs.readFileSync(path.join(__dirname, "candidates.json"), "utf8"));

const primary = candidates.filter(b => b.range[1] <= 45000);
const words = [];
for (const bucket of primary) for (const w of bucket.words) words.push(w);
words.sort((a, b) => a.rank - b.rank);

const outDir = path.join(__dirname, "curation_batches");
fs.mkdirSync(outDir, { recursive: true });
const BATCH = 500;
let n = 0;
for (let i = 0; i < words.length; i += BATCH) {
  n++;
  fs.writeFileSync(path.join(outDir, `CUR_${String(n).padStart(2, "0")}.json`), JSON.stringify(words.slice(i, i + BATCH), null, 1));
}
console.log(`큐레이션 대상: ${words.length}개(rank<=45000) → ${n}배치 (${outDir})`);
