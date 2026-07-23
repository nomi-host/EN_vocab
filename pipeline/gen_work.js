#!/usr/bin/env node
/* 레벨별 다의어 작업 파일 생성. 각 파일 = 에이전트 1명 담당분(~150단어).
   항목: {word, ko(현재 단일 뜻), pos, wn:[WordNet 의미 목록]}.
   이미 senses가 있는 단어(파일럿·save·deliver)는 제외. */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const SEED = require("./load_seed.js")(); // 코어+청크 전체(분할 후 words.js만 읽으면 코어뿐)
const wn = JSON.parse(fs.readFileSync(path.join(__dirname, "wordnet_senses.json"), "utf8"));

const workDir = path.join(__dirname, "work");
fs.mkdirSync(workDir, { recursive: true });

const BATCH = 150;
const byLevel = {};
for (const w of SEED) {
  if (w.senses && w.senses.length) continue; // 이미 완료
  (byLevel[w.cefr] = byLevel[w.cefr] || []).push({
    word: w.word,
    ko: w.ko,
    pos: w.pos,
    wn: wn[w.word.toLowerCase()] || [],
  });
}

const summary = [];
for (const lvl of ["A1","A2","B1","B2","C1","C2"]) {
  const list = byLevel[lvl] || [];
  let n = 0;
  for (let i = 0; i < list.length; i += BATCH) {
    n++;
    const chunk = list.slice(i, i + BATCH);
    const name = `${lvl}_${String(n).padStart(2,"0")}`;
    fs.writeFileSync(path.join(workDir, name + ".json"), JSON.stringify(chunk));
  }
  summary.push(`${lvl}: ${list.length}단어 → ${n}배치`);
}
console.log(summary.join("\n"));
console.log("총 배치:", fs.readdirSync(workDir).filter(f=>f.endsWith(".json")).length);
