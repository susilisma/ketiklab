// Supabase-backed accounts. Everything here degrades gracefully: if the network
// is down or the project is unreachable the app keeps working from localStorage.
import { createClient, type Session } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://spnvuseebxnacjfmfupm.supabase.co";
export const SUPABASE_KEY = "sb_publishable_tajFpjuBEdX13YwnR-k2nA_-IxP5R14";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

export type Profile = { id: string; name: string; member_until: string | null; ref_code: string | null };

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

export async function saveName(userId: string, name: string) {
  await supabase.from("profiles").upsert({ id: userId, name }, { onConflict: "id" });
}

/** Whole-progress blob. Small enough (a few KB) that a single row is plenty. */
export async function loadProgress(userId: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from("progress").select("data").eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return (data as { data: Record<string, unknown> }).data ?? null;
}

export async function saveProgress(userId: string, data: Record<string, unknown>) {
  await supabase.from("progress").upsert({ user_id: userId, data }, { onConflict: "user_id" });
}

/** Keys we mirror to the cloud. Everything else stays device-local on purpose. */
export const SYNCED_KEYS = [
  "lingotrio-state", "lingotrio-days", "lingotrio-fav", "lingotrio-chapters",
  "lingotrio-langs", "lingotrio-source", "lingotrio-loop", "lingotrio-input",
  "ketiklab-name",
];

export function collectLocal(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of SYNCED_KEYS) {
    try { const v = localStorage.getItem(k); if (v !== null) out[k] = v; } catch { /* ignore */ }
  }
  return out;
}

export function applyLocal(blob: Record<string, unknown>) {
  for (const [k, v] of Object.entries(blob || {})) {
    if (!SYNCED_KEYS.includes(k) || typeof v !== "string") continue;
    try { localStorage.setItem(k, v); } catch { /* ignore */ }
  }
}
