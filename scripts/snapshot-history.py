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
    except FileNotFoundError:
        return fallback

def give_up(reason):
    # This runs inside site.yml's push step before `git add`; an exception here aborted
    # the step, the content promote.mjs had already written was never pushed, and the
    # next hourly run failed the same way. A broken history file is announced and left
    # as it is, so the promotion still goes out and someone can look at the file.
    print(f"::warning title=snapshot-history::{reason} — leaving history.json untouched")
    sys.exit(0)

try:
    words = load(LIVE, [])
except ValueError as e:
    give_up(f"words.json is not valid JSON ({e})")
if not isinstance(words, list) or not words:
    give_up("words.json is empty or not a list")

try:
    raw = load(HIST, [])
except ValueError as e:
    give_up(f"history.json is not valid JSON ({e})")
if not isinstance(raw, list):
    # a hand edit that turned the file into an object used to be overwritten in silence
    # with a one-row list, losing every earlier day
    give_up(f"history.json holds a {type(raw).__name__}, not the list of daily rows")

hist = [r for r in raw if isinstance(r, dict) and r.get("date")]
today = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
hist = [r for r in hist if r["date"] != today]
hist.append({"date": today, "words": len(words)})
hist.sort(key=lambda r: r["date"])

with open(HIST, "w", encoding="utf-8") as f:
    json.dump(hist, f, ensure_ascii=False, separators=(",", ":"))
print(f"history: {len(hist)} days, today = {len(words)} words")
