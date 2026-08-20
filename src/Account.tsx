import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  supabase, currentSession, signIn, signUp, signOut, resetPassword,
  loadProfile, saveName, loadProgress, saveProgress, collectLocal, applyLocal,
} from "./cloud";

type Lang = "zh" | "id" | "en";
const T = (zh: string, id: string, en: string, l: Lang) => (l === "zh" ? zh : l === "id" ? id : en);

export function Account({ uiLang, name, onName }: {
  uiLang: Lang;
  name: string;
  onName: (n: string) => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [member, setMember] = useState<string | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState("");

  useEffect(() => {
    let alive = true;
    currentSession().then(s => { if (alive) { setSession(s); setReady(true); } });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (alive) setSession(s); });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  // First sight of a session: pull the cloud copy, or push this device's copy up
  // if the account is still empty. Local data is never silently discarded.
  useEffect(() => {
    if (!session) return;
    let alive = true;
    (async () => {
      const uid = session.user.id;
      const prof = await loadProfile(uid);
      if (!alive) return;
      if (prof) {
        setMember(prof.member_until);
        setRefCode(prof.ref_code);
        if (prof.name) { onName(prof.name); }
        else if (name.trim()) { await saveName(uid, name.trim()); }
      }
      const cloud = await loadProgress(uid);
      if (!alive) return;
      if (cloud && Object.keys(cloud).length) {
        applyLocal(cloud);
        const n = localStorage.getItem("ketiklab-name");
        if (n) onName(n);
        setMsg(T("已从云端恢复你的学习记录，刷新后生效。",
                 "Data belajarmu dipulihkan dari cloud. Muat ulang untuk melihatnya.",
                 "Your progress was restored from the cloud. Reload to see it.", uiLang));
      } else {
        await saveProgress(uid, collectLocal());
        setMsg(T("这台设备上的学习记录已上传到你的账号。",
                 "Data di perangkat ini sudah diunggah ke akunmu.",
                 "This device's progress has been uploaded to your account.", uiLang));
      }
      if (alive) setSyncedAt(new Date().toLocaleTimeString());
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    try {
      if (mode === "up") {
        const res = await signUp(email.trim(), password, formName.trim() || name.trim());
        if (formName.trim()) onName(formName.trim());
        if (!res.session) {
          setMsg(T("注册成功。请到邮箱点确认链接，然后回来登录。",
                   "Pendaftaran berhasil. Cek email kamu, klik tautan konfirmasi, lalu masuk.",
                   "Signed up. Check your email for the confirmation link, then sign in.", uiLang));
          setMode("in");
        }
      } else {
        await signIn(email.trim(), password);
      }
      setPassword("");
    } catch (e2: unknown) {
      setErr((e2 as Error).message || String(e2));
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    setErr(""); setMsg("");
    if (!email.trim()) { setErr(T("先填邮箱。", "Isi email dulu.", "Enter your email first.", uiLang)); return; }
    try {
      await resetPassword(email.trim());
      setMsg(T("重置链接已发到你的邮箱。", "Tautan reset sudah dikirim ke emailmu.", "A reset link is on its way.", uiLang));
    } catch (e2: unknown) { setErr((e2 as Error).message || String(e2)); }
  }

  async function pushNow() {
    if (!session) return;
    setBusy(true);
    try {
      await saveProgress(session.user.id, collectLocal());
      if (name.trim()) await saveName(session.user.id, name.trim());
      setSyncedAt(new Date().toLocaleTimeString());
      setMsg(T("已同步。", "Tersinkron.", "Synced.", uiLang));
    } catch (e2: unknown) { setErr((e2 as Error).message || String(e2)); }
    finally { setBusy(false); }
  }

  if (!ready) return <p className="acct-note">{T("加载中…", "Memuat…", "Loading…", uiLang)}</p>;

  if (session) {
    const active = member && new Date(member) >= new Date();
    return <div className="acct">
      <div className="acct-card">
        <div className="acct-who">
          <span>{(name.trim()[0] || session.user.email?.[0] || "?").toUpperCase()}</span>
          <div>
            <b>{name.trim() || T("学习者", "Pelajar", "Learner", uiLang)}</b>
            <small>{session.user.email}</small>
          </div>
          <em className={active ? "acct-badge on" : "acct-badge"}>
            {active
              ? T(`会员至 ${member}`, `Anggota s/d ${member}`, `Member until ${member}`, uiLang)
              : T("免费用户", "Pengguna gratis", "Free learner", uiLang)}
          </em>
        </div>

        <label className="acct-field">
          <span>{T("显示名字", "Nama tampilan", "Display name", uiLang)}</span>
          <input value={name} maxLength={24} onChange={e => onName(e.target.value)}
            onBlur={() => session && saveName(session.user.id, name.trim())}
            placeholder={T("你的名字", "Nama kamu", "Your name", uiLang)} />
        </label>

        {refCode && <p className="acct-note">
          {T("你的推广码：", "Kode referralmu: ", "Your referral code: ", uiLang)}<code>{refCode}</code>
        </p>}

        <div className="acct-actions">
          <button className="acct-btn" onClick={pushNow} disabled={busy}>
            {T("立即同步", "Sinkronkan sekarang", "Sync now", uiLang)}
          </button>
          <button className="acct-btn ghost" onClick={() => signOut()}>
            {T("退出登录", "Keluar", "Sign out", uiLang)}
          </button>
        </div>
        {syncedAt && <p className="acct-note">{T("上次同步 ", "Sinkron terakhir ", "Last synced ", uiLang)}{syncedAt}</p>}
        {msg && <p className="acct-ok">{msg}</p>}
        {err && <p className="acct-err">{err}</p>}
      </div>
      <p className="acct-note">
        {T("登录后，学习记录、错词本、收藏和连续天数会跟着账号走，换手机也在。",
           "Setelah masuk, progres, daftar kata salah, favorit, dan streak ikut akunmu — ganti HP pun tetap ada.",
           "Once signed in, your progress, mistakes, favourites and streak follow the account across devices.", uiLang)}
      </p>
    </div>;
  }

  return <div className="acct">
    <div className="acct-card">
      <div className="acct-tabs">
        <button className={mode === "in" ? "on" : ""} onClick={() => { setMode("in"); setErr(""); }}>
          {T("登录", "Masuk", "Sign in", uiLang)}
        </button>
        <button className={mode === "up" ? "on" : ""} onClick={() => { setMode("up"); setErr(""); }}>
          {T("注册", "Daftar", "Sign up", uiLang)}
        </button>
      </div>
      <form onSubmit={submit}>
        {mode === "up" && <label className="acct-field">
          <span>{T("名字", "Nama", "Name", uiLang)}</span>
          <input value={formName} maxLength={24} onChange={e => setFormName(e.target.value)}
            placeholder={T("别人看到的名字", "Nama yang dilihat orang", "How you appear", uiLang)} />
        </label>}
        <label className="acct-field">
          <span>{T("邮箱", "Email", "Email", uiLang)}</span>
          <input type="email" required autoComplete="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" />
        </label>
        <label className="acct-field">
          <span>{T("密码", "Kata sandi", "Password", uiLang)}</span>
          <input type="password" required minLength={6}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder={T("至少 6 位", "Minimal 6 karakter", "At least 6 characters", uiLang)} />
        </label>
        <button className="acct-btn primary" type="submit" disabled={busy}>
          {busy ? T("处理中…", "Memproses…", "Working…", uiLang)
                : mode === "up" ? T("注册", "Daftar", "Sign up", uiLang)
                                : T("登录", "Masuk", "Sign in", uiLang)}
        </button>
      </form>
      {mode === "in" && <button className="acct-link" onClick={forgot}>
        {T("忘记密码？", "Lupa kata sandi?", "Forgot password?", uiLang)}
      </button>}
      {msg && <p className="acct-ok">{msg}</p>}
      {err && <p className="acct-err">{err}</p>}
    </div>
    <p className="acct-note">
      {T("不登录也能练。登录只是为了让记录跟着你换设备，以及以后认出会员身份。",
         "Tanpa akun pun tetap bisa latihan. Akun hanya membuat progresmu ikut pindah perangkat dan menandai status anggota.",
         "You can practise without an account. Signing in only makes your progress portable and marks membership.", uiLang)}
    </p>
  </div>;
}
