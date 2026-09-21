#!/usr/bin/env python3
"""Export the Words by Topic collection (public/data/words.json) as Anki-importable TSV decks, one per direction.

    python3 scripts/export-anki.py [out_dir]        default: dist/

    ketiklab-topic-zh-id.tsv   learn Chinese,    Indonesian meaning   (zh, pinyin, id)
    ketiklab-topic-id-zh.tsv   learn Indonesian, Chinese meaning      (id, idSyllables, zh)
    ketiklab-topic-en-id.tsv   learn English,    Indonesian meaning   (en, phonetic, id)

Each note carries the word being learnt, its pronunciation (empty where the collection has none), ONE meaning in
the learner's language, level, category and tags — never several languages on one card. Rows that share a word
(a few Chinese forms appear under two concepts) become one note with their meanings joined by "; ".

Only words.json is exported: it is authored in-house. The exam libraries are not — en-toefl.json in particular
carries no redistribution licence — so nothing else is read.

The files use Anki's header directives (separator, columns, tags column), so File → Import picks the fields up by
name. Keep each deck name stable across updates — AnkiWeb ratings survive only when the name does not change; these
decks replace the old ketiklab-trilingual.tsv, which should be retired rather than renamed.
"""
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dist")

# (file, learning-language field, pronunciation field, meaning field)
DECKS = [
    ("ketiklab-topic-zh-id.tsv", "zh", "pinyin", "id"),
    ("ketiklab-topic-id-zh.tsv", "id", "idSyllables", "zh"),
    ("ketiklab-topic-en-id.tsv", "en", "phonetic", "id"),
]


def clean(value):
    """One TSV cell: no tabs or line breaks, HTML left as plain text."""
    return " ".join(str(value or "").split())


def learn_word(w, lang):
    # the Chinese field can list alternative forms ("实现；达到"); the first is the one practised and the one pinyin spells
    return clean(w.get(lang)).split("；")[0].strip() if lang == "zh" else clean(w.get(lang))


def export(words, name, lang, pron, meaning):
    notes = {}
    for w in words:
        word, gloss = learn_word(w, lang), clean(w.get(meaning))
        if not word or not gloss:
            continue
        level, category = clean(w.get("level")), clean(w.get("category"))
        n = notes.get(word)
        if n is None:
            notes[word] = {"pron": clean(w.get(pron)), "glosses": [gloss], "level": level, "category": category,
                           "tags": ["KetikLab", category, level]}
            continue
        if gloss not in n["glosses"]:
            n["glosses"].append(gloss)
        n["pron"] = n["pron"] or clean(w.get(pron))
        n["tags"] += [t for t in (category, level) if t not in n["tags"]]
    columns = [lang, pron, meaning, "level", "category", "tags"]
    path = os.path.join(OUT_DIR, name)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("#separator:tab\n#html:false\n#columns:" + "\t".join(columns) + "\n#tags column:" + str(len(columns)) + "\n")
        for word, n in notes.items():
            f.write("\t".join([word, n["pron"], "; ".join(n["glosses"]), n["level"], n["category"], " ".join(t for t in n["tags"] if t)]) + "\n")
    with_pron = sum(1 for n in notes.values() if n["pron"])
    print(f"export-anki: {len(notes)} notes -> {path} ({with_pron} with {pron})")


def main():
    words = json.load(open(os.path.join(ROOT, "public", "data", "words.json"), encoding="utf-8"))
    if isinstance(words, dict) and "words" in words:
        words = words["words"]
    # most rows carry no pinyin of their own: the app reads it from zh-pinyin.json
    # ("词": "toned|plain|level"), and the Chinese deck must do the same
    try:
        zh_pinyin = json.load(open(os.path.join(ROOT, "public", "data", "zh-pinyin.json"), encoding="utf-8"))
    except (OSError, ValueError):
        zh_pinyin = {}
    for w in words:
        if not w.get("pinyin"):
            toned = zh_pinyin.get(learn_word(w, "zh"), "").split("|")[0]
            if toned:
                w["pinyin"] = toned
    os.makedirs(OUT_DIR, exist_ok=True)
    for deck in DECKS:
        export(words, *deck)


if __name__ == "__main__":
    main()
