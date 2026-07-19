/* 문법 태그 마스터 데이터 (docs/PLAN.md 2.5절) — 자동 생성, 직접 수정 금지.
   소스: pipeline/grammar_tags_parts/*.json. 재빌드: node pipeline/merge_grammar.js */
window.GRAMMAR_TAGS = {
 "relative-clause-continuous": {
  "category": "관계사",
  "name_kr": "관계대명사의 계속적 용법",
  "desc_kr": "관계대명사 앞에 콤마(,)를 찍으면 앞 문장 전체를 부연 설명하는 용법이 된다. 한정적 용법(콤마 없음)은 '~하는 사람/것'처럼 명사를 좁혀 꾸미지만, 계속적 용법은 이미 정해진 대상에 대해 '그런데 그 사람은/그것은'처럼 추가 정보를 덧붙인다. 그래서 콤마 앞뒤를 끊어 두 문장으로 풀어도 뜻이 통한다.",
  "example": {
   "en": "I gave the ticket to my brother, who lost it immediately.",
   "ko": "나는 그 표를 형에게 줬는데, 형은 그것을 바로 잃어버렸다."
  }
 },
 "passive-simple": {
  "category": "수동태",
  "name_kr": "단순 수동태",
  "desc_kr": "'be동사 + 과거분사' 형태로, 동작을 하는 주체가 아니라 동작을 당하는 대상을 주어로 내세울 때 쓴다. 누가 했는지보다 무엇이 어떻게 됐는지가 중요하거나, 행위자를 굳이 밝히고 싶지 않을 때 자연스럽다. 행위자를 밝히려면 문장 끝에 'by ~'를 붙인다.",
  "example": {
   "en": "The bridge was built in 1932.",
   "ko": "그 다리는 1932년에 지어졌다."
  }
 },
 "subjunctive-past": {
  "category": "가정법",
  "name_kr": "가정법 과거",
  "desc_kr": "지금 사실과 반대되는 상황을 가정할 때 쓴다. if절에는 동사의 과거형(be동사는 인칭에 상관없이 were)을, 주절에는 'would/could/might + 동사원형'을 쓴다. 형태는 과거지만 뜻은 '현재'에 대한 가정이라는 점이 핵심이다.",
  "example": {
   "en": "If I were you, I would apologize first.",
   "ko": "내가 너라면, 먼저 사과할 텐데."
  }
 },
 "relative-pronoun-who": {
  "category": "관계사",
  "name_kr": "관계대명사 who",
  "desc_kr": "who는 선행사가 사람일 때 쓰는 관계대명사로, 관계사절 안에서 그 사람이 하는 동작을 나타내는 주어 역할(주격)을 한다. 목적어 자리에서는 원래 whom을 써야 문법적으로 정확하지만, 실제 회화나 편한 글에서는 목적격 자리에도 who를 그대로 쓰는 경우가 훨씬 많다. 즉 who는 선행사가 '사람'이라는 것을 알려줄 뿐이고, 문장 안에서 주어인지 목적어인지는 뒤에 이어지는 동사와의 관계로 판단하면 된다.",
  "example": {
   "en": "The woman who called you yesterday is my aunt.",
   "ko": "어제 너한테 전화한 여자분이 우리 이모야."
  }
 },
 "relative-pronoun-which": {
  "category": "관계사",
  "name_kr": "관계대명사 which",
  "desc_kr": "which는 선행사가 사물이나 동물일 때 쓰는 관계대명사로, who의 사물 버전이라고 생각하면 된다. 콤마 없이 쓰면 명사를 좁혀 꾸미는 한정적 용법이 되고, 콤마를 찍으면 이미 정해진 대상이나 앞 절 전체에 대한 추가 설명을 덧붙이는 계속적 용법이 된다. that과 달리 콤마 뒤(계속적 용법)에서도 쓸 수 있고 전치사 바로 뒤에도 올 수 있다는 점이 that과 실질적으로 갈리는 부분이다.",
  "example": {
   "en": "She bought a laptop, which turned out to be too heavy to carry.",
   "ko": "그녀는 노트북을 샀는데, 그게 들고 다니기엔 너무 무거운 걸로 밝혀졌다."
  }
 },
 "relative-pronoun-that": {
  "category": "관계사",
  "name_kr": "관계대명사 that",
  "desc_kr": "that은 선행사가 사람이든 사물이든 상관없이 한정적 용법에서 who나 which 대신 쓸 수 있는 관계대명사다. 다만 콤마 뒤에 오는 계속적 용법에는 쓸 수 없고, 전치사 바로 뒤(전치사+관계대명사)에도 올 수 없다는 제약이 있어 그 자리에선 who/which로 되돌려야 한다. 그래서 that은 '바로 이 사람/이것'을 딱 좁혀 지목하는 자리에서만 쓸 수 있는, who/which의 캐주얼한 대체어라고 이해하면 된다.",
  "example": {
   "en": "This is the book that changed my life.",
   "ko": "이게 바로 내 인생을 바꾼 책이야."
  }
 },
 "relative-pronoun-whose": {
  "category": "관계사",
  "name_kr": "관계대명사 whose",
  "desc_kr": "whose는 '누구의'라는 소유의 의미를 나타내는 관계대명사로, 뒤에 오는 명사를 선행사의 소유물로 이어준다. 원래 두 문장에서 소유격(his/her/its/their)으로 쓰이던 자리를 관계대명사절로 합칠 때 whose로 바꾼다고 생각하면 이 낯선 형태가 이해된다. 선행사가 사람이든 사물이든 모두 쓸 수 있다는 점에서 사람에만 한정되는 who와 다르다.",
  "example": {
   "en": "I met a man whose dog followed him everywhere.",
   "ko": "나는 자기 개가 어디든 따라다니는 남자를 만났다."
  }
 },
 "relative-adverb": {
  "category": "관계사",
  "name_kr": "관계부사(where/when/why/how)",
  "desc_kr": "관계부사는 '전치사+관계대명사'를 하나로 압축한 표현으로, 관계사절 안에서 장소·시간·이유·방법을 나타내는 부사 역할을 한다. where는 장소(in/at which), when은 시간(in/on which), why는 이유(for which)에 해당하며, 관계대명사와 달리 뒤에 오는 절은 주어와 목적어가 다 갖춰진 완전한 문장이라는 점이 핵심 구분 포인트다. how는 특이하게 선행사 the way와 함께 쓰지 않고 둘 중 하나만 남기는 규칙이 있다.",
  "example": {
   "en": "This is the restaurant where we had our first date.",
   "ko": "여기가 우리가 첫 데이트를 했던 그 식당이야."
  }
 },
 "relative-pronoun-omission": {
  "category": "관계사",
  "name_kr": "관계대명사 생략",
  "desc_kr": "관계사절 안에서 관계대명사가 목적어 역할(목적격)을 할 때는 생략할 수 있다. 관계사절에 이미 주어와 동사가 갖춰져 있고 관계대명사는 그 뒤 목적어 자리만 채우는 역할이라, 굳이 밝히지 않아도 문맥상 무엇을 가리키는지 통하기 때문이다. 반면 관계사절 안에서 주어 역할을 하는 주격 관계대명사는 생략하면 문장 자체가 성립하지 않으므로 생략할 수 없다.",
  "example": {
   "en": "The movie I watched last night was amazing.",
   "ko": "내가 어젯밤에 본 영화 진짜 좋았어."
  }
 },
 "passive-progressive": {
  "category": "수동태",
  "name_kr": "진행형 수동태",
  "desc_kr": "'be동사+being+과거분사' 형태로, 단순 수동태에 '지금 그 일이 진행 중'이라는 진행형의 의미를 더한 것이다. 단순 수동태가 동작의 결과나 상태에 초점을 둔다면, 진행형 수동태는 그 동작이 바로 지금(또는 그 시점에) 실제로 벌어지고 있음을 강조한다. be동사 뒤에 being과 과거분사가 겹쳐 나오는 낯선 형태지만, 능동태의 진행형(be+~ing)에서 목적어를 주어 자리로 끌어올린 것뿐이라고 생각하면 형태가 이해된다.",
  "example": {
   "en": "The road is being repaired this week.",
   "ko": "그 도로는 이번 주에 보수 공사 중이다."
  }
 },
 "passive-perfect": {
  "category": "수동태",
  "name_kr": "완료형 수동태",
  "desc_kr": "'have been+과거분사' 형태로, 완료시제가 갖는 계속·경험·완료·결과의 의미를 수동태에 얹은 것이다. 단순 수동태가 특정 시점의 동작 자체를 나타낸다면, 완료형 수동태는 그 동작이 과거 어느 시점부터 지금까지 영향을 미치고 있거나 이미 끝났다는 시간의 폭을 함께 전달한다. 능동태의 완료형(have+과거분사)에서 목적어를 주어 자리로 올리면서 뒤에 과거분사가 하나 더 붙는 구조로 이해하면 된다.",
  "example": {
   "en": "The report has been finished ahead of schedule.",
   "ko": "그 보고서는 예정보다 일찍 완성됐다."
  }
 },
 "passive-by-omission": {
  "category": "수동태",
  "name_kr": "by 생략 수동태",
  "desc_kr": "수동태에서 'by+행위자'는 필수가 아니라 선택이며, 실제 영어에서는 행위자를 굳이 밝히지 않고 통째로 생략하는 경우가 훨씬 많다. 행위자가 일반 사람들이라 콕 집을 필요가 없거나, 누가 했는지 너무 뻔해서 말할 필요가 없거나, 반대로 누군지 모르거나 밝히고 싶지 않을 때 이런 생략이 자연스럽다. 그래서 문법책의 'by+행위자' 공식만 외우면 실제 문장 대부분에서 by가 안 보이는 이유를 놓치게 된다.",
  "example": {
   "en": "My wallet was stolen on the subway.",
   "ko": "지하철에서 내 지갑을 도둑맞았다."
  }
 },
 "passive-get": {
  "category": "수동태",
  "name_kr": "get-수동태",
  "desc_kr": "'get+과거분사'는 be동사 대신 get을 쓰는 수동태로, 격식을 덜 차린 구어체에서 특히 잘 쓰인다. be-수동태가 차분한 상태 묘사에 가깝다면, get-수동태는 갑작스러운 변화나 예상치 못한 일(주로 사고나 곤란한 상황)이 벌어졌다는 느낌을 더 강하게 준다. 그래서 다치거나 해고당하거나 걸리는 것처럼 좋지 않은 일이 갑자기 일어났을 때 원어민이 be동사보다 get을 즐겨 쓰는 경향이 있다.",
  "example": {
   "en": "He got fired for being late all the time.",
   "ko": "그는 계속 지각해서 결국 잘렸다."
  }
 },
 "subjunctive-past-perfect": {
  "category": "가정법",
  "name_kr": "가정법 과거완료",
  "desc_kr": "이미 지나가버린 과거 사실과 반대되는 상황을 가정할 때 쓴다. if절에는 'had+과거분사'를, 주절에는 'would/could/might+have+과거분사'를 써서 '그때 그랬다면 (그때) 그랬을 텐데'라는 뜻을 나타낸다. 가정법 과거가 현재에 대한 상상이나 아쉬움이라면, 가정법 과거완료는 이미 끝나버려 되돌릴 수 없는 과거에 대한 후회라는 점이 핵심 차이다.",
  "example": {
   "en": "If I had studied harder, I would have passed the exam.",
   "ko": "내가 더 열심히 공부했더라면, 시험에 합격했을 텐데."
  }
 },
 "subjunctive-mixed": {
  "category": "가정법",
  "name_kr": "혼합 가정법",
  "desc_kr": "if절과 주절이 가리키는 시점이 서로 다를 때 두 가정법을 섞어 쓰는 것을 혼합 가정법이라 한다. if절은 과거 사실을 반대로 가정(had+과거분사, 가정법 과거완료)하면서, 그 결과가 지금 현재까지 이어진다고 볼 때 주절은 가정법 과거 형태(would+동사원형)를 쓴다. '그때 그랬다면 (지금) 이럴 텐데'처럼 과거의 원인과 현재의 결과가 이어지는 문장에서 이런 시제 불일치가 자연스럽게 나타난다.",
  "example": {
   "en": "If I hadn't missed the flight, I would be at the conference right now.",
   "ko": "그때 비행기를 놓치지 않았더라면, 지금쯤 학회장에 있을 텐데."
  }
 },
 "wish-clause": {
  "category": "가정법",
  "name_kr": "I wish 가정법",
  "desc_kr": "I wish 뒤에 가정법을 쓰면 현실과 다른 것을 바라는 아쉬움이나 소망을 나타낸다. 현재 사실과 반대되는 소망이면 wish 뒤에 과거형(가정법 과거, be동사는 인칭에 상관없이 were)을 쓰고, 과거 사실과 반대되는 후회면 'had+과거분사'(가정법 과거완료)를 쓴다. if절 없이 wish 하나만으로 '~라면 좋을 텐데'나 '~했더라면 좋았을 텐데'라는 아쉬움을 표현한다는 점이 if 가정법과 형태상 다르다.",
  "example": {
   "en": "I wish I had brought an umbrella.",
   "ko": "우산을 가져왔더라면 좋았을 텐데."
  }
 },
 "as-if-as-though": {
  "category": "가정법",
  "name_kr": "as if / as though 가정법",
  "desc_kr": "as if(as though)는 '마치 ~인 것처럼'이라는 뜻으로, 실제로는 그렇지 않은 상황을 비유적으로 빗대어 말할 때 가정법을 함께 쓴다. 주절과 같은 시점을 반대로 가정할 때는 과거형을, 주절보다 앞선 시점을 반대로 가정할 때는 'had+과거분사'를 써서 시제 차이로 '언제'에 대한 반사실을 구분한다. 다만 화자가 어느 정도 그럴듯하다고 여기는 추측일 때는 직설법을 그대로 쓰기도 해서, 형태만 보고도 화자가 얼마나 확신 없이 비유하는지 짐작할 수 있다.",
  "example": {
   "en": "He talks as if he knew everything about it.",
   "ko": "그는 마치 그것에 대해 모든 걸 아는 것처럼 말한다."
  }
 },
 "if-omission-inversion": {
  "category": "가정법",
  "name_kr": "if 생략 도치 가정법",
  "desc_kr": "가정법 문장에서 if를 생략하면 그 빈자리를 표시하려고 주어와 (조)동사의 순서를 바꾸는 도치가 일어난다. 가정법 과거에서 if절에 were가 있으면 'Were+주어', 가정법 과거완료에서 had가 있으면 'Had+주어', 미래에 대한 약한 가정에서 should가 있으면 'Should+주어' 형태로 문장이 시작된다. 이런 도치 형태는 문어체나 격식 있는 글에서 즐겨 쓰이며, if가 보이지 않아도 조동사가 문장 맨 앞에 나온 순간 가정법임을 알아챌 수 있다.",
  "example": {
   "en": "Had I known about the traffic, I would have left earlier.",
   "ko": "그 교통 체증을 알았더라면, 더 일찍 출발했을 텐데."
  }
 },
 "infinitive-noun-usage": {
  "category": "to부정사",
  "name_kr": "to부정사의 명사적 용법",
  "desc_kr": "to부정사가 문장에서 명사처럼 주어·목적어·보어 자리에 들어가는 용법으로, '~하는 것'으로 해석하면 자연스럽다. 주어 자리에 그대로 쓰면 문장이 앞으로 늘어져 어색하므로 실제로는 가주어 it을 문장 맨 앞에 세우고 진짜 주어인 to부정사는 뒤로 보내는 경우가 많다. want, decide, hope처럼 아직 하지 않은 일을 향하는 동사 뒤 목적어 자리, be동사 뒤 보어 자리에도 같은 원리로 쓰인다.",
  "example": {
   "en": "It is important to finish this project by Friday.",
   "ko": "이 프로젝트를 금요일까지 끝내는 것이 중요하다."
  }
 },
 "infinitive-adjective-usage": {
  "category": "to부정사",
  "name_kr": "to부정사의 형용사적 용법",
  "desc_kr": "to부정사가 명사 바로 뒤에서 그 명사를 꾸며주는 용법으로, '~할', '~하는'으로 해석된다. something, anything, nothing 같은 부정대명사 뒤에 특히 자주 붙는다. 수식받는 명사가 to부정사 동사의 목적어 역할을 하면서 원래 전치사가 필요한 동사라면, 그 전치사를 끝까지 살려서 써야 한다는 점이 실수하기 쉬운 부분이다.",
  "example": {
   "en": "I need a pen to write with.",
   "ko": "나는 (그것으로) 쓸 펜이 필요하다."
  }
 },
 "infinitive-adverb-usage": {
  "category": "to부정사",
  "name_kr": "to부정사의 부사적 용법",
  "desc_kr": "to부정사가 동사·형용사·문장 전체를 꾸며 목적, 결과, 원인, 판단의 근거 등 다양한 의미를 더하는 용법이다. 목적('~하기 위해')으로 가장 많이 배우지만, 감정 형용사 뒤에서는 원인('~해서 기쁘다')으로, grow up to be처럼 문맥에 따라서는 결과('그 결과 ~하게 되다')로 해석이 달라진다. 그래서 무조건 '~하기 위해'로만 외우면 결과·원인 용법에서 오히려 어색한 번역이 나온다.",
  "example": {
   "en": "I was surprised to see him there.",
   "ko": "나는 그를 거기서 보고 놀랐다."
  }
 },
 "infinitive-semantic-subject": {
  "category": "to부정사",
  "name_kr": "to부정사의 의미상 주어(for/of)",
  "desc_kr": "to부정사가 나타내는 동작을 실제로 하는 주체가 문장의 주어와 다를 때, 그 주체를 밝혀주는 장치다. 대부분은 'for + 목적격'을 쓰지만, kind, nice, careless, foolish처럼 사람의 성격이나 태도를 평가하는 형용사가 앞에 오면 예외적으로 'of + 목적격'을 쓴다. 이 for/of 선택이 형용사의 종류에 달려 있다는 점이 학습자들이 자주 헷갈리는 지점이다.",
  "example": {
   "en": "It was kind of you to help me.",
   "ko": "도와주다니 너 참 친절했다."
  }
 },
 "bare-infinitive-causative": {
  "category": "to부정사",
  "name_kr": "사역동사 + 원형부정사",
  "desc_kr": "make, have, let 같은 사역동사는 목적어 뒤에 to 없는 원형부정사를 써서 '목적어가 ~하게 시키다/하도록 하다'라는 뜻을 나타낸다. 같은 사역이라도 make는 강제성이 강하고, have는 부탁이나 지시에 가까우며, let은 허락의 뉘앙스라는 차이가 있다. get만은 예외적으로 'get + 목적어 + to부정사' 형태를 쓴다는 점도 함께 기억해 둘 필요가 있다.",
  "example": {
   "en": "My mom made me clean my room.",
   "ko": "엄마가 나한테 방 청소를 시켰다."
  }
 },
 "bare-infinitive-perception": {
  "category": "to부정사",
  "name_kr": "지각동사 + 원형부정사",
  "desc_kr": "see, hear, feel, watch 같은 지각동사는 목적어의 동작을 있는 그대로 지각했을 때 목적어 뒤에 원형부정사를 쓴다. 같은 자리에 현재분사(-ing)를 쓸 수도 있는데, 원형부정사는 동작을 처음부터 끝까지 지켜본 느낌이고 -ing는 한창 진행 중인 한 장면을 본 느낌이라는 차이가 있다. 사역동사 구문과 형태는 똑같아 보여도, 지각동사는 '시키는 것'이 아니라 '있는 그대로를 느낀 것'이라는 의미 차이가 핵심이다.",
  "example": {
   "en": "I saw him cross the street.",
   "ko": "나는 그가 길을 건너는 것을 봤다."
  }
 },
 "participle-adjective-present": {
  "category": "분사·분사구문",
  "name_kr": "현재분사의 형용사 용법",
  "desc_kr": "동사에 -ing를 붙인 현재분사가 명사를 꾸며 '~하는, ~하게 만드는'이라는 능동·진행의 뜻을 더하는 용법이다. 수식받는 명사가 그 동작을 스스로 하고 있거나, 그런 감정을 남에게 일으키는 원인일 때 -ing형을 쓴다. 그래서 boring, interesting처럼 감정을 유발하는 동사는 그 감정의 원인이 되는 대상 앞에서 늘 -ing형으로 쓰인다.",
  "example": {
   "en": "The boring lecture put everyone to sleep.",
   "ko": "그 지루한 강의는 모두를 졸게 만들었다."
  }
 },
 "participle-adjective-past": {
  "category": "분사·분사구문",
  "name_kr": "과거분사의 형용사 용법",
  "desc_kr": "동사의 과거분사형이 명사를 꾸며 '~된, ~당한'이라는 수동·완료의 뜻을 더하는 용법이다. 수식받는 명사가 동작을 스스로 하는 게 아니라 그 동작을 당하거나 그 감정을 느끼는 쪽일 때 과거분사를 쓴다. 위의 현재분사 용법과 능동-수동으로 정확히 짝을 이루는 관계라서(지루하게 만드는 강의=boring, 지루함을 느끼는 학생=bored) 둘을 나란히 놓고 구분하면 헷갈리지 않는다.",
  "example": {
   "en": "The bored students stared out the window.",
   "ko": "지루해하는 학생들은 창밖을 바라보았다."
  }
 },
 "participle-clause-basic": {
  "category": "분사·분사구문",
  "name_kr": "분사구문(부사절 축약)",
  "desc_kr": "접속사가 있는 부사절(시간, 이유, 조건 등)에서 부사절의 주어가 주절의 주어와 같을 때, 접속사와 주어를 생략하고 동사를 -ing형으로 바꿔 문장을 간결하게 줄인 형태다. 접속사를 없앤 대신 원래 어떤 의미(때, 이유, 동시동작 등)였는지는 앞뒤 문맥으로 짐작해야 한다는 점이 이 용법의 핵심 특징이다.",
  "example": {
   "en": "Walking down the street, I saw an old friend.",
   "ko": "길을 걷다가 나는 오랜 친구를 만났다."
  }
 },
 "participle-clause-independent": {
  "category": "분사·분사구문",
  "name_kr": "독립분사구문",
  "desc_kr": "분사구문에서 분사가 나타내는 동작의 주체(의미상 주어)가 주절의 주어와 다를 때, 그 주어를 생략하지 않고 분사 앞에 그대로 남겨 둔 형태다. 일반 분사구문은 주절과 주어가 같아서 생략되지만, 이 경우는 한 문장 안에 서로 다른 두 주어가 나란히 등장한다는 점이 뚜렷한 구분점이다.",
  "example": {
   "en": "The weather being nice, we decided to go on a picnic.",
   "ko": "날씨가 좋아서 우리는 소풍을 가기로 했다."
  }
 },
 "participle-with-construction": {
  "category": "분사·분사구문",
  "name_kr": "with + 분사구문",
  "desc_kr": "'with + 명사 + 분사' 형태로 주된 동작과 동시에 벌어지는 부수적인 상태나 동작(부대상황)을 묘사할 때 쓴다. 명사가 분사의 동작을 스스로 하는 쪽이면 현재분사, 그 동작을 당하는 쪽이면 과거분사를 쓴다. 독립분사구문처럼 명사(의미상 주어)가 따로 드러난다는 점은 같지만, with가 붙어 '~한 채로'라는 배경 묘사의 느낌이 강하다는 차이가 있다.",
  "example": {
   "en": "She was reading with her legs crossed.",
   "ko": "그녀는 다리를 꼰 채로 책을 읽고 있었다."
  }
 },
 "participle-perfect": {
  "category": "분사·분사구문",
  "name_kr": "완료형 분사구문(Having p.p.)",
  "desc_kr": "분사구문이 나타내는 시점이 주절보다 앞선 과거일 때 'Having + 과거분사' 형태를 써서 시간차를 드러낸다. 단순 분사구문(-ing)은 주절과 같은 시점의 일이라 순서가 잘 드러나지 않지만, 이 형태는 '먼저 ~한 후에, ~했기 때문에'처럼 두 동작 사이의 선후 관계가 분명해진다는 점이 다르다.",
  "example": {
   "en": "Having finished his homework, he went out to play.",
   "ko": "그는 숙제를 끝낸 후에 놀러 나갔다."
  }
 },
 "gerund-vs-infinitive-meaning-change": {
  "category": "동명사",
  "name_kr": "동명사·to부정사 목적어에 따라 뜻이 달라지는 동사",
  "desc_kr": "remember, forget, try, stop 같은 동사는 뒤에 동명사가 오는지 to부정사가 오는지에 따라 뜻이 완전히 달라진다. 동명사는 이미 하고 있거나 이미 일어난 일(과거지향), to부정사는 아직 하지 않은 앞으로의 일(미래지향)을 가리킨다는 감각으로 구분하면 두 형태를 헷갈리지 않는다. 예를 들어 stop -ing는 '~하던 것을 멈추다'이고 stop to부정사는 '~하려고 (다른 일을) 멈추다'로, 무엇을 멈춘 것인지가 완전히 달라진다.",
  "example": {
   "en": "He stopped to check his phone.",
   "ko": "그는 휴대폰을 확인하려고 하던 일을 멈췄다."
  }
 },
 "gerund-idiom-expressions": {
  "category": "동명사",
  "name_kr": "동명사 관용표현",
  "desc_kr": "cannot help -ing, be busy -ing, look forward to -ing처럼 동명사가 들어가는 자리가 굳어진 관용 표현들이다. 대부분 뜻을 통째로 외워야 하고, 특히 look forward to에서 to가 부정사의 to가 아니라 전치사로 쓰인 것이라 뒤에 동사원형이 아니라 동명사가 와야 한다는 점이 실수하기 쉬운 대목이다.",
  "example": {
   "en": "I'm looking forward to seeing you again.",
   "ko": "다시 만날 날을 기대하고 있어요."
  }
 },
 "gerund-subject-object": {
  "category": "동명사",
  "name_kr": "동명사의 주어·목적어 역할",
  "desc_kr": "동명사는 '~하는 것, ~하기'라는 뜻으로 문장에서 명사처럼 주어, 목적어, 보어 자리에 들어간다. enjoy, finish, avoid처럼 실제로 일어나고 있거나 이미 하고 있는 일을 목적어로 받는 동사들은 동명사를 취하는 경향이 강하다. to부정사의 명사적 용법과 뜻이 겹칠 때도 있지만, 동명사 쪽은 일반적·습관적인 행위를 가리키는 느낌이 더 강하다는 차이가 있다.",
  "example": {
   "en": "Swimming every morning keeps me energetic.",
   "ko": "매일 아침 수영하는 것은 나를 활기차게 해준다."
  }
 },
 "gerund-after-preposition": {
  "category": "동명사",
  "name_kr": "전치사 + 동명사",
  "desc_kr": "전치사 뒤에는 동사원형이나 to부정사가 아니라 반드시 동명사가 온다. 전치사는 원래 명사(구)를 목적어로 받는 품사인데, 동사를 명사 자리에 넣으려면 동명사로 바꿔야 하기 때문이다. before, after, without, by처럼 흔히 쓰는 전치사 뒤에 동사를 넣고 싶을 때 실수로 원형이나 to부정사를 쓰기 쉬우니 주의가 필요하다.",
  "example": {
   "en": "She left without saying goodbye.",
   "ko": "그녀는 작별 인사도 없이 떠났다."
  }
 },
 "inversion-negative-adverb": {
  "category": "도치",
  "name_kr": "부정어 도치",
  "desc_kr": "never, hardly, little, not only처럼 부정의 뜻을 가진 부사(구)가 강조를 위해 문장 맨 앞으로 나오면, 그 뒤의 주어와 동사가 의문문처럼 도치된다. 일반동사가 쓰인 문장이면 do/does/did를 주어 앞으로 끌어오고, 조동사나 be동사가 있으면 그것을 그대로 주어 앞으로 옮긴다. 부정어를 문장 맨 앞으로 뺀 만큼 그 내용을 강하게 강조하려는 의도가 담긴 어순이라는 점이 핵심이다.",
  "example": {
   "en": "Never have I seen such a beautiful sunset.",
   "ko": "이렇게 아름다운 노을은 본 적이 없다."
  }
 },
 "inversion-so-neither": {
  "category": "도치",
  "name_kr": "so/neither 도치",
  "desc_kr": "상대의 말에 '나도 그래(긍정 동의)' 또는 '나도 아니야(부정 동의)'라고 맞장구칠 때 쓰는 도치 구문이다. 앞 문장이 긍정문이면 'So + 동사 + 주어', 부정문이면 'Neither/Nor + 동사 + 주어' 순서가 된다. 앞 문장이 일반동사문이면 do/does/did를 끌어와 도치시킨다는 점에서 부정어 도치와 같은 원리를 공유하지만, 여기서는 동의를 표현하는 대화체 표현이라는 점이 다르다.",
  "example": {
   "en": "\"I don't like coffee.\" \"Neither do I.\"",
   "ko": "\"나는 커피를 안 좋아해.\" \"나도 그래.\""
  }
 },
 "inversion-place-adverbial": {
  "category": "도치",
  "name_kr": "장소부사구 도치",
  "desc_kr": "here, there나 장소를 나타내는 부사구가 문장 맨 앞에 나오면 주어와 동사의 자리가 바뀌어 '동사 + 주어' 순서가 되는 경우가 많다. 이때는 do/does/did를 끌어오지 않고 본동사 자체를 주어 앞으로 옮긴다는 점이 부정어 도치와 다르다. 다만 주어가 대명사(he, she, it 등)일 때는 도치하지 않고 원래 어순(주어+동사)을 그대로 유지하는 예외가 있다.",
  "example": {
   "en": "Here comes the bus.",
   "ko": "저기 버스가 온다."
  }
 },
 "comparative-basic": {
  "category": "비교 구문",
  "name_kr": "비교급 기본",
  "desc_kr": "형용사/부사의 비교급(-er 또는 more ~)을 써서 두 대상을 비교할 때 쓴다. 비교 대상은 than 뒤에 나오며, 짧은 단어는 -er을, 음절이 긴 단어는 more를 붙인다. 핵심은 '더 ~하다'는 상대적 차이를 드러내는 것이라, 절대적인 정도가 아니라 두 대상 사이의 우열을 표현한다는 점이다.",
  "example": {
   "en": "This bag is heavier than that one.",
   "ko": "이 가방이 저것보다 더 무겁다."
  }
 },
 "superlative-basic": {
  "category": "비교 구문",
  "name_kr": "최상급 기본",
  "desc_kr": "셋 이상의 대상 중에서 가장 두드러지는 하나를 콕 집을 때 the -est 또는 the most를 쓴다. 비교급이 둘을 견주는 것과 달리 최상급은 비교 범위 전체(in the class, of the three 등) 안에서 1등을 가리킨다는 점이 핵심이다. 형용사 앞에 반드시 the를 붙이는 이유도 그 범위 안에서 유일하게 정해지는 대상이기 때문이다.",
  "example": {
   "en": "She is the tallest student in her class.",
   "ko": "그녀는 반에서 키가 가장 큰 학생이다."
  }
 },
 "comparative-double": {
  "category": "비교 구문",
  "name_kr": "the 비교급~, the 비교급~",
  "desc_kr": "'the + 비교급 ~, the + 비교급 ~' 구조로, 한쪽의 정도가 변하면 다른 쪽도 그에 비례해서 변한다는 뜻을 나타낸다. 앞뒤 두 절 모두 비교급 앞에 the가 붙지만, 이 the는 관사가 아니라 '~할수록'이라는 비례 부사 역할을 한다. 두 절이 원인-결과처럼 짝을 이루어 하나의 흐름으로 읽힌다는 점이 단순 비교급과 다르다.",
  "example": {
   "en": "The more you practice, the better you get.",
   "ko": "연습을 많이 할수록, 더 잘하게 된다."
  }
 },
 "as-as-original": {
  "category": "비교 구문",
  "name_kr": "원급 비교(as~as)",
  "desc_kr": "'as + 형용사/부사 원급 + as'로 두 대상이 같은 정도라는 것을 나타낸다. 비교급이 우열을 가리는 것과 달리 원급 비교는 '~만큼 ~하다'는 대등함을 표현하므로, 형용사·부사는 원형 그대로 쓰고 -er이나 more를 붙이지 않는다. 부정문(not as ~ as)으로 쓰면 반대로 '~만큼 ~하지 않다'는 미달의 의미가 된다.",
  "example": {
   "en": "My brother is as tall as I am.",
   "ko": "내 남동생은 나만큼 키가 크다."
  }
 },
 "as-as-possible": {
  "category": "비교 구문",
  "name_kr": "as~as possible",
  "desc_kr": "'as + 형용사/부사 + as possible' 또는 'as ~ as + 주어 + can'으로 '할 수 있는 한 최대로 ~하게'라는 뜻을 나타낸다. 이는 원급 비교의 특수한 활용으로, 비교 대상이 다른 사람이나 사물이 아니라 '가능한 한계치' 자체라는 점이 일반 원급 비교와 다르다. 부탁이나 지시 문장에서 정도를 최대한 끌어올리라고 강조할 때 자주 쓴다.",
  "example": {
   "en": "Please reply as soon as possible.",
   "ko": "가능한 한 빨리 답장해 주세요."
  }
 },
 "comparative-multiplier": {
  "category": "비교 구문",
  "name_kr": "배수 비교(twice as~as)",
  "desc_kr": "twice, three times 같은 배수 표현을 원급 비교(as~as) 앞에 붙여 '~보다 몇 배 더 ~하다'는 정량적 차이를 나타낸다. 단순 비교급(more, -er)이 우열만 보여주는 것과 달리, 배수 비교는 그 차이가 정확히 몇 배인지까지 수치로 밝힌다는 점이 다르다. 두 배까지는 twice로 바꿔 쓰는 것이 자연스럽고, 세 배 이상부터는 숫자+times 형태를 그대로 쓴다.",
  "example": {
   "en": "This laptop is twice as expensive as that one.",
   "ko": "이 노트북은 저것보다 두 배 더 비싸다."
  }
 },
 "present-perfect-basic": {
  "category": "시제",
  "name_kr": "현재완료 기본(계속·경험·완료·결과)",
  "desc_kr": "'have/has + 과거분사'로 과거에 일어난 일이 현재와 어떤 식으로든 이어져 있음을 나타낸다. 계속(지금까지 쭉), 경험(~해 본 적 있다), 완료(막 ~했다), 결과(그래서 지금 ~한 상태다)라는 네 가지 의미로 쓰이지만 공통점은 '지금 시점에서 본 과거'라는 것이다. 그래서 yesterday, last year처럼 과거의 특정 시점을 못 박는 부사와는 같이 쓸 수 없고, 대신 just, already, ever, since처럼 현재와 연결되는 부사와 어울린다.",
  "example": {
   "en": "I have lost my keys, so I can't get in.",
   "ko": "열쇠를 잃어버려서 안에 들어갈 수가 없다."
  }
 },
 "present-perfect-continuous": {
  "category": "시제",
  "name_kr": "현재완료진행형",
  "desc_kr": "'have/has been + 동사ing'로 과거에 시작된 동작이 현재까지 계속 진행 중이거나, 방금 끝났어도 그 여파가 지금 느껴질 만큼 동작 자체에 초점을 둘 때 쓴다. 단순 현재완료가 계속·경험·완료·결과라는 결과 상태를 보여주는 것과 달리, 진행형이 붙으면 그 시간 동안 '계속 ~하고 있었다'는 지속성과 생동감이 강조된다. 그래서 지쳤다, 땀난다처럼 그 동작의 흔적이 눈에 보이는 상황을 설명할 때 자연스럽다.",
  "example": {
   "en": "I've been cleaning the house all morning.",
   "ko": "나는 아침 내내 집을 청소하고 있었다."
  }
 },
 "past-perfect": {
  "category": "시제",
  "name_kr": "과거완료",
  "desc_kr": "'had + 과거분사'로 과거의 어느 한 시점보다 그 이전에 이미 일어난 일을 나타낸다. 단순 과거가 그 시점 하나만 가리키는 것과 달리 과거완료는 '더 과거'라는 기준점이 필요하며, 그래서 문장 안에 단순 과거로 표현되는 또 다른 과거 시점이 함께 등장하는 경우가 많다. 두 사건의 시간 순서를 헷갈리지 않게 밝혀주는 것이 이 시제의 핵심 역할이다.",
  "example": {
   "en": "When I arrived at the station, the train had already left.",
   "ko": "내가 역에 도착했을 때, 기차는 이미 떠난 뒤였다."
  }
 },
 "future-perfect": {
  "category": "시제",
  "name_kr": "미래완료",
  "desc_kr": "'will have + 과거분사'로 미래의 어느 시점에는 어떤 일이 이미 끝나 있을 것이라는 뜻을 나타낸다. 단순 미래(will)가 앞으로 일어날 일 자체를 말하는 것과 달리, 미래완료는 그보다 앞선 시점부터 그 미래 시점까지의 흐름을 훑어 '그때는 이미 완료된 상태'임을 강조한다. by the time, by + 미래 시점 같은 표현과 자주 함께 쓰인다.",
  "example": {
   "en": "By next month, I will have finished writing my thesis.",
   "ko": "다음 달이면, 나는 논문 쓰기를 이미 끝냈을 것이다."
  }
 },
 "perfect-progressive": {
  "category": "시제",
  "name_kr": "완료진행형",
  "desc_kr": "'had been + 동사ing'(과거완료진행) 또는 'will have been + 동사ing'(미래완료진행)처럼, 어떤 기준 시점까지 동작이 얼마나 오래 계속되어 왔는지 그 지속 기간에 초점을 맞추는 형태다. 같은 기준 시점을 다루는 단순 완료형(과거완료·미래완료)이 '그때 이미 끝나 있었다/끝나 있을 것이다'는 완료·결과를 보여주는 것과 달리, 완료진행형은 '그 시점까지 계속 ~하고 있었다/있을 것이다'는 진행 중인 동작 그 자체를 부각한다. for, since와 함께 써서 지속된 기간을 구체적으로 밝히는 경우가 많다.",
  "example": {
   "en": "By the time she called, I had been waiting for two hours.",
   "ko": "그녀가 전화했을 때, 나는 두 시간째 기다리고 있던 참이었다."
  }
 },
 "tense-agreement-reported-speech": {
  "category": "시제",
  "name_kr": "시제 일치와 화법전환",
  "desc_kr": "다른 사람의 말을 그대로 옮기지 않고 전달하는 화법(간접화법)으로 바꿀 때, 전달동사(said, told 등)가 과거형이면 인용문 안의 시제도 한 단계씩 뒤로 물러난다 — 이를 시제 일치라 한다. 현재는 과거로, 과거·현재완료는 과거완료로 바뀌고, 인칭대명사와 now·today 같은 시간·장소 부사도 화자 기준에 맞게 함께 바뀐다. 다만 변하지 않는 진리나 현재도 여전히 유효한 사실은 예외적으로 시제를 그대로 두기도 한다.",
  "example": {
   "en": "She said that she was tired and would go home early.",
   "ko": "그녀는 피곤해서 집에 일찍 갈 거라고 말했다."
  }
 },
 "modal-perfect": {
  "category": "조동사",
  "name_kr": "조동사 + have p.p.",
  "desc_kr": "'조동사 + have + 과거분사'로 이미 지나간 과거의 일을 지금 돌아보며 평가하는 표현이다. should have p.p.는 '~했어야 했는데 안 했다'는 후회, could have p.p.는 '~할 수 있었는데 안 했다'는 아쉬움, needn't have p.p.는 '안 해도 됐는데 괜히 했다'는 뜻을 나타낸다. 조동사 자체는 현재형이지만 have p.p.가 붙어 그 판단의 대상은 항상 과거의 사건이라는 점이 핵심이다.",
  "example": {
   "en": "You should have called me before coming.",
   "ko": "오기 전에 나한테 전화라도 했어야지."
  }
 },
 "modal-idiom-cannot-help": {
  "category": "조동사",
  "name_kr": "cannot help ~ing 등 조동사 관용표현",
  "desc_kr": "cannot help ~ing는 '~하지 않을 수 없다, 저절로 ~하게 된다'는 뜻으로, 여기서 help는 '돕다'가 아니라 '피하다, 참다'에 가까운 의미로 쓰인 관용 표현이다. 같은 뜻으로 can't help but + 동사원형도 쓰는데, 둘을 섞어 can't help but ~ing처럼 쓰지 않도록 형태를 구분해서 기억해야 한다. 의지로 억누르기 힘든 감정이나 반응을 나타낼 때 자연스럽다.",
  "example": {
   "en": "I couldn't help laughing when he tripped over his own feet.",
   "ko": "그가 자기 발에 걸려 넘어지는 걸 보고 웃지 않을 수 없었다."
  }
 },
 "modal-obligation-necessity": {
  "category": "조동사",
  "name_kr": "must/have to의 의무 표현 차이",
  "desc_kr": "must와 have to 둘 다 '~해야 한다'는 의무를 나타내지만 그 의무의 출처가 다르다. must는 화자 자신이 그렇게 판단해서 내리는 주관적 의무나 강한 권고에 가깝고, have to는 규칙·법·상황처럼 화자 밖에서 오는 객관적 필요를 나타낸다. 부정형에서는 차이가 더 뚜렷해지는데, must not은 '~하면 안 된다'는 금지이고 don't have to는 '안 해도 된다'는 불필요를 뜻해 의미가 정반대다.",
  "example": {
   "en": "You don't have to finish it today, but you must be honest about the delay.",
   "ko": "오늘 다 끝낼 필요는 없지만, 지연된 것에 대해서는 솔직해야 한다."
  }
 },
 "modal-speculation": {
  "category": "조동사",
  "name_kr": "must/might/can't have p.p. 추측 표현",
  "desc_kr": "'조동사 + have + 과거분사'로 과거에 있었던 일을 지금 시점에서 추측할 때, 어떤 조동사를 쓰느냐에 따라 확신의 정도가 달라진다. must have p.p.는 '틀림없이 ~했을 것이다'는 강한 확신, might/could have p.p.는 '~했을 수도 있다'는 약한 가능성, can't have p.p.는 '~했을 리가 없다'는 강한 부정 추측을 나타낸다. 형태는 앞서 나온 후회·유감의 조동사+have p.p.와 같지만, 여기서는 과거 사실에 대한 판단이 아니라 순전히 확률적인 추측이라는 점이 다르다.",
  "example": {
   "en": "He must have missed the bus; he's never this late.",
   "ko": "그는 틀림없이 버스를 놓쳤을 것이다. 그가 이렇게 늦은 적이 없으니까."
  }
 },
 "cleft-it-that": {
  "category": "강조구문",
  "name_kr": "It is ~ that 강조구문",
  "desc_kr": "'It is/was ~ that ...' 구조로 문장의 한 성분을 It is/was와 that 사이에 끼워 넣어 그 부분을 특별히 강조하는 분열문(강조구문)이다. 원래 문장에서 강조하고 싶은 주어, 목적어, 부사(구) 하나를 뽑아내 앞으로 보내고 나머지는 that절로 남기는 방식이라, 강조된 자리에 무엇을 넣느냐에 따라 같은 문장도 완전히 다른 초점을 갖게 된다. '다른 게 아니라 바로 이거다'라는 뉘앙스를 전달하고 싶을 때 쓴다.",
  "example": {
   "en": "It was Sarah who found the missing wallet.",
   "ko": "잃어버린 지갑을 찾은 사람은 다름 아닌 사라였다."
  }
 },
 "do-emphasis": {
  "category": "강조구문",
  "name_kr": "do/does/did 강조",
  "desc_kr": "평서문에 원래 없던 do/does/did를 동사 앞에 넣고 뒤의 동사는 원형으로 바꿔 '정말로 ~하다'는 사실을 강조하는 용법이다. 의문문·부정문을 만들 때 쓰는 do와 형태는 같지만, 여기서는 문장을 의문문으로 바꾸는 게 아니라 이미 참인 사실을 힘주어 재확인하는 역할을 한다. 상대가 의심하거나 반대로 말했을 때 그것을 바로잡아 반박하는 상황에서 특히 자연스럽다.",
  "example": {
   "en": "I know you doubt me, but I did finish the report.",
   "ko": "네가 날 못 미더워하는 거 알지만, 나 그 보고서 진짜 끝냈어."
  }
 },
 "emphasis-intensifiers": {
  "category": "강조구문",
  "name_kr": "very/the very 등 강조 표현",
  "desc_kr": "very, the very, so 같은 강조 부사(어)를 명사나 형용사 앞에 붙여 정도를 한층 끌어올리는 표현이다. very는 형용사·부사를 그대로 강조하지만, the very는 명사 앞에 붙어 '바로 그 ~'처럼 대상 자체를 콕 집어 강조한다는 점에서 쓰임이 다르다. 강조하고 싶은 것이 정도(형용사)인지 대상 그 자체(명사)인지에 따라 어떤 강조어를 쓸지가 갈린다.",
  "example": {
   "en": "This is the very book I've been looking for.",
   "ko": "이게 바로 내가 찾고 있던 그 책이다."
  }
 },
 "ellipsis-repeated-verb": {
  "category": "생략",
  "name_kr": "반복 동사(구) 생략",
  "desc_kr": "앞 절에서 이미 나온 동사(구)를 뒤 절에서 똑같이 반복하면 어색하므로, 앞에서 쓴 동사를 통째로 빼고 조동사나 do/does/did만 남기는 용법이다. 무엇이 생략됐는지는 앞 절을 보면 바로 복원되기 때문에 의미 손실 없이 문장이 간결해진다. 특히 비교 대상이나 대조되는 두 절을 이어줄 때(A는 ~하고 B도 그렇다/아니다) 자주 쓰인다. 생략된 자리에 아무것도 안 남기지 않고 대동사(do/be/조동사)를 남긴다는 점이 핵심이다.",
  "example": {
   "en": "She likes coffee, and I do too.",
   "ko": "그녀는 커피를 좋아하고, 나도 그렇다."
  }
 },
 "ellipsis-conjunction-clause": {
  "category": "생략",
  "name_kr": "접속사절에서의 주어+be동사 생략",
  "desc_kr": "when/while/if/though 등이 이끄는 부사절의 주어가 주절 주어와 같을 때, 그 주어와 be동사를 함께 생략하고 분사나 형용사만 남기는 용법이다. 주어가 같다는 게 뻔한데 그대로 두면 문장이 늘어지고 중복되므로, 접속사 바로 뒤에 남은 분사·형용사·전치사구만으로 뜻을 전달한다. 주절과 주어가 다르면 이 생략을 쓸 수 없고 주어를 반드시 밝혀야 한다는 점이 실수하기 쉬운 부분이다.",
  "example": {
   "en": "While studying abroad, she learned to live independently.",
   "ko": "유학하는 동안 그녀는 독립적으로 사는 법을 배웠다."
  }
 },
 "ellipsis-comparative": {
  "category": "생략",
  "name_kr": "비교구문에서의 생략",
  "desc_kr": "than이나 as 뒤에 앞 절과 겹치는 동사나 명사를 그대로 반복하지 않고 빼버리는 용법이다. 비교 대상이 무엇인지는 앞 절 구조로 유추되므로, 생략하지 않으면 오히려 불필요하게 장황해 보인다. 이때 남는 것은 흔히 주어나 목적어 같은 비교의 핵심 요소뿐이고, 비교 대상을 헷갈리지 않게 격을 맞추는 것이 중요하다(예: him이 아니라 he).",
  "example": {
   "en": "My sister is taller than I (am).",
   "ko": "내 여동생은 나보다 키가 크다."
  }
 },
 "noun-clause-that": {
  "category": "명사절",
  "name_kr": "that 명사절",
  "desc_kr": "접속사 that이 이끄는 절이 문장 안에서 주어, 목적어, 보어 자리에 들어가 하나의 명사처럼 쓰이는 용법이다. that절 자체는 '~라는 것'으로 해석되며, 완전한 문장 형태를 그대로 유지한 채 통째로 명사 역할을 한다는 점이 의문사 명사절과 다르다. 목적어로 쓰일 때는 that이 흔히 생략되지만, 주어로 쓰일 때는 생략하지 않는 것이 원칙이다.",
  "example": {
   "en": "I believe that she will succeed.",
   "ko": "나는 그녀가 성공할 거라고 믿는다."
  }
 },
 "noun-clause-whether-if": {
  "category": "명사절",
  "name_kr": "whether/if 명사절",
  "desc_kr": "'~인지 아닌지'라는 불확실한 사실을 나타낼 때 whether나 if로 시작하는 절을 명사처럼 쓰는 용법이다. that절이 확정된 사실을 진술하는 것과 달리, 이 절은 둘 중 어느 쪽인지 모르는 상태를 표현한다는 점이 핵심 차이다. whether는 주어 자리나 to부정사 앞, 전치사 뒤에도 쓸 수 있지만 if는 주로 목적어 자리에만 쓰인다는 제약이 있다.",
  "example": {
   "en": "I'm not sure whether he will come to the party.",
   "ko": "그가 파티에 올지 안 올지 잘 모르겠다."
  }
 },
 "noun-clause-wh-question": {
  "category": "명사절",
  "name_kr": "의문사 명사절(간접의문문)",
  "desc_kr": "what/who/where/when/why/how 같은 의문사가 이끄는 절이 문장 속에 통째로 들어가 명사 역할을 하는 용법으로, 흔히 '간접의문문'이라 부른다. 직접 의문문과 달리 어순이 '의문사+주어+동사'로 평서문 어순을 유지한다는 점이 가장 큰 특징이자 실수하기 쉬운 부분이다(Do you know where is he? 처럼 도치하면 틀림). that절이 사실을 그대로 진술하는 것과 달리, 의문사절은 그 의문사에 해당하는 정보 자체를 담는다.",
  "example": {
   "en": "Could you tell me where the nearest station is?",
   "ko": "가장 가까운 역이 어디인지 알려주시겠어요?"
  }
 },
 "noun-clause-apposition": {
  "category": "명사절",
  "name_kr": "동격의 that",
  "desc_kr": "fact, idea, news, rumor 같은 특정 추상명사 바로 뒤에 that절을 붙여 그 명사의 구체적인 내용을 설명하는 용법이다. 관계대명사 that과 헷갈리기 쉬운데, 관계대명사 that절은 앞의 명사를 대신할 목적어나 주어 자리가 절 안에 비어 있는 반면 동격의 that절은 완전한 문장 구조를 그대로 갖춘다는 점이 결정적 차이다. 즉 that 뒤에 문장 성분이 하나도 안 빠진 완전한 절이 오면 동격, 하나가 비어 있으면 관계대명사다.",
  "example": {
   "en": "I heard the rumor that she is quitting her job.",
   "ko": "나는 그녀가 회사를 그만둔다는 소문을 들었다."
  }
 },
 "parallelism-coordinating-conjunction": {
  "category": "병렬구조",
  "name_kr": "등위접속사 병렬구조",
  "desc_kr": "and, but, or 같은 등위접속사로 두 개 이상의 단어·구·절을 연결할 때는 앞뒤 요소가 같은 문법적 형태를 갖춰야 한다는 원칙이다. 예를 들어 앞에 동명사가 왔으면 뒤에도 동명사가 와야 하고, 앞이 to부정사면 뒤도 to부정사여야 자연스럽다. 형태를 맞추지 않으면 문법적으로 틀리진 않아도 균형이 깨져 어색하게 읽히므로, 영어 글쓰기에서 특히 중요하게 다뤄지는 원칙이다.",
  "example": {
   "en": "She enjoys reading, writing, and traveling.",
   "ko": "그녀는 독서, 글쓰기, 여행하는 것을 즐긴다."
  }
 },
 "correlative-conjunction": {
  "category": "병렬구조",
  "name_kr": "상관접속사(not only~but also 등)",
  "desc_kr": "not only~but also, either~or, neither~nor, both~and처럼 두 단어가 짝을 이뤄 대등한 두 요소를 연결하는 접속사다. 등위접속사 병렬구조와 마찬가지로 두 짝 뒤에 오는 요소는 문법적으로 같은 형태여야 한다는 원칙이 그대로 적용되지만, 상관접속사는 짝의 앞부분이 무엇을 연결하는지에 따라 그 뒤에 이어지는 요소의 형태가 자동으로 정해진다는 점이 다르다. not only가 문두에 오면 주어와 동사가 도치된다는 점도 함께 알아둬야 하는 포인트다.",
  "example": {
   "en": "He is not only smart but also hardworking.",
   "ko": "그는 똑똑할 뿐만 아니라 성실하기도 하다."
  }
 },
 "parallelism-gerund-infinitive-consistency": {
  "category": "병렬구조",
  "name_kr": "동명사·to부정사 병렬 일치",
  "desc_kr": "한 문장 안에서 여러 동사를 나열할 때 동명사와 to부정사를 섞어 쓰지 않고 한 가지 형태로 통일해야 한다는 원칙이다. 단순히 접속사로 연결된 병렬구조 전반의 규칙을 동명사/to부정사라는 구체적인 형태 하나에 좁혀 적용한 것으로, like, enjoy, prefer처럼 목적어로 둘 다 취할 수 있는 동사 뒤에서 특히 자주 실수가 나온다. 형태를 섞으면 문법 오류로 지적받는 대표적인 지점이라 영작문에서 꼭 점검해야 하는 부분이다.",
  "example": {
   "en": "I like to swim and to hike, not to swim and hiking.",
   "ko": "나는 수영하는 것과 등산하는 것을 좋아하는데, 이때 형태를 섞어 쓰면 안 된다."
  }
 },
 "double-negative": {
  "category": "부정 표현",
  "name_kr": "이중부정",
  "desc_kr": "부정어(not, no, never 등)를 한 문장 안에 두 번 겹쳐 써서 오히려 강한 긍정의 뜻을 만드는 용법이다. 표준 영어에서는 not ~ without처럼 의도적으로 짝을 이룬 이중부정만 인정되고, I don't have no money처럼 부정어를 단순히 겹쳐 부정을 강조하는 것은 비표준·구어체로 취급된다는 점을 한국 학습자는 특히 주의해야 한다. 핵심은 '부정×부정=긍정'이라는 논리이므로, 두 부정어를 없애고 긍정문으로 바꿔도 같은 뜻이 나와야 제대로 쓴 것이다.",
  "example": {
   "en": "There is not a day that goes by without me thinking of you.",
   "ko": "너를 생각하지 않고 지나가는 날이 하루도 없다."
  }
 },
 "partial-negation-not-all": {
  "category": "부정 표현",
  "name_kr": "부분부정(not all/every)",
  "desc_kr": "all, every, both처럼 '전체'를 뜻하는 말 앞에 not을 붙이면 전체를 통째로 부정하는 것이 아니라 '전부는 아니다'라는 뜻이 된다는 용법이다. 즉 not all students은 '학생이 한 명도 아니다'가 아니라 '학생 중 일부만 그렇다'는 뜻으로, 전체부정(no student, none)과 반드시 구별해야 한다. 이 차이를 놓치면 문장의 논리적 의미가 정반대로 오독될 수 있어 독해에서 자주 함정으로 나온다.",
  "example": {
   "en": "Not all of the students passed the exam.",
   "ko": "학생들 전부가 시험에 통과한 것은 아니다."
  }
 },
 "partial-negation-not-always": {
  "category": "부정 표현",
  "name_kr": "부분부정(not always/necessarily)",
  "desc_kr": "always, necessarily처럼 '항상·반드시'를 뜻하는 부사 앞에 not을 붙여 '항상 그런 건 아니다'라는 뜻을 만드는 용법이다. not all이 대상의 '수량'(전부/일부)에 대한 부분부정이라면, 이쪽은 빈도나 필연성에 대한 부분부정이라는 점에서 성격이 다르다. '전혀 아니다(never)'와 혼동하지 않도록, '그런 경우도 있고 아닌 경우도 있다'는 뉘앙스로 읽어야 한다.",
  "example": {
   "en": "Expensive things are not always the best.",
   "ko": "비싼 것이 항상 가장 좋은 것은 아니다."
  }
 },
 "concession-although-while": {
  "category": "접속사·접속부사",
  "name_kr": "양보의 접속사(although/while)",
  "desc_kr": "although, though, even though, while 등은 뒤에 이어지는 내용과 반대되거나 예상 밖인 사실을 주절에서 말할 것임을 미리 알리는 접속사다. '~에도 불구하고'로 해석되며, 원인-결과를 나타내는 접속사와 달리 앞뒤 내용이 논리적으로 충돌한다는 점이 핵심이다. while은 '~인 반면'이라는 대조의 뜻으로도 쓰이는데, 이때는 시간(~하는 동안)의 의미와 헷갈리지 않도록 문맥으로 구분해야 한다.",
  "example": {
   "en": "Although it was raining, we went out for a walk.",
   "ko": "비가 오는데도 우리는 산책을 나갔다."
  }
 },
 "reason-since-as-because": {
  "category": "접속사·접속부사",
  "name_kr": "이유의 접속사(since/as/because)",
  "desc_kr": "because, since, as는 모두 '~때문에'로 원인을 나타내지만 강조점이 조금씩 다르다. because는 원인 그 자체가 문장의 핵심 정보일 때 쓰이는 반면, since와 as는 듣는 사람도 이미 알 만한 배경 이유를 가볍게 덧붙일 때 자주 쓰인다. since는 '~한 이래로'라는 시간의 뜻도 있어 문맥상 이유인지 시간인지 구별해야 하는 점이 학습자들이 자주 헷갈리는 부분이다.",
  "example": {
   "en": "Since it was already late, we decided to stay home.",
   "ko": "이미 시간이 늦었으니 우리는 집에 있기로 했다."
  }
 },
 "condition-unless-provided": {
  "category": "접속사·접속부사",
  "name_kr": "조건의 접속사(unless/provided that)",
  "desc_kr": "unless는 '만약 ~하지 않는다면'이라는 뜻으로 if ~ not과 같은 의미를 한 단어로 압축한 접속사이고, provided (that)/providing (that)은 '~라는 조건 하에서만'이라는 뜻으로 특정 조건이 반드시 충족되어야 함을 강조하는 접속사다. unless가 '부정적 예외 상황'을 짚는 느낌이라면, provided that은 계약이나 규정처럼 '조건 충족'을 못 박는 격식체 표현에 더 잘 어울린다. 둘 다 조건절이므로 if절과 마찬가지로 미래의 일이라도 현재시제로 쓴다는 점을 잊지 말아야 한다.",
  "example": {
   "en": "You can join the club unless you are under twelve.",
   "ko": "열두 살 미만이 아니라면 그 동아리에 가입할 수 있다."
  }
 },
 "contrast-however-conjunctive-adverb": {
  "category": "접속사·접속부사",
  "name_kr": "대조의 접속부사(however 등)",
  "desc_kr": "however, nevertheless, on the other hand 같은 접속부사는 although와 달리 두 절을 문법적으로 하나로 묶어주는 접속사가 아니라 독립된 두 문장 사이에서 대조 관계를 이어주는 부사다. 그래서 접속부사 앞에는 마침표나 세미콜론이 와야 하고, 콤마만 찍어 두 문장을 잇는 것(콤마 스플라이스)은 문법 오류로 취급된다는 점이 although/though와의 결정적 차이다. 뜻은 '그러나·그럼에도'로 비슷해 보여도 품사와 문장 연결 방식이 다르다는 것이 핵심이다.",
  "example": {
   "en": "The plan was risky; however, it eventually paid off.",
   "ko": "그 계획은 위험했지만, 결국에는 성과를 거두었다."
  }
 },
 "purpose-so-that-in-order-that": {
  "category": "접속사·접속부사",
  "name_kr": "목적의 접속사(so that/in order that)",
  "desc_kr": "so that과 in order that은 '~하기 위해서, ~하도록'이라는 목적을 나타내는 절을 이끄는 접속사로, 절 안에는 흔히 can/could, will/would 같은 조동사가 함께 쓰인다. in order that은 격식을 갖춘 문어체에서 주로 쓰이고 so that은 구어에서도 자유롭게 쓰인다는 격식 차이가 있다. to부정사로도 같은 목적을 나타낼 수 있지만, 주절과 목적절의 주어가 다를 때는 to부정사 대신 이 접속사절을 써야 한다는 점이 실질적인 구분 기준이다.",
  "example": {
   "en": "She spoke slowly so that everyone could understand.",
   "ko": "그녀는 모두가 이해할 수 있도록 천천히 말했다."
  }
 },
 "too-to": {
  "category": "준동사 관용 표현",
  "name_kr": "too ~ to",
  "desc_kr": "'too+형용사/부사+to부정사'는 '너무 ~해서 …할 수 없다'는 부정적 결과를 나타내는 관용 표현이다. 형태만 보면 긍정문처럼 생겼지만 의미상 부정(할 수 없다)이 숨어 있다는 점이 핵심이며, so ~ that 구문의 결과절을 not을 따로 안 쓰고도 부정적으로 압축한 것으로 이해하면 편하다. 반대로 '충분히 ~해서 …할 수 있다'는 긍정적 결과를 나타내려면 enough to 구문을 써야 한다는 점에서 대비된다.",
  "example": {
   "en": "The coffee was too hot to drink.",
   "ko": "그 커피는 너무 뜨거워서 마실 수가 없었다."
  }
 },
 "enough-to": {
  "category": "준동사 관용 표현",
  "name_kr": "형용사/부사 + enough to",
  "desc_kr": "'형용사/부사+enough+to부정사'는 '~할 만큼 충분히 …하다'는 긍정적 결과를 나타내는 관용 표현이다. enough는 형용사나 부사 뒤에 놓인다는 어순이 특징이며(enough smart가 아니라 smart enough), too ~ to가 부정적 결과(할 수 없음)를 담는 것과 정반대로 이쪽은 결과가 충족되어 가능해졌다는 뜻을 담는다. 명사를 수식할 때는 enough가 명사 앞에 온다는 점(enough time)도 형용사/부사 수식과 어순이 다르다는 걸 함께 알아둘 만하다.",
  "example": {
   "en": "He is old enough to drive a car.",
   "ko": "그는 차를 운전할 수 있을 만큼 나이가 충분히 들었다."
  }
 },
 "so-that-such-that": {
  "category": "준동사 관용 표현",
  "name_kr": "so ~ that / such ~ that",
  "desc_kr": "'so+형용사/부사+that'과 'such+(a/an)+형용사+명사+that'은 둘 다 '너무 ~해서 …하다'는 정도와 그 결과를 함께 설명하는 구문이지만, so는 형용사·부사를 바로 수식하고 such는 명사(구)를 수식한다는 점에서 붙는 위치가 다르다. too ~ to가 to부정사로 결과를 짧게 압축하는 반면, 이 구문은 that절로 결과를 온전한 문장 형태로 풀어서 더 구체적으로 설명할 수 있다는 차이가 있다. such 뒤에 단수 가산명사가 오면 관사 a/an을 반드시 챙겨야 한다는 점도 실수하기 쉬운 부분이다.",
  "example": {
   "en": "It was such an exciting movie that I watched it twice.",
   "ko": "그 영화가 너무 재미있어서 나는 두 번이나 봤다."
  }
 },
 "parenthetical-comma-insertion": {
  "category": "삽입구문",
  "name_kr": "콤마 삽입절",
  "desc_kr": "문장 중간에 콤마로 부가 설명이나 화자의 생각을 끼워 넣는 용법으로, 삽입된 부분을 통째로 빼도 문장의 골격(주어+동사+목적어 등)은 그대로 완전하게 남는다는 것이 특징이다. 관계대명사의 계속적 용법이 앞 명사에 대한 추가 정보를 붙이는 것과 달리, 이 삽입구문은 명사 하나에 얽매이지 않고 문장 전체에 대한 보충 설명(예: 동격어구, 부사구, 화자의 의견)을 자유롭게 끼워 넣을 수 있다는 점이 다르다. 읽을 때는 콤마와 콤마 사이를 잠깐 끊어 읽으면 자연스럽다.",
  "example": {
   "en": "My father, a retired teacher, still enjoys reading every day.",
   "ko": "은퇴한 선생님인 우리 아버지는 지금도 매일 독서를 즐기신다."
  }
 },
 "embedded-i-think-relative-clause": {
  "category": "삽입구문",
  "name_kr": "관계사절 안의 I think류 삽입절",
  "desc_kr": "관계대명사절 안에 I think, I believe, they say 같은 짧은 절이 끼어들어, 마치 원래 있던 절인 것처럼 자연스럽게 녹아드는 용법이다. 이 I think 등은 문법적으로 필수 성분이 아니라 화자의 판단이나 추측을 살짝 덧붙이는 삽입절이므로 통째로 빼도 관계사절의 문법 구조는 완전하게 성립한다. 일반 콤마 삽입절과 달리 콤마 없이 관계대명사 바로 뒤에 바짝 붙어서, 마치 관계사절의 동사를 수식하는 것처럼 보이는 형태로 나타난다는 점이 구별 포인트다.",
  "example": {
   "en": "She is the kind of person who I think will succeed no matter what.",
   "ko": "그녀는 내 생각엔 무슨 일이 있어도 성공할 사람이다."
  }
 }
};
