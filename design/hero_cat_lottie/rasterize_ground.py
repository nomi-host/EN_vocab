from playwright.sync_api import sync_playwright
import os

HERE = os.path.dirname(os.path.abspath(__file__))
GROUND = open(os.path.join(HERE, "ground_group.svg"), encoding="utf-8").read()
F = 3
STROKE = 2.0  # 원본 hero_example_2.svg 스펙(cls-5/cls-9 stroke-width:2px) 그대로 — 1.68px(캐릭터 선
              # 굵기 맞춤)로 줄였다가 "너무 얇다"는 재지적(2026-07-19)으로 원복.
# cls-9(돌/자갈 마크)는 원본에 fill:#fffcf8(크림) 지정이 있는데, 이전 버전은 cls-5/cls-9를 한 스타일로
# 묶어 fill:none을 강제하는 바람에 돌 채움색이 사라졌었음(2026-07-19 버그 발견) — 반드시 분리할 것.
STYLE = (f'<defs><style>'
         f'.cls-5{{fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:{STROKE}px;}}'
         f'.cls-9{{fill:#fffcf8;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:{STROKE}px;}}'
         f'</style></defs>')
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 185 350 30" width="{350*F}" height="{30*F}">{STYLE}{GROUND}</svg>'

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(device_scale_factor=1)
    pg.set_content(f'<body style="margin:0;padding:0">{svg}</body>')
    pg.wait_for_timeout(60)
    el = pg.query_selector("svg")
    el.screenshot(path=os.path.join(HERE, "ground.png"), omit_background=True)
    b.close()
print("done")
