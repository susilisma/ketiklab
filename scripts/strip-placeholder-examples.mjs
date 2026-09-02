#!/usr/bin/env node
/**
 * One-off cleanup: remove the filler example sentences from public/data/words.json.
 *
 * append-batch.mjs used to invent an example for every word that arrived without
 * one, so 3082 of 3094 entries carry the same three sentences with the word
 * swapped in. The generator no longer does this, but the entries already written
 * still hold the filler. This strips exactly those three shapes and leaves every
 * genuine example untouched.
 *
 * Usage:
 *   node scripts/strip-placeholder-examples.mjs            # report only
 *   node scripts/strip-placeholder-examples.mjs --write    # actually rewrite
 *
 * Run it through the "Build and deploy" workflow_dispatch rather than locally if
 * a local branch is behind origin/main: words.json is written as a single line,
 * so any local edit conflicts irreconcilably with the hourly content commits.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORDS = join(ROOT, "public", "data", "words.json");
const write = process.argv.includes("--write");

const FILLER = [
  /^Today I am learning the word [“"].*[”"]\.$/,
  /^Hari ini saya belajar kata [“"].*[”"]\.$/,
  /^我今天学习[“"].*[”"]这个词。$/,
];
const isFiller = (s) => typeof s === "string" && FILLER.some((re) => re.test(s.trim()));

const words = JSON.parse(readFileSync(WORDS, "utf8"));
let stripped = 0, emptied = 0, kept = 0;

for (const w of words) {
  const ex = w.examples;
  if (!ex || typeof ex !== "object") continue;
  for (const k of ["en", "id", "zh"]) {
    if (!(k in ex)) continue;
    if (isFiller(ex[k])) { delete ex[k]; stripped++; }
    else kept++;
  }
  if (!Object.keys(ex).length) emptied++;
}

console.log(JSON.stringify({
  words: words.length,
  fillerSentencesRemoved: stripped,
  realSentencesKept: kept,
  wordsLeftWithNoExample: emptied,
  wrote: write,
}, null, 2));

if (write) {
  writeFileSync(WORDS, JSON.stringify(words));
  console.log("words.json rewritten");
} else {
  console.log("report only — pass --write to apply");
}
