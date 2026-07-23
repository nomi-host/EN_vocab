#!/usr/bin/env node
/* ============================================================================
   어근(접두사·접미사) 네트워크 보강 스크립트
   ----------------------------------------------------------------------------
   입력: words.js (window.SEED), pipeline/affixes.json(자체 큐레이션 ~150개)
   출력: pipeline/cefrj/roots.json — { "word": [{affix, gloss}, ...] }
   방식: 표제어 문자열에 접두사/접미사를 위치 고정으로 매칭(순수 문자열 패턴,
         etymology-db 같은 외부 어원 DB 사용 안 함 — PLAN.md 2.1 "어근/접두·
         접미사" 항목). 어간 최소 길이(min_stem)로 오탐(예: "lion"이 "-ion"에
         잘못 걸리는 것)을 걸러낸다.
   실행: node pipeline/enrich_roots.js
         이후 node pipeline/merge_cefrj.js 로 words.js 재생성해야 반영됨.
============================================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AFFIXES = JSON.parse(fs.readFileSync(path.join(__dirname, "affixes.json"), "utf8"));

// 접사만 봐서는 오탐이 뻔한 흔한 단어들 — 최소 어간 길이로 못 거르는 예외만 개별 등재
const EXCLUDE = new Set([
  // -er/-or
  "water", "over", "under", "after", "other", "never", "ever", "her", "father", "mother", "brother", "sister", "weather", "letter", "matter", "paper", "power", "order", "answer", "finger", "summer", "winter", "corner", "dinner", "manner",
  // -al
  "animal", "final", "local", "total", "normal", "royal", "signal", "special", "hospital", "capital", "metal",
  // -ent/-ant
  "parent", "student", "different", "present", "silent", "giant", "plant", "want",
  // -ist/-ism
  "wrist", "exist", "list", "fist",
  // -ion
  "lion", "onion",
  // -ic
  "attic", "topic", "music", "magic", "panic", "picnic", "traffic", "public",
  // -ate
  "gate", "date", "rate", "plate", "state", "late", "create",
  // -age
  "cage", "page", "stage", "wage", "image",
  // -ate/-ary etc misc
  "library",
  // -ess
  "chess", "dress", "press", "guess", "less",
  // -ee (double-e coincidence, not the "받는 사람" suffix)
  "carefree", "chimpanzee", "coffee", "committee", "degree", "duty-free", "foresee", "guarantee", "oversee", "settee", "disagree", "agree", "referee", "free",
  // re- (read/real/reason 등 "re-"로 시작하지만 다시(again)와 무관한 단어)
  "reach", "read", "reader", "readable", "readily", "reading", "ready", "real", "real estate", "realism", "realist",
  "realistic", "reality", "realize", "realization", "really", "reason", "reasonable", "reasonably", "receipt",
  "recent", "recently", "reckon", "reggae", "relic", "remote", "remote control", "rental", "reptilian", "restaurant", "retina",
  // de- (dead/dear/decade 등 de-와 무관한 단어)
  "deaden", "deadline", "deadly", "dealer", "dearly", "death", "debris", "debut", "decade", "december", "decent",
  "decorate", "decoration", "decorative", "deeply", "delicacy", "delicate", "delicately", "delicatessen", "delicious",
  "delight", "delighted", "delightful", "denim", "dense", "densely", "dental", "dentist", "depth", "desktop", "dessert", "devil",
  // en-/em- (end/enemy/energy/engine/encyclopedia 등 en-과 무관한 단어)
  "encyclopedia", "ending", "endless", "endlessly", "enemy", "energetic", "energy", "engine", "engineer",
  "engineering", "englishman", "embassy",
  // ex- (exact 계열은 학습자 입장에서 분해가 어색함)
  "exact", "exactly", "exactness",
  // in- (industry, incense, increase 등 in-과 무관한 단어)
  "industry", "incense", "incentive", "increase",
  // com-/con- (comedy/comfort/common/couple/county 등 함께(com-)와 무관한 단어)
  "comedian", "comedy", "comfort", "comfortable", "comfortably", "common", "common sense", "commonly",
  "commonwealth", "commode", "commodity", "couple", "county", "coastline", "cocktail", "coconut", "cocoon",
  "coffin", "colonial", "colorful", "column", "columnist", "cooker", "cookie", "cooking",
  // either (of/either 등 -er과 무관)
  "either",
  // -or (anchor/corridor/harbor/mirror/terror 등 행위자 명사가 아닌 단어, indoor/outdoor는 "door" 합성어)
  "anchor", "corridor", "harbor", "metaphor", "mirror", "terror", "tremor", "ancestor", "indoor", "outdoor", "junior", "senior",
  // -al (appeal/conceal/reveal/cereal/spiral 등 "-al"과 무관, principal은 학습자에게 분해 의미 없음)
  "appeal", "conceal", "reveal", "cereal", "pedestal", "spiral", "dismal", "sandal", "scandal", "vandal", "carnival", "principal",
  // -ic (arctic/garlic/frolic 등 "-ic"와 무관)
  "arctic", "garlic", "frolic",
  // -ate (chocolate/frigate/accurate/private 등 "-ate"와 무관, playmate/roommate/schoolmate/teammate는 "mate" 합성어)
  "chocolate", "frigate", "accurate", "private", "appreciate", "approximate", "permeate", "elaborate",
  "playmate", "roommate", "schoolmate", "teammate", "climate", "magnate",
  // -er (shower/november/frontier는 "~하는 사람/것" 행위자 명사가 아님)
  "shower", "november", "frontier",
  // -ish (diminish는 "-ish"(형용사화)와 무관)
  "diminish",
  // ab- (about/above/aboard/ability 등 "떨어져서"라는 의미와 무관하거나 합성어로 오분석됨)
  "abandon", "ability", "aboard", "abolish", "abound", "about", "above", "abroad",
  "abhor", "abhorrent", "abhorrently", "absurd", "aboriginal", "aborigine", "abundance", "abundant", "abundantly",
  // 기타 개별 오탐
  "classmate", "fabric", "haughty",
  // 2026-07-23 어휘 20k 확장 트랙 D(사용자 수집어) 신규 단어 재검수 오탐 —
  // foster는 "fost"+"-er"(행위자 명사)가 아니라 통어근, prostitution은 "pro-"+"stitution"이
  // 아니라 라틴어 prostituere 통어근, indicative는 "in-"(부정)이 아니라 indicate+"-ive"라
  // in- 접두사 분해가 학습자에게 오히려 오해를 줌.
  "foster", "prostitution", "indicative",
]);

// 같은 위치(접두/접미)에서 텍스트상 가장 긴 접사만 후보로 삼는다 — 예: "badly"가
// 짧은 "-y"(어간 기준 통과)로 잘못 걸리고 진짜 "-ly"는 어간 길이 미달로 빠지는 일이
// 없도록, 가장 긴 매칭이 어간 길이를 통과하지 못하면 그 자리는 아예 태그하지 않는다
// (더 짧은 걸로 대체하지 않음).
function bestAt(word, type) {
  const bare = a => (type === "prefix" ? a.affix.slice(0, -1) : a.affix.slice(1));
  const textual = AFFIXES
    .filter(a => a.type === type)
    .filter(a => (type === "prefix" ? word.startsWith(bare(a)) : word.endsWith(bare(a))))
    .sort((x, y) => bare(y).length - bare(x).length);
  if (!textual.length) return null;
  const longest = textual[0];
  const b = bare(longest);
  const stemLen = word.length - b.length;
  if (stemLen < (longest.min_stem || 3)) return null;
  return { affix: longest.affix, gloss: longest.gloss };
}

function analyze(word) {
  const w = word.toLowerCase();
  if (EXCLUDE.has(w)) return [];
  if (/[\s-]/.test(w)) return []; // 복합어/구(phrase) 표제어("remote control","classical music" 등)는 마지막 단어만으로 접사 판단이 왜곡되므로 건너뜀
  const out = [];
  const p = bestAt(w, "prefix");
  const s = bestAt(w, "suffix");
  if (p) out.push(p);
  if (s) out.push(s);
  return out;
}

function main() {
  const SEED = require("./load_seed.js")(); // 코어+청크 전체(분할 후 words.js만 읽으면 코어뿐)
  console.log(`총 ${SEED.length}개 단어 처리`);

  const perWord = {};
  const affixCount = {};
  for (const item of SEED) {
    const roots = analyze(item.word);
    if (!roots.length) continue;
    perWord[item.word.toLowerCase()] = roots;
    for (const r of roots) affixCount[r.affix] = (affixCount[r.affix] || 0) + 1;
  }

  // 매칭 단어가 너무 적은(2개 이하) 접사는 사전 탭 "어근별 보기"에서 의미가 없어 제외
  const weakAffixes = new Set(Object.keys(affixCount).filter(a => affixCount[a] <= 2));
  const out = {};
  for (const [word, roots] of Object.entries(perWord)) {
    const kept = roots.filter(r => !weakAffixes.has(r.affix));
    if (kept.length) out[word] = kept;
  }

  const outPath = path.join(__dirname, "cefrj", "roots.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));

  const finalAffixCount = {};
  for (const roots of Object.values(out)) for (const r of roots) finalAffixCount[r.affix] = (finalAffixCount[r.affix] || 0) + 1;
  console.log(`완료: ${Object.keys(out).length}개 단어에 어근 태그 → ${path.relative(ROOT, outPath)}`);
  console.log(`사용된 접사 종류: ${Object.keys(finalAffixCount).length}개`);
}
main();
