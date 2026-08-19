#!/usr/bin/env python3
"""Rebuild the English word libraries from openly-licensed sources.

Sources (all redistributable, attribution kept in public/data/SOURCES.md):
  - Open English WordNet 2024  : definitions          (CC BY 4.0)
  - Chinese Open Wordnet 1.4   : Chinese glosses      (WordNet license)
  - Wordnet Bahasa 1.4         : Indonesian glosses   (MIT)
  - wordfreq 3.x               : frequency banding    (Apache-2.0, open corpora)
  - CMUdict                    : US pronunciation     (BSD-2-Clause)

Output: public/data/en-core.json / en-plus.json / en-upper.json / en-academic.json
Format: {"name","trans":[zh...],"idtrans":[id...],"def":"english gloss","usphone":"ipa"}
"""
import json, os, re, sys, warnings
warnings.filterwarnings("ignore")

import wn
from wordfreq import zipf_frequency, top_n_list
import cmudict

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "data")

ARPA2IPA = {
    "AA":"ɑ","AE":"æ","AH":"ə","AO":"ɔ","AW":"aʊ","AY":"aɪ","B":"b","CH":"tʃ","D":"d",
    "DH":"ð","EH":"ɛ","ER":"ɝ","EY":"eɪ","F":"f","G":"ɡ","HH":"h","IH":"ɪ","IY":"i",
    "JH":"dʒ","K":"k","L":"l","M":"m","N":"n","NG":"ŋ","OW":"oʊ","OY":"ɔɪ","P":"p",
    "R":"r","S":"s","SH":"ʃ","T":"t","TH":"θ","UH":"ʊ","UW":"u","V":"v","W":"w",
    "Y":"j","Z":"z","ZH":"ʒ",
}
CMU = cmudict.dict()

def ipa(word):
    prons = CMU.get(word)
    if not prons:
        return ""
    out, stressed = [], False
    for ph in prons[0]:
        stress = ph[-1] if ph[-1].isdigit() else ""
        base = ph[:-1] if ph[-1].isdigit() else ph
        sym = ARPA2IPA.get(base, "")
        if stress == "1" and not stressed:
            out.append("ˈ"); stressed = True
        elif stress == "2":
            out.append("ˌ")
        out.append(sym)
    return "".join(out)


HAN = re.compile(r"[\u4e00-\u9fff]")
def is_han(g):
    return bool(HAN.search(g))

def clean_gloss(g):
    # omw-cmn encodes part-of-speech tails like "不安+的"; strip them
    g = g.split("+")[0].strip()
    return g


def entry(w, en, cmn, idn):
    """Best sense for a headword: first synset that carries a Chinese gloss,
    preferring senses the word itself heads, skipping proper-noun senses."""
    synsets = en.synsets(w)
    if not synsets:
        return None
    pick = None
    for rank, syn in enumerate(synsets[:6]):
        ili = syn.ili if isinstance(syn.ili, str) else (syn.ili.id if syn.ili else None)
        if not ili:
            continue
        lemmas = syn.lemmas()
        if any(l[:1].isupper() for l in lemmas):
            continue
        zh = [clean_gloss(l) for x in cmn.synsets(ili=ili) for l in x.lemmas()]
        zh = [g for g in dict.fromkeys(zh) if g and is_han(g)][:3]
        if not zh:
            continue
        idg = [l for x in idn.synsets(ili=ili) for l in x.lemmas()]
        idg = [g for g in dict.fromkeys(idg) if g and not g[:1].isupper()][:3]
        head = bool(lemmas) and lemmas[0].lower() == w
        score = rank - (2 if head else 0)
        if pick is None or score < pick[0]:
            pick = (score, zh, idg, (syn.definition() or "").strip())
        if head and rank == 0:
            break
    if pick is None:
        return None
    _, zh, idg, defi = pick
    return {"name": w, "trans": zh, "idtrans": idg, "def": defi[:120], "usphone": ipa(w)}


BANDS = [
    ("en-business",  "商务英语",     "Bahasa Inggris bisnis",         None, None),
    ("en-core",     "英语核心词",   "Kosakata inti bahasa Inggris",  4.30, 9.0),
    ("en-plus",     "英语进阶词",   "Kosakata lanjutan",             3.85, 4.30),
    ("en-upper",    "英语高阶词",   "Kosakata tingkat atas",         3.50, 3.85),
    ("en-academic", "英语学术词",   "Kosakata akademik",             3.15, 3.50),
]

SKIP = re.compile(r"[^a-z]")
# ultra-high-frequency function words carry no learning value in a typing trainer
STOP = set("""the be to of and a in that have i it for not on with he as you do at this but his by
from they we say her she or an will my one all would there their what so up out if about who get which go me
when make can like time no just him know take people into year your good some could them see other than then
now look only come its over think also back after use two how our work first well way even new want because
any these give day most us is are was were been has had did does am s t don ll re ve d m o y ain""".split())

def build():
    en  = wn.Wordnet("oewn:2024")
    cmn = wn.Wordnet("omw-cmn:1.4")
    idn = wn.Wordnet("omw-id:1.4")

    candidates = [w for w in top_n_list("en", 60000)
                  if len(w) >= 3 and not SKIP.search(w) and w not in STOP]

    buckets = {b[0]: [] for b in BANDS}
    seen = set()
    for w in candidates:
        z = zipf_frequency(w, "en")
        band = next((b for b in BANDS if b[3] is not None and b[3] <= z < b[4]), None)
        if not band or w in seen:
            continue
        row = entry(w, en, cmn, idn)
        if not row:
            continue
        seen.add(w)
        buckets[band[0]].append(row)

    # business library: headwords AND glosses authored in-house (business
    # register), English definition borrowed from Open English WordNet
    biz_path = os.path.join(os.path.dirname(__file__), "business-glosses.tsv")
    biz = []
    for line in open(biz_path, encoding="utf-8"):
        line = line.rstrip("\n")
        if not line.strip():
            continue
        w, zh, idg = line.split("\t")
        # no English definition here: WordNet's first sense often does not match
        # the business register these glosses were written for
        biz.append({
            "name": w,
            "trans": [g for g in zh.split(";") if g],
            "idtrans": [g for g in idg.split(";") if g],
            "usphone": ipa(w),
        })
    buckets["en-business"] = biz

    manifest_rows = []
    for key, zh_name, id_name, lo, hi in BANDS:
        rows = buckets[key]
        desc = (f"精选商务词汇 · {len(rows)} 词 · 中文/印尼语释义" if lo is None
                else f"词频 Zipf {lo}–{hi} · {len(rows)} 词 · 中文/印尼语释义")
        with open(os.path.join(OUT, key + ".json"), "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False, separators=(",", ":"))
        manifest_rows.append({
            "id": key,
            "name": zh_name,
            "description": desc,
            "lang": "en",
            "length": len(rows),
            "file": key + ".json",
        })
        print(f"{key:12s} {len(rows):5d} words  (zipf {lo}-{hi})")
    # rewrite the manifest, keeping non-English libraries untouched
    man_path = os.path.join(OUT, "manifest.json")
    man = json.load(open(man_path, encoding="utf-8"))
    man = [m for m in man if m.get("lang") != "en"]
    order = {b[0]: i for i, b in enumerate(BANDS)}
    man += sorted(manifest_rows, key=lambda r: order[r["id"]])
    with open(man_path, "w", encoding="utf-8") as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
    print("manifest.json rewritten:", ", ".join(m["id"] for m in man))
    return manifest_rows

if __name__ == "__main__":
    build()
