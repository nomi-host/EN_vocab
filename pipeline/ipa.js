/* ARPABET(CMUdict) → IPA 변환. CMUdict는 오프라인·무료(공개 도메인급 라이선스,
   cmu-pronouncing-dictionary npm 패키지, ISC). 표준 General American 대응표 사용.
   1음절 이상 다단어 표제어(구동사 등)는 단어별로 조회해 공백으로 이어붙임. */
const { dictionary } = require("cmu-pronouncing-dictionary");

const VOWEL = {
  AA: "ɑ", AE: "æ", AH: "ʌ", AO: "ɔ", AW: "aʊ", AY: "aɪ",
  EH: "ɛ", ER: "ɝ", EY: "eɪ", IH: "ɪ", IY: "i", OW: "oʊ",
  OY: "ɔɪ", UH: "ʊ", UW: "u",
};
const CONSONANT = {
  B: "b", CH: "tʃ", D: "d", DH: "ð", F: "f", G: "ɡ", HH: "h",
  JH: "dʒ", K: "k", L: "l", M: "m", N: "n", NG: "ŋ", P: "p",
  R: "r", S: "s", SH: "ʃ", T: "t", TH: "θ", V: "v", W: "w",
  Y: "j", Z: "z", ZH: "ʒ",
};

/* 한 단어(공백 없음)의 ARPABET 문자열 → IPA. 1차 강세 음절 앞에 ˈ.
   강세 없는(0) AH/ER는 관용적으로 슈와(ə)/ɚ로 구분 표기. */
function oneWordIpa(arpabet) {
  const phones = arpabet.split(" ");
  let out = "";
  for (const p of phones) {
    const stress = p.match(/[012]$/);
    const base = stress ? p.slice(0, -1) : p;
    const unstressed = stress && stress[0] === "0";
    if (VOWEL[base]) {
      if (stress && stress[0] === "1") out += "ˈ";
      if (base === "AH" && unstressed) out += "ə";
      else if (base === "ER" && unstressed) out += "ɚ";
      else out += VOWEL[base];
    } else if (CONSONANT[base]) {
      out += CONSONANT[base];
    }
  }
  return out;
}

/* 표제어(다단어 가능) → IPA 문자열("/.../" 없이 순수 기호만). 사전에 없으면 "" */
function ipaFor(word) {
  const parts = word.toLowerCase().split(/\s+/);
  const ipas = [];
  for (const p of parts) {
    const arpabet = dictionary[p];
    if (!arpabet) return ""; // 하나라도 못 찾으면 전체를 비움(부분 표기 방지)
    ipas.push(oneWordIpa(arpabet));
  }
  return ipas.join(" ");
}

module.exports = { ipaFor };
