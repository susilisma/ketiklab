#!/usr/bin/env node
/**
 * Safe content-append tool for the hourly auto-update job (JSON data model).
 *
 * Usage:
 *   node scripts/append-batch.mjs [--dry-run] <batch.json>
 *
 * batch.json shape:
 * {
 *   "words":   [ ["en","id","zh","daily|business|indonesia|study","A1|A2|B1|B2?"], ...   // tuple form, no examples
 *              | {"en","id","zh","category","level","examples":{"en","id","zh"},"pinyin?","phonetic?","idSyllables?"} ],
 *   "readings":[ {"id","lang":"en|id|zh","title","author","era","genre","lines":[...],"note"}, ... ]
 * }
 *
 * Operates on public/data/words.json and public/data/readings.json.
 * Guarantees: schema validation, de-duplication (words by en/id/zh; readings by
 * id and title+author), idempotency, and never mutating existing entries.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORDS_JSON = join(ROOT, "public", "data", "words.json");
const READINGS_JSON = join(ROOT, "public", "data", "readings.json");

const CATEGORIES = new Set(["daily", "business", "indonesia", "study"]);
const LEVELS = new Set(["A1", "A2", "B1", "B2"]);
const LANGS = new Set(["en", "id", "zh"]);
const DEFAULT_SOURCE = "KetikLab";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const batchPath = args.find((a) => !a.startsWith("--"));
if (!batchPath) {
  console.error("usage: node scripts/append-batch.mjs [--dry-run] <batch.json>");
  process.exit(2);
}

const batch = JSON.parse(readFileSync(batchPath, "utf8"));
const newWords = Array.isArray(batch.words) ? batch.words : [];
const newReadings = Array.isArray(batch.readings) ? batch.readings : [];

const words = JSON.parse(readFileSync(WORDS_JSON, "utf8"));
const readings = JSON.parse(readFileSync(READINGS_JSON, "utf8"));

// existing keys
const enSet = new Set(words.map((w) => String(w.en).toLowerCase()));
const idSet = new Set(words.map((w) => String(w.id).toLowerCase()));
// every Chinese sense, not the whole field: the practice word is the first sense, and
// "污染；弄脏" next to a live "污染" gives two cards the same word to type
const zhSenses = (w) => String(w.zh).split("；").map((x) => x.trim()).filter(Boolean);
const zhSet = new Set(words.flatMap(zhSenses));
const readIdSet = new Set(readings.map((r) => r.id));
const readTA = new Set(readings.map((r) => (r.title + "|" + r.author).toLowerCase()));

function materializeWord(w) {
  // tuple form -> full object
  if (Array.isArray(w)) {
    const [en, id, zh, category, level = "A1"] = w;
    if (![en, id, zh, category].every((x) => typeof x === "string" && x.trim())) return { err: "empty-field" };
    if (!CATEGORIES.has(category)) return { err: "bad-category" };
    if (!LEVELS.has(level)) return { err: "bad-level" };
    // the tuple form carries no example text; inventing one filled the library with one sentence
    return { obj: { en, id, zh, category, level, source: DEFAULT_SOURCE, examples: {} } };
  }
  // object form
  if (!w || typeof w !== "object") return { err: "not-object" };
  const { en, id, zh, category, level = "A1", examples, phonetic, idSyllables, pinyin, source } = w;
  if (![en, id, zh, category].every((x) => typeof x === "string" && x.trim())) return { err: "empty-field" };
  if (!CATEGORIES.has(category)) return { err: "bad-category" };
  if (!LEVELS.has(level)) return { err: "bad-level" };
  // keep whichever languages the batch supplied; the card skips a missing row
  const ex = {};
  if (examples) for (const k of ["en", "id", "zh"]) {
    if (typeof examples[k] === "string" && examples[k].trim()) ex[k] = examples[k];
  }
  const obj = { en, id, zh, category, level, source: source || DEFAULT_SOURCE, examples: ex };
  if (phonetic) obj.phonetic = phonetic;
  if (idSyllables) obj.idSyllables = idSyllables;
  if (pinyin) obj.pinyin = pinyin;
  return { obj };
}

const kept = { words: [], readings: [] };
const skip = { words: [], readings: [] };
const bEn = new Set(), bId = new Set(), bZh = new Set();

for (const raw of newWords) {
  const { obj, err } = materializeWord(raw);
  if (err) { skip.words.push(err); continue; }
  const kEn = obj.en.toLowerCase(), kId = obj.id.toLowerCase();
  const kZh = zhSenses(obj);
  // the reason names the row: promote.mjs prints a duplicate as a warning, since a drained
  // row is gone from the queue and "promoted: 0" in the log was all that said so
  if (enSet.has(kEn) || idSet.has(kId) || kZh.some((z) => zhSet.has(z))) { skip.words.push(`dup-existing: ${obj.en} / ${obj.id} / ${obj.zh}`); continue; }
  if (bEn.has(kEn) || bId.has(kId) || kZh.some((z) => bZh.has(z))) { skip.words.push(`dup-in-batch: ${obj.en} / ${obj.id} / ${obj.zh}`); continue; }
  bEn.add(kEn); bId.add(kId); kZh.forEach((z) => bZh.add(z));
  kept.words.push(obj);
}

const bRid = new Set();
for (const r of newReadings) {
  if (!r || typeof r !== "object") { skip.readings.push("not-object"); continue; }
  const { id, lang, title, author, era, genre, lines, note } = r;
  if (![id, lang, title, author, era, genre, note].every((x) => typeof x === "string" && x.trim())) { skip.readings.push("empty-field"); continue; }
  if (!LANGS.has(lang)) { skip.readings.push("bad-lang"); continue; }
  if (!Array.isArray(lines) || lines.length < 2 || !lines.every((l) => typeof l === "string" && l.trim())) { skip.readings.push("bad-lines"); continue; }
  const ta = (title + "|" + author).toLowerCase();
  if (readIdSet.has(id) || readTA.has(ta)) { skip.readings.push(`dup-existing: ${id}`); continue; }
  if (bRid.has(id)) { skip.readings.push(`dup-in-batch: ${id}`); continue; }
  bRid.add(id);
  kept.readings.push({ id, lang, title, author, era, genre, lines, note });
}

if (!dryRun) {
  if (kept.words.length) writeFileSync(WORDS_JSON, JSON.stringify([...words, ...kept.words]));
  if (kept.readings.length) writeFileSync(READINGS_JSON, JSON.stringify([...readings, ...kept.readings]));
}

console.log(JSON.stringify({
  dryRun,
  words: { submitted: newWords.length, added: kept.words.length, skipped: skip.words.length, total: words.length + (dryRun ? 0 : kept.words.length) },
  readings: { submitted: newReadings.length, added: kept.readings.length, skipped: skip.readings.length, total: readings.length + (dryRun ? 0 : kept.readings.length) },
  skipReasons: { words: skip.words, readings: skip.readings },
}, null, 2));
