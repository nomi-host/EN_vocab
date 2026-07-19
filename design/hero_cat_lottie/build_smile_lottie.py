import json, os, shutil
from PIL import Image
F=3.0
SRC="/private/tmp/claude-501/-Users-minyoungkim/8018c4ff-a2a2-4b15-a49a-98f17d67cb51/scratchpad/lottie-player/public/projects/hero-cat/scene-1"
SC="/private/tmp/claude-501/-Users-minyoungkim/8018c4ff-a2a2-4b15-a49a-98f17d67cb51/scratchpad/lottie-player/public/projects/hero-smile/scene-1"
os.makedirs(SC,exist_ok=True)
for fn in ["sticker_1_face.png","sticker_1_browA.png","sticker_1_browB.png"]:
    shutil.copy(f"{SRC}/{fn}", f"{SC}/{fn}")
def px(fn): return Image.open(f"{SC}/{fn}").size
S=round(100.0/F,4)
FPS=30; OP=90
# comp = s1 crop (bx-P,by-P)=(14,25.8), size 72.4 x 72.7
CROP_X, CROP_Y = 14.0, 25.8
W, H = 73, 73
def to_comp(sx,sy): return [round(sx-CROP_X,2), round(sy-CROP_Y,2)]
def stat(v): return {"a":0,"k":v}
def anim(k): return {"a":1,"k":k}
def kf(t,v,last=False):
    k={"t":t,"s":v}
    if not last: k["i"]={"x":[0.5],"y":[1]}; k["o"]={"x":[0.5],"y":[0]}
    return k
assets=[]; layers=[]; ind=1
def ni():
    global ind; v=ind; ind+=1; return v
# eyebrow pop keyframes around center cy, pops at given frames (up ~2.6 then back)
def brow_pos(cx,cy,peaks):
    pts={0:cy, OP:cy}
    for pk in peaks:
        for dt,val in [(-4,0),(0,-2.6),(4,0)]:
            t=pk+dt
            if 0<=t<=OP: pts[t]=cy+val
    ts=sorted(pts)
    out=[]
    for j,t in enumerate(ts):
        out.append(kf(t,[cx,round(pts[t],2),0], last=(j==len(ts)-1)))
    return anim(out)
# brows on top, then face
for name,peaks in [("browA",[22,68]),("browB",[45,86])]:
    fn=f"sticker_1_{name}.png"; w,h=px(fn); rid=name
    assets.append({"id":rid,"w":w,"h":h,"u":"","p":fn,"e":0})
    if name=="browA": c=to_comp(51.9,46.45)
    else: c=to_comp(38.6,52.35)
    layers.append({"ddd":0,"ind":ni(),"ty":2,"nm":name,"refId":rid,"sr":1,
      "ks":{"o":stat(100),"r":stat(0),"p":brow_pos(c[0],c[1],peaks),"a":stat([w/2,h/2,0]),"s":stat([S,S,100])},
      "ao":0,"ip":0,"op":OP,"st":0,"bm":0})
# face
fw,fh=px("sticker_1_face.png")
assets.append({"id":"face","w":fw,"h":fh,"u":"","p":"sticker_1_face.png","e":0})
fc=to_comp(50.2,62.15)
layers.append({"ddd":0,"ind":ni(),"ty":2,"nm":"face","refId":"face","sr":1,
  "ks":{"o":stat(100),"r":stat(0),"p":stat([fc[0],fc[1],0]),"a":stat([fw/2,fh/2,0]),"s":stat([S,S,100])},
  "ao":0,"ip":0,"op":OP,"st":0,"bm":0})
lottie={"v":"5.7.4","fr":FPS,"ip":0,"op":OP,"w":W,"h":H,"nm":"Smile","ddd":0,"assets":assets,"layers":layers}
json.dump(lottie, open(f"{SC}/lottie.json","w"))
print("smile lottie built. face comp center", fc, "W",W,"H",H)
