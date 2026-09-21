#!/usr/bin/env python3
"""Build the Chinese practice libraries for Indonesian and English speakers.

KetikLab's whole point is Chinese for Indonesians, yet every specialist library
was English or Indonesian. This fills the gap.

Selection is by Chinese corpus frequency (wordfreq's zh list, which is ordered by
frequency), NOT by exam vocabulary: exam lists carry trademarks and their
published editions are not ours to redistribute, while a frequency ranking is a
measurement anyone may reproduce.

Glosses come from the open wordnets, linked through ILI:
  Chinese Open Wordnet (omw-cmn 1.4) -> ILI -> Open English WordNet 2024
                                            -> Wordnet Bahasa (omw-id 1.4)

Quality gates, learned the hard way on the English pipeline:
  1. two to four characters — single characters are too polysemous to gloss,
  2. at most three senses, and the headword must head its first sense,
  3. both an English and an Indonesian gloss must exist for the SAME synset,
  4. the Indonesian gloss is picked by Indonesian corpus frequency, because
     Wordnet Bahasa lemma order is not meaningful,
  5. proper nouns and multi-word lemmas are dropped.

Usage: python3 scripts/build-zh-dicts.py
"""
import importlib.util, json, os, re, unicodedata, warnings
warnings.filterwarnings("ignore")

import wn
from wordfreq import top_n_list, zipf_frequency
from pypinyin import pinyin, Style

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DATA = os.path.join(ROOT, "public", "data")

HAN = re.compile(r"^[一-鿿]+$")
SCAN = 60000

def annotate_coverage(manifest):
    # scripts/manifest-coverage.py has a hyphen in its name, so load it by path
    spec = importlib.util.spec_from_file_location(
        "manifest_coverage", os.path.join(os.path.dirname(os.path.abspath(__file__)), "manifest-coverage.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.annotate(manifest, DATA)

# Rank bands over the *kept* list, so each library has a usable size no matter
# how much the wordnets cover.
# The blurbs carry no word count or gloss languages: the app's library card prints the count
# and which meaning this reader gets from the coverage the manifest carries.
BANDS = [
    ("zh-core",  "中文核心词", "最高频中文词", "Kata inti Mandarin",         "Core Chinese",         "Kata Mandarin paling sering dipakai", "Highest-frequency Chinese words", 0,    1200),
    ("zh-plus",  "中文进阶词", "常用中文词",   "Kata lanjutan Mandarin",     "Intermediate Chinese", "Kata Mandarin umum",                   "Common Chinese words",            1200, 2200),
    ("zh-upper", "中文高阶词", "进阶中文词",   "Kata tingkat atas Mandarin", "Advanced Chinese",     "Kata Mandarin tingkat lanjut",         "Higher-level Chinese words",      2200, 999999),
]

# pypinyin takes the first heteronym (长凳 zhǎng, 弹跳 dàn, 分子 fèn); the readings the
# library teaches are pinned in pinyin-fixes.json and win over the guess
FIXES = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "pinyin-fixes.json"), encoding="utf-8"))
def strip_tones(s):
    # ü becomes the IME "v" before the combining marks go: stripped first, the diaeresis
    # was gone and nǚ turned into "nu", which the pinyin rung then graded against
    return "".join(c for c in unicodedata.normalize("NFD", s).replace("u\u0308", "v") if not unicodedata.combining(c))

def toned(word):
    fixed = FIXES.get(word)
    return fixed if fixed else " ".join(p[0] for p in pinyin(word, style=Style.TONE))

def plain(word):
    fixed = FIXES.get(word)
    return strip_tones(fixed) if fixed else " ".join(p[0] for p in pinyin(word, style=Style.NORMAL))

def clean_lemmas(raw):
    out = []
    for g in raw:
        g = g.split("+")[0].strip()
        if not g or " " in g or "_" in g or g[:1].isupper():
            continue
        out.append(g)
    return list(dict.fromkeys(out))

def main():
    cmn = wn.Wordnet("omw-cmn:1.4")
    eng = wn.Wordnet("oewn:2024")
    idn = wn.Wordnet("omw-id:1.4")

    kept, scanned = [], 0
    for word in top_n_list("zh", SCAN):
        scanned += 1
        if not HAN.match(word) or not (2 <= len(word) <= 4):
            continue
        senses = cmn.synsets(word)
        if not senses or len(senses) > 4:
            continue
        chosen = None
        for syn in senses:
            lemmas = [l.split("+")[0].strip() for l in syn.lemmas()]
            if not lemmas or lemmas[0] != word:      # must HEAD the synset
                continue
            ili = syn.ili if isinstance(syn.ili, str) else (syn.ili.id if syn.ili else None)
            if not ili:
                continue
            en_g = clean_lemmas([g for x in eng.synsets(ili=ili) for g in x.lemmas()])
            id_g = clean_lemmas([g for x in idn.synsets(ili=ili) for g in x.lemmas()])
            if not en_g or not id_g:
                continue
            id_g.sort(key=lambda g: zipf_frequency(g, "id"), reverse=True)
            if zipf_frequency(id_g[0], "id") < 2.0:  # too rare to teach
                continue
            chosen = (ili, en_g, id_g)
            break
        if not chosen:
            continue
        ili, en_g, id_g = chosen
        definition = ""
        try:
            for x in eng.synsets(ili=ili):
                if x.definition():
                    definition = x.definition()
                    break
        except Exception:
            pass
        kept.append({
            "name": word,
            "trans": en_g[:3],          # shown to zh / en interface users
            "idtrans": id_g[:3],        # shown to id interface users
            "def": definition,
            "usphone": toned(word),     # the card's phonetic line
        })

    print(f"scanned {scanned} headwords, kept {len(kept)}")

    manifest_path = os.path.join(DATA, "manifest.json")
    with open(manifest_path, encoding="utf-8") as f:
        manifest = json.load(f)
    manifest = [m for m in manifest if not m["id"].startswith("zh-")]

    pin_path = os.path.join(DATA, "zh-pinyin.json")
    try:
        with open(pin_path, encoding="utf-8") as f:
            pinmap = json.load(f)
    except Exception:
        pinmap = {}

    for dict_id, name, blurb, name_id, name_en, blurb_id, blurb_en, lo, hi in BANDS:
        rows = kept[lo:hi]
        if not rows:
            continue
        path = os.path.join(DATA, dict_id + ".json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False, separators=(",", ":"))
        manifest.append({
            "id": dict_id,
            "name": name,
            "description": blurb,
            "name_id": name_id,
            "name_en": name_en,
            "description_id": blurb_id,
            "description_en": blurb_en,
            "lang": "zh",
            "length": len(rows),
            "file": dict_id + ".json",
        })
        # every practice word needs a pinyin ladder entry or step 2/3 breaks
        for r in rows:
            w = r["name"]
            # a pinned reading also replaces an entry already in the map, which used to
            # keep the old guess while the library's usphone showed the fix
            if w not in pinmap or w in FIXES:
                level = pinmap[w].split("|")[2] if w in pinmap else "4"
                pinmap[w] = f"{toned(w)}|{plain(w)}|{level}"
        print(f"{dict_id}: {len(rows)} words")

    with open(pin_path, "w", encoding="utf-8") as f:
        json.dump(pinmap, f, ensure_ascii=False, separators=(",", ":"))
    annotate_coverage(manifest)
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    print(f"pinyin map: {len(pinmap)} entries")

if __name__ == "__main__":
    main()
