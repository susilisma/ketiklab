// Supabase-backed accounts. Everything here degrades gracefully: if the network
// is down or the project is unreachable the app keeps working from localStorage.
import { createClient, type Session } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://spnvuseebxnacjfmfupm.supabase.co";
export const SUPABASE_KEY = "sb_publishable_tajFpjuBEdX13YwnR-k2nA_-IxP5R14";

// detectSessionInUrl: the password-reset email links back here with the tokens in
// the hash, and auth-js only turns them into a session when it is allowed to look.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export type Profile = { id: string; name: string; member_until: string | null; ref_code: string | null };
export type ProgressBlob = Record<string, unknown>;
export type SyncNote = "restored" | "merged" | "switched" | "";

const ss = {
  get(k: string) { try { return sessionStorage.getItem(k) || ""; } catch { return ""; } },
  set(k: string, v: string) { try { if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); } catch { /* ignore */ } },
};

// ---- steering App to the account view ----
// A recovery link lands on the home view, and so does the reload a restore ends
// with. App subscribes once and switches to the account panel when asked.
let accountWanted = false;
const accountWatchers = new Set<() => void>();
function wantAccount() {
  accountWanted = accountWatchers.size === 0;
  accountWatchers.forEach(f => f());
}
export function onAccountWanted(f: () => void): () => void {
  accountWatchers.add(f);
  if (accountWanted) { accountWanted = false; f(); }
  return () => { accountWatchers.delete(f); };
}

// One-shot messages that must outlive a reload: what the last sync did, and the
// reason Supabase put in the hash when a link was dead (read before auth-js strips
// the URL; a dead link never becomes a session, so nothing else would report it).
const NOTE_KEY = "ketiklab-sync-note";
let note = ss.get(NOTE_KEY) as SyncNote;
ss.set(NOTE_KEY, "");
let urlError = (() => { try { return new URLSearchParams(location.hash.slice(1)).get("error_description") || ""; } catch { return ""; } })();
export function noteAfterReload(n: SyncNote) { ss.set(NOTE_KEY, n); }
export function takeNote(): SyncNote { const n = note; note = ""; return n; }
export function takeUrlError(): string { const e = urlError; urlError = ""; return e; }
if (note || urlError) wantAccount();

// ---- password recovery ----
// auth-js announces PASSWORD_RECOVERY exactly once, during the initialisation that
// createClient just started, and only to listeners that already exist. Kept in
// sessionStorage as well, because linking this device to the account may reload.
const RECOVERY_KEY = "ketiklab-recovery";
let recovery = ss.get(RECOVERY_KEY) === "1";
export function recoveryPending() { return recovery; }
export function finishRecovery() { recovery = false; ss.set(RECOVERY_KEY, ""); }
export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

let session: Session | null = null;
// a sign-up confirmation link also arrives with tokens in the hash; that sign-in
// should land on the account page rather than silently on the home view
let fromLink = (() => { try { return location.hash.includes("access_token="); } catch { return false; } })();
function tidyUrl() {
  try { if (/#(access_token|error)|#$/.test(location.href)) history.replaceState(null, "", location.pathname + location.search); } catch { /* ignore */ }
}
supabase.auth.onAuthStateChange((event, s) => {
  session = s;
  if (event === "PASSWORD_RECOVERY") { recovery = true; ss.set(RECOVERY_KEY, "1"); }
  if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && fromLink)) { fromLink = false; wantAccount(); }
  tidyUrl();
});

export async function currentSession(): Promise<Session | null> {
  try { const { data } = await supabase.auth.getSession(); return data.session ?? null; }
  catch { return null; }
}

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  finishRecovery();
  try { await supabase.auth.signOut(); } catch { /* ignore */ }
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://ketiklab.com/",
  });
  if (error) throw error;
}

export async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles").select("id,name,member_until,ref_code").eq("id", userId).maybeSingle();
  if (error) return null;
  return (data as Profile) ?? null;
}

// The query builders resolve with { error } rather than throwing; the writes here
// throw instead, so a caller's "saved" message can only follow a clean write.
export async function saveName(userId: string, name: string) {
  const { error } = await supabase.from("profiles").upsert({ id: userId, name }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

/** Whole-progress blob; one row per account. "No row yet" and "could not ask" are
 *  kept apart: the first lets a device upload over the account, the second must not. */
export async function loadProgress(userId: string): Promise<{ ok: true; data: ProgressBlob | null } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from("progress").select("data").eq("user_id", userId).maybeSingle();
  if (error) return { ok: false, error: error.message };
  const row: unknown = data;
  const blob: unknown = typeof row === "object" && row !== null ? (row as { data?: unknown }).data : null;
  const filled = typeof blob === "object" && blob !== null && !Array.isArray(blob) && Object.keys(blob).length > 0;
  return { ok: true, data: filled ? blob as ProgressBlob : null };
}

export async function saveProgress(userId: string, data: ProgressBlob) {
  const { error } = await supabase.from("progress").upsert({ user_id: userId, data }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
}

/** Keys we mirror to the cloud. Everything else stays device-local on purpose. */
export const SYNCED_KEYS = [
  "ketiklab-state", "ketiklab-days", "ketiklab-fav", "ketiklab-chapters",
  "ketiklab-langs", "ketiklab-source", "ketiklab-category", "ketiklab-loop", "ketiklab-input",
  "ketiklab-name",
];
const PROGRESS_KEYS = ["ketiklab-state", "ketiklab-days", "ketiklab-fav", "ketiklab-chapters"];

/** Device-local, deliberately not in SYNCED_KEYS: which account the data on this
 *  device belongs to. Absent means anonymous data that may join the first account
 *  to sign in; a different id means someone else's data, which must not. */
const SYNC_UID_KEY = "ketiklab-sync-uid";
export function linkedUid(): string | null { try { return localStorage.getItem(SYNC_UID_KEY); } catch { return null; } }
export function linkDevice(uid: string) { try { localStorage.setItem(SYNC_UID_KEY, uid); } catch { /* ignore */ } }

export function collectLocal(): ProgressBlob {
  const out: ProgressBlob = {};
  for (const k of SYNCED_KEYS) {
    try { const v = localStorage.getItem(k); if (v !== null) out[k] = v; } catch { /* ignore */ }
  }
  return out;
}

export function applyLocal(blob: ProgressBlob) {
  for (const [k, v] of Object.entries(blob || {})) {
    if (!SYNCED_KEYS.includes(k) || typeof v !== "string") continue;
    try { localStorage.setItem(k, v); } catch { /* ignore */ }
  }
}

export function replaceLocal(blob: ProgressBlob) {
  for (const k of SYNCED_KEYS) { try { localStorage.removeItem(k); } catch { /* ignore */ } }
  applyLocal(blob);
}

// ---- merging two copies ----
// Counters take the larger value and lists are unioned, so a merge never loses a
// word anyone typed; only the settings keys are a plain choice, and there `over`
// wins. mergeProgress(x, x) is x in canonical form, which the comparisons rely on.
function parsed(v: unknown): unknown { if (typeof v !== "string") return null; try { return JSON.parse(v); } catch { return null; } }
function record(v: unknown): Record<string, unknown> { const p = parsed(v); return p && typeof p === "object" && !Array.isArray(p) ? p as Record<string, unknown> : {}; }
function list(v: unknown): unknown[] { const p = parsed(v); return Array.isArray(p) ? p : []; }
const count = (v: unknown) => (typeof v === "number" && v > 0 ? v : 0);
const strings = (v: unknown): string[] => (Array.isArray(v) ? v : []).filter((s): s is string => typeof s === "string");

export function mergeProgress(base: ProgressBlob, over: ProgressBlob): ProgressBlob {
  const out: ProgressBlob = {};
  for (const k of SYNCED_KEYS) {
    const a = base[k], b = over[k];
    if (typeof a !== "string" && typeof b !== "string") continue;
    if (k === "ketiklab-state") {
      const x = record(a), y = record(b);
      out[k] = JSON.stringify({
        correct: Math.max(count(x.correct), count(y.correct)),
        attempts: Math.max(count(x.attempts), count(y.attempts)),
        mistakes: Array.from(new Set([...strings(y.mistakes), ...strings(x.mistakes)])).slice(0, 30),
      });
    } else if (k === "ketiklab-days" || k === "ketiklab-chapters") {
      const x = record(a), y = record(b), m: Record<string, number> = {};
      for (const d of Object.keys({ ...x, ...y }).sort()) m[d] = Math.max(count(x[d]), count(y[d]));
      out[k] = JSON.stringify(m);
    } else if (k === "ketiklab-fav") {
      const seen = new Set<string>(), m: unknown[] = [];
      for (const f of [...list(b), ...list(a)]) {
        if (!f || typeof f !== "object") continue;
        const id = `${(f as { lang?: unknown }).lang}:${(f as { key?: unknown }).key}`;
        if (!seen.has(id)) { seen.add(id); m.push(f); }
      }
      out[k] = JSON.stringify(m.slice(0, 500));
    } else {
      out[k] = typeof b === "string" ? b : a;
    }
  }
  return out;
}

const canon = (b: ProgressBlob) => JSON.stringify(mergeProgress(b, b));

/** True when `b` holds no progress (words, days, favourites, chapters) that `a` lacks. */
export function coversProgress(a: ProgressBlob, b: ProgressBlob): boolean {
  const m = mergeProgress(b, a), n = mergeProgress(a, a);
  return PROGRESS_KEYS.every(k => m[k] === n[k]);
}

let lastPushed = "";
/** Read the cloud copy, merge this device into it, write it back if that changed
 *  anything. Reports whether the cloud holds progress this device does not.
 *  Throws when either request fails; nothing is written after a failed read. */
export async function pushProgress(userId: string, local: ProgressBlob = collectLocal()) {
  const r = await loadProgress(userId);
  if (!r.ok) throw new Error("cloud read failed: " + r.error);
  const cloud: ProgressBlob = r.data ?? {};
  const merged = mergeProgress(cloud, local);
  if (canon(merged) !== canon(cloud)) await saveProgress(userId, merged);
  lastPushed = canon(local);
  return { merged, cloudHasMore: !coversProgress(local, cloud) };
}

/** Tie this device's data to the account. "merge" keeps everything from both sides
 *  (the cloud's settings win: a device that was never linked has none worth keeping);
 *  "replace" drops what another account left here. Whenever local data changes the
 *  page reloads, the same way importProgress does: App holds its own copy of every
 *  synced key in memory and would otherwise write the old values straight back. */
export async function linkThisDevice(userId: string, how: "merge" | "replace", profileName = ""): Promise<"uploaded" | "same" | "reloading"> {
  const r = await loadProgress(userId);
  if (!r.ok) throw new Error("cloud read failed: " + r.error);
  const cloud: ProgressBlob = r.data ?? {};
  const local = collectLocal();
  const wasLinked = linkedUid() !== null;
  // a reload is only worth it when the marker stuck: with storage refused, the next
  // visit would link and reload all over again
  if (how === "replace") {
    if (profileName) cloud["ketiklab-name"] = profileName;
    replaceLocal(cloud); linkDevice(userId);
    if (linkedUid() !== userId) return "same";
    noteAfterReload("switched"); location.reload();
    return "reloading";
  }
  if (!r.data) { await saveProgress(userId, local); linkDevice(userId); return "uploaded"; }
  const merged = mergeProgress(local, cloud);
  if (profileName) merged["ketiklab-name"] = profileName;
  await saveProgress(userId, merged);
  linkDevice(userId);
  if (linkedUid() !== userId || canon(merged) === canon(local)) return "same";
  applyLocal(merged); noteAfterReload(wasLinked ? "merged" : "restored"); location.reload();
  return "reloading";
}

// Nothing in App pushes, so the cloud copy is refreshed from here: once a minute
// when something changed, and when the tab goes to the background. Only for a
// device linked to the signed-in account, so a stranger's data is never uploaded.
let pushing = false;
async function autoPush() {
  const uid = session?.user.id;
  if (!uid || pushing || linkedUid() !== uid) return;
  const local = collectLocal();
  if (canon(local) === lastPushed) return;
  pushing = true;
  try { await pushProgress(uid, local); } catch { /* the next tick retries */ } finally { pushing = false; }
}
setInterval(autoPush, 60000);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") void autoPush(); });
