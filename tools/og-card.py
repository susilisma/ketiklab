from PIL import Image, ImageDraw, ImageFont
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
W, H = 1200, 630
BG, SURF, LINE, TEXT, MUTED, PURPLE, PURPLE_SOFT = "#f6f7fb", "#ffffff", "#e6e6ef", "#1c1d26", "#7b7d8c", "#7165eb", "#eeecff"
F = lambda size, bold=False: ImageFont.truetype("C:/Windows/Fonts/" + ("msyhbd.ttc" if bold else "msyh.ttc"), size)
im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
LEFT, RIGHT_LIMIT = 72, 740          # left column must stay clear of the card at x=790
d.rounded_rectangle((LEFT, 64, LEFT + 60, 124), 16, fill=PURPLE)
d.text((LEFT + 30, 94), "KL", font=F(26, True), fill="white", anchor="mm")
d.text((LEFT + 78, 94), "KetikLab", font=F(40, True), fill=TEXT, anchor="lm")
d.text((LEFT, 206), "中文 · Bahasa Indonesia · English", font=F(38, True), fill=TEXT, anchor="lm")
d.text((LEFT, 266), "三语打字练习 · 边打字边记单词", font=F(27), fill=MUTED, anchor="lm")
d.text((LEFT, 308), "Latihan mengetik trilingual · Trilingual typing practice", font=F(23), fill=MUTED, anchor="lm")
x, y = LEFT, 372
for label in ("免费 · Gratis · Free", "开源 · Open source", "21,700+ 词 · kata · words"):
    f = F(20, True); w = d.textlength(label, font=f) + 36
    if x + w > RIGHT_LIMIT: x, y = LEFT, y + 56
    d.rounded_rectangle((x, y, x + w, y + 44), 22, fill=PURPLE_SOFT); d.text((x + 18, y + 22), label, font=f, fill=PURPLE, anchor="lm"); x += w + 12
d.text((LEFT, y + 96), "ketiklab.com", font=F(26, True), fill=PURPLE, anchor="lm")
cx0, cy0, cx1, cy1 = 790, 120, 1128, 510
d.rounded_rectangle((cx0 + 6, cy0 + 10, cx1 + 6, cy1 + 10), 28, fill="#e9e9f2")
d.rounded_rectangle((cx0, cy0, cx1, cy1), 28, fill=SURF, outline=LINE, width=2)
mx = (cx0 + cx1) // 2
d.text((cx0 + 28, cy0 + 34), "01 / 20", font=F(18, True), fill=PURPLE, anchor="lm")
d.text((mx, cy0 + 118), "shí xiàn", font=F(30, True), fill=PURPLE, anchor="mm")
d.text((mx, cy0 + 196), "实现", font=F(100, True), fill=TEXT, anchor="mm")
d.text((mx, cy0 + 278), "mencapai  ·  achieve", font=F(25), fill=MUTED, anchor="mm")
d.rounded_rectangle((cx0 + 40, cy0 + 318, cx1 - 40, cy0 + 366), 14, fill=BG, outline=PURPLE, width=2)
f = F(24, True); tw = d.textlength("shi xia", font=f)
d.text((mx - 6, cy0 + 342), "shi xia", font=f, fill=TEXT, anchor="mm")
d.rectangle((mx - 6 + tw / 2 + 4, cy0 + 330, mx - 6 + tw / 2 + 6, cy0 + 354), fill=PURPLE)
# assert nothing in the left column crosses into the card
assert d.textlength("中文 · Bahasa Indonesia · English", font=F(38, True)) + LEFT < cx0 - 20
im.save("public/og.png", optimize=True)
print("public/og.png", im.size, "%d KB" % (len(open("public/og.png", "rb").read()) // 1024), "| 标题宽", int(d.textlength("中文 · Bahasa Indonesia · English", font=F(38, True))), "| 胶囊末行 y", y)
