import re, json, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageFilter

F = 3  # px per scene unit
SCENE = "/private/tmp/claude-501/-Users-minyoungkim/8018c4ff-a2a2-4b15-a49a-98f17d67cb51/scratchpad/lottie-player/public/projects/hero-cat/scene-1"
DESIGN = "/Users/minyoungkim/EN_vocab/design"
os.makedirs(SCENE, exist_ok=True)

parts = json.load(open("parts/hero2_parts.json"))
DEFS = parts["defs"]
G = parts["groups"]

def svg_wrap(viewbox, inner, w, h, extra_defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" '
            f'width="{w}" height="{h}">{DEFS}{extra_defs}{inner}</svg>')

# ---- extract dust markup from move4-03 (top-level child index 12) ----
def extract_frame_dust(fn):
    s = open(f"{DESIGN}/{fn}").read()
    body = re.search(r'</defs>(.*)</svg>', s, re.S).group(1)
    # parse top-level children
    kids=[]; i=0; n=len(body)
    while i<n:
        if body[i].isspace(): i+=1; continue
        if body[i]!='<': i+=1; continue
        m=re.match(r'<(\w+)', body[i:]); tag=m.group(1)
        if tag=='g':
            depth=1; j=i+2
            while depth>0:
                no=body.find('<g',j); nc=body.find('</g>',j)
                if no!=-1 and no<nc: depth+=1; j=no+2
                else: depth-=1; j=nc+4
            kids.append(body[i:j]); i=j
        else:
            cs=body.find('/>',i); cf=body.find('</'+tag+'>',i)
            if cs!=-1 and (cf==-1 or cs<cf): j=cs+2
            else: j=cf+len(tag)+3
            kids.append(body[i:j]); i=j
    return kids

k3 = extract_frame_dust("ghost_cat_move4-03.svg")
dust_markup = k3[12]
# frame-03 dust defs uses .cls-1(#fdb259 fill),.cls-4(#fff),.cls-1 stroke? use its own style
frame_defs = '<defs><style>.cls-1{fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;}.cls-4{fill:#fff;}.cls-3{fill:#ffaf42;}</style></defs>'

renders = []  # (filename, svg_string, out_w, out_h, shadow?)

# ---------- BG (note only, ground is separate scrolling layer) ----------
renders.append(("bg.png", svg_wrap("0 0 350 220", G["note_BG"], 350*F, 220*F), None))
# ---------- GROUND strip (separate, for horizontal scroll) ----------
# ground bbox y189.9..203.4 -> band y185..215 (30 tall), full width
renders.append(("ground.png", svg_wrap("0 185 350 30", G["ground"], 350*F, 30*F), None))

# ---------- Cat frames (dust removed, forced common viewBox) ----------
for n in ["01","02","03","04","05"]:
    s = open(f"{DESIGN}/ghost_cat_move4-{n}.svg").read()
    s = re.sub(r'viewBox="[^"]*"', 'viewBox="0 0 167.46 140"', s, count=1)
    s = re.sub(r'<svg ', f'<svg width="{int(167.46*F)}" height="{140*F}" ', s, count=1)
    renders.append((f"cat{n}.png", s, "REMOVE_DUST"))

# ---------- Dust puff (from frame03) cropped ----------
# frame03 dust bbox ~ (4.85,94.65,24.7,22.7); pad 2
dvb = "2.85 92.65 28.7 26.7"
dust_svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{dvb}" '
            f'width="{int(28.7*F)}" height="{int(26.7*F)}">{frame_defs}{dust_markup}</svg>')
renders.append(("dust.png", dust_svg, None))

# ---------- Stickers ----------
P = 6
STK = {
  "sticker_2": (67,25.8,54.8,54.6),
  "sticker_3": (240.6,24.8,100.1,95.2),
  "sticker_4": (199.2,17.4,95.3,36.4),
  "sticker_5": (6.5,96.9,37.5,37.8),
  "sticker_6": (282.9,6.3,30.7,27.4),
}
sticker_meta = {}
for gid,(bx,by,bw,bh) in STK.items():
    vb=f"{bx-P} {by-P} {bw+2*P} {bh+2*P}"
    ow=int((bw+2*P)*F); oh=int((bh+2*P)*F)
    renders.append((f"{gid}.png", svg_wrap(vb, G[gid], ow, oh), "SHADOW"))
    sticker_meta[gid]={"cx":bx+bw/2,"cy":by+bh/2,"w":bw+2*P,"h":bh+2*P}

# sticker_1 special: face (minus eyebrows) + 2 eyebrows
s1=G["sticker_1"]
# remove eyebrow paths (d starts M47.86,48.18 and M34.35,53.02)
browA=re.search(r'<path[^>]*d="M47\.86,48\.18[^"]*"[^>]*/>', s1).group(0)
browB=re.search(r'<path[^>]*d="M34\.35,53\.02[^"]*"[^>]*/>', s1).group(0)
s1_face = s1.replace(browA,"").replace(browB,"")
bx,by,bw,bh=(20,31.8,60.4,60.7)
vb=f"{bx-P} {by-P} {bw+2*P} {bh+2*P}"
renders.append(("sticker_1_face.png", svg_wrap(vb,s1_face,int((bw+2*P)*F),int((bh+2*P)*F)),"SHADOW"))
sticker_meta["sticker_1"]={"cx":bx+bw/2,"cy":by+bh/2,"w":bw+2*P,"h":bh+2*P}
# eyebrows: crop tight with pad 3
for name,brow,(ex,ey,ew,eh) in [("browA",browA,(47.9,44.8,8,3.3)),("browB",browB,(34.3,51.6,8.6,1.5))]:
    p2=3; vb=f"{ex-p2} {ey-p2} {ew+2*p2} {eh+2*p2}"
    renders.append((f"sticker_1_{name}.png", svg_wrap(vb,brow,int((ew+2*p2)*F),int((eh+2*p2)*F)),None))
    sticker_meta[f"s1_{name}"]={"cx":ex+ew/2,"cy":ey+eh/2,"w":ew+2*p2,"h":eh+2*p2}

json.dump(sticker_meta, open("parts/sticker_meta.json","w"), indent=1)

# ---------- render all ----------
def add_shadow(path):
    im=Image.open(path).convert("RGBA")
    a=im.split()[3]
    sh=Image.new("RGBA",im.size,(0,0,0,0))
    solid=Image.new("RGBA",im.size,(20,16,10,150))
    sh=Image.composite(solid, sh, a)
    sh=sh.filter(ImageFilter.GaussianBlur(radius=F*0.9))
    off=int(F*1.3)
    canvas=Image.new("RGBA",im.size,(0,0,0,0))
    canvas.alpha_composite(sh,(0,off))
    canvas.alpha_composite(im,(0,0))
    canvas.save(path)

with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True)
    pg=b.new_page(device_scale_factor=1)
    for item in renders:
        fname, svg, mode = item[0], item[1], item[2]
        pg.set_content(f'<body style="margin:0;padding:0">{svg}</body>')
        pg.wait_for_timeout(60)
        if mode=="REMOVE_DUST":
            pg.evaluate("""() => {
              const svg=document.querySelector('svg');
              const kids=[...svg.children].filter(e=>e.tagName!=='defs');
              for(const el of kids){const bb=el.getBBox();const cx=bb.x+bb.width/2,cy=bb.y+bb.height/2;
                if(cx<42&&cy>90&&bb.width<40&&bb.height<40) el.remove();}
            }""")
            pg.wait_for_timeout(30)
        el=pg.query_selector("svg")
        el.screenshot(path=f"{SCENE}/{fname}", omit_background=True)
        if mode=="SHADOW":
            add_shadow(f"{SCENE}/{fname}")
        im=Image.open(f"{SCENE}/{fname}")
        print(fname, im.size)
    b.close()
print("DONE")
