#!/usr/bin/env python3
"""Append today's library size to public/data/history.json.

One row per day (last write wins), so the ops dashboard can draw a growth
curve without any backend. Runs right after the daily generator.
"""
import json, os, sys, datetime

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
LIVE = os.path.join(ROOT, "public", "data", "words.json")
HIST = os.path.join(ROOT, "public", "data", "history.json")

def load(path, fallback):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

words = load(LIVE, [])
if not words:
    print("words.json unreadable — leaving history untouched")
    sys.exit(0)

hist = [r for r in load(HIST, []) if isinstance(r, dict) and r.get("date")]
today = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
hist = [r for r in hist if r["date"] != today]
hist.append({"date": today, "words": len(words)})
hist.sort(key=lambda r: r["date"])

with open(HIST, "w", encoding="utf-8") as f:
    json.dump(hist, f, ensure_ascii=False, separators=(",", ":"))
print(f"history: {len(hist)} days, today = {len(words)} words")
