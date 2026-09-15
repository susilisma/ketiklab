// Ebbinghaus-style spaced repetition, persisted in IndexedDB via Dexie.
// A word climbs an expanding interval ladder on each correct answer and drops
// back to the start (a "lapse") on a wrong answer, so difficult words resurface
// sooner and mastered words return less often — the forgetting-curve idea.
import Dexie, { type Table } from "dexie";

export type ReviewRecord = {
  en: string; // primary key — "<lang>:<word key>", so the Indonesian "air" and the English "air" keep separate rows
  step: number; // index into INTERVALS; -1 = new or lapsed, not on the ladder yet
  dueAt: number; // epoch ms when the word should be reviewed next
  reps: number; // total times answered
  lapses: number; // total wrong answers
  lastResult: "correct" | "wrong";
  updatedAt: number;
};

// Expanding intervals in DAYS. A wrong answer schedules a same-session retry.
export const INTERVALS = [1, 2, 4, 7, 15, 30, 60, 120];
const DAY = 24 * 60 * 60 * 1000;
const RELAPSE_DELAY = 10 * 60 * 1000; // 10 minutes

// Rows written before keys carried a language ("apple" rather than "en:apple").
// A hanzi key can only be Chinese and is renamed on upgrade; a Latin key may be
// the trio word in any language or an English or Indonesian dictionary
// headword, so it stays as it is, invisible to the counts, until the same word
// is answered under its new key and inherits it (see recordReview).
const keyed = (en: string) => en.includes(":");
const HANZI = /^[㐀-鿿]+$/;

class KetikDB extends Dexie {
  reviews!: Table<ReviewRecord, string>;
  constructor() {
    super("ketiklab");
    this.version(1).stores({ reviews: "en, dueAt, step" });
    this.version(2).stores({ reviews: "en, dueAt, step" }).upgrade(async (tx) => {
      const table = tx.table<ReviewRecord, string>("reviews");
      const bare = (await table.toArray()).filter((r) => !keyed(r.en) && HANZI.test(r.en));
      for (const r of bare) {
        const en = "zh:" + r.en;
        const other = await table.get(en);
        await table.delete(r.en);
        if (!other || other.updatedAt < r.updatedAt) await table.put({ ...r, en });
      }
    });
  }
}

const db = new KetikDB();

export async function recordReview(en: string, correct: boolean, now = Date.now()): Promise<void> {
  await db.transaction("rw", db.reviews, async () => {
    let existing = await db.reviews.get(en);
    // the same word under its old bare key: inherit its ladder position when this
    // key has none yet, and drop the old row either way so it cannot stay due forever
    const i = en.indexOf(":");
    if (i >= 0) {
      const old = await db.reviews.get(en.slice(i + 1));
      if (old) { await db.reviews.delete(old.en); if (!existing) existing = { ...old, en }; }
    }
    const prevStep = existing?.step ?? -1;
    let step: number;
    let dueAt: number;
    if (!correct) { step = -1; dueAt = now + RELAPSE_DELAY; }
    // a correct answer before the word is due (a retried chapter, a repeated word) is
    // not a recall from memory, so it keeps the rung and the date it already has
    else if (existing && existing.dueAt > now) { step = prevStep; dueAt = existing.dueAt; }
    else { step = Math.min(prevStep + 1, INTERVALS.length - 1); dueAt = now + INTERVALS[step] * DAY; }
    await db.reviews.put({
      en,
      step,
      dueAt,
      reps: (existing?.reps ?? 0) + 1,
      lapses: (existing?.lapses ?? 0) + (correct ? 0 : 1),
      lastResult: correct ? "correct" : "wrong",
      updatedAt: now,
    });
  });
}

export type SrsStats = { due: number; learning: number; mastered: number; total: number };

export async function getStats(now = Date.now()): Promise<SrsStats> {
  const all = (await db.reviews.toArray()).filter((r) => keyed(r.en));
  const due = all.filter((r) => r.dueAt <= now).length;
  const mastered = all.filter((r) => r.step >= 4).length;
  const learning = all.length - mastered;
  return { due, learning, mastered, total: all.length };
}

// "<lang>:<key>" ids of words due for review now, soonest first.
export async function getDueKeys(now = Date.now(), limit = 60): Promise<string[]> {
  const all = (await db.reviews.where("dueAt").belowOrEqual(now).toArray()).filter((r) => keyed(r.en));
  all.sort((a, b) => a.dueAt - b.dueAt);
  return all.slice(0, limit).map((r) => r.en);
}

// rows for words that no longer exist in any list (renamed or removed by a content
// update) would otherwise count as due forever
export async function deleteRecords(keys: string[]): Promise<void> {
  if (keys.length) await db.reviews.bulkDelete(keys);
}

export async function getAllRecords(): Promise<ReviewRecord[]> {
  return db.reviews.toArray();
}

export async function restoreRecords(records: ReviewRecord[]): Promise<void> {
  // finite numbers only: a NaN dueAt is never due and never counted, and a string
  // reps would be concatenated on the next answer ("31" after "3" + 1)
  const num = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) && v !== null && v !== "" ? Number(v) : fallback);
  const clean = records.filter((r) => r && typeof r.en === "string" && Number.isFinite(r.dueAt) && Number.isFinite(r.step))
    .map((r) => ({ ...r, step: Math.max(-1, Math.min(INTERVALS.length - 1, Math.trunc(r.step))), reps: num(r.reps, 0), lapses: num(r.lapses, 0), updatedAt: num(r.updatedAt, r.dueAt), lastResult: r.lastResult === "wrong" ? "wrong" as const : "correct" as const }))
    // a backup from before keys carried a language: hanzi keys are Chinese for sure
    .map((r) => (!keyed(r.en) && HANZI.test(r.en) ? { ...r, en: "zh:" + r.en } : r));
  if (clean.length) await db.reviews.bulkPut(clean);
}

export async function resetAll(): Promise<void> {
  await db.reviews.clear();
}
