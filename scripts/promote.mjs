#!/usr/bin/env node
/**
 * Hourly promotion: move a few items from the content queue into the live
 * site data. Runs inside GitHub Actions on a cron schedule.
 *
 * - Promotes WORDS_PER_RUN words (default 2) from queue/words.json
 * - Promotes 1 reading from queue/readings.json every READING_EVERY_HOURS
 *   (default 6) UTC hours
 * - Validation + dedup are delegated to scripts/append-batch.mjs
 * - Promoted items are removed from the queue whether appended or skipped
 *   as duplicates, so the queue always drains forward.
 * - Writes "changed=true|false" to $GITHUB_OUTPUT for the workflow.
 */
import { readFileSync, writeFileSync, appendFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const Q_WORDS = join(ROOT, "queue", "words.json");
const Q_READS = join(ROOT, "queue", "readings.json");

const WORDS_PER_RUN = Number(process.env.WORDS_PER_RUN || 2);
const READING_EVERY_HOURS = Number(process.env.READING_EVERY_HOURS || 6);

const readJson = (p, fallback) => {
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return fallback; }
};

const qWords = readJson(Q_WORDS, []);
const qReads = readJson(Q_READS, []);

const takeWords = qWords.slice(0, WORDS_PER_RUN);
const hour = new Date().getUTCHours();
const takeReading = qReads.length && hour % READING_EVERY_HOURS === 0 ? [qReads[0]] : [];

const setOutput = (changed) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
};

if (!takeWords.length && !takeReading.length) {
  console.log("queue empty or nothing scheduled this hour — no promotion");
  setOutput(false);
  process.exit(0);
}

const batchPath = join(ROOT, "queue", "_promote-batch.json");
writeFileSync(batchPath, JSON.stringify({ words: takeWords, readings: takeReading }));

const out = execFileSync(process.execPath, [join(ROOT, "scripts", "append-batch.mjs"), batchPath], { encoding: "utf8" });
console.log(out);
rmSync(batchPath, { force: true });

// drain promoted items from the queue regardless of dup-skips
writeFileSync(Q_WORDS, JSON.stringify(qWords.slice(takeWords.length), null, 0));
if (takeReading.length) writeFileSync(Q_READS, JSON.stringify(qReads.slice(1), null, 1));

const summary = JSON.parse(out);
const promoted = (summary.words?.added ?? 0) + (summary.readings?.added ?? 0);
console.log(`promoted: ${promoted} | words left in queue: ${qWords.length - takeWords.length} | readings left: ${qReads.length - takeReading.length}`);
setOutput(true);
