#!/usr/bin/env node
/* ============================================================================
   문법 태그 마스터 병합 스크립트 (docs/PLAN.md 2.5절)
   ----------------------------------------------------------------------------
   입력: pipeline/grammar_tags_parts/*.json (00_pilot + G01~G04, 에이전트별 분할)
   동작: 전부 합쳐 pipeline/grammar_tags.json(소스 오브 트루스, 사람이 보는 참고용)과
         루트 grammar_tags.js(실제 서빙되는 에셋 — words.js와 동일 패턴, window.GRAMMAR_TAGS
         전역 변수로 즉시 로드)를 같이 생성한다.
   ※ 직접 수정하지 말 것 — pipeline/grammar_tags_parts/*.json 수정 후 재빌드.
   실행: node pipeline/merge_grammar.js
============================================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(__dirname, "grammar_tags_parts");
const JSON_OUT = path.join(__dirname, "grammar_tags.json");
const JS_OUT = path.join(ROOT, "grammar_tags.js");

const merged = {};
let count = 0;
for (const f of fs.readdirSync(DIR).sort()) {
  if (!f.endsWith(".json")) continue;
  const part = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  for (const [id, item] of Object.entries(part)) {
    if (!item.category || !item.name_kr || !item.desc_kr || !item.example) {
      throw new Error(`${f}: ${id} 항목 스키마 불완전`);
    }
    if (merged[id]) throw new Error(`중복 id: ${id} (${f})`);
    merged[id] = item;
    count++;
  }
}

fs.writeFileSync(JSON_OUT, JSON.stringify(merged, null, 1) + "\n");

const header = `/* 문법 태그 마스터 데이터 (docs/PLAN.md 2.5절) — 자동 생성, 직접 수정 금지.
   소스: pipeline/grammar_tags_parts/*.json. 재빌드: node pipeline/merge_grammar.js */
window.GRAMMAR_TAGS = `;
fs.writeFileSync(JS_OUT, header + JSON.stringify(merged, null, 1) + ";\n");

console.log(`병합 완료 — ${count}개 항목 → pipeline/grammar_tags.json, grammar_tags.js`);
const cats = {};
Object.values(merged).forEach(x => { cats[x.category] = (cats[x.category] || 0) + 1; });
console.log("카테고리별:", cats);
