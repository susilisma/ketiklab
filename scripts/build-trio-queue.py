#!/usr/bin/env python3
"""Generate the daily trilingual word batch and append it to queue/words.json.

Fully automated: walks the English frequency list, keeps only entries that have
BOTH a Chinese and an Indonesian gloss in the open wordnets, de-duplicates
against the live library and the existing queue, and stops at WORDS (default
100). Because it de-duplicates against a library that grows every day, each run
naturally advances further down the frequency list — no manual curation, no
repeats.

Sources (all redistributable, see public/data/SOURCES.md):
  Open English WordNet 2024 (CC BY 4.0) · Chinese Open Wordnet (WordNet License)
  Wordnet Bahasa (MIT) · wordfreq (Apache-2.0) · CMUdict (BSD-2) · pypinyin (MIT)

Usage:  python3 scripts/build-trio-queue.py [count]
Env:    WORDS=100  QUEUE_CAP=400
"""
import json, os, re, sys, warnings
warnings.filterwarnings("ignore")

import wn
from wordfreq import zipf_frequency, top_n_list
import cmudict
from pypinyin import pinyin, Style

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
LIVE = os.path.join(ROOT, "public", "data", "words.json")
QUEUE = os.path.join(ROOT, "queue", "words.json")

WORDS = int(os.environ.get("WORDS") or (sys.argv[1] if len(sys.argv) > 1 else 100))
QUEUE_CAP = int(os.environ.get("QUEUE_CAP", 400))

HAN = re.compile(r"^[一-鿿]+$")
# Ultra-frequent function words have no useful single gloss: "are" resolves to
# the unit of area, "will" to determination. Skip them outright.
ZIPF_CEILING = 5.3
STOP = set("""the be to of and a in that have i it for not on with he as you do at this but his by
from they we say her she or an will my one all would there their what so up out if about who get which go me
when make can like time no just him know take people into year your good some could them see other than then
now look only come its over think also back after use two how our work first well way even new want because
any these give day most us is are was were been has had did does am ain aren cant couldnt didnt doesnt dont
hadnt hasnt havent isnt lets shouldnt thats theres theyre wasnt werent whats wont wouldnt youre youve""".split())
ASCII_WORD = re.compile(r"^[a-z][a-z\- ]*[a-z]$")

# ---------------------------------------------------------------- phonetics
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
        if stress == "1" and not stressed:
            out.append("ˈ"); stressed = True
        elif stress == "2":
            out.append("ˌ")
        out.append(ARPA2IPA.get(base, ""))
    return "".join(out)

def toned(zh):
    return " ".join(p[0] for p in pinyin(zh, style=Style.TONE))

def syllables(word):
    """Rough Indonesian syllabification for the reading hint."""
    v = "aeiouAEIOU"
    out, cur = [], ""
    for i, ch in enumerate(word):
        cur += ch
        if ch in v and i + 2 < len(word) and word[i + 1] not in v and word[i + 2] in v:
            out.append(cur); cur = ""
    if cur:
        out.append(cur)
    return "·".join(out) if len(out) > 1 else ""

# ---------------------------------------------------------------- taxonomy
DAILY = {"noun.food","noun.body","noun.animal","noun.plant","noun.person","noun.time",
         "noun.feeling","noun.artifact","noun.object","noun.substance","noun.phenomenon",
         "verb.body","verb.consumption","verb.motion","verb.emotion","verb.contact",
         "verb.perception","verb.weather","adj.ppl"}
BUSINESS = {"noun.possession","noun.act","noun.group","noun.quantity",
            "verb.possession","verb.competition","verb.social","verb.creation"}
STUDY = {"noun.cognition","noun.communication","noun.attribute","noun.relation",
         "noun.state","noun.process","noun.event","noun.motive","noun.shape",
         "verb.cognition","verb.communication","verb.stative","verb.change","adj.all","adv.all"}

def category_for(lexfile):
    if lexfile in BUSINESS: return "business"
    if lexfile in STUDY:    return "study"
    if lexfile in DAILY:    return "daily"
    return "daily"

def level_for(z):
    if z >= 4.5: return "A1"
    if z >= 4.0: return "A2"
    if z >= 3.5: return "B1"
    return "B2"

# ---------------------------------------------------------------- dedup keys
def load(path, fallback):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

def index(rows):
    en, idn, zh = set(), set(), set()
    for r in rows:
        if isinstance(r, list):
            e, i, z = r[0], r[1], r[2]
        else:
            e, i, z = r.get("en", ""), r.get("id", ""), r.get("zh", "")
        en.add(str(e).lower()); idn.add(str(i).lower())
        for part in str(z).split("；"):
            if part.strip():
                zh.add(part.strip())
    return en, idn, zh

# ---------------------------------------------------------------- build
def main():
    queue = load(QUEUE, [])
    if len(queue) >= QUEUE_CAP:
        print(f"queue already holds {len(queue)} words (cap {QUEUE_CAP}) — skipping")
        return

    live = load(LIVE, [])
    EN, ID, ZH = index(live)
    qe, qi, qz = index(queue)
    EN |= qe; ID |= qi; ZH |= qz

    en_wn  = wn.Wordnet("oewn:2024")
    cmn_wn = wn.Wordnet("omw-cmn:1.4")
    idn_wn = wn.Wordnet("omw-id:1.4")

    picked, seen_scan = [], 0
    per_cat = {"daily": 0, "business": 0, "study": 0}
    cap = max(1, WORDS // 3 + WORDS // 10)

    for w in top_n_list("en", 80000):
        if len(picked) >= WORDS:
            break
        seen_scan += 1
        if len(w) < 3 or not ASCII_WORD.match(w) or w.lower() in EN or w in STOP:
            continue
        z = zipf_frequency(w, "en")
        if z >= ZIPF_CEILING:          # function-word tier, no clean single sense
            continue

        # Quality gate. Wordnet Bahasa lemma lists are unordered and sometimes
        # corrupt, and highly polysemous words translate badly in any case, so:
        #   1. only headwords with few senses,
        #   2. only the primary sense, and only when the headword heads it,
        #   3. Chinese gloss by lemma order (meaningful in omw-cmn),
        #   4. Indonesian gloss by Indonesian corpus frequency (order is not
        #      meaningful in omw-id, so pick the synonym learners will meet).
        senses = en_wn.synsets(w)
        if not senses or len(senses) > 4:
            continue
        syn = senses[0]
        ili = syn.ili if isinstance(syn.ili, str) else (syn.ili.id if syn.ili else None)
        if not ili:
            continue
        lemmas = syn.lemmas()
        if not lemmas or lemmas[0].lower() != w or any(l[:1].isupper() for l in lemmas):
            continue

        zh_g = [g.split("+")[0].strip() for x in cmn_wn.synsets(ili=ili) for g in x.lemmas()]
        zh_g = [g for g in dict.fromkeys(zh_g) if HAN.match(g)][:3]
        if not zh_g:
            continue
        id_c = [g for x in idn_wn.synsets(ili=ili) for g in x.lemmas()]
        id_c = [g for g in dict.fromkeys(id_c) if g and not g[:1].isupper() and " " not in g]
        if not id_c:
            continue
        idw = max(id_c, key=lambda g: zipf_frequency(g, "id"))
        if zipf_frequency(idw, "id") < 2.0:        # too rare to teach
            continue
        lexfile = syn.lexfile() or ""

        zh = "；".join(zh_g)
        if idw.lower() in ID or any(g in ZH for g in zh_g):
            continue

        cat = category_for(lexfile)
        if per_cat[cat] >= cap:
            continue

        row = {
            "en": w,
            "id": idw,
            "zh": zh,
            "category": cat,
            "level": level_for(z),
            "pinyin": toned(zh_g[0]),
        }
        ph = ipa(w)
        if ph:
            row["phonetic"] = f"/{ph}/"
        syl = syllables(idw)
        if syl:
            row["idSyllables"] = syl

        picked.append(row)
        per_cat[cat] += 1
        EN.add(w); ID.add(idw.lower())
        for g in zh_g:
            ZH.add(g)

    out = queue + picked
    os.makedirs(os.path.dirname(QUEUE), exist_ok=True)
    with open(QUEUE, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    print(f"scanned {seen_scan} headwords")
    print(f"new words: {len(picked)}  {per_cat}")
    print(f"queue: {len(queue)} -> {len(out)}")
    if picked:
        print("sample:", ", ".join(f"{r['en']}={r['zh'].split('；')[0]}/{r['id']}" for r in picked[:8]))

if __name__ == "__main__":
    main()
