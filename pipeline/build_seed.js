#!/usr/bin/env node
/* ============================================================================
   EN Vocab — 시드 빌드 파이프라인
   ----------------------------------------------------------------------------
   입력: pipeline/headwords.json  (사람/LLM 큐레이션분: word, cefr, ko, ipa,
                                    syn, ant, forms, roots, ex)
   보강: WordNet(오프라인, wordpos) → en(영영 정의) + pos(품사) 자동 채움
   출력: words.js  (window.SEED)

   docs/PLAN.md 2.3 "LLM 최소화 파이프라인"의 실행체:
     - 표제어/CEFR/한국어/예문 = 큐레이션(향후 NGSL+오픈사전+LLM 갭필로 대체)
     - 영영 정의/품사 = WordNet 기계 추출(무LLM)
   확장 시: headwords.json을 NGSL 표제어 + 국립국어원/위키낱말사전 병합 +
            미커버분 LLM 번역으로 자동 생성하면, 이 스크립트가 그대로 굽는다.

   실행: (프로젝트 루트에서)
     npm --prefix pipeline install    # wordpos 설치
     node pipeline/build_seed.js
============================================================================ */
const fs = require("fs");
const path = require("path");

let WordPOS;
try { WordPOS = require("wordpos"); }
catch (e) {
  // 개발 샌드박스에서는 스크래치패드 node_modules를 참조할 수 있도록 폴백
  const alt = process.env.WORDPOS_PATH;
  if (alt) WordPOS = require(alt);
  else { console.error("wordpos 미설치: `npm --prefix pipeline install` 후 실행하세요."); process.exit(1); }
}

const ROOT = path.resolve(__dirname, "..");
const headwords = JSON.parse(fs.readFileSync(path.join(__dirname, "headwords.json"), "utf8"));
const wp = new WordPOS();

const POS_MAP = { n: "noun", v: "verb", a: "adj", s: "adj", r: "adv" };

function enrich(hw) {
  return new Promise(resolve => {
    wp.lookup(hw.word, results => {
      // 품사: WordNet에 존재하는 pos들(중복 제거, 사전식 순서 noun>verb>adj>adv)
      const posSet = new Set(results.map(r => POS_MAP[r.pos]).filter(Boolean));
      const order = ["noun", "verb", "adj", "adv"];
      const pos = order.filter(p => posSet.has(p));
      // 영영 정의: 큐레이션 오버라이드(hw.en)가 있으면 우선(WordNet 첫 뜻이 다의어에서
      // 엉뚱한 의미를 고르는 경우 교정). 없으면 WordNet 첫 synset의 def.
      const en = (hw.en && hw.en.trim()) || (results.length ? results[0].def.trim() : "");
      resolve({
        word: hw.word,
        ipa: hw.ipa || "",
        pos: pos.length ? pos : (hw.pos || []),
        cefr: hw.cefr,
        ko: hw.ko,
        en,
        syn: hw.syn || [],
        ant: hw.ant || [],
        forms: hw.forms || [],
        roots: hw.roots || [],
        ex: hw.ex || [],
        _wnHits: results.length,
      });
    });
  });
}

(async () => {
  const out = [];
  let noHit = 0;
  for (const hw of headwords) {
    const e = await enrich(hw);
    if (!e._wnHits) noHit++;
    delete e._wnHits;
    out.push(e);
  }
  out.sort((a, b) => a.word.localeCompare(b.word));

  const header =
`/* ============================================================================
   EN Vocab — 시드 데이터 (pipeline/build_seed.js 자동 생성)
   생성: ${new Date().toISOString().slice(0, 10)} · 표제어 ${out.length}개
   ----------------------------------------------------------------------------
   한국어 뜻/CEFR/예문/유의어망 = 큐레이션(pipeline/headwords.json)
   영영 정의(en)/품사(pos)     = WordNet(Princeton, 오프라인 추출)
   ※ 직접 수정하지 말 것 — headwords.json 수정 후 재빌드.
   출처: WordNet 3.0 (Princeton). 한국어 데이터는 CC BY-SA 병합분 포함 예정.
============================================================================ */
window.SEED = `;
  fs.writeFileSync(path.join(ROOT, "words.js"), header + JSON.stringify(out, null, 2) + ";\n");
  console.log(`빌드 완료: ${out.length}개 표제어 → words.js (WordNet 미매칭 ${noHit}개)`);
})();
