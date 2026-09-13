#!/usr/bin/env node
/**
 * Promotion step: move queued content into the live site data.
 * Runs inside GitHub Actions.
 *
 * Scheduled runs release at a RATE, not a fixed amount per run: WORDS_PER_HOUR
 * times the hours on the words clock, and one reading per READING_EVERY_HOURS
 * on the readings clock, each capped at MAX_CATCHUP_HOURS. GitHub fires cron
 * irregularly, so a fixed count would tie publishing speed to how often it
 * happens to run. Manual runs set WORDS_PER_RUN to take a fixed number, which
 * is how the workflow's "flush the whole queue" dispatch works.
 *
 * Words and readings keep separate clocks in queue/_promote-state.json, so a
 * word release does not restart the wait for the next reading. A clock only
 * advances by the period its release covered, and it stops when its queue runs
 * dry, so neither a partial period nor an idle day is paid out as a burst.
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

/** Decide how much to release. Pure — no I/O, so it can be reasoned about alone. */
function plan({
  queuedWords, queuedReadings, wordsHours, readingsHours, fixedCount = null,
  wordsPerHour = 12, readingEveryHours = 6, maxCatchupHours = 24,
}) {
  if (fixedCount !== null) {
    const words = Math.max(0, Math.min(queuedWords, Math.floor(fixedCount)));
    return { words, readings: Math.min(queuedReadings, 1), wordsHours: null, readingsHours: null };
  }
  // a negative clock skew must never turn into a negative slice
  const clamp = (h) => Math.min(Math.max(h, 0), maxCatchupHours);
  const wh = clamp(wordsHours), rh = clamp(readingsHours);
  return {
    words: Math.min(queuedWords, Math.floor(wordsPerHour * wh)),
    readings: Math.min(queuedReadings, Math.floor(rh / readingEveryHours)),
    wordsHours: wh, readingsHours: rh,
  };
}

/**
 * Hours a clock has run. A clock that was never set, or that stopped because its
 * queue ran dry, restarts at one release unit: the idle hours before new content
 * arrived are not owed to it.
 */
function hoursOn(clock, restartHours, now) {
  const at = Date.parse(clock?.at ?? "");
  if (!Number.isFinite(at)) return restartHours;
  const hours = (now - at) / 3600000;
  return clock.drained ? Math.min(hours, restartHours) : hours;
}

/**
 * The clock after a release: it advances by exactly the period the release
 * covered, so the remainder of a partial period carries into the next run. A
 * release that empties the queue stops the clock at now instead.
 */
function advance(clock, { count, effectiveHours, hoursPerItem, drained, now }) {
  if (!count) return clock;
  const carry = drained || effectiveHours === null ? 0 : Math.max(0, effectiveHours - count * hoursPerItem);
  return { at: new Date(now - carry * 3600000).toISOString(), drained };
}

const readJson = (p, fallback) => {
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return fallback; }
};

const qWords = readJson(Q_WORDS, []);
const qReads = readJson(Q_READS, []);
const state = readJson(STATE, {});

const now = Date.now();
const { words: wordCount, readings: readingCount, wordsHours, readingsHours } = plan({
  queuedWords: qWords.length, queuedReadings: qReads.length,
  wordsHours: hoursOn(state.words, 1, now),
  readingsHours: hoursOn(state.readings, READING_EVERY_HOURS, now),
  fixedCount: FIXED_COUNT, wordsPerHour: WORDS_PER_HOUR,
  readingEveryHours: READING_EVERY_HOURS, maxCatchupHours: MAX_CATCHUP_HOURS,
});
const takeWords = qWords.slice(0, wordCount);
const takeReading = qReads.slice(0, readingCount);

const mode = FIXED_COUNT !== null
  ? `fixed ${FIXED_COUNT}`
  : `${WORDS_PER_HOUR}/h x ${wordsHours.toFixed(2)}h on the words clock, ` +
    `1 per ${READING_EVERY_HOURS}h x ${readingsHours.toFixed(2)}h on the readings clock`;
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
// a clock that released nothing is left untouched, so its time keeps accumulating
writeFileSync(STATE, JSON.stringify({
  words: advance(state.words, {
    count: takeWords.length, effectiveHours: wordsHours, hoursPerItem: 1 / WORDS_PER_HOUR,
    drained: takeWords.length === qWords.length, now,
  }),
  readings: advance(state.readings, {
    count: takeReading.length, effectiveHours: readingsHours, hoursPerItem: READING_EVERY_HOURS,
    drained: takeReading.length === qReads.length, now,
  }),
}, null, 1) + "\n");

const summary = JSON.parse(out);
const promoted = (summary.words?.added ?? 0) + (summary.readings?.added ?? 0);
console.log(`promoted: ${promoted} | words left in queue: ${qWords.length - takeWords.length} | readings left: ${qReads.length - takeReading.length}`);
setOutput(true);
