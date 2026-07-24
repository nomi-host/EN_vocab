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
         WordNet 3.0(Princeton, 오프라인). 발음기호(ipa)는 CMUdict(오프라인, ISC 라이선스,
         ARPABET→IPA 변환은 pipeline/ipa.js). 한국어 뜻·예문은 자체 작성.
   실행: node pipeline/merge_cefrj.js [출력파일]
============================================================================ */
const fs = require("fs");
const path = require("path");
const { ipaFor } = require("./ipa.js");

const ROOT = path.resolve(__dirname, "..");
const BATCH_DIR = path.join(__dirname, "batches");
const ENRICHED_DIR = path.join(__dirname, "cefrj");
const NETWORK_PATH = path.join(__dirname, "cefrj", "network.json");
const ROOTS_PATH = path.join(__dirname, "cefrj", "roots.json");
const SENSES_DIR = path.join(__dirname, "senses_parts");

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

function loadNetwork() {
  if (!fs.existsSync(NETWORK_PATH)) return {};
  return JSON.parse(fs.readFileSync(NETWORK_PATH, "utf8"));
}

function loadRoots() {
  if (!fs.existsSync(ROOTS_PATH)) return {};
  return JSON.parse(fs.readFileSync(ROOTS_PATH, "utf8"));
}

// senses_parts/ 안의 모든 *.json을 병합. 레벨별 소넷 에이전트가 각자 별도 파일에
// 써서 병렬 충돌을 피하고, 여기서 하나로 합친다. 같은 단어가 겹치면 나중 파일이 우선.
function loadSenses() {
  const map = {};
  if (!fs.existsSync(SENSES_DIR)) return map;
  for (const f of fs.readdirSync(SENSES_DIR).sort()) {
    if (!f.endsWith(".json")) continue;
    const part = JSON.parse(fs.readFileSync(path.join(SENSES_DIR, f), "utf8"));
    for (const [k, v] of Object.entries(part)) map[k.toLowerCase()] = v;
  }
  return map;
}

const LEVEL_ORDER = ["a1", "a2", "b1", "b2", "c1", "c2"];

function main() {
  const authored = loadAuthored();
  const network = loadNetwork();
  const roots = loadRoots();
  const sensesData = loadSenses();
  const byWord = new Map(); // lowercased word -> output entry (first/lowest level wins)
  let enrichedCount = 0;

  if (fs.existsSync(ENRICHED_DIR)) {
    const files = fs.readdirSync(ENRICHED_DIR)
      .filter(f => f.endsWith("_enriched.json"))
      .sort((x, y) => {
        const ix = LEVEL_ORDER.indexOf(x.split("_")[0]);
        const iy = LEVEL_ORDER.indexOf(y.split("_")[0]);
        return (ix === -1 ? 99 : ix) - (iy === -1 ? 99 : iy);
      });
    for (const f of files) {
      const items = JSON.parse(fs.readFileSync(path.join(ENRICHED_DIR, f), "utf8"));
      enrichedCount += items.length;
      for (const hw of items) {
        const key = hw.word.toLowerCase();
        const a = authored[key];
        if (!a || !a.ko) continue; // 아직 한국어 작성 안 됨 → 스킵
        const POS_ORDER = { noun: 1, verb: 2, adjective: 3, adverb: 4 };
        const pos = (hw.pos || []).filter(p => POS_ORDER[p]).sort((x, y) => POS_ORDER[x] - POS_ORDER[y]);
        const posTags = pos.map(p => ({ noun: "noun", verb: "verb", adjective: "adj", adverb: "adv" }[p]));

        const existing = byWord.get(key);
        if (existing) {
          // 같은 단어가 여러 레벨 표제어 목록에 등장 — 최초(최저 레벨) 항목을 유지하고 품사만 합침
          for (const p of posTags) if (!existing.pos.includes(p)) existing.pos.push(p);
          continue;
        }

        const net = network[key];
        const entry = {
          word: hw.word,
          ipa: ipaFor(hw.word),
          pos: posTags,
          cefr: hw.cefr,
          ko: a.ko,
          en: a.enOverride || hw.en || "",
          syn: hw.syn || [],
          ant: (net && net.ant) || [],
          forms: (net && net.forms) || [],
          roots: roots[key] || [],
          ex: [a.ex],
        };
        if (sensesData[key] && sensesData[key].length) entry.senses = sensesData[key];
        else if (a.senses && a.senses.length) entry.senses = a.senses;
        byWord.set(key, entry);
      }
    }
  }
  const out = Array.from(byWord.values());
  out.sort((x, y) => x.word.localeCompare(y.word));

  // 코어/청크 분할(2026-07-23, pipeline/VOCAB_20K_PLAN.md 5장) — words.js는 코어(A1~B2)만
  // 동기 로드하고, 나머지(C1·C2, 향후 20k 확장분)는 JSON 청크로 분리해 앱이 비동기로 합류시킨다.
  // 청크 목록은 words.js 끝의 window.SEED_CHUNKS 매니페스트로 전달 — 청크를 늘릴 때
  // index.html 수정이 필요 없게. 파이프라인 스크립트는 pipeline/load_seed.js로 전체를 읽을 것.
  const CORE_LEVELS = new Set(["A1", "A2", "B1", "B2"]);
  const core = out.filter(w => CORE_LEVELS.has(w.cefr));
  const ext = out.filter(w => !CORE_LEVELS.has(w.cefr));
  const CHUNKS = ext.length ? [{ file: "words_c.json", words: ext }] : [];

  const header =
`/* ============================================================================
   EN Vocab — 시드 데이터 (pipeline/merge_cefrj.js 자동 생성)
   생성: ${new Date().toISOString().slice(0, 10)} · 표제어 총 ${out.length}개 (CEFR-J 전체 후보 ${enrichedCount}개 중 작성 완료분)
   이 파일 = 코어(A1~B2) ${core.length}개 · 지연 로드 청크(${CHUNKS.map(c => c.file).join(", ") || "없음"}) ${ext.length}개
   ----------------------------------------------------------------------------
   표제어/CEFR/품사 = CEFR-J Wordlist(Tono Lab, TUFS — 연구·상업 무료, 출처 표시 조건)
   영영 정의(en)/유의어(syn)/반의어(ant)/파생어(forms) = WordNet 3.0(Princeton, 오프라인 추출)
   발음기호(ipa) = CMUdict(오프라인, ARPABET→IPA 변환, pipeline/ipa.js) — 사전에 없는 단어는 빈 문자열
   한국어 뜻(ko)/예문(ex) = 자체 작성(LLM 갭필 단계를 세션 내 직접 수행)
   ※ 직접 수정하지 말 것 — pipeline/batches/*.json 수정 후 재빌드(node pipeline/merge_cefrj.js).
   ※ 전체 표제어 = 이 파일 + window.SEED_CHUNKS의 JSON 청크. 스크립트에서 전체가 필요하면
     pipeline/load_seed.js 사용(words.js만 require하면 코어만 나옴).
   진행 현황: pipeline/PROGRESS.md 참조.
============================================================================ */
window.SEED = `;
  const outPath = process.argv[2] || path.join(ROOT, "words.js");
  const manifest = `;\nwindow.SEED_CHUNKS = ${JSON.stringify(CHUNKS.map(c => c.file))};\n`;
  fs.writeFileSync(outPath, header + JSON.stringify(core, null, 1) + manifest);
  const outDir = path.dirname(outPath);
  for (const c of CHUNKS) fs.writeFileSync(path.join(outDir, c.file), JSON.stringify(c.words, null, 1));
  console.log(`병합 완료: 총 ${out.length}개 (코어 ${core.length} → ${path.relative(ROOT, outPath)}, 청크 ${ext.length} → ${CHUNKS.map(c => c.file).join(", ") || "없음"}) — CEFR-J 후보 총 ${enrichedCount}개 중 ${(100 * out.length / (enrichedCount || 1)).toFixed(1)}% 작성`);
}
main();
