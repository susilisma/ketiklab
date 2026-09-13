#!/usr/bin/env python3
"""Post-build pages for search engines. Run after `vite build`:

    python3 scripts/build-seo-pages.py dist

Writes, from public/data and the built dist/index.html:
  dist/{zh,id,en}/index.html          the app shell with that language's <html lang>, title, description,
                                      og:locale, canonical, hreflang set and a single-language crawlable block
  dist/{lang}/lib/{id}/index.html     one static page per library (the ten manifest rows plus the trilingual
                                      collection), listing the first entries with pronunciation and glosses
  dist/{lang}/readings/index.html     the classic readings, with author, era and an opening line
  dist/sitemap.xml                    every page above with xhtml:link alternates
and adds the hreflang set plus links to the language pages to dist/index.html itself.

The sub-pages carry <base href="/"> so the bundle's relative asset, data and sw.js URLs keep resolving at the
site root. Every structural pattern this script relies on is asserted, so a changed index.html fails the build
instead of silently shipping wrong pages.
"""
import html
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dist")
DATA = os.path.join(ROOT, "public", "data")
SITE = "https://ketiklab.com"
LANGS = ("zh", "id", "en")
HTML_LANG = {"zh": "zh-CN", "id": "id", "en": "en"}
OG_LOCALE = {"zh": "zh_CN", "id": "id_ID", "en": "en_US"}
ENTRIES_PER_PAGE = 150
esc = html.escape

T = {
    "title": {
        "zh": "中文·印尼语·英语三语打字练习 — 免费开源 | KetikLab",
        "id": "Latihan mengetik Mandarin (pinyin), Indonesia, Inggris — gratis & open source | KetikLab",
        "en": "Chinese typing practice with pinyin, Indonesian and English — free, open source | KetikLab",
    },
    "desc": {
        "zh": "KetikLab：免费、开源的三语打字与词汇训练站。中文按认读→打拼音→选汉字→输入法四步阶梯练习，拼音在上、汉字在下；3,701 个三语精选词、10 个考试词库、161 篇经典朗读，艾宾浩斯间隔复习。",
        "id": "KetikLab: situs latihan mengetik dan kosakata gratis, open source, untuk bahasa Mandarin, Indonesia, dan Inggris. Tangga pinyin empat langkah, 3.701 kata pilihan trilingual, 10 kamus ujian, 161 bacaan klasik, pengulangan berjarak.",
        "en": "KetikLab: a free, open-source typing and vocabulary trainer for Chinese, Indonesian and English. A four-step pinyin ladder, 3,701 curated trilingual words, 10 exam libraries, 161 classic readings, spaced repetition.",
    },
    "h1": {
        "zh": "中文 · 印尼语 · 英语三语打字练习",
        "id": "Latihan mengetik Mandarin, Indonesia, dan Inggris",
        "en": "Chinese, Indonesian and English typing practice",
    },
    "para": {
        "zh": "KetikLab 是免费、开源的三语打字与词汇训练站：3,701 个按概念对齐的中文、印尼语、英语精选词，10 个考试词库共 21,700 余词，161 篇公共领域经典朗读。中文按「认读 → 打拼音 → 选汉字 → 输入法」四步阶梯练习，拼音印在汉字上方；艾宾浩斯间隔复习、错词本、收藏、学习日历与云端同步。浏览器打开即用，可安装到手机。",
        "id": "KetikLab adalah situs latihan mengetik dan kosakata yang gratis dan open source untuk bahasa Mandarin, Indonesia, dan Inggris: 3.701 kata pilihan dengan arti tiga bahasa, 10 kamus ujian dengan lebih dari 21.700 kata, 161 bacaan klasik. Bahasa Mandarin dilatih lewat tangga empat langkah — baca, ketik pinyin, pilih hanzi, ketik dengan IME — dengan pinyin di atas hanzi; ada pengulangan berjarak, buku kesalahan, favorit, kalender belajar, dan sinkronisasi cloud. Langsung di browser, bisa dipasang di HP.",
        "en": "KetikLab is a free, open-source typing and vocabulary trainer for Chinese, Indonesian and English: 3,701 curated words aligned across the three languages, 10 exam libraries with 21,700+ words, and 161 public-domain classic readings. Chinese is practised on a four-step ladder — read, type the pinyin, pick the character, type it with your IME — with the pinyin printed above the character; spaced repetition, a mistakes book, favourites, a learning calendar and cloud sync. Runs in the browser and installs on your phone.",
    },
    "open": {"zh": "打开练习", "id": "Buka latihan", "en": "Open the trainer"},
    "libs": {"zh": "词库", "id": "Kamus", "en": "Libraries"},
    "readings": {"zh": "经典朗读", "id": "Bacaan klasik", "en": "Classic readings"},
    "trio": {"zh": "三语精选词", "id": "Kata pilihan trilingual", "en": "Curated trilingual words"},
    "trio_desc": {
        "zh": "按概念对齐的中文、印尼语、英语词汇，附拼音、音标、印尼语音节与三语例句，分日常、商务、印尼生活、学习与政策四类。",
        "id": "Kosakata Mandarin, Indonesia, dan Inggris yang diselaraskan per konsep, dengan pinyin, fonetik, suku kata Indonesia, dan contoh kalimat tiga bahasa; empat kategori: harian, bisnis, hidup di Indonesia, belajar & kebijakan.",
        "en": "Chinese, Indonesian and English vocabulary aligned by concept, with pinyin, phonetics, Indonesian syllables and trilingual example sentences, in four categories: daily, business, life in Indonesia, study & policy.",
    },
    "showing": {"zh": "共 {n} 条，下面是前 {k} 条。完整词库在练习页里。", "id": "{n} entri; {k} pertama ditampilkan di bawah. Kamus lengkap ada di halaman latihan.", "en": "{n} entries; the first {k} are listed below. The full library is in the trainer."},
    "cols": {"zh": ("词", "发音", "释义", "印尼语"), "id": ("Kata", "Pelafalan", "Arti", "Indonesia"), "en": ("Word", "Pronunciation", "Gloss", "Indonesian")},
    "cols_trio": {"zh": ("中文", "拼音", "印尼语", "English"), "id": ("Mandarin", "Pinyin", "Indonesia", "Inggris"), "en": ("Chinese", "Pinyin", "Indonesian", "English")},
    "cols_read": {"zh": ("篇名", "作者", "年代", "语言", "开头"), "id": ("Judul", "Penulis", "Era", "Bahasa", "Baris pertama"), "en": ("Title", "Author", "Era", "Language", "Opening line")},
    "read_desc": {
        "zh": "{n} 篇公共领域经典作品，逐句照着输入：中文、印尼语、英语各有。",
        "id": "{n} karya klasik domain publik untuk diketik baris demi baris, dalam bahasa Mandarin, Indonesia, dan Inggris.",
        "en": "{n} public-domain classics to type through line by line, in Chinese, Indonesian and English.",
    },
    "practice": {"zh": "练这个词库", "id": "Latih kamus ini", "en": "Practise this library"},
    "lang_names": {"zh": "中文", "id": "Bahasa Indonesia", "en": "English"},
    "count": {"zh": "{n} 词", "id": "{n} kata", "en": "{n} words"},
}
READ_LANG = {"zh": "中文", "id": "Bahasa Indonesia", "en": "English"}


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


def load_json(name):
    d = json.load(open(os.path.join(DATA, name), encoding="utf-8"))
    for key in ("words", "readings", "dicts"):
        if isinstance(d, dict) and key in d:
            return d[key]
    return d


def sub1(pattern, repl, text, label, flags=0):
    new, n = re.subn(pattern, repl, text, count=1, flags=flags)
    if n != 1:
        sys.exit(f"build-seo-pages: expected exactly one match for {label} in dist/index.html, found {n}")
    return new


def num(n, lang):
    """Thousands separator: Indonesian writes 1.200, Chinese and English 1,200."""
    s = f"{n:,}"
    return s.replace(",", ".") if lang == "id" else s


def fmt(key, lang, **kw):
    return T[key][lang].format(**kw)


def hreflang_links(path_for):
    """path_for(lang) -> URL path; x-default points at the root."""
    out = [f'    <link rel="alternate" hreflang="{HTML_LANG[l]}" href="{SITE}{path_for(l)}" />' for l in LANGS]
    out.append(f'    <link rel="alternate" hreflang="x-default" href="{SITE}/" />')
    return "\n".join(out)


def language_page(index_html, lang, lib_rows, n_readings):
    url = f"{SITE}/{lang}/"
    h = index_html
    h = sub1(r'<html lang="[^"]*">', f'<html lang="{HTML_LANG[lang]}">', h, "<html lang>")
    h = sub1(r"<head>", '<head>\n    <base href="/" />', h, "<head>")
    h = sub1(r"<title>[^<]*</title>", f"<title>{esc(T['title'][lang])}</title>", h, "<title>")
    h = sub1(r'(<meta\s+name="description"\s+content=")[^"]*(")', lambda m: m.group(1) + esc(T["desc"][lang], quote=True) + m.group(2), h, "description", re.S)
    for prop in ("og:title", "twitter:title"):
        h = sub1(rf'(<meta (?:property|name)="{prop}" content=")[^"]*(")', lambda m: m.group(1) + esc(T["title"][lang], quote=True) + m.group(2), h, prop)
    for prop in ("og:description", "twitter:description"):
        h = sub1(rf'(<meta (?:property|name)="{prop}" content=")[^"]*(")', lambda m: m.group(1) + esc(T["desc"][lang], quote=True) + m.group(2), h, prop)
    h = sub1(r'<link rel="canonical" href="[^"]*" />', f'<link rel="canonical" href="{url}" />', h, "canonical")
    h = sub1(r'<meta property="og:url" content="[^"]*" />', f'<meta property="og:url" content="{url}" />', h, "og:url")
    h = sub1(r'<meta property="og:locale" content="[^"]*" />', f'<meta property="og:locale" content="{OG_LOCALE[lang]}" />', h, "og:locale")
    others = [l for l in LANGS if l != lang]
    h = re.sub(r'\s*<meta property="og:locale:alternate" content="[^"]*" />', "", h)
    h = sub1(r'(<meta property="og:locale" content="[^"]*" />)', lambda m: m.group(1) + "".join(f'\n    <meta property="og:locale:alternate" content="{OG_LOCALE[o]}" />' for o in others), h, "og:locale (alternates)")
    h = sub1(r"</head>", hreflang_links(lambda l: f"/{l}/") + "\n  </head>", h, "</head>")
    lib_links = " · ".join(f'<a href="/{lang}/lib/{r["id"]}/">{esc(lib_name(r, lang))}</a>' for r in lib_rows)
    block = (
        f'<main style="max-width:720px;margin:0 auto;padding:48px 24px;font-family:Inter,\'PingFang SC\',\'Microsoft YaHei\',sans-serif;color:#1c1d26;line-height:1.7">\n'
        f'        <h1 style="font-size:28px;margin:0 0 8px">{esc(T["h1"][lang])} — KetikLab</h1>\n'
        f'        <p lang="{HTML_LANG[lang]}">{esc(T["para"][lang])}</p>\n'
        f'        <p><a href="/?ui={lang}" style="color:#7165eb;font-weight:700">{esc(T["open"][lang])} →</a></p>\n'
        f'        <p style="color:#7b7d8c;font-size:14px"><b>{esc(T["libs"][lang])}:</b> {lib_links} · <a href="/{lang}/readings/">{esc(T["readings"][lang])} ({n_readings})</a></p>\n'
        f'        <p style="color:#7b7d8c;font-size:14px">' + " · ".join(f'<a href="/{l}/" hreflang="{HTML_LANG[l]}">{T["lang_names"][l]}</a>' for l in LANGS) + "</p>\n"
        f"      </main>"
    )
    h = sub1(r'<main style="[^"]*">.*?</main>', lambda m: block, h, "crawlable <main>", re.S)
    return h


def root_page(index_html, n_readings):
    h = index_html
    h = sub1(r"</head>", hreflang_links(lambda l: f"/{l}/") .replace('hreflang="x-default" href="' + SITE + '/"', 'hreflang="x-default" href="' + SITE + '/"') + "\n  </head>", h, "</head> (root)")
    links = " · ".join(f'<a href="/{l}/" hreflang="{HTML_LANG[l]}" style="color:#7165eb">{T["lang_names"][l]}</a>' for l in LANGS)
    h = sub1(r"(\s*</main>)", lambda m: f'\n        <p style="color:#7b7d8c;font-size:14px">{links} · <a href="/zh/readings/" style="color:#7165eb">{esc(T["readings"]["zh"])} ({n_readings})</a></p>' + m.group(1), h, "</main> (root)")
    return h


def lib_name(row, lang):
    return row.get(f"name_{lang}") or row["name"] if lang != "zh" else row["name"]


def lib_desc(row, lang):
    return row.get(f"description_{lang}") or row["description"] if lang != "zh" else row["description"]


CSS = (
    "*{box-sizing:border-box}body{margin:0;background:#f6f7fb;color:#1c1d26;font:16px/1.65 Inter,'PingFang SC','Microsoft YaHei',sans-serif}"
    "header{display:flex;align-items:center;gap:12px;padding:18px 24px;border-bottom:1px solid #e6e6ef;background:#fff}"
    "header a{color:inherit;text-decoration:none;font-weight:800}header i{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#7165eb;color:#fff;font:700 13px Inter,sans-serif;font-style:normal}"
    "main{max-width:960px;margin:0 auto;padding:36px 24px 64px}h1{font-size:30px;margin:0 0 10px;line-height:1.25}.lead{color:#7b7d8c;margin:0 0 22px}"
    ".cta{display:inline-block;background:#7165eb;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:12px;margin:6px 0 28px}"
    ".wrap{overflow-x:auto;background:#fff;border:1px solid #e6e6ef;border-radius:14px}table{border-collapse:collapse;width:100%;min-width:560px}"
    "th,td{padding:9px 14px;border-bottom:1px solid #f0f0f5;text-align:left;vertical-align:top}th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#7b7d8c;background:#fafafd}"
    "td.w{font-weight:700;white-space:nowrap}td.p{color:#7165eb;white-space:nowrap}"
    "nav.more{margin-top:34px;color:#7b7d8c;font-size:14px;line-height:2}nav.more a{color:#7165eb;text-decoration:none}"
    "footer{color:#7b7d8c;font-size:13px;padding:24px;text-align:center}footer a{color:#7165eb;text-decoration:none}"
    "@media(max-width:640px){main{padding:24px 14px 48px}h1{font-size:24px}th,td{padding:8px 10px}}"
)


def static_page(lang, title, desc, path, body, alt_path_for, lib_rows, n_readings):
    url = f"{SITE}{path}"
    head = (
        f'<!doctype html>\n<html lang="{HTML_LANG[lang]}">\n<head>\n<meta charset="utf-8" />\n'
        f'<meta name="viewport" content="width=device-width, initial-scale=1" />\n'
        f"<title>{esc(title)}</title>\n<meta name=\"description\" content=\"{esc(desc, quote=True)}\" />\n"
        f'<link rel="canonical" href="{url}" />\n<link rel="icon" type="image/svg+xml" href="/favicon.svg" />\n'
        f'<meta property="og:type" content="website" /><meta property="og:site_name" content="KetikLab" />\n'
        f'<meta property="og:title" content="{esc(title, quote=True)}" /><meta property="og:description" content="{esc(desc, quote=True)}" />\n'
        f'<meta property="og:url" content="{url}" /><meta property="og:image" content="{SITE}/og.png" /><meta property="og:locale" content="{OG_LOCALE[lang]}" />\n'
        f'<meta name="twitter:card" content="summary_large_image" />\n'
        + hreflang_links(alt_path_for).replace("    <", "<") + f"\n<style>{CSS}</style>\n</head>\n"
    )
    libs_nav = " · ".join(f'<a href="/{lang}/lib/{r["id"]}/">{esc(lib_name(r, lang))}</a>' for r in lib_rows)
    langs_nav = " · ".join(f'<a href="/{l}/" hreflang="{HTML_LANG[l]}">{T["lang_names"][l]}</a>' for l in LANGS)
    tail = (
        f'<nav class="more"><b>{esc(T["libs"][lang])}:</b> {libs_nav} · <a href="/{lang}/readings/">{esc(T["readings"][lang])} ({n_readings})</a><br>{langs_nav}</nav>\n</main>\n'
        f'<footer><a href="/{lang}/">KetikLab</a> · <a href="https://github.com/susilisma/ketiklab">GitHub</a></footer>\n</body>\n</html>\n'
    )
    return head + f'<body>\n<header><a href="/{lang}/"><i>KL</i> KetikLab</a></header>\n<main>\n' + body + tail


def lib_page(lang, row, entries, lib_rows, n_readings):
    name = lib_name(row, lang); desc = lib_desc(row, lang)
    n = len(entries); shown = entries[:ENTRIES_PER_PAGE]
    title = f"{name} — {fmt('count', lang, n=num(n, lang))} | KetikLab"
    cols = T["cols"][lang]
    rows = "\n".join(
        f'<tr><td class="w">{esc(e["name"])}</td><td class="p">{esc(e.get("usphone") or "")}</td>'
        f'<td>{esc("；".join(e.get("trans") or []))}</td><td>{esc("; ".join(e.get("idtrans") or []))}</td></tr>'
        for e in shown)
    body = (
        f"<h1>{esc(name)}</h1>\n<p class=\"lead\">{esc(desc)}</p>\n"
        f'<a class="cta" href="/?ui={lang}&amp;lib={row["id"]}">{esc(T["practice"][lang])} →</a>\n'
        f"<p>{esc(fmt('showing', lang, n=num(n, lang), k=len(shown)))}</p>\n"
        f'<div class="wrap"><table><thead><tr>' + "".join(f"<th>{esc(c)}</th>" for c in cols) + f"</tr></thead>\n<tbody>\n{rows}\n</tbody></table></div>\n"
    )
    path = f"/{lang}/lib/{row['id']}/"
    return path, static_page(lang, title, f"{name}: {desc}", path, body, lambda l: f"/{l}/lib/{row['id']}/", lib_rows, n_readings)


def trio_page(lang, words, lib_rows, n_readings):
    name = T["trio"][lang]; desc = T["trio_desc"][lang]
    n = len(words); shown = words[:ENTRIES_PER_PAGE]
    title = f"{name} — {fmt('count', lang, n=num(n, lang))} | KetikLab"
    cols = T["cols_trio"][lang]
    rows = "\n".join(
        f'<tr><td class="w">{esc(w["zh"])}</td><td class="p">{esc(w.get("pinyin") or "")}</td><td>{esc(w["id"])}</td><td>{esc(w["en"])}</td></tr>'
        for w in shown)
    body = (
        f"<h1>{esc(name)}</h1>\n<p class=\"lead\">{esc(desc)}</p>\n"
        f'<a class="cta" href="/?ui={lang}">{esc(T["practice"][lang])} →</a>\n'
        f"<p>{esc(fmt('showing', lang, n=num(n, lang), k=len(shown)))}</p>\n"
        f'<div class="wrap"><table><thead><tr>' + "".join(f"<th>{esc(c)}</th>" for c in cols) + f"</tr></thead>\n<tbody>\n{rows}\n</tbody></table></div>\n"
    )
    path = f"/{lang}/lib/trio/"
    return path, static_page(lang, title, f"{name}: {desc}", path, body, lambda l: f"/{l}/lib/trio/", lib_rows, n_readings)


def readings_page(lang, readings, lib_rows):
    name = T["readings"][lang]; n = len(readings)
    desc = fmt("read_desc", lang, n=n)
    title = f"{name} — {n} | KetikLab"
    cols = T["cols_read"][lang]
    rows = "\n".join(
        f'<tr><td class="w">{esc(r["title"])}</td><td>{esc(r.get("author") or "")}</td><td>{esc(str(r.get("era") or ""))}</td>'
        f'<td>{esc(READ_LANG.get(r["lang"], r["lang"]))}</td><td>{esc((r.get("lines") or [""])[0])}</td></tr>'
        for r in readings)
    body = (
        f"<h1>{esc(name)}</h1>\n<p class=\"lead\">{esc(desc)}</p>\n"
        f'<a class="cta" href="/?ui={lang}&amp;view=articles">{esc(T["open"][lang])} →</a>\n'
        f'<div class="wrap"><table><thead><tr>' + "".join(f"<th>{esc(c)}</th>" for c in cols) + f"</tr></thead>\n<tbody>\n{rows}\n</tbody></table></div>\n"
    )
    path = f"/{lang}/readings/"
    return path, static_page(lang, title, desc, path, body, lambda l: f"/{l}/readings/", lib_rows, n)


def sitemap(groups):
    """groups: list of dicts {lang: path} — one entry per translated page set."""
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for g in groups:
        for lang, path in g.items():
            out.append("  <url>")
            out.append(f"    <loc>{SITE}{path}</loc>")
            for l2, p2 in g.items():
                out.append(f'    <xhtml:link rel="alternate" hreflang="{HTML_LANG[l2]}" href="{SITE}{p2}" />')
            out.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE}/" />')
            out.append("  </url>")
    out.append("</urlset>")
    return "\n".join(out) + "\n"


def main():
    index_path = os.path.join(DIST, "index.html")
    if not os.path.exists(index_path):
        sys.exit(f"build-seo-pages: {index_path} not found (run after vite build)")
    index_html = read(index_path)
    manifest = load_json("manifest.json")
    words = load_json("words.json")
    readings = load_json("readings.json")
    dict_entries = {row["id"]: load_json(row["file"]) for row in manifest}
    n_pages = 0
    groups = [{l: "/" for l in LANGS}]  # the root is one page in every language

    groups.append({l: f"/{l}/" for l in LANGS})
    for lang in LANGS:
        write(os.path.join(DIST, lang, "index.html"), language_page(index_html, lang, manifest, len(readings))); n_pages += 1

    for row in manifest:
        for lang in LANGS:
            path, page = lib_page(lang, row, dict_entries[row["id"]], manifest, len(readings))
            write(os.path.join(DIST, path.strip("/"), "index.html"), page); n_pages += 1
        groups.append({l: f"/{l}/lib/{row['id']}/" for l in LANGS})
    for lang in LANGS:
        path, page = trio_page(lang, words, manifest, len(readings))
        write(os.path.join(DIST, path.strip("/"), "index.html"), page); n_pages += 1
    groups.append({l: f"/{l}/lib/trio/" for l in LANGS})
    for lang in LANGS:
        path, page = readings_page(lang, readings, manifest)
        write(os.path.join(DIST, path.strip("/"), "index.html"), page); n_pages += 1
    groups.append({l: f"/{l}/readings/" for l in LANGS})

    write(index_path, root_page(index_html, len(readings)))
    write(os.path.join(DIST, "sitemap.xml"), sitemap(groups))
    urls = sum(len(g) for g in groups)
    print(f"build-seo-pages: {n_pages} pages written, sitemap lists {urls} URLs, "
          f"{len(manifest)} libraries + trio ({len(words)} words) + {len(readings)} readings")


if __name__ == "__main__":
    main()
