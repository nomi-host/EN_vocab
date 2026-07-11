#!/usr/bin/env node
/* ============================================================================
   CEFR-J 대량 시드 병합 스크립트
   ----------------------------------------------------------------------------
   입력:
     pipeline/cefrj/<LEVEL>_enriched.json   — CEFR-J(표제어+품사+CEFR) + WordNet(en·syn) 자동 추출
     pipeline/batches/<level>_batch*.json   — 직접 작성한 한국어 뜻(ko)·예문(ex) 배치
   동작: enriched 리스트를 기준으로, 배치에 ko가 있는 단어만 최종 words.js에 편입.
         (아직 작성 안 된 단어는 조용히 건너뜀 — 미완성 데이터를 앱에 노출하지 않음)
   출처: CEFR-J Wordlist(Tono Lab, TUFS) — 연구·상업 목적 무료 이용 가능(출처 표시 조건).
         WordNet 3.0(Princeton, 오프라인). 한국어 뜻·예문은 자체 작성.
   실행: node pipeline/merge_cefrj.js [출력파일]
============================================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BATCH_DIR = path.join(__dirname, "batches");
const ENRICHED_DIR = path.join(__dirname, "cefrj");

function loadAuthored() {
  const map = {};
  if (!fs.existsSync(BATCH_DIR)) return map;
  for (const f of fs.readdirSync(BATCH_DIR)) {
    if (!f.endsWith(".json")) continue;
    const items = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, f), "utf8"));
    for (const it of items) map[it.word.toLowerCase()] = it;
  }
  return map;
}

function main() {
  const authored = loadAuthored();
  const out = [];
  let enrichedCount = 0;

  if (fs.existsSync(ENRICHED_DIR)) {
    for (const f of fs.readdirSync(ENRICHED_DIR)) {
      if (!f.endsWith("_enriched.json")) continue;
      const items = JSON.parse(fs.readFileSync(path.join(ENRICHED_DIR, f), "utf8"));
      enrichedCount += items.length;
      for (const hw of items) {
        const a = authored[hw.word.toLowerCase()];
        if (!a || !a.ko) continue; // 아직 한국어 작성 안 됨 → 스킵
        const POS_ORDER = { noun: 1, verb: 2, adjective: 3, adverb: 4 };
        const pos = (hw.pos || []).filter(p => POS_ORDER[p]).sort((x, y) => POS_ORDER[x] - POS_ORDER[y]);
        out.push({
          word: hw.word,
          ipa: "",
          pos: pos.length ? pos.map(p => ({ noun: "noun", verb: "verb", adjective: "adj", adverb: "adv" }[p])) : [],
          cefr: hw.cefr,
          ko: a.ko,
          en: a.enOverride || hw.en || "",
          syn: hw.syn || [],
          ant: [],
          forms: [],
          roots: [],
          ex: [a.ex],
        });
      }
    }
  }
  out.sort((x, y) => x.word.localeCompare(y.word));

  const header =
`/* ============================================================================
   EN Vocab — 시드 데이터 (pipeline/merge_cefrj.js 자동 생성)
   생성: ${new Date().toISOString().slice(0, 10)} · 표제어 ${out.length}개 (CEFR-J 전체 후보 ${enrichedCount}개 중 작성 완료분)
   ----------------------------------------------------------------------------
   표제어/CEFR/품사 = CEFR-J Wordlist(Tono Lab, TUFS — 연구·상업 무료, 출처 표시 조건)
   영영 정의(en)/유의어(syn) = WordNet 3.0(Princeton, 오프라인 추출)
   한국어 뜻(ko)/예문(ex) = 자체 작성(LLM 갭필 단계를 세션 내 직접 수행)
   ※ 직접 수정하지 말 것 — pipeline/batches/*.json 수정 후 재빌드(node pipeline/merge_cefrj.js).
   진행 현황: pipeline/PROGRESS.md 참조.
============================================================================ */
window.SEED = `;
  const outPath = process.argv[2] || path.join(ROOT, "words.js");
  fs.writeFileSync(outPath, header + JSON.stringify(out, null, 1) + ";\n");
  console.log(`병합 완료: ${out.length}개 단어 → ${path.relative(ROOT, outPath)} (CEFR-J 후보 총 ${enrichedCount}개 중 ${(100 * out.length / (enrichedCount || 1)).toFixed(1)}% 작성)`);
}
main();
