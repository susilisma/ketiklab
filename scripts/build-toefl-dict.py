#!/usr/bin/env python3
"""Build public/data/en-toefl.json from a TOEFL vocabulary PDF.

Usage: python3 scripts/build-toefl-dict.py <wordlist.pdf>   (needs `pip install pypdf`)

What is taken from the PDF: the headwords and their Chinese glosses.

What is deliberately NOT taken:
  - the mnemonics, roots, cognates and near-miss notes marked with 【词根】
    【拓展】【词源】【辨析】【形近】, which are the source's own authored
    material rather than dictionary content;
  - its phonetic transcriptions. They are unlabelled and read as a mixed
    British-leaning convention, while the app renders this field as
    "American English · /…/". A wrong label is worse than none, so
    pronunciations come from the site's existing cmudict-derived dictionaries
    instead, and words those do not cover simply have none.

Indonesian glosses come the same way, from the site's existing Wordnet
Bahasa-derived dictionaries. So the only text this script copies out of the
PDF is the headword list and the Chinese meanings.
"""
import io, json, os, re, sys, unicodedata

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DATA = os.path.join(ROOT, "public", "data")
OUT = os.path.join(DATA, "en-toefl.json")
# existing dictionaries, all built from openly licensed sources, used to enrich
ENRICH_FROM = ("en-core", "en-plus", "en-upper", "en-academic", "en-business")

# running heads, page numbers and the source's own marketing furniture
FURNITURE = re.compile(
    r"^\s*(\d+|2026 新版《考托必背词》|2026 BEAT|《托福必考2000词》|List \d+"
    r"|托福资源下载|请加助教微信|单词\s*.?音标\s*释义\s*助记)\s*$")
POS = r"(?:n|v|vt|vi|adj|adv|prep|conj|pron|num|art|aux|int)\."
# a headword may run to three words ("vice versa"), but never into the part of
# speech that some entries print before their phonetics ("extract v. [..]")
ENTRY = re.compile(r"^\s*(\d{1,3})\s+([A-Za-z][A-Za-z'’\-]*(?:\s(?!" + POS + r")[A-Za-z'’\-]+){0,2})"
                   r"\s*(?:\[[^\]]*\])?\s*(.*)$")
POS_TOKEN = re.compile(r"\b" + POS)
# an entry with one phonetic per part of speech opens "v. [..] n. [..]"; those
# labels belong to the transcriptions, not to the first gloss. A bracket holding
# hanzi is a usage note ("vi. [不好的事] 复发") and its label stays.
POS_PHONETIC = re.compile(r"^(?:" + POS + r"\s*\[[^\]一-鿿]*\]\s*)+")
NOTE = re.compile(r"【")
INLINE = re.compile(r"\[[^\]]*\]")
ETYM = re.compile(r"(来自|缩写自|形变|得名于|拉丁语|拉丁文|希腊语|古英语|法语|同\s)")
LATIN3 = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ]{3,}")

# pypdf hands back the PDF's glyphs as CJK radical code points (⽯ U+2F6F for
# 石), which no IME produces, so a search for the real character would never
# match. NFKC folds the Kangxi block back to the ideographs; the simplified
# forms in the Radicals Supplement have no decomposition and need a table.
RADICAL = re.compile(r"[⺀-⿟]")
RADICAL_SUPP = str.maketrans("⻓⻝⻋⺠⻛⻣⻜⻔⻅⻦⻰⻢⻆⻚⻥⻘⻬⻁⻤⻮⻄⻉⻩",
                             "长食车民风骨飞门见鸟龙马角页鱼青齐虎鬼齿西贝黄")


def unradical(text):
    return RADICAL.sub(lambda m: unicodedata.normalize("NFKC", m.group()), text).translate(RADICAL_SUPP)


def cut_at_english(g):
    """Truncate a gloss where its English begins — that is where a note starts.

    Part-of-speech markers are masked with a same-length filler first, so "adj."
    inside "n. 液体 adj. 液体的" is not mistaken for one and the index of the
    real match still lines up with the original string.
    """
    masked = POS_TOKEN.sub(lambda m: "\x00" * len(m.group(0)), g)
    m = LATIN3.search(masked)
    return g[:m.start()] if m else g


def glosses(body):
    parts = []
    for seg in body:
        seg = seg.strip()
        if not seg:
            continue
        if NOTE.search(seg):
            head = NOTE.split(seg)[0].strip()
            if head:
                parts.append(head)
            break
        parts.append(seg)
    text = re.sub(r"\s+", " ", " ".join(parts)).strip(" ;；,，")
    text = POS_PHONETIC.sub("", text)
    out = []
    for g in re.split(r"[;；]", text):
        g = re.sub(r"^[英美]\s*", "", INLINE.sub("", g).strip())
        g = cut_at_english(ETYM.split(g)[0]).strip(" ,，、=→")
        if g:
            out.append(g)
    return out


def parse(pdf_path):
    from pypdf import PdfReader
    pages = []
    for page in PdfReader(pdf_path).pages:
        try:
            pages.append(page.extract_text() or "")
        except Exception:
            pages.append("")
    lines = [l.rstrip() for l in unradical("\n".join(pages)).split("\n")]
    lines = [l for l in lines if l.strip() and not FURNITURE.match(l.strip())]

    entries, cur = [], None
    for l in lines:
        m = ENTRY.match(l)
        if m and m.group(2):
            if cur:
                entries.append(cur)
            cur = {"word": m.group(2).strip(), "body": [m.group(3)]}
        elif cur:
            cur["body"].append(l)
    if cur:
        entries.append(cur)

    # page 2 carries a revision timetable whose rows also read as "<number> List n"
    entries = [e for e in entries if e["word"] != "List"]

    # the extractor breaks hyphenated headwords across lines: "hunter-" / "gatherer"
    for e in entries:
        if e["word"].endswith("-"):
            for i, seg in enumerate(e["body"]):
                if not seg.strip():
                    continue
                # only the first token continues the word; the rest is still its body
                head, _, rest = seg.strip().partition(" ")
                e["word"] += head
                e["body"] = ([rest] if rest.strip() else []) + e["body"][i + 1:]
                break
    return entries


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: build-toefl-dict.py <wordlist.pdf>")

    pool = {}
    for name in ENRICH_FROM:
        with io.open(os.path.join(DATA, name + ".json"), encoding="utf-8") as f:
            for e in json.load(f):
                pool.setdefault(e["name"].lower(), e)

    seen, out, dropped = set(), [], []
    for e in parse(sys.argv[1]):
        word = e["word"].strip()
        trans = glosses(e["body"])
        if not word or not trans:
            dropped.append(word)
            continue
        if word.lower() in seen:
            continue
        seen.add(word.lower())
        entry = {"name": word, "trans": trans}
        src = pool.get(word.lower())
        if src:
            if src.get("idtrans"):
                entry["idtrans"] = src["idtrans"]
            if src.get("usphone"):
                entry["usphone"] = src["usphone"]
        out.append(entry)

    with io.open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    print(json.dumps({
        "words": len(out),
        "withUsPhone": sum(1 for e in out if e.get("usphone")),
        "withIndonesian": sum(1 for e in out if e.get("idtrans")),
        "newToTheSite": sum(1 for e in out if e["name"].lower() not in pool),
        "droppedForNoGloss": dropped,
        "wrote": os.path.relpath(OUT, ROOT),
    }, ensure_ascii=True, indent=2))  # ascii: this report has to survive a GBK console


if __name__ == "__main__":
    main()
