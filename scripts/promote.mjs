#!/usr/bin/env node
/**
 * Promotion step: move queued content into the live site data.
 * Runs inside GitHub Actions.
 *
 * Scheduled runs release at a RATE, not a fixed amount per run. GitHub
 * delivers cron events when it feels like it — this repo saw ~22 runs a day
 * through 2026-08-25 and then 1-2 a day, with gaps of 7 to 13 hours — so a
 * fixed count per run makes the publishing speed depend on GitHub's mood
 * rather than on the schedule. The amount released is WORDS_PER_HOUR times
 * the hours since the last promotion, capped at MAX_CATCHUP_HOURS so a long
 * gap cannot empty the queue in one go.
 *
 * Manual runs set WORDS_PER_RUN to take that fixed number instead, which is
 * how the workflow's "flush the whole queue" dispatch works.
 *
 * - Validation + dedup are delegated to scripts/append-batch.mjs
 * - Promoted items leave the queue whether appended or skipped as duplicates,
 *   so the queue always drains forward.
 * - Writes "changed=true|false" to $GITHUB_OUTPUT for the workflow.
 * - Pass --dry-run to print the plan and touch nothing.
 */
import { readFileSync, writeFileSync, appendFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const Q_WORDS = join(ROOT, "queue", "words.json");
const Q_READS = join(ROOT, "queue", "readings.json");
const STATE = join(ROOT, "queue", "_promote-state.json");

const DRY_RUN = process.argv.includes("--dry-run");
const WORDS_PER_HOUR = Number(process.env.WORDS_PER_HOUR || 12);
const READING_EVERY_HOURS = Number(process.env.READING_EVERY_HOURS || 6);
const MAX_CATCHUP_HOURS = Number(process.env.MAX_CATCHUP_HOURS || 24);
// present only on manual dispatch: take exactly this many, ignoring elapsed time
const FIXED_COUNT = process.env.WORDS_PER_RUN ? Number(process.env.WORDS_PER_RUN) : null;

/**
 * Decide how much to release. Pure: same inputs, same answer, no I/O — so it
 * can be exercised on its own without a queue on disk.
 */
export function plan({
  queuedWords, queuedReadings, elapsedHours, fixedCount = null,
  wordsPerHour = 12, readingEveryHours = 6, maxCatchupHours = 24,
}) {
  if (fixedCount !== null) {
    const words = Math.max(0, Math.min(queuedWords, Math.floor(fixedCount)));
    return { words, readings: Math.min(queuedReadings, 1), effectiveHours: null };
  }
  // a negative clock skew must never turn into a negative slice
  const effectiveHours = Math.min(Math.max(elapsedHours, 0), maxCatchupHours);
  return {
    words: Math.min(queuedWords, Math.floor(wordsPerHour * effectiveHours)),
    readings: Math.min(queuedReadings, Math.floor(effectiveHours / readingEveryHours)),
    effectiveHours,
  };
}

const readJson = (p, fallback) => {
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return fallback; }
};

const qWords = readJson(Q_WORDS, []);
const qReads = readJson(Q_READS, []);

const now = Date.now();
const lastAt = Date.parse(readJson(STATE, {}).lastPromotedAt ?? "");
// no state yet (first run after this change) — bootstrap at one hour's worth
const elapsedHours = Number.isFinite(lastAt) ? (now - lastAt) / 3600000 : 1;

const { words: wordCount, readings: readingCount, effectiveHours } = plan({
  queuedWords: qWords.length, queuedReadings: qReads.length, elapsedHours,
  fixedCount: FIXED_COUNT, wordsPerHour: WORDS_PER_HOUR,
  readingEveryHours: READING_EVERY_HOURS, maxCatchupHours: MAX_CATCHUP_HOURS,
});
const takeWords = qWords.slice(0, wordCount);
const takeReading = qReads.slice(0, readingCount);

const mode = FIXED_COUNT !== null
  ? `fixed ${FIXED_COUNT}`
  : `${WORDS_PER_HOUR}/h x ${effectiveHours.toFixed(2)}h since last promotion`;
console.log(`plan: ${mode} -> ${takeWords.length} words, ${takeReading.length} readings ` +
            `(queued: ${qWords.length} words, ${qReads.length} readings)`);

const setOutput = (changed) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
};

if (DRY_RUN) {
  console.log("--dry-run: nothing written");
  process.exit(0);
}

if (!takeWords.length && !takeReading.length) {
  console.log("nothing due this run — no promotion");
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
if (takeReading.length) writeFileSync(Q_READS, JSON.stringify(qReads.slice(takeReading.length), null, 1));
// only advance the clock once the release actually happened, so a run that
// promotes nothing leaves the elapsed time to accumulate for the next one
writeFileSync(STATE, JSON.stringify({ lastPromotedAt: new Date(now).toISOString() }, null, 1) + "\n");

const summary = JSON.parse(out);
const promoted = (summary.words?.added ?? 0) + (summary.readings?.added ?? 0);
console.log(`promoted: ${promoted} | words left in queue: ${qWords.length - takeWords.length} | readings left: ${qReads.length - takeReading.length}`);
setOutput(true);
