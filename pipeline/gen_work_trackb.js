#!/usr/bin/env node
/* 트랙 B(기존 단어 sense 갭) 작업 파일 생성 — pipeline/VOCAB_20K_PLAN.md 3장.
   pos_gap.json(품사 갭 엄격, 589단어)의 각 단어에 대해:
   - 기존 senses[](있으면) 또는 flat ko/en/ex(없으면)를 "existing"으로 보존 전달
   - wordnet_senses.json에서 "missing"에 해당하는 품사(한국어)만 골라 wn 근거로 전달
   출력: pipeline/work_trackb/TRACKB_NN.json = [{word, cefr, existingPos, existing:[senseObj...] 또는 null,
         existingFlat:{ko,en,ex} (existing이 null일 때만), missingPosKo:[...], wn:[{pos,def,syn}]}]
   에이전트는 이 existing을 절대 삭제/축소하지 않고, 새 sense를 더해 senses_parts/TRACKB_NN.json에
   "완성된 전체 배열"을 써야 한다(TRACKB_AGENT_INSTRUCTIONS.md 참고). */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const SEED = require("./load_seed.js")();
const wn = JSON.parse(fs.readFileSync(path.join(__dirname, "wordnet_senses.json"), "utf8"));
const posGap = JSON.parse(fs.readFileSync(path.join(__dirname, "expansion", "pos_gap.json"), "utf8"));

const POS_EN2KO = { noun: "명사", verb: "동사", adj: "형용사", adv: "부사" };
const byWord = new Map(SEED.map(w => [w.word.toLowerCase(), w]));

const items = [];
for (const gap of posGap) {
  const key = gap.word.toLowerCase();
  const w = byWord.get(key);
  if (!w) continue; // 방어적: SEED에 없으면 스킵(있을 수 없음)
  const missingPosKo = gap.missing.map(m => POS_EN2KO[m.pos]).filter(Boolean);
  if (!missingPosKo.length) continue;
  const wnCandidates = (wn[key] || []).filter(s => missingPosKo.includes(s.pos));

  const item = {
    word: w.word,
    cefr: w.cefr,
    missingPosKo,
    wn: wnCandidates,
  };
  if (w.senses && w.senses.length) {
    item.existing = w.senses;
  } else {
    item.existingFlat = { pos: w.pos, ko: w.ko, en: w.en, ex: w.ex };
  }
  items.push(item);
}

const workDir = path.join(__dirname, "work_trackb");
fs.mkdirSync(workDir, { recursive: true });
const BATCH = 150;
let n = 0;
for (let i = 0; i < items.length; i += BATCH) {
  n++;
  const chunk = items.slice(i, i + BATCH);
  fs.writeFileSync(path.join(workDir, `TRACKB_${String(n).padStart(2, "0")}.json`), JSON.stringify(chunk, null, 1));
}
console.log(`트랙 B 작업 파일: ${items.length}단어(wn 후보 0건인 항목 ${items.filter(i=>!i.wn.length).length}개 포함) → ${n}배치 (${workDir})`);
