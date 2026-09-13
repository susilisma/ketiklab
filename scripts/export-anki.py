#!/usr/bin/env python3
"""Export the trilingual collection (public/data/words.json) as an Anki-importable TSV.

    python3 scripts/export-anki.py [out.tsv]        default: dist/ketiklab-trilingual.tsv

Only words.json is exported: it is authored in-house. The exam libraries are not — en-toefl.json in
particular carries no redistribution licence — so nothing else is read.

The file uses Anki's header directives (separator, columns, tags column), so File → Import picks the
fields up by name. Suggested note type: three fields on the front in turn (zh → id/en, id → zh/en,
en → zh/id) so one import gives three card directions. Keep the deck name stable across updates —
AnkiWeb ratings survive only when the name does not change.
"""
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dist", "ketiklab-trilingual.tsv")

COLUMNS = ["zh", "pinyin", "id", "en", "phonetic", "idSyllables", "example_zh", "example_id", "example_en", "level", "category", "tags"]


def clean(value):
    """One TSV cell: no tabs or line breaks, HTML left as plain text."""
    return " ".join(str(value or "").split())


def main():
    words = json.load(open(os.path.join(ROOT, "public", "data", "words.json"), encoding="utf-8"))
    if isinstance(words, dict) and "words" in words:
        words = words["words"]
    rows = []
    for w in words:
        ex = w.get("examples") or {}
        rows.append([
            clean(w.get("zh")), clean(w.get("pinyin")), clean(w.get("id")), clean(w.get("en")),
            clean(w.get("phonetic")), clean(w.get("idSyllables")),
            clean(ex.get("zh")), clean(ex.get("id")), clean(ex.get("en")),
            clean(w.get("level")), clean(w.get("category")),
            "KetikLab " + clean(w.get("category")) + " " + clean(w.get("level")),
        ])
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("#separator:tab\n#html:false\n#columns:" + "\t".join(COLUMNS) + "\n#tags column:" + str(len(COLUMNS)) + "\n")
        for r in rows:
            f.write("\t".join(r) + "\n")
    with_ex = sum(1 for r in rows if r[6] or r[7] or r[8])
    print(f"export-anki: {len(rows)} notes -> {OUT} ({with_ex} with example sentences)")


if __name__ == "__main__":
    main()
