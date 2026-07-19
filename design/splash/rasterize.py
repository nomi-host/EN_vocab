import os
from playwright.sync_api import sync_playwright

OUT = "/private/tmp/claude-501/-Users-minyoungkim/50c2291d-925e-4f1d-8e28-362bba67ec5e/scratchpad/splash_assets"
F = 6  # scale factor for crisp raster (244*6=1464 wide)
W, H = 244, 38

names = ["no_cream", "no_pink", "oh_lime", "yes_blue", "english_cream"]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(device_scale_factor=1)
    page.set_viewport_size({"width": W*F, "height": H*F})
    for name in names:
        svg_path = os.path.join(OUT, f"{name}.svg")
        s = open(svg_path, encoding="utf-8").read()
        s = s.replace('viewBox="0 0 244 38"', f'viewBox="0 0 244 38" width="{W*F}" height="{H*F}"')
        page.set_content(f'<body style="margin:0;padding:0">{s}</body>')
        page.wait_for_timeout(40)
        el = page.query_selector("svg")
        out_path = os.path.join(OUT, f"{name}.png")
        el.screenshot(path=out_path, omit_background=True)
        print(name, "->", out_path)
    browser.close()
