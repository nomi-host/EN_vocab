import os
from playwright.sync_api import sync_playwright

SRC = "/Users/minyoungkim/Documents/claude/EN_vocab/design/rough"
OUT = "/private/tmp/claude-501/-Users-minyoungkim/50c2291d-925e-4f1d-8e28-362bba67ec5e/scratchpad/ghost_v2/build"
F = 3
CVB = 200  # both sets already share a common 200x200 viewBox, no forcing needed

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(device_scale_factor=1)
    page.set_viewport_size({"width": CVB*F, "height": CVB*F})
    for name, n in [("walk", 5), ("run", 6)]:
        for i in range(1, n+1):
            fn = f"ghost-{name}-{i:02d}.svg"
            s = open(os.path.join(SRC, fn), encoding="utf-8").read()
            page.set_content(f'<body style="margin:0;padding:0">{s}</body>')
            page.wait_for_timeout(40)
            el = page.query_selector("svg")
            out_path = os.path.join(OUT, f"{name}{i:02d}.png")
            el.screenshot(path=out_path, omit_background=True)
            print(fn, "->", out_path)
    browser.close()
