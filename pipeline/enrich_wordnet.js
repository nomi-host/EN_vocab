#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const WordPOS = require("wordpos");
const wp = new WordPOS();

const POS_MAP = { n: "noun", v: "verb", a: "adjective", s: "adjective", r: "adverb" };

function enrich(item) {
  return new Promise(resolve => {
    wp.lookup(item.word, results => {
      const wantPos = item.pos.map(p => (p === "preposition" || p === "determiner" || p === "pronoun" || p === "conjunction" || p === "interjection" || p === "number" || p === "modal auxiliary" || p === "be-verb" || p === "infinitive-to") ? null : p).filter(Boolean);
      let best = results.find(r => wantPos.includes(POS_MAP[r.pos]));
      if (!best) best = results[0];
      if (!best) { resolve({ ...item, en: "", syn: [], exp: "" }); return; }
      const syn = (best.synonyms || []).filter(s => s.toLowerCase() !== item.word.toLowerCase()).slice(0, 4);
      const exp = (best.exp || []).find(e => e.split(" ").length >= 4) || (best.exp || [])[0] || "";
      resolve({ ...item, en: (best.def || "").trim(), syn, exp });
    });
  });
}

async function main() {
  const inPath = process.argv[2];
  const outPath = process.argv[3];
  const items = JSON.parse(fs.readFileSync(inPath, "utf8"));
  const out = [];
  for (const item of items) {
    out.push(await enrich(item));
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
  console.log(`enriched ${out.length} -> ${outPath}`);
}
main();
