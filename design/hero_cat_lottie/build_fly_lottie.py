import json, math, base64, os
from PIL import Image

SCENE = "/private/tmp/claude-501/-Users-minyoungkim/50c2291d-925e-4f1d-8e28-362bba67ec5e/scratchpad/ghost_fly"
F = 3.0
S = round(100.0 / F, 4)
FPS = 30
W = H = 200
CENTER = [W/2, H/2]

def px(fn): return Image.open(os.path.join(SCENE, fn)).size
def hold_kf(t, v): return {"t": t, "s": [v], "h": 1}
def kf(t, v, last=False):
    k = {"t": t, "s": v}
    if not last: k["i"] = {"x":[0.5],"y":[1]}; k["o"] = {"x":[0.5],"y":[0]}
    return k
def stat(v): return {"a": 0, "k": v}
def anim(k): return {"a": 1, "k": k}

def bob(op, amp=2.0):
    per = op / 2; pts = []; t = 0
    while t <= op:
        y = CENTER[1] - amp*0.5*(1-math.cos((t/per)*2*math.pi))
        pts.append((t, round(y, 2))); t += per/2
    out = []
    for j, (t, y) in enumerate(pts):
        out.append(kf(t, [CENTER[0], y, 0], last=(j == len(pts)-1)))
    return anim(out)

def build(frame_nums, frames_per_pose, out_name, nm, loop):
    n_poses = len(frame_nums)
    op = frames_per_pose * n_poses
    assets = []; layers = []; ind = 1
    def ni():
        nonlocal ind; v = ind; ind += 1; return v
    for i, n in enumerate(frame_nums):
        rid = f"fly{n:02d}"; fn = f"fly{n:02d}.png"
        w, h = px(fn)
        assets.append({"id": rid, "w": w, "h": h, "u": "", "p": fn, "e": 0})
        fpp = frames_per_pose
        if i == 0:
            op_kfs = [hold_kf(0, 100), hold_kf(fpp, 0)]
        else:
            op_kfs = [hold_kf(0, 0), hold_kf(i*fpp, 100), hold_kf(i*fpp+fpp, 0)]
        layers.append({"ddd":0,"ind":ni(),"ty":2,"nm":fn,"refId":rid,"sr":1,
            "ks":{"o":anim(op_kfs),"r":stat(0),"p":bob(op),"a":stat([w/2,h/2,0]),"s":stat([S,S,100])},
            "ao":0,"ip":0,"op":op,"st":0,"bm":0})
    lottie = {"v":"5.7.4","fr":FPS,"ip":0,"op":op,"w":W,"h":H,"nm":nm,"ddd":0,"assets":assets,"layers":layers,
              "loop": loop}
    for a in lottie["assets"]:
        with open(os.path.join(SCENE, a["p"]), "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        a["p"] = f"data:image/png;base64,{b64}"; a["u"] = ""; a["e"] = 1
    out_path = os.path.join(SCENE, out_name)
    json.dump(lottie, open(out_path, "w"))
    print(nm, "-> layers", len(layers), "op", op, "loop_s", op/FPS, "loop", loop, "size", os.path.getsize(out_path))

build([1,2,3,4], 5, "cat_fly_intro.embedded.json", "Cat Fly Intro", loop=False)
build([5,6,7,8,9,10], 5, "cat_fly_loop.embedded.json", "Cat Fly Loop", loop=True)
