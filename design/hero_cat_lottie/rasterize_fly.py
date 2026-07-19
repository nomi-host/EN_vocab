import os
from playwright.sync_api import sync_playwright

SRC = "/Users/minyoungkim/Documents/claude/EN_vocab/design/rough"
OUT = "/private/tmp/claude-501/-Users-minyoungkim/50c2291d-925e-4f1d-8e28-362bba67ec5e/scratchpad/ghost_fly"
F = 3
CVB = 200

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(device_scale_factor=1)
    page.set_viewport_size({"width": CVB*F, "height": CVB*F})
    for i in range(1, 11):
        fn = f"ghost-fly-{i:02d}.svg"
        s = open(os.path.join(SRC, fn), encoding="utf-8").read()
        page.set_content(f'<body style="margin:0;padding:0">{s}</body>')
        page.wait_for_timeout(40)
        el = page.query_selector("svg")
        out_path = os.path.join(OUT, f"fly{i:02d}.png")
        el.screenshot(path=out_path, omit_background=True)
        print(fn, "->", out_path)
    browser.close()
