import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  supabase, currentSession, signIn, signUp, signOut, resetPassword, updatePassword,
  loadProfile, saveName, pushProgress, linkThisDevice, applyLocal, linkedUid, linkDevice,
  recoveryPending, finishRecovery, noteAfterReload, takeNote, takeUrlError, type SyncNote,
} from "./cloud";

type Lang = "zh" | "id" | "en";
const T = (zh: string, id: string, en: string, l: Lang) => (l === "zh" ? zh : l === "id" ? id : en);

/** The mistyped domains that actually cost people their account. */
const DOMAIN_FIX: Record<string, string> = {
  "gmail.co": "gmail.com", "gmial.com": "gmail.com", "gmai.com": "gmail.com",
  "gmail.con": "gmail.com", "gmail.cm": "gmail.com", "gmailc.om": "gmail.com",
  "gnail.com": "gmail.com", "gmail.om": "gmail.com",
  "yahoo.co": "yahoo.com", "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com",
  "hotmail.co": "hotmail.com", "hotmial.com": "hotmail.com",
  "outlook.co": "outlook.com", "outlok.com": "outlook.com",
  "icloud.co": "icloud.com", "163.co": "163.com", "126.co": "126.com",
  "qq.co": "qq.com",
};

function suggestEmail(raw: string): string | null {
  const at = raw.lastIndexOf("@");
  if (at < 0) return null;
  const domain = raw.slice(at + 1).toLowerCase().trim();
  const fixed = DOMAIN_FIX[domain];
  return fixed ? raw.slice(0, at + 1) + fixed : null;
}

/** Supabase speaks English error codes; learners deserve their own language. */
function humanError(e: unknown, l: Lang): string {
  const ae = (e && typeof e === "object" ? e : {}) as { name?: string; status?: number; message?: string };
  const raw = typeof e === "string" ? e : ae.message || String(e);
  const m = raw.toLowerCase();
  // A dead connection carries the browser's own wording — Chrome "Failed to fetch",
  // Firefox "NetworkError…", Safari "Load failed" — so the error class is checked
  // first and the text only as a fallback.
  if (ae.name === "AuthRetryableFetchError" || ae.status === 0 || m.includes("failed to fetch") || m.includes("network") || m.includes("load failed") || m.includes("offline"))
    return T("连不上服务器，检查一下网络再试。",
             "Tidak bisa terhubung ke server. Cek koneksimu.",
             "Could not reach the server. Check your connection.", l);
  if (m.includes("cloud read failed"))
    return T("暂时读不到云端记录，没有改动任何数据，请稍后再试。",
             "Data cloud belum bisa dibaca. Tidak ada yang diubah — coba lagi nanti.",
             "Could not read the cloud copy; nothing was changed. Try again later.", l);
  if (m.includes("email not confirmed"))
    return T("这个邮箱还没确认。去收件箱（含垃圾邮件）点确认链接后再登录。",
             "Email ini belum dikonfirmasi. Cek inbox (dan folder spam), klik tautannya, lalu masuk lagi.",
             "This email is not confirmed yet. Open the link we sent (check spam too), then sign in.", l);
  if (m.includes("invalid login credentials"))
    return T("邮箱或密码不对。也请检查邮箱有没有打错字母。",
             "Email atau kata sandi salah. Cek juga ejaan emailmu.",
             "Wrong email or password. Double-check the spelling of your email too.", l);
  if (m.includes("rate limit"))
    return T("发信次数达到上限，请等一小时再试。",
             "Batas pengiriman email tercapai. Coba lagi satu jam lagi.",
             "Email sending limit reached. Try again in an hour.", l);
  if (m.includes("already registered") || m.includes("already exists"))
    return T("这个邮箱已经注册过了，直接登录即可。",
             "Email ini sudah terdaftar. Silakan masuk saja.",
             "That email is already registered — just sign in.", l);
  if (m.includes("different from the old"))
    return T("新密码不能和原密码相同。", "Kata sandi baru harus berbeda dari yang lama.", "The new password must differ from the old one.", l);
  if (m.includes("password") && m.includes("6"))
    return T("密码至少 6 位。", "Kata sandi minimal 6 karakter.", "Password needs at least 6 characters.", l);
  if (m.includes("expired") || m.includes("invalid or has"))
    return T("这个链接已失效或过期，请重新申请一封。",
             "Tautan ini sudah kedaluwarsa. Minta yang baru.",
             "That link has expired. Request a new one.", l);
  return raw;
}

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
  const [profName, setProfName] = useState("");
  const [syncedAt, setSyncedAt] = useState("");
  const [typo, setTypo] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");
  const [recovering, setRecovering] = useState(recoveryPending);
  const [newPw, setNewPw] = useState("");
  // the data on this device belongs to a different account than the one signed in
  const [foreign, setForeign] = useState(false);
  const [cloudNewer, setCloudNewer] = useState(false);
  const [note, setNote] = useState<SyncNote>("");
  const [urlErr, setUrlErr] = useState("");
  const lastUid = useRef<string | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    currentSession().then(s => { if (alive) { setSession(s); setReady(true); } });
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (!alive) return;
      setSession(s);
      if (e === "PASSWORD_RECOVERY") setRecovering(true);
      if (e === "SIGNED_OUT") setRecovering(false);
    });
    const n = takeNote(); if (n) setNote(n);
    const ue = takeUrlError(); if (ue) setUrlErr(ue);
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  // Account mounts afresh on every visit to the tab, so this runs often. It only
  // writes to localStorage while linking this device to the account for the first
  // time (and reloads then, see linkThisDevice); afterwards it pushes and reports.
  useEffect(() => {
    const cur = session?.user.id;
    if (lastUid.current !== cur) {
      lastUid.current = cur;
      setMember(null); setRefCode(null); setProfName(""); setSyncedAt(""); setMsg(""); setErr(""); setForeign(false); setCloudNewer(false);
    }
    if (!session) return;
    let alive = true;
    (async () => {
      const uid = session.user.id;
      const linked = linkedUid();
      const prof = await loadProfile(uid);
      if (!alive) return;
      if (prof) {
        setMember(prof.member_until);
        setRefCode(prof.ref_code);
        setProfName(prof.name || "");
        if (prof.name) onName(prof.name);
        else if (name.trim() && (!linked || linked === uid)) await saveName(uid, name.trim()).catch(() => { /* the sync below reports an outage */ });
      }
      if (recovering) return;
      try {
        if (linked && linked !== uid) { setForeign(true); return; }
        if (linked === uid) {
          const { cloudHasMore } = await pushProgress(uid);
          if (!alive) return;
          setCloudNewer(cloudHasMore);
        } else {
          const done = await linkThisDevice(uid, "merge", prof?.name || "");
          if (!alive || done === "reloading") return;
          setMsg(done === "uploaded"
            ? T("这台设备上的学习记录已上传到你的账号。",
                "Data di perangkat ini sudah diunggah ke akunmu.",
                "This device's progress has been uploaded to your account.", uiLang)
            : T("已同步。", "Tersinkron.", "Synced.", uiLang));
        }
        setSyncedAt(new Date().toLocaleTimeString());
      } catch (e2: unknown) { if (alive) setErr(humanError(e2, uiLang)); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, recovering]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    try {
      const addr = email.trim();
      if (mode === "up") {
        const res = await signUp(addr, password, formName.trim() || name.trim());
        // With confirmation on, signing up an address that already has an account
        // returns a placeholder user with no identities instead of an error, and
        // sends no email.
        if (res.user && res.user.identities && res.user.identities.length === 0) {
          setErr(humanError("already registered", uiLang));
          setMode("in");
          return;
        }
        if (formName.trim()) onName(formName.trim());
        if (!res.session) {
          setSentTo(addr);
          setMsg(T(`确认邮件已发到 ${addr}。点开里面的链接，然后回来登录。地址不对的话现在就改，否则永远收不到。`,
                   `Email konfirmasi dikirim ke ${addr}. Klik tautannya, lalu masuk. Kalau alamatnya salah, perbaiki sekarang — kalau tidak, emailnya tidak akan pernah sampai.`,
                   `A confirmation email went to ${addr}. Open the link, then sign in. If that address is wrong, fix it now — otherwise it will never arrive.`, uiLang));
          setMode("in");
        }
      } else {
        await signIn(addr, password);
      }
      setPassword("");
    } catch (e2: unknown) {
      setErr(humanError(e2, uiLang));
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    setErr(""); setMsg("");
    if (!email.trim()) { setErr(T("先填邮箱。", "Isi email dulu.", "Enter your email first.", uiLang)); return; }
    const addr = email.trim();
    try {
      await resetPassword(addr);
      setMsg(T(`重置链接已发到 ${addr}。`, `Tautan reset sudah dikirim ke ${addr}.`, `A reset link went to ${addr}.`, uiLang));
    } catch (e2: unknown) { setErr(humanError(e2, uiLang)); }
  }

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    try {
      await updatePassword(newPw);
      finishRecovery(); setRecovering(false); setNewPw("");
      setMsg(T("密码已更新。", "Kata sandi sudah diperbarui.", "Password updated.", uiLang));
    } catch (e2: unknown) { setErr(humanError(e2, uiLang)); }
    finally { setBusy(false); }
  }

  async function pushNow() {
    if (!session) return;
    const uid = session.user.id;
    setErr(""); setMsg(""); setBusy(true);
    try {
      const linked = linkedUid();
      if (linked && linked !== uid) { setForeign(true); return; }
      const { cloudHasMore } = await pushProgress(uid);
      if (name.trim()) await saveName(uid, name.trim());
      linkDevice(uid);
      setCloudNewer(cloudHasMore);
      setSyncedAt(new Date().toLocaleTimeString());
      setMsg(T("已同步。", "Tersinkron.", "Synced.", uiLang));
    } catch (e2: unknown) { setErr(humanError(e2, uiLang)); }
    finally { setBusy(false); }
  }

  // Bring what the cloud has onto this device. Reloads, because App would write its
  // in-memory copy of every synced key straight back over the merged values.
  async function pullNow() {
    if (!session) return;
    setErr(""); setMsg(""); setBusy(true);
    try {
      const { merged } = await pushProgress(session.user.id);
      applyLocal(merged); noteAfterReload("merged"); window.location.reload();
    } catch (e2: unknown) { setErr(humanError(e2, uiLang)); setBusy(false); }
  }

  async function chooseLink(how: "merge" | "replace") {
    if (!session) return;
    setErr(""); setMsg(""); setBusy(true);
    try {
      const done = await linkThisDevice(session.user.id, how, profName);
      if (done === "reloading") return;
      setForeign(false);
      setSyncedAt(new Date().toLocaleTimeString());
      setMsg(done === "uploaded"
        ? T("这台设备上的学习记录已上传到你的账号。",
            "Data di perangkat ini sudah diunggah ke akunmu.",
            "This device's progress has been uploaded to your account.", uiLang)
        : T("已同步。", "Tersinkron.", "Synced.", uiLang));
    } catch (e2: unknown) { setErr(humanError(e2, uiLang)); }
    finally { setBusy(false); }
  }

  const noteText = note === "restored"
    ? T("已从云端恢复你的学习记录。", "Data belajarmu dipulihkan dari cloud.", "Your progress was restored from the cloud.", uiLang)
    : note === "merged"
    ? T("已把云端的记录合并到这台设备。", "Data dari cloud sudah digabung ke perangkat ini.", "The cloud's progress was merged into this device.", uiLang)
    : note === "switched"
    ? T("这台设备已换成这个账号的记录。", "Perangkat ini sekarang memakai data akun ini.", "This device now holds this account's progress.", uiLang)
    : "";

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

        {recovering && <form onSubmit={setNewPassword} style={{ marginBottom: 18 }}>
          <label className="acct-field">
            <span>{T("设置新密码", "Kata sandi baru", "New password", uiLang)}</span>
            <input type="password" required minLength={6} autoComplete="new-password" value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder={T("至少 6 位", "Minimal 6 karakter", "At least 6 characters", uiLang)} />
          </label>
          <button className="acct-btn primary" type="submit" disabled={busy}>
            {busy ? T("处理中…", "Memproses…", "Working…", uiLang) : T("保存新密码", "Simpan kata sandi baru", "Save new password", uiLang)}
          </button>
          <button className="acct-link" type="button" onClick={() => { finishRecovery(); setRecovering(false); }}>
            {T("先不改，保留原密码", "Nanti saja, pakai yang lama", "Not now, keep the old one", uiLang)}
          </button>
        </form>}

        <label className="acct-field">
          <span>{T("显示名字", "Nama tampilan", "Display name", uiLang)}</span>
          <input value={name} maxLength={24} onChange={e => onName(e.target.value)}
            onBlur={() => { if (session && !foreign) saveName(session.user.id, name.trim()).catch(e2 => setErr(humanError(e2, uiLang))); }}
            placeholder={T("你的名字", "Nama kamu", "Your name", uiLang)} />
        </label>

        {refCode && <p className="acct-note">
          {T("你的推广码：", "Kode referralmu: ", "Your referral code: ", uiLang)}<code>{refCode}</code>
        </p>}

        {foreign
          ? <>
              <p className="acct-note">
                {T("这台设备上的学习记录属于另一个账号。要怎么处理？",
                   "Data belajar di perangkat ini milik akun lain. Mau diapakan?",
                   "The progress on this device belongs to another account. What should happen to it?", uiLang)}
              </p>
              <div className="acct-actions">
                <button className="acct-btn" onClick={() => chooseLink("merge")} disabled={busy}>
                  {T("合并进这个账号", "Gabungkan ke akun ini", "Merge into this account", uiLang)}
                </button>
                <button className="acct-btn ghost" onClick={() => chooseLink("replace")} disabled={busy}>
                  {T("只用云端记录", "Pakai data cloud saja", "Use the cloud copy only", uiLang)}
                </button>
              </div>
            </>
          : cloudNewer && <p className="acct-note">
              {T("云端有这台设备还没有的记录。", "Cloud punya data yang belum ada di perangkat ini.", "The cloud has progress this device does not.", uiLang)}
              <button className="acct-link" style={{ marginTop: 0, marginLeft: 6 }} onClick={pullNow} disabled={busy}>
                {T("合并到本机", "Gabungkan ke sini", "Merge it here", uiLang)}
              </button>
            </p>}

        <div className="acct-actions">
          {!foreign && <button className="acct-btn" onClick={pushNow} disabled={busy}>
            {T("立即同步", "Sinkronkan sekarang", "Sync now", uiLang)}
          </button>}
          <button className="acct-btn ghost" onClick={() => signOut()}>
            {T("退出登录", "Keluar", "Sign out", uiLang)}
          </button>
        </div>
        {syncedAt && <p className="acct-note">{T("上次同步 ", "Sinkron terakhir ", "Last synced ", uiLang)}{syncedAt}</p>}
        {noteText && <p className="acct-ok">{noteText}</p>}
        {msg && <p className="acct-ok">{msg}</p>}
        {urlErr && <p className="acct-err">{humanError(urlErr, uiLang)}</p>}
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
            onChange={e => { setEmail(e.target.value); setTypo(suggestEmail(e.target.value)); }}
            placeholder="nama@email.com" />
        </label>
        {typo && <button type="button" className="acct-typo"
          onClick={() => { setEmail(typo); setTypo(null); }}>
          {T(`是不是想输 ${typo}？点这里改。`, `Maksudmu ${typo}? Ketuk untuk memperbaiki.`, `Did you mean ${typo}? Tap to fix.`, uiLang)}
        </button>}
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
      {noteText && <p className="acct-ok">{noteText}</p>}
      {msg && <p className="acct-ok">{msg}</p>}
      {urlErr && <p className="acct-err">{humanError(urlErr, uiLang)}</p>}
      {err && <p className="acct-err">{err}</p>}
    </div>
    <p className="acct-note">
      {T("不登录也能练。登录只是为了让记录跟着你换设备，以及以后认出会员身份。",
         "Tanpa akun pun tetap bisa latihan. Akun hanya membuat progresmu ikut pindah perangkat dan menandai status anggota.",
         "You can practise without an account. Signing in only makes your progress portable and marks membership.", uiLang)}
    </p>
  </div>;
}
