#!/usr/bin/env node
/* 비즈니스 맥락 구동사 24개 큐 생성 — IDIOM_01~04(PHaVE List 기반)에 없는 갭만 자체 선정
   (정식 라이선스 데이터셋 없어 ESL 자료 교차 참고, docs/PLAN.md 2.4b / CLAUDE.md 참고).
   출력: pipeline/work/IDIOM_05.json — 다의어 배치와 동일 스키마({word, ko, pos, wn}),
   AGENT_INSTRUCTIONS.md 지침으로 senses_parts/IDIOM_05.json 작성 후
   gen_idiom_seed.js → merge_cefrj.js로 words.js에 편입.
   실행: node pipeline/gen_idiom05_business.js */
const fs = require("fs");
const path = require("path");
const WordPOS = require("wordpos");
const wp = new WordPOS();
const POS_KO = { n: "명사", v: "동사", a: "형용사", s: "형용사", r: "부사" };

// word, ko(현재 대표 뜻 — senses 작성 에이전트의 참고용 단일 뜻, 정교한 다의어 분리는 그쪽에서)
const ITEMS = [
  { word: "circle back", ko: "나중에 다시 논의하다" },
  { word: "touch base", ko: "짧게 연락하다, 근황을 나누다" },
  { word: "loop in", ko: "참조·논의에 포함시키다" },
  { word: "sign off", ko: "승인하다, 결재하다" },
  { word: "drill down", ko: "세부적으로 파고들다" },
  { word: "spin off", ko: "분사시키다, 파생시키다" },
  { word: "buy in", ko: "지지하다, 동의하다" },
  { word: "staff up", ko: "인력을 충원하다" },
  { word: "cash out", ko: "현금화하다" },
  { word: "bottom out", ko: "바닥을 치다, 최저점을 찍다" },
  { word: "level up", ko: "역량·수준을 끌어올리다" },
  { word: "close out", ko: "마감하다, 종료하다" },
  { word: "firm up", ko: "확정하다, 굳히다" },
  { word: "gear up", ko: "준비 태세를 갖추다" },
  { word: "lock in", ko: "확정 짓다, 고정하다" },
  { word: "map out", ko: "계획을 세밀히 짜다" },
  { word: "nail down", ko: "확정하다, 구체화하다" },
  { word: "pencil in", ko: "잠정적으로 일정을 잡다" },
  { word: "pull together", ko: "자료·팀을 한데 모으다" },
  { word: "shore up", ko: "강화하다, 보강하다" },
  { word: "size up", ko: "평가하다, 가늠하다" },
  { word: "sync up", ko: "조율하다, 맞추다" },
  { word: "walk through", ko: "단계별로 설명하다" },
  { word: "flag up", ko: "문제를 제기하다, 알리다" },
].map(x => ({ ...x, pos: ["verb"] }));

async function main() {
  const out = [];
  for (const item of ITEMS) {
    const res = await new Promise(resolve => wp.lookup(item.word, resolve));
    const wn = (res || []).filter(r => POS_KO[r.pos] === "동사").slice(0, 8).map(r => ({
      pos: POS_KO[r.pos] || r.pos,
      def: (r.def || "").split(";")[0].trim(),
      syn: (r.synonyms || []).filter(s => s.toLowerCase() !== item.word.toLowerCase()).slice(0, 4).map(s => s.replace(/_/g, " ")),
    }));
    out.push({ word: item.word, ko: item.ko, pos: item.pos, wn });
    console.log(item.word, "->", wn.length, "senses from WordNet");
  }
  const outPath = path.join(__dirname, "work", "IDIOM_05.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + "\n");
  console.log(`\n완료: ${out.length}개 → ${path.relative(path.join(__dirname, ".."), outPath)}`);
}
main();
