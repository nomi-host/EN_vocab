# 로고 슬롯머신 스플래시 (2026-07-20)

실제 배포 에셋: `../../img/splash/splash.json` (base64 임베디드, lottie-web로 재생).
`index.html`의 `SplashScreen` 컴포넌트가 앱 첫 마운트 시 재생 — 인트로 롤링 → "No"에
안착해 "NoEnglish" 완성 → 전체 페이드아웃 → 언마운트(그 시점부터 실제 앱 노출).

## 레퍼런스
Figma `CNkoxXlAe9nDCYJAwzMChZ` node `20:406`("splash" 프레임, 402×874, 배경 `#211C15`).
`../splash_ref/`에 원본 노드 다운로드본 보관(`splash_node_408.svg`=전체 로고,
`430`=No/핑크, `431`=oH/라임, `432`=YeS/블루). 폰트는 Luckiest Guy(사용자 확인).

## 컨셉
로고의 흰(크림) "No" 자리에서 **oH → No → Yes**가 슬롯머신처럼 빠르게 돌다가 점점
느려지며(ease-out) 마지막에 **크림색 "No"**(로고와 완전히 같은 글자)에 안착 →
"NoEnglish" 완성 → 전체 페이드아웃.

## 에셋 제작
전체 로고 SVG(`splash_node_408.svg`)는 10개 `<path>`로 구성 — **인덱스 0,1이 "No"
(N+o, o는 구멍 있는 복합 패스), 2~9가 "English" 7글자+i의 점**. `build_splash.py`가
이 path들을 두 그룹으로 쪼개 재조립:
- `no_cream.svg`/`no_pink.svg`: path[0:2]를 각각 크림(#FFFAF1)/핑크(#FFB4D4)로 재색칠.
- `english_cream.svg`: path[2:]를 크림으로(정적 English 레이어 전용, 244×38 캔버스 유지).
- **릴 심볼(oH/No/Yes) 4종은 최종 릴 창 폭(`REEL_W`)과 같은 캔버스에 바로 렌더** —
  중간에 244폭 캔버스를 거쳐 크롭하던 단계는 폐기(불필요한 중간 단계였음). 전부
  **바닥선 정렬**(`translate y = 38 - 자기 높이`) + **`REEL_W` 기준 우측 정렬**
  (`translate x = REEL_W - 자기 너비`)로 배치 — 오른쪽 끝을 전부 맞추면 "No"가 안착할
  때 "English"와 이어지는 위치가 자동으로 일치함.
- **`REEL_W`는 처음 61(="No" 자신의 폭)이었다가 80(="Yes"의 폭)으로 재조정(2026-07-20)**
  — 61폭일 땐 우측정렬을 해도 **창 자체가 61폭이라 Yes(80폭)의 왼쪽이 여전히 잘림**
  (사용자가 "Y가 반이 잘렸다"고 재지적). 창을 Yes 폭에 맞춰 넓히되, **창의 오른쪽 끝은
  그대로 `LOGO_X+61`에 고정**(`WINDOW_RIGHT` 상수) — 그래야 안착한 "No"가 여전히
  "English" 시작 지점과 픽셀 단위로 맞물림. oH/No처럼 80보다 좁은 심볼은 왼쪽에 약간의
  투명 여백만 생길 뿐 잘리지 않음.
- `rasterize.py` — Playwright(Chromium headless)로 각 심볼을 자기 캔버스 크기의 F=6배로
  래스터(`*_reel80.png`). English만 여전히 244×38 캔버스(별도 정적 레이어라 릴 창 폭과
  무관).

## Lottie 구조 (`build_splash.py`)
- comp 402×874, 60fps. 배경은 도형 레이어(rc+fill, `sid:"bgColor"` 슬롯) — 이미지 아님.
- "English"는 정적 이미지 레이어(항상 표시).
- **릴(reel)**: 13칸(oH·No·Yes ×4 + 마지막 크림 No 1개)을 **하나의 precomp**
  (`comp_reel_content`, `REEL_W`×38)에 넣고 **각 칸이 자기 자신의 position 키프레임**을
  가짐(전부 같은 시작 시각·같은 ease, 값만 자기 행 위치만큼 오프셋) — "부모 트랜스폼
  하나가 전체를 미는" 방식(중첩 comp-안-comp 또는 parent 링크) 대신 이렇게 만든 이유는
  아래 실패 사례 참고. 메인 comp에는 이 precomp을 참조하는 레이어 **하나만** 두고
  위치 고정(오른쪽 끝은 `WINDOW_RIGHT`에 맞춤), `w`/`h`(`REEL_W`×38)를 선언해두면
  **그 크기로 자동 클리핑됨**(창 역할).
- 이징: `settle-soft`(`.00,.65,.51,.99`, text-to-lottie 스킬의 "로고 안착" 앵커) 단일
  세그먼트로 0→−540(13칸×45유닛) — ease-out 자체가 "처음엔 빠르게 여러 칸 지나가다
  뒤로 갈수록 느려지는" 슬롯머신 감속을 자연히 만들어줌(별도 스텝 키프레임 불필요).
- 전체 페이드아웃(hold→end)은 모든 레이어에 **같은** opacity 키프레임 객체를 공유
  (배경 도형까지 같이 사라져야 언마운트 시 아무 잔상도 안 남음).

## 실패했던 접근 + 알게 된 것(재발 방지)
- **레이어 배열 순서 = 스태킹 순서, 인덱스 0이 맨 앞(위)** — 배경 도형 레이어를 배열
  맨 앞에 넣었더니 다른 모든 레이어를 덮어버려 화면에 아무것도 안 보이는 버그가
  있었음(Skottie로 처음 검증할 때 발견). **불투명한 배경 레이어는 항상 배열 마지막에
  넣을 것.**
- **comp-안에-comp(2단 중첩)는 Skottie에선 잘 됐는데 실제 배포 렌더러인
  lottie-web에서는 아무것도 안 그려짐(에러도 없이 조용히 실패)** — "릴 전체를 미는
  부모 comp" + "그 부모를 다시 참조하는 자식 comp" 2단 구조를 "각 칸이 자기 위치
  키프레임을 갖는 단일 precomp"로 단순화해서 해결. **Skottie 검증만으로 끝내지 말고
  실제 배포 렌더러(이 프로젝트는 lottie-web)로도 반드시 확인할 것** — 두 렌더러가
  같은 스펙이어도 fragile한 기능(정확히는 `references/svg-compatibility.md`·
  player-contract가 경고한 "마스크·프리컴프·타임리맵")에서 실제로 결과가 갈릴 수 있음.
- **명시적 사각형 마스크(`masksProperties`)가 lottie-web에서 거의 안 보이는 조각으로
  깨졌음** — 원인 후보: 마스크 path의 `i`/`o`(베지어 탄젠트) 값을 `[0,0]`(직선 의도)
  으로 준 것을 lottie-web의 마스크 파싱 경로가 다르게 해석해 `C0,0 0,0 x,y` 같은
  퇴화 곡선으로 변환됨 — 결과적으로 거의 접힌 도형이 됨(mask 전용 코드 경로가 일반
  shape 경로 파싱과 다른 듯). **경로 자체를 마스크로 클리핑하려 하지 말고, precomp의
  `w`/`h`를 선언해 그 크기로 자동 클리핑되는 쪽을 먼저 시도할 것** — 이번에 그 방법이
  Skottie·lottie-web 둘 다에서 문제없이 동작함을 확인함(추가 마스크 불필요).
- **`masksProperties`를 꼭 써야 한다면 `x`(마스크 확장/페더) 속성이 없으면 lottie-web이
  그 마스크를 완전히 무시(내용 전체가 안 보임)했었다** — 표준 bodymovin 출력엔 있는
  속성인데 수기로 작성하다 빠뜨리기 쉬움. 그래도 이번 케이스는 `w`/`h` 클리핑으로
  대체해 최종본엔 마스크 자체가 없음.

## 앱 통합
`index.html`의 `SplashScreen`(App 컴포넌트 최상위, `showSplash` state) —
`fetch("img/splash/splash.json?v="+APP_VERSION)` → `lottie.loadAnimation({loop:false,
autoplay:true})` → `complete` 이벤트에서 `onDone()`(→ `setShowSplash(false)`로 그 시점에
바로 언마운트, 별도 CSS 페이드 불필요 — Lottie 안에서 이미 다 페이드된 상태라 언마운트
순간 시각적 점프 없음). `.splash-screen`은 `.app`과 같은 `max-width:520px`로 데스크톱
폭도 일치.
