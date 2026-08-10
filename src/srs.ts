// Ebbinghaus-style spaced repetition, persisted in IndexedDB via Dexie.
// A word climbs an expanding interval ladder on each correct answer and drops
// back to the start (a "lapse") on a wrong answer, so difficult words resurface
// sooner and mastered words return less often — the forgetting-curve idea.
import Dexie, { type Table } from "dexie";

export type ReviewRecord = {
  en: string; // primary key — the word's English key
  step: number; // index into INTERVALS
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

class LingoDB extends Dexie {
  reviews!: Table<ReviewRecord, string>;
  constructor() {
    super("lingotrio");
    this.version(1).stores({ reviews: "en, dueAt, step" });
  }
}

const db = new LingoDB();

export async function recordReview(en: string, correct: boolean, now = Date.now()): Promise<void> {
  const existing = await db.reviews.get(en);
  const prevStep = existing?.step ?? 0;
  const step = correct ? Math.min(prevStep + 1, INTERVALS.length - 1) : 0;
  const dueAt = correct ? now + INTERVALS[step] * DAY : now + RELAPSE_DELAY;
  await db.reviews.put({
    en,
    step,
    dueAt,
    reps: (existing?.reps ?? 0) + 1,
    lapses: (existing?.lapses ?? 0) + (correct ? 0 : 1),
    lastResult: correct ? "correct" : "wrong",
    updatedAt: now,
  });
}

export type SrsStats = { due: number; learning: number; mastered: number; total: number };

export async function getStats(now = Date.now()): Promise<SrsStats> {
  const all = await db.reviews.toArray();
  const due = all.filter((r) => r.dueAt <= now).length;
  const mastered = all.filter((r) => r.step >= 4).length;
  const learning = all.length - mastered;
  return { due, learning, mastered, total: all.length };
}

// English keys of words due for review now, soonest first.
export async function getDueKeys(now = Date.now(), limit = 60): Promise<string[]> {
  const all = await db.reviews.where("dueAt").belowOrEqual(now).toArray();
  all.sort((a, b) => a.dueAt - b.dueAt);
  return all.slice(0, limit).map((r) => r.en);
}

export async function getAllRecords(): Promise<ReviewRecord[]> {
  return db.reviews.toArray();
}

export async function restoreRecords(records: ReviewRecord[]): Promise<void> {
  const clean = records.filter((r) => r && typeof r.en === "string");
  if (clean.length) await db.reviews.bulkPut(clean);
}

export async function resetAll(): Promise<void> {
  await db.reviews.clear();
}
