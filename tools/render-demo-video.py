# KetikLab product demo video, rendered frame by frame with Pillow and encoded with ffmpeg.
# usage: python render.py <zh|id|en> <v|h> [out_dir]     v = 1080x1920 (9:16), h = 1920x1080 (16:9)
import sys, os, subprocess, shutil, io, math, random
from PIL import Image, ImageDraw, ImageFont

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
LANG = sys.argv[1] if len(sys.argv) > 1 else "zh"
ORIENT = sys.argv[2] if len(sys.argv) > 2 else "v"
OUT_DIR = sys.argv[3] if len(sys.argv) > 3 else os.path.dirname(os.path.abspath(__file__))
W, H = (1080, 1920) if ORIENT == "v" else (1920, 1080)
FPS = 30
S = W / 1080 if ORIENT == "v" else H / 1080          # scale relative to a 1080-wide phone frame

BG, SURF, LINE, TEXT, MUTED, PURPLE, PURPLE_SOFT, MINT, AMBER, BLUE = (
    "#f6f7fb", "#ffffff", "#e6e6ef", "#1c1d26", "#7b7d8c", "#7165eb", "#eeecff", "#61d0a0", "#f2bd63", "#69a7ec")
FONT_DIR = "C:/Windows/Fonts/"
_fc = {}
def F(size, bold=False):
    k = (round(size * S), bold)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(FONT_DIR + ("msyhbd.ttc" if bold else "msyh.ttc"), k[0])
    return _fc[k]
def px(v): return round(v * S)
def ease(t): t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3
def lerp(a, b, t): return a + (b - a) * t
def mix(hex1, hex2, t):
    a = tuple(int(hex1[i:i+2], 16) for i in (1, 3, 5)); b = tuple(int(hex2[i:i+2], 16) for i in (1, 3, 5))
    return tuple(int(lerp(a[i], b[i], t)) for i in range(3))

T = {
    "hook":   {"zh": ("三种语言", "边打字边背单词"), "id": ("Tiga bahasa", "mengetik sambil menghafal"), "en": ("Three languages", "type it, remember it")},
    "langs":  {"zh": "中文 · Bahasa Indonesia · English", "id": "Mandarin · Indonesia · Inggris", "en": "Chinese · Indonesian · English"},
    "card":   {"zh": "拼音在上，汉字在下，照着打", "id": "Pinyin di atas, hanzi di bawah — tinggal ketik", "en": "Pinyin above, character below — just type"},
    "ladder": {"zh": "中文四步阶梯", "id": "Tangga Mandarin empat langkah", "en": "A four-step Chinese ladder"},
    "steps":  {"zh": ("认读", "打拼音", "选汉字", "输入法"), "id": ("Baca", "Ketik pinyin", "Pilih hanzi", "IME"), "en": ("Read", "Type pinyin", "Pick hanzi", "IME")},
    "libs":   {"zh": ("三语精选词", "考试词库", "词条总数", "经典朗读"), "id": ("Kata pilihan trilingual", "Kamus ujian", "Total kata", "Bacaan klasik"), "en": ("Curated trilingual words", "Exam libraries", "Words in total", "Classic readings")},
    "srs":    {"zh": "艾宾浩斯间隔复习 · 学习日历", "id": "Pengulangan berjarak · kalender belajar", "en": "Spaced repetition · learning calendar"},
    "cta":    {"zh": ("免费", "开源", "无广告"), "id": ("Gratis", "Open source", "Tanpa iklan"), "en": ("Free", "Open source", "No ads")},
    "cta2":   {"zh": "浏览器打开就能用 · 可安装到手机", "id": "Langsung di browser · bisa dipasang di HP", "en": "Runs in the browser · installs on your phone"},
}
WORDS = [("实现", "shí xiàn", "shi xian", "mencapai  ·  achieve"), ("机会", "jī huì", "ji hui", "kesempatan  ·  opportunity")]
LIB_VALUES = (3701, 10, 21697, 161)

def brand(d, x, y, size=1.0):
    s = px(64 * size)
    d.rounded_rectangle((x, y, x + s, y + s), px(16 * size), fill=PURPLE)
    d.text((x + s / 2, y + s / 2), "KL", font=F(28 * size, True), fill="white", anchor="mm")
    d.text((x + s + px(18 * size), y + s / 2), "KetikLab", font=F(40 * size, True), fill=TEXT, anchor="lm")

def caption(d, text, y, size=40, color=TEXT, bold=True):
    d.text((W / 2, y), text, font=F(size, bold), fill=color, anchor="mm")

def pill(d, x, y, label, size=26, on=True):
    f = F(size, True); w = d.textlength(label, font=f) + px(44); h = px(size * 2.1)
    d.rounded_rectangle((x, y, x + w, y + h), h / 2, fill=PURPLE if on else PURPLE_SOFT)
    d.text((x + w / 2, y + h / 2), label, font=f, fill="white" if on else PURPLE, anchor="mm")
    return w

def word_card(d, cx, cy, cw, ch, word, pinyin, typed, done, alpha):
    # alpha fades the whole card in; done draws the check state
    bg = mix(BG, SURF, alpha); ln = mix(BG, LINE, alpha)
    x0, y0, x1, y1 = cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2
    d.rounded_rectangle((x0 + px(8), y0 + px(12), x1 + px(8), y1 + px(12)), px(34), fill=mix(BG, "#e9e9f2", alpha))
    d.rounded_rectangle((x0, y0, x1, y1), px(34), fill=bg, outline=ln, width=px(2))
    if alpha < 0.35: return
    tc = mix(BG, TEXT, alpha); pc = mix(BG, PURPLE, alpha); mc = mix(BG, MUTED, alpha)
    d.text((x0 + px(40), y0 + px(52)), "01 / 20", font=F(24, True), fill=pc, anchor="lm")
    d.text((cx, y0 + ch * 0.27), pinyin, font=F(44, True), fill=pc, anchor="mm")
    d.text((cx, y0 + ch * 0.47), word, font=F(150, True), fill=tc, anchor="mm")
    d.text((cx, y0 + ch * 0.66), WORDS[[w[0] for w in WORDS].index(word)][3], font=F(34), fill=mc, anchor="mm")
    bx0, by0, bx1, by1 = x0 + px(60), y0 + ch * 0.76, x1 - px(60), y0 + ch * 0.76 + px(84)
    d.rounded_rectangle((bx0, by0, bx1, by1), px(20), fill=BG, outline=MINT if done else PURPLE, width=px(3))
    f = F(36, True); shown = typed if not done else word_card.full
    if shown:
        tw = d.textlength(shown, font=f)
        d.text((cx, (by0 + by1) / 2), shown, font=f, fill=TEXT, anchor="mm")
        if not done:
            d.rectangle((cx + tw / 2 + px(6), by0 + px(20), cx + tw / 2 + px(10), by1 - px(20)), fill=PURPLE)
    if done:
        r = px(30); d.ellipse((x1 - px(80) - r, y0 + px(52) - r, x1 - px(80) + r, y0 + px(52) + r), fill=MINT)
        d.line((x1 - px(80) - r * 0.45, y0 + px(52), x1 - px(80) - r * 0.1, y0 + px(52) + r * 0.35, x1 - px(80) + r * 0.5, y0 + px(52) - r * 0.4), fill="white", width=px(6), joint="curve")
word_card.full = ""

# ---------------- scenes: each gets (draw, t) with t in seconds from scene start ----------------
def sc_hook(d, t):
    a = ease(t / 0.6); y = H * 0.36 + (1 - a) * px(40)
    brand(d, W / 2 - px(150), H * 0.18, 1.15)
    l1, l2 = T["hook"][LANG]
    d.text((W / 2, y), l1, font=F(78, True), fill=mix(BG, TEXT, a), anchor="mm")
    b = ease((t - 0.35) / 0.6); d.text((W / 2, y + px(110)), l2, font=F(78, True), fill=mix(BG, PURPLE, b), anchor="mm")
    c = ease((t - 0.9) / 0.6); d.text((W / 2, y + px(230)), T["langs"][LANG], font=F(38), fill=mix(BG, MUTED, c), anchor="mm")

def sc_card(d, t, total):
    caption(d, T["card"][LANG], H * 0.12, 42)
    per = total / len(WORDS); i = min(int(t / per), len(WORDS) - 1); lt = t - i * per
    word, pinyin, full, _ = WORDS[i]; word_card.full = full
    a = ease(lt / 0.45)
    typing_start, per_char = 1.2, 0.16
    n = int(max(0, lt - typing_start) / per_char); typed = full[:min(n, len(full))]
    done = n >= len(full) + 2
    cw, ch = (W * 0.86, H * 0.5) if ORIENT == "v" else (W * 0.42, H * 0.78)
    word_card(d, W / 2, H * 0.55, cw, ch, word, pinyin, typed, done, a)

def sc_ladder(d, t):
    caption(d, T["ladder"][LANG], H * 0.14, 42)
    steps = T["steps"][LANG]; n = len(steps); on = min(n - 1, int(t / 0.7))
    if ORIENT == "v":
        for k, s in enumerate(steps):
            y = H * 0.31 + k * px(160); a = ease((t - k * 0.7) / 0.4); lit = k <= on
            d.rounded_rectangle((W * 0.12, y, W * 0.88, y + px(112)), px(28), fill=PURPLE if lit else SURF, outline=LINE if not lit else PURPLE, width=px(2))
            d.ellipse((W * 0.12 + px(28), y + px(26), W * 0.12 + px(88), y + px(86)), fill="white" if lit else PURPLE_SOFT)
            d.text((W * 0.12 + px(58), y + px(56)), str(k + 1), font=F(30, True), fill=PURPLE, anchor="mm")
            d.text((W * 0.12 + px(120), y + px(56)), s, font=F(40, True), fill="white" if lit else mix(BG, TEXT, a), anchor="lm")
    else:
        cw = W * 0.19
        for k, s in enumerate(steps):
            x = W * 0.08 + k * (cw + px(30)); y = H * 0.36; lit = k <= on; a = ease((t - k * 0.7) / 0.4)
            d.rounded_rectangle((x, y, x + cw, y + px(240)), px(28), fill=PURPLE if lit else SURF, outline=PURPLE if lit else LINE, width=px(2))
            d.text((x + cw / 2, y + px(80)), str(k + 1), font=F(56, True), fill="white" if lit else PURPLE, anchor="mm")
            d.text((x + cw / 2, y + px(170)), s, font=F(34, True), fill="white" if lit else mix(BG, TEXT, a), anchor="mm")

def sc_libs(d, t):
    labels = T["libs"][LANG]
    cols = 2 if ORIENT == "v" else 4
    bw, bh = (W * 0.4, H * 0.19) if ORIENT == "v" else (W * 0.2, H * 0.4)
    accents = (PURPLE, MINT, AMBER, BLUE)
    for k, (lab, val) in enumerate(zip(labels, LIB_VALUES)):
        r, c = divmod(k, cols)
        x = W * 0.06 + c * (bw + W * 0.04) if ORIENT == "v" else W * 0.05 + c * (bw + W * 0.0333)
        y = H * 0.29 + r * (bh + H * 0.03) if ORIENT == "v" else H * 0.28
        a = ease((t - k * 0.25) / 0.5); shown = int(val * ease((t - k * 0.25) / 1.4))
        d.rounded_rectangle((x, y, x + bw, y + bh), px(30), fill=mix(BG, SURF, a), outline=mix(BG, LINE, a), width=px(2))
        d.rounded_rectangle((x + px(30), y + px(36), x + px(42), y + bh - px(36)), px(6), fill=mix(BG, accents[k], a))
        d.text((x + px(70), y + bh * 0.42), f"{shown:,}" + ("+" if val == 21697 and shown == val else ""), font=F(64, True), fill=mix(BG, TEXT, a), anchor="lm")
        d.text((x + px(70), y + bh * 0.72), lab, font=F(26), fill=mix(BG, MUTED, a), anchor="lm")
    caption(d, T["langs"][LANG], H * 0.14, 34, MUTED, False)

def sc_srs(d, t):
    caption(d, T["srs"][LANG], H * 0.14, 42)
    rnd = random.Random(7); cols, rows = 13, 7
    cell = px(56) if ORIENT == "v" else px(44); gap = px(10)
    gw = cols * cell + (cols - 1) * gap; gh = rows * cell + (rows - 1) * gap
    x0, y0 = W / 2 - gw / 2, H * (0.33 if ORIENT == "v" else 0.30)
    order = [(c, r) for c in range(cols) for r in range(rows)]; rnd.shuffle(order)
    lit = int(len(order) * ease(t / 3.2))
    levels = ["#eeecff", "#c9c3fb", "#a59bf5", "#7165eb", "#4f43c9"]
    for k, (c, r) in enumerate(order):
        x, y = x0 + c * (cell + gap), y0 + r * (cell + gap)
        col = levels[min(4, 1 + (k * 7 + r) % 4)] if k < lit else "#ececf2"
        d.rounded_rectangle((x, y, x + cell, y + cell), px(10), fill=col)
    lab = {"zh": ("少", "多"), "id": ("sedikit", "banyak"), "en": ("less", "more")}[LANG]
    d.text((x0, y0 + gh + px(50)), lab[0], font=F(24), fill=MUTED, anchor="lm")
    d.text((x0 + gw, y0 + gh + px(50)), lab[1], font=F(24), fill=MUTED, anchor="rm")
    streak = {"zh": "连续学习 {} 天", "id": "{} hari berturut-turut", "en": "{}-day streak"}[LANG].format(int(lerp(0, 23, ease(t / 3.2))))
    d.text((W / 2, y0 + gh + px(150)), streak, font=F(44, True), fill=PURPLE, anchor="mm")

def sc_cta(d, t):
    a = ease(t / 0.5)
    brand(d, W / 2 - px(150), H * (0.29 if ORIENT == "v" else 0.24), 1.15)
    d.text((W / 2, H * (0.46 if ORIENT == "v" else 0.42)), "ketiklab.com", font=F(92, True), fill=mix(BG, PURPLE, a), anchor="mm")
    labels = T["cta"][LANG]; f = F(30, True)
    widths = [d.textlength(l, font=f) + px(44) for l in labels]; total = sum(widths) + px(16) * (len(labels) - 1)
    x = W / 2 - total / 2; y = H * (0.54 if ORIENT == "v" else 0.50)
    for k, l in enumerate(labels):
        b = ease((t - 0.3 - k * 0.15) / 0.4)
        if b > 0: pill(d, x, y, l, 30, on=True)
        x += widths[k] + px(16)
    c = ease((t - 0.9) / 0.5)
    d.text((W / 2, H * (0.62 if ORIENT == "v" else 0.58)), T["cta2"][LANG], font=F(32), fill=mix(BG, MUTED, c), anchor="mm")

SCENES = [(2.6, sc_hook), (9.0, sc_card), (3.8, sc_ladder), (4.2, sc_libs), (4.4, sc_srs), (3.6, sc_cta)]
TOTAL = sum(s[0] for s in SCENES)

def frame(tg):
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    acc = 0.0
    for dur, fn in SCENES:
        if tg < acc + dur or (dur, fn) == SCENES[-1]:
            (fn(d, tg - acc, dur) if fn is sc_card else fn(d, tg - acc)); break
        acc += dur
    # cross-fade the first 0.25 s of every scene from the background
    acc = 0.0
    for dur, fn in SCENES[1:]:
        acc += SCENES[SCENES.index((dur, fn)) - 1][0]
    return im

def ffmpeg_exe():
    exe = shutil.which("ffmpeg")
    if exe: return exe
    try:
        import imageio_ffmpeg; return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception: return None

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, f"ketiklab-{LANG}-{'9x16' if ORIENT == 'v' else '16x9'}.mp4")
    exe = ffmpeg_exe(); n = int(TOTAL * FPS)
    if not exe:
        gif = out[:-4] + ".gif"; frames = [frame(k / 10).convert("P", palette=Image.ADAPTIVE) for k in range(int(TOTAL * 10))]
        frames[0].save(gif, save_all=True, append_images=frames[1:], duration=100, loop=0); print("no ffmpeg — wrote", gif); return
    cmd = [exe, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for k in range(n):
        p.stdin.write(frame(k / FPS).tobytes())
    p.stdin.close(); p.wait()
    print(out, f"{TOTAL:.1f}s", f"{os.path.getsize(out) // 1024} KB", "rc", p.returncode)

if __name__ == "__main__":
    main()
