from PIL import Image, ImageDraw, ImageFont
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
W, H = 1200, 630
BG, SURF, LINE, TEXT, MUTED, PURPLE, PURPLE_SOFT = "#f6f7fb", "#ffffff", "#e6e6ef", "#1c1d26", "#7b7d8c", "#7165eb", "#eeecff"
F = lambda size, bold=False: ImageFont.truetype("C:/Windows/Fonts/" + ("msyhbd.ttc" if bold else "msyh.ttc"), size)
load = lambda name: json.load(open("public/data/" + name, encoding="utf-8"))
# site total as a floor ("21,700+") so the card does not go stale as the libraries grow
TOTAL = (len(load("words.json")) + sum(len(load(r["file"])) for r in load("manifest.json"))) // 100 * 100
im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
LEFT, RIGHT_LIMIT = 72, 740          # left column must stay clear of the card at x=790
d.rounded_rectangle((LEFT, 64, LEFT + 60, 124), 16, fill=PURPLE)
d.text((LEFT + 30, 94), "KL", font=F(26, True), fill="white", anchor="mm")
d.text((LEFT + 78, 94), "KetikLab", font=F(40, True), fill=TEXT, anchor="lm")
# the learning languages are a choice (或 / or), never joined by "·" as if shown together
LINES = (("学中文、印尼语或英语", 40, True, TEXT, 200), ("Learn Chinese, English or Indonesian", 29, True, TEXT, 254),
         ("打字背单词，释义用你最熟悉的语言", 26, False, MUTED, 308), ("with meanings in the language you know best", 22, False, MUTED, 346))
for text, size, bold, color, ty in LINES:
    d.text((LEFT, ty), text, font=F(size, bold), fill=color, anchor="lm")
x, y = LEFT, 400
for label in ("免费 · Free", "开源 · Open source", f"{TOTAL:,}+ 词 · words"):
    f = F(20, True); w = d.textlength(label, font=f) + 36
    if x + w > RIGHT_LIMIT: x, y = LEFT, y + 56
    d.rounded_rectangle((x, y, x + w, y + 44), 22, fill=PURPLE_SOFT); d.text((x + 18, y + 22), label, font=f, fill=PURPLE, anchor="lm"); x += w + 12
d.text((LEFT, y + 96), "ketiklab.com", font=F(26, True), fill=PURPLE, anchor="lm")
cx0, cy0, cx1, cy1 = 790, 110, 1128, 530
d.rounded_rectangle((cx0 + 6, cy0 + 10, cx1 + 6, cy1 + 10), 28, fill="#e9e9f2")
d.rounded_rectangle((cx0, cy0, cx1, cy1), 28, fill=SURF, outline=LINE, width=2)
mx = (cx0 + cx1) // 2
d.text((cx0 + 28, cy0 + 34), "01 / 20", font=F(18, True), fill=PURPLE, anchor="lm")
d.text((mx, cy0 + 94), "shí xiàn", font=F(30, True), fill=PURPLE, anchor="mm")
d.text((mx, cy0 + 176), "实现", font=F(100, True), fill=TEXT, anchor="mm")
# one meaning line in one language, drawn like the app's .meanings span: accent bar, small label, gloss
fl, fm = F(15), F(27, True); bw = max(d.textlength("Bahasa Indonesia", font=fl), d.textlength("mencapai", font=fm)) + 16
bx = mx - bw / 2
d.rectangle((bx - 8, cy0 + 252, bx - 6, cy0 + 308), fill=PURPLE)
d.text((bx + 6, cy0 + 264), "Bahasa Indonesia", font=fl, fill=MUTED, anchor="lm")
d.text((bx + 6, cy0 + 293), "mencapai", font=fm, fill=TEXT, anchor="lm")
d.rounded_rectangle((cx0 + 40, cy0 + 340, cx1 - 40, cy0 + 388), 14, fill=BG, outline=PURPLE, width=2)
f = F(24, True); tw = d.textlength("shi xia", font=f)
d.text((mx - 6, cy0 + 364), "shi xia", font=f, fill=TEXT, anchor="mm")
d.rectangle((mx - 6 + tw / 2 + 4, cy0 + 352, mx - 6 + tw / 2 + 6, cy0 + 376), fill=PURPLE)
# assert nothing in the left column crosses into the card
widest = max(d.textlength(t, font=F(s, b)) for t, s, b, _, _ in LINES)
assert widest + LEFT < cx0 - 20 and y + 96 < H - 30
im.save("public/og.png", optimize=True)
print("public/og.png", im.size, "%d KB" % (len(open("public/og.png", "rb").read()) // 1024), "| 最宽行", int(widest), "| 胶囊末行 y", y, "| 总词数", TOTAL)
