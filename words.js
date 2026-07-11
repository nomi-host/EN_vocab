/* ============================================================================
   EN Vocab — 시드 데이터 (초안 / 스키마 확정용)
   ----------------------------------------------------------------------------
   실제 데이터는 파이프라인(docs/PLAN.md 2.3)이 채운다:
     표제어/레벨 = NGSL·Oxford / 뜻(ko) = 오픈 사전 3종 병합 + LLM 갭필
     예문 = Tatoeba / 유의어·반의어·파생 = WordNet / 어원·어근 = etymology-db
   여기서는 스키마와 화면 검증용으로 소수만 손으로 채워둔다.

   필드:
     word      표제어
     ipa       발음기호
     pos       품사(배열)
     cefr      A1|A2|B1|B2|C1
     ko        한국어 뜻(간략)
     en        영영 뜻(간략)
     syn/ant   유의어/반의어(표제어 문자열 배열)
     forms     같은 어근의 다른 품사 파생 [{word,pos}]
     roots     어근/접사 [{affix,gloss}]
     ex        예문 [{en, ko}]
   출처 표기: 뜻/예문 일부는 CC BY-SA(위키낱말사전·국립국어원)·CC BY(Tatoeba).
============================================================================ */
window.SEED = [
  {
    word: "alert", ipa: "/əˈlɜːrt/", pos: ["adj", "verb", "noun"], cefr: "B1",
    ko: "경계하는; 기민한 · (동) 알리다 · (명) 경보",
    en: "quick to notice and respond to possible danger or problems",
    syn: ["watchful", "vigilant", "attentive"], ant: ["unaware", "inattentive"],
    forms: [{ word: "alertness", pos: "noun" }, { word: "alertly", pos: "adv" }],
    roots: [{ affix: "a-", gloss: "~쪽으로 (라틴 ad-)" }],
    ex: [
      { en: "You need to be alert to the possibility of danger at all times.", ko: "항상 위험 가능성을 경계할 필요가 있다." },
      { en: "A good driver stays alert on long trips.", ko: "좋은 운전자는 장거리에서도 긴장을 늦추지 않는다." }
    ]
  },
  {
    word: "vigilant", ipa: "/ˈvɪdʒɪlənt/", pos: ["adj"], cefr: "C1",
    ko: "바짝 경계하는, 방심하지 않는",
    en: "keeping careful watch for possible danger or difficulties",
    syn: ["alert", "watchful", "wary"], ant: ["careless", "negligent"],
    forms: [{ word: "vigilance", pos: "noun" }, { word: "vigilantly", pos: "adv" }],
    roots: [{ affix: "vigil-", gloss: "깨어 있다 (라틴 vigilare)" }],
    ex: [
      { en: "Security staff must remain vigilant during the event.", ko: "경비 인력은 행사 동안 계속 경계를 늦추지 말아야 한다." }
    ]
  },
  {
    word: "possibility", ipa: "/ˌpɒsəˈbɪləti/", pos: ["noun"], cefr: "A2",
    ko: "가능성",
    en: "a thing that may happen or be the case",
    syn: ["chance", "likelihood", "prospect"], ant: ["impossibility"],
    forms: [{ word: "possible", pos: "adj" }, { word: "possibly", pos: "adv" }],
    roots: [{ affix: "-ity", gloss: "성질·상태 (명사화)" }, { affix: "poss-", gloss: "할 수 있다 (라틴 posse)" }],
    ex: [
      { en: "There is a strong possibility of rain tomorrow.", ko: "내일 비가 올 가능성이 높다." }
    ]
  },
  {
    word: "deadline", ipa: "/ˈdedlaɪn/", pos: ["noun"], cefr: "B1",
    ko: "마감 기한",
    en: "the latest time or date by which something should be completed",
    syn: ["due date", "time limit"], ant: [],
    forms: [], roots: [{ affix: "-line", gloss: "선·경계" }],
    ex: [
      { en: "Could you update me on the project deadline?", ko: "프로젝트 마감 기한을 알려주실 수 있나요?" }
    ]
  },
  {
    word: "sightseeing", ipa: "/ˈsaɪtsiːɪŋ/", pos: ["noun"], cefr: "B1",
    ko: "관광, 구경",
    en: "the activity of visiting interesting places, especially by tourists",
    syn: ["touring", "excursion"], ant: [],
    forms: [{ word: "sight", pos: "noun" }, { word: "see", pos: "verb" }],
    roots: [{ affix: "sight-", gloss: "봄·시야" }],
    ex: [
      { en: "I'll be staying for five days for sightseeing.", ko: "관광 목적으로 5일간 머물 예정입니다." }
    ]
  },
  {
    word: "interact", ipa: "/ˌɪntərˈækt/", pos: ["verb"], cefr: "B1",
    ko: "상호작용하다, 소통하다",
    en: "to communicate with or react to each other",
    syn: ["communicate", "engage"], ant: ["ignore"],
    forms: [{ word: "interaction", pos: "noun" }, { word: "interactive", pos: "adj" }],
    roots: [{ affix: "inter-", gloss: "사이, 서로 (라틴)" }, { affix: "act-", gloss: "행하다 (라틴 agere)" }],
    ex: [
      { en: "Children learn a lot when they interact with each other.", ko: "아이들은 서로 소통하며 많은 것을 배운다." }
    ]
  },
  {
    word: "interrupt", ipa: "/ˌɪntəˈrʌpt/", pos: ["verb"], cefr: "B1",
    ko: "방해하다, (말·행동을) 중단시키다",
    en: "to stop someone from speaking or doing something for a short time",
    syn: ["disturb", "cut in"], ant: ["continue"],
    forms: [{ word: "interruption", pos: "noun" }],
    roots: [{ affix: "inter-", gloss: "사이, 서로 (라틴)" }, { affix: "rupt-", gloss: "깨다 (라틴 rumpere)" }],
    ex: [
      { en: "Sorry to interrupt, but could I ask a quick question?", ko: "방해해서 죄송한데, 짧게 하나 여쭤봐도 될까요?" }
    ]
  },
  {
    word: "idiomatic", ipa: "/ˌɪdiəˈmætɪk/", pos: ["adj"], cefr: "C1",
    ko: "(표현이) 자연스러운, 관용적인",
    en: "using expressions that are natural to a native speaker",
    syn: ["natural", "colloquial"], ant: ["awkward", "stilted"],
    forms: [{ word: "idiom", pos: "noun" }, { word: "idiomatically", pos: "adv" }],
    roots: [{ affix: "-atic", gloss: "~에 관한 (형용사화)" }],
    ex: [
      { en: "\"But honestly\" sounds more idiomatic than \"However, I think that\".", ko: "\"But honestly\"가 \"However, I think that\"보다 더 자연스럽게 들린다." }
    ]
  }
];
