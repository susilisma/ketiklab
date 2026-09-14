#!/usr/bin/env python3
"""Write each library's meaning coverage into public/data/manifest.json.

row["coverage"] = {"zh", "id", "en", "def"}: how many entries carry a non-empty
meaning in that language, so the picker can say what a reader will actually see.
  trans   -> Chinese in the en-* and Indonesian libraries, English in zh-* (lang "zh")
  idtrans -> Indonesian;  def -> the English definition

Only the coverage fields change; indentation and line endings are kept, and an
unchanged manifest is not rewritten. build-en-dicts.py and build-zh-dicts.py
call annotate() before they write the manifest.

Usage: python scripts/manifest-coverage.py [data dir]
"""
import json, os, sys

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "data")

def filled(v):
    if isinstance(v, str):
        return bool(v.strip())
    return any(isinstance(g, str) and g.strip() for g in v or [])

def coverage(entries, lang):
    trans = sum(1 for e in entries if filled(e.get("trans")))
    return {
        "zh": 0 if lang == "zh" else trans,
        "id": sum(1 for e in entries if filled(e.get("idtrans"))),
        "en": trans if lang == "zh" else 0,
        "def": sum(1 for e in entries if filled(e.get("def"))),
    }

def annotate(manifest, data_dir=DATA):
    for row in manifest:
        with open(os.path.join(data_dir, row["file"]), encoding="utf-8") as f:
            row["coverage"] = coverage(json.load(f), row["lang"])
    return manifest

def rewrite(data_dir=DATA):
    path = os.path.join(data_dir, "manifest.json")
    with open(path, encoding="utf-8", newline="") as f:
        raw = f.read()
    manifest = annotate(json.loads(raw), data_dir)
    nl = "\r\n" if "\r\n" in raw else "\n"
    lines = raw.split(nl)
    indented = next((l for l in lines[1:] if l.startswith(" ")), None)
    if indented is None:
        text = json.dumps(manifest, ensure_ascii=False, separators=(",", ":"))
    else:
        text = json.dumps(manifest, ensure_ascii=False, indent=len(indented) - len(indented.lstrip(" ")))
    text = text.replace("\n", nl) + (nl if raw.endswith(nl) else "")
    if text != raw:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(text)
    return manifest, text != raw

if __name__ == "__main__":
    manifest, changed = rewrite(sys.argv[1] if len(sys.argv) > 1 else DATA)
    print(f"{'id':12s} {'lang':4s} {'length':>6s} {'zh':>6s} {'id':>6s} {'en':>6s} {'def':>6s}")
    for r in manifest:
        c = r["coverage"]
        print(f"{r['id']:12s} {r['lang']:4s} {r['length']:6d} {c['zh']:6d} {c['id']:6d} {c['en']:6d} {c['def']:6d}")
    print("manifest.json", "updated" if changed else "already current")
