import json, math, base64, os
from PIL import Image

SCENE = "/private/tmp/claude-501/-Users-minyoungkim/50c2291d-925e-4f1d-8e28-362bba67ec5e/scratchpad/ghost_v2/build"
F = 3.0
S = round(100.0 / F, 4)
FPS = 30
W = H = 200

def px(fn): return Image.open(os.path.join(SCENE, fn)).size
def hold_kf(t, v): return {"t": t, "s": [v], "h": 1}
def kf(t, v, last=False):
    k = {"t": t, "s": v}
    if not last: k["i"] = {"x":[0.5],"y":[1]}; k["o"] = {"x":[0.5],"y":[0]}
    return k
def stat(v): return {"a": 0, "k": v}
def anim(k): return {"a": 1, "k": k}

def bob(op, center, amp=2.0):
    per = op / 2; pts = []; t = 0
    while t <= op:
        y = center[1] - amp*0.5*(1-math.cos((t/per)*2*math.pi))
        pts.append((t, round(y, 2))); t += per/2
    out = []
    for j, (t, y) in enumerate(pts):
        out.append(kf(t, [center[0], y, 0], last=(j == len(pts)-1)))
    return anim(out)

def build(name, n_poses, frames_per_pose, out_name, nm, y_shift):
    # 2026-07-19: 새 .hero-cat 박스(28.1/26.8/41.2/67.1%)에 맞춰 접지 위치 재계산 —
    # 걷기/달리기가 원본 포즈 bbox가 달라 필요한 하강량도 다름(walk +11, run +15).
    center = [W/2, H/2 + y_shift]
    op = frames_per_pose * n_poses
    assets = []; layers = []; ind = 1
    def ni():
        nonlocal ind; v = ind; ind += 1; return v
    for i in range(n_poses):
        n = i + 1
        rid = f"{name}{n:02d}"; fn = f"{name}{n:02d}.png"
        w, h = px(fn)
        assets.append({"id": rid, "w": w, "h": h, "u": "", "p": fn, "e": 0})
        fpp = frames_per_pose
        if i == 0:
            op_kfs = [hold_kf(0, 100), hold_kf(fpp, 0)]
        else:
            op_kfs = [hold_kf(0, 0), hold_kf(i*fpp, 100), hold_kf(i*fpp+fpp, 0)]
        layers.append({"ddd":0,"ind":ni(),"ty":2,"nm":fn,"refId":rid,"sr":1,
            "ks":{"o":anim(op_kfs),"r":stat(0),"p":bob(op, center),"a":stat([w/2,h/2,0]),"s":stat([S,S,100])},
            "ao":0,"ip":0,"op":op,"st":0,"bm":0})
    lottie = {"v":"5.7.4","fr":FPS,"ip":0,"op":op,"w":W,"h":H,"nm":nm,"ddd":0,"assets":assets,"layers":layers}
    # embed base64
    for a in lottie["assets"]:
        with open(os.path.join(SCENE, a["p"]), "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        a["p"] = f"data:image/png;base64,{b64}"; a["u"] = ""; a["e"] = 1
    out_path = os.path.join(SCENE, out_name)
    json.dump(lottie, open(out_path, "w"))
    print(nm, "-> layers", len(layers), "op", op, "loop_s", op/FPS, "size", os.path.getsize(out_path))

build("walk", 5, 6, "cat_walk.embedded.json", "Cat Walk", y_shift=11)
build("run", 6, 3, "cat_run.embedded.json", "Cat Run", y_shift=15)
