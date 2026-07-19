import json, base64, os

SCENE_DIR = "/private/tmp/claude-501/-Users-minyoungkim/50c2291d-925e-4f1d-8e28-362bba67ec5e/scratchpad/splash-lottie/public/projects/no-english-splash/scene-1"
ASSETS_DIR = "/private/tmp/claude-501/-Users-minyoungkim/50c2291d-925e-4f1d-8e28-362bba67ec5e/scratchpad/splash_assets"

FPS = 60
W, H = 402, 874
F = 6.0
S = round(100.0 / F, 4)  # image layer scale: raster px -> comp units

ROLL_END = 150
HOLD_END = 190
FADE_END = 220

CELL_H = 45
CELLS = ["oh_lime", "no_pink", "yes_blue"] * 4 + ["no_cream"]  # 13 cells, last = final landing
N_CELLS = len(CELLS)
FINAL_Y = -(N_CELLS - 1) * CELL_H  # -540

REEL_W, REEL_H = 80, 38  # window widened to fit "Yes" (80 units) fully — was 61 (No's own width), which
                          # right-aligning alone couldn't fix since the WINDOW itself was still clipping it.
LOGO_X, LOGO_Y = 79, 410  # matches Figma splash layout (node 20:408 position)
WINDOW_RIGHT = LOGO_X + 61  # fixed anchor: "No"'s right edge must stay flush against "English" at this x
FULL_W_PX, FULL_H_PX = 244 * F, 38 * F
CELL_W_PX, CELL_H_PX = REEL_W * F, 38 * F

SETTLE_SOFT = (0.00, 0.65, 0.51, 0.99)


def b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")


def img_asset(aid, filename, w, h):
    return {"id": aid, "w": int(w), "h": int(h), "u": "", "p": f"data:image/png;base64,{b64(os.path.join(ASSETS_DIR, filename))}", "e": 1}


def stat(v):
    return {"a": 0, "k": v}


def ease_kf(t0, v0, t1, v1, ease):
    x1, y1, x2, y2 = ease
    return {"a": 1, "k": [
        {"t": t0, "s": v0, "i": {"x": [x2], "y": [y2]}, "o": {"x": [x1], "y": [y1]}},
        {"t": t1, "s": v1},
    ]}


def image_layer(ind, ref_id, w_px, h_px, pos, name, parent=None):
    layer = {
        "ddd": 0, "ind": ind, "ty": 2, "nm": name, "refId": ref_id, "sr": 1,
        "ks": {"o": stat(100), "r": stat(0), "p": pos if isinstance(pos, dict) else stat(pos),
               "a": stat([w_px / 2, h_px / 2, 0]), "s": stat([S, S, 100])},
        "ao": 0, "ip": 0, "op": FADE_END, "st": 0, "bm": 0,
    }
    if parent is not None:
        layer["parent"] = parent
    return layer


CELL_REF = {"oh_lime": "img_oh_lime", "no_pink": "img_no_pink", "yes_blue": "img_yes_blue", "no_cream": "img_no_cream"}

assets = []
assets.append(img_asset("img_no_cream", "no_cream_reel80.png", CELL_W_PX, CELL_H_PX))
assets.append(img_asset("img_no_pink", "no_pink_reel80.png", CELL_W_PX, CELL_H_PX))
assets.append(img_asset("img_oh_lime", "oh_lime_reel80.png", CELL_W_PX, CELL_H_PX))
assets.append(img_asset("img_yes_blue", "yes_blue_reel80.png", CELL_W_PX, CELL_H_PX))
assets.append(img_asset("img_english", "english_cream.png", FULL_W_PX, FULL_H_PX))

# ---------- reel_content: single precomp, 13 cells each with its OWN animated position ----------
# (avoids comp-inside-comp nesting, which lottie-web failed to render even though Skottie was fine with it —
#  every cell moves by the same amount via identical per-layer keyframe timing/easing, just offset by its own
#  base row position, so the net visual effect is the same as a single scrolling strip.)
reel_content_layers = []
for i, cell in enumerate(CELLS):
    base_y = i * CELL_H + REEL_H / 2
    pos_anim = ease_kf(0, [REEL_W / 2, base_y, 0], ROLL_END, [REEL_W / 2, base_y + FINAL_Y, 0], SETTLE_SOFT)
    reel_content_layers.append(image_layer(i + 1, CELL_REF[cell], CELL_W_PX, CELL_H_PX, pos_anim, f"cell_{i}_{cell}"))
assets.append({"id": "comp_reel_content", "nm": "reel_content", "fr": FPS, "w": int(REEL_W), "h": int(REEL_H), "layers": reel_content_layers})

# ---------- main comp ----------
layers = []

# background: shape layer (slot-compatible fill) instead of a solid layer
bg_layer = {
    "ddd": 0, "ind": 1, "ty": 4, "nm": "background", "sr": 1,
    "ks": {"o": stat(100), "r": stat(0), "p": stat([0, 0, 0]), "a": stat([0, 0, 0]), "s": stat([100, 100, 100])},
    "ao": 0, "ip": 0, "op": FADE_END, "st": 0, "bm": 0,
    "shapes": [
        {"ty": "gr", "nm": "bg", "it": [
            {"ty": "rc", "d": 1, "s": stat([W, H]), "p": stat([W / 2, H / 2]), "r": stat(0)},
            {"ty": "fl", "c": {"a": 0, "k": [0.1294, 0.1098, 0.0824, 1], "sid": "bgColor"}, "o": stat(100)},
            {"ty": "tr", "p": stat([0, 0]), "a": stat([0, 0]), "s": stat([100, 100]), "r": stat(0), "o": stat(100)},
        ]},
    ],
}
# english (static wordmark) — asset canvas is the full 244-wide frame; only x:61..244 has ink.
english_layer = image_layer(2, "img_english", FULL_W_PX, FULL_H_PX,
                             [LOGO_X + 244 / 2, LOGO_Y + 38 / 2, 0], "english")

# reel window: fixed position; clipping comes from the referenced precomp's own declared w/h
# (verified empirically in both Skottie and lottie-web — an explicit rect mask here rendered
# as a near-degenerate path in lottie-web's mask code path and is not needed).
reel_layer = {
    "ddd": 0, "ind": 3, "ty": 0, "nm": "reel_window", "refId": "comp_reel_content", "sr": 1,
    "ks": {"o": stat(100), "r": stat(0), "p": stat([WINDOW_RIGHT - REEL_W / 2, LOGO_Y + REEL_H / 2, 0]),
           "a": stat([REEL_W / 2, REEL_H / 2, 0]), "s": stat([100, 100, 100])},
    "ao": 0, "ip": 0, "op": FADE_END, "st": 0, "bm": 0,
    "w": int(REEL_W), "h": int(REEL_H),
}
# stacking order: array index 0 = frontmost. reel (front) -> english -> background (back).
layers.append(reel_layer)
layers.append(english_layer)
layers.append(bg_layer)

# whole-scene fade out (locked, same on every layer)
fade_anim = {"a": 1, "k": [
    {"t": HOLD_END, "s": [100], "i": {"x": [0.42], "y": [1]}, "o": {"x": [0.58], "y": [0]}},
    {"t": FADE_END, "s": [0]},
]}
for l in layers:
    l["ks"]["o"] = fade_anim

lottie = {
    "v": "5.7.4", "fr": FPS, "ip": 0, "op": FADE_END, "w": W, "h": H, "nm": "NoEnglish Splash",
    "ddd": 0, "assets": assets, "layers": layers,
    "slots": {"bgColor": {"p": stat([0.1294, 0.1098, 0.0824, 1])}},
}

out_path = os.path.join(SCENE_DIR, "lottie.json")
json.dump(lottie, open(out_path, "w"))
print("written", out_path, "bytes", os.path.getsize(out_path))

controls = {"controls": [{"sid": "bgColor", "label": "Background color"}]}
json.dump(controls, open(os.path.join(SCENE_DIR, "controls.json"), "w"), indent=2)
print("controls written")
