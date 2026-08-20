import { useEffect, useMemo, useState } from "react";

export type UiLang = "zh" | "id" | "en";

/* Single-SKU lifetime membership with a hard seat cap — the scarcity model,
   priced for Indonesian purchasing power rather than converted from RMB. */
export const PLAN = {
  price: 249000,
  currency: "Rp",
  seats: 300,
  commission: 0.2,
  payoutMin: 100000,
  payoutFee: 0.0,
};

const T = <T,>(ui: UiLang, zh: T, id: T, en: T): T => (ui === "zh" ? zh : ui === "id" ? id : en);

const money = (n: number) => "Rp " + n.toLocaleString("id-ID");

/* Referral code is derived locally and kept stable per browser until real
   accounts exist; the server will hand out the authoritative code later. */
function useReferralCode() {
  return useMemo(() => {
    const KEY = "ketiklab-ref";
    const ALPHABET = "ACDEFGHJKLMNPQRSTUVWXYZ23456789";   // no 0/O/1/I/B/8
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && /^[A-Z0-9]{6}$/.test(saved)) return saved;
      const bytes = new Uint8Array(6);
      crypto.getRandomValues(bytes);
      const code = Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join("");
      localStorage.setItem(KEY, code);
      return code;
    } catch {
      return "KETIK9";
    }
  }, []);
}

const FEATURES: Record<UiLang, string[]> = {
  zh: [
    "解锁全部词库与全部章节",
    "间隔复习（艾宾浩斯）完整功能",
    "中文阶梯第 3—4 步：选汉字、输入法实战",
    "阅读模块与学习计划",
    "完整数据统计与默写模式",
    "多设备云同步，进度永不丢失",
    "开通推广权限，享 20% 返佣",
    "后续新增功能永久免费解锁",
  ],
  id: [
    "Buka semua kamus dan semua bab",
    "Pengulangan berjarak (Ebbinghaus) versi penuh",
    "Tangga Mandarin langkah 3—4: pilih hanzi & ketik dengan IME",
    "Modul bacaan dan rencana belajar",
    "Statistik lengkap dan mode dikte",
    "Sinkronisasi lintas perangkat, progres tidak hilang",
    "Akses program referral dengan komisi 20%",
    "Fitur baru berikutnya terbuka gratis selamanya",
  ],
  en: [
    "Every library and every chapter unlocked",
    "Full spaced repetition (Ebbinghaus)",
    "Chinese ladder steps 3—4: pick hanzi and real IME typing",
    "Reading module and study plan",
    "Full statistics and dictation modes",
    "Cross-device sync, progress never lost",
    "Referral access with 20% commission",
    "All future features unlocked for life",
  ],
};

type PayConfig = {
  seatsTaken?: number;
  whatsapp?: string;
  qris?: string;
  bank?: { name?: string; account?: string; holder?: string };
};

/* Payment details live in public/data/pay.json so they can be filled in
   without a rebuild. Empty config = the offer shows as "opening soon". */
function usePayConfig(base: string) {
  const [cfg, setCfg] = useState<PayConfig>({});
  useEffect(() => {
    let alive = true;
    fetch(base + "pay.json")
      .then(r => (r.ok ? r.json() : {}))
      .then(d => { if (alive) setCfg(d || {}); })
      .catch(() => {});
    return () => { alive = false; };
  }, [base]);
  return cfg;
}

/* Human-readable order reference so a manual transfer can be matched to a
   buyer without an accounts system. */
function orderRef(code: string) {
  const KEY = "ketiklab-order";
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
    const n = Math.floor(Math.random() * 9000) + 1000;
    const ref = `KL-${code}-${n}`;
    localStorage.setItem(KEY, ref);
    return ref;
  } catch {
    return `KL-${code}`;
  }
}

type Props = { uiLang: UiLang; base?: string };

export function Membership({ uiLang, base = "./data/" }: Props) {
  const cfg = usePayConfig(base);
  const seatsTaken = cfg.seatsTaken || 0;
  const code = useReferralCode();
  const [checkout, setCheckout] = useState(false);
  const link = `https://ketiklab.com/?ref=${code}`;
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(""), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = (what: string, text: string) => {
    navigator.clipboard?.writeText(text).then(() => setCopied(what)).catch(() => setCopied(""));
  };

  const left = Math.max(0, PLAN.seats - seatsTaken);
  const pct = Math.min(100, Math.round((seatsTaken / PLAN.seats) * 100));

  return <div className="member-view">
    {/* ---------- the offer ---------- */}
    <section className="member-card offer">
      <div className="offer-head">
        <span className="crown">♛</span>
        <div>
          <b>{T(uiLang, "永久会员", "Anggota Seumur Hidup", "Lifetime member")}</b>
          <small>{T(uiLang, `限量 ${PLAN.seats} 名 · 一次付清，终身有效`,
                            `Terbatas ${PLAN.seats} kursi · sekali bayar, berlaku selamanya`,
                            `${PLAN.seats} seats only · pay once, keep forever`)}</small>
        </div>
      </div>

      <div className="offer-price">
        <b>{money(PLAN.price)}</b>
        <span>{T(uiLang, "终身有效", "berlaku selamanya", "lifetime")}</span>
      </div>

      <div className="seat-bar"><i style={{ width: `${pct}%` }} /></div>
      <p className="seat-note">
        {T(uiLang, `已售 ${seatsTaken} / ${PLAN.seats} · 剩余 ${left} 席`,
                   `Terjual ${seatsTaken} / ${PLAN.seats} · sisa ${left} kursi`,
                   `${seatsTaken} / ${PLAN.seats} taken · ${left} left`)}
      </p>

      <ul className="feature-list">
        {FEATURES[uiLang].map(f => <li key={f}><i>✓</i>{f}</li>)}
      </ul>

      <button className="offer-cta" onClick={() => setCheckout(v => !v)}>
        {T(uiLang, "成为创始会员", "Jadi anggota pertama", "Become a founding member")}
      </button>

      {checkout && <Checkout uiLang={uiLang} cfg={cfg} code={code} />}
    </section>

    {/* ---------- referral ---------- */}
    <section className="member-card">
      <div className="card-head">
        <div>
          <b>{T(uiLang, "推广返佣", "Program referral", "Referral programme")}</b>
          <small>{T(uiLang, `每成功推荐一位会员，你得 ${PLAN.commission * 100}% 分成`,
                            `Setiap anggota baru dari tautanmu memberi komisi ${PLAN.commission * 100}%`,
                            `${PLAN.commission * 100}% of every membership sold through your link`)}</small>
        </div>
        <span className="pill">{T(uiLang, "会员专属", "Khusus anggota", "Members only")}</span>
      </div>

      <div className="ref-grid">
        <label>
          <small>{T(uiLang, "推广码", "Kode referral", "Referral code")}</small>
          <div className="copy-row">
            <input readOnly value={code} />
            <button onClick={() => copy("code", code)}>
              {copied === "code" ? T(uiLang, "已复制", "Tersalin", "Copied") : T(uiLang, "复制", "Salin", "Copy")}
            </button>
          </div>
        </label>
        <label>
          <small>{T(uiLang, "推广链接", "Tautan referral", "Referral link")}</small>
          <div className="copy-row">
            <input readOnly value={link} />
            <button onClick={() => copy("link", link)}>
              {copied === "link" ? T(uiLang, "已复制", "Tersalin", "Copied") : T(uiLang, "复制", "Salin", "Copy")}
            </button>
          </div>
        </label>
      </div>

      <div className="ref-stats">
        <div className="stat mint"><i>▣</i><div><b>{money(0)}</b><small>{T(uiLang, "可提现余额", "Saldo bisa ditarik", "Available")}</small></div></div>
        <div className="stat amber"><i>◷</i><div><b>{money(0)}</b><small>{T(uiLang, "冻结金额", "Saldo tertahan", "On hold")}</small></div></div>
        <div className="stat blue"><i>↗</i><div><b>{money(0)}</b><small>{T(uiLang, "累计收入", "Total pendapatan", "Lifetime earned")}</small></div></div>
      </div>
    </section>

    {/* ---------- payout rules ---------- */}
    <section className="member-card">
      <div className="card-head">
        <div>
          <b>{T(uiLang, "提现规则", "Aturan penarikan", "Payout rules")}</b>
          <small>{T(uiLang, "推荐产生的佣金满额后可申请提现",
                            "Ajukan penarikan setelah komisi mencapai batas minimum",
                            "Request a payout once your commission clears the minimum")}</small>
        </div>
      </div>
      <table className="rule-table">
        <tbody>
          <tr><td>{T(uiLang, "最低提现额", "Minimum penarikan", "Minimum payout")}</td><td>{money(PLAN.payoutMin)}</td></tr>
          <tr><td>{T(uiLang, "手续费", "Biaya admin", "Processing fee")}</td><td>{PLAN.payoutFee === 0 ? T(uiLang, "免手续费", "Gratis", "None") : `${PLAN.payoutFee * 100}%`}</td></tr>
          <tr><td>{T(uiLang, "结算周期", "Periode pencairan", "Payout window")}</td><td>{T(uiLang, "每月 1 日与 15 日", "Tanggal 1 dan 15 setiap bulan", "1st and 15th of each month")}</td></tr>
          <tr><td>{T(uiLang, "冻结期", "Masa tahan", "Hold period")}</td><td>{T(uiLang, "成交后 14 天", "14 hari setelah pembelian", "14 days after purchase")}</td></tr>
          <tr><td>{T(uiLang, "提现方式", "Metode penarikan", "Payout method")}</td><td>GoPay · DANA · {T(uiLang, "银行转账", "Transfer bank", "Bank transfer")}</td></tr>
        </tbody>
      </table>
      <p className="rule-note">
        {T(uiLang,
          "冻结期用于覆盖退款窗口。佣金以印尼盾结算，超过起征额的部分按印尼税法由收款人自行申报。",
          "Masa tahan menutup jendela pengembalian dana. Komisi dibayar dalam rupiah; kewajiban pajak ditanggung penerima sesuai ketentuan yang berlaku.",
          "The hold covers the refund window. Commission is paid in rupiah; the recipient is responsible for any tax due.")}
      </p>
    </section>

    {/* ---------- records ---------- */}
    <section className="member-card">
      <div className="card-head">
        <div>
          <b>{T(uiLang, "邀请与提现记录", "Riwayat undangan & penarikan", "Referrals and payouts")}</b>
          <small>{T(uiLang, "成交、佣金与提现明细会在这里列出",
                            "Rincian pembelian, komisi, dan penarikan tampil di sini",
                            "Purchases, commission and payouts appear here")}</small>
        </div>
      </div>
      <div className="empty-records">
        {T(uiLang, "暂无记录", "Belum ada riwayat", "No records yet")}
      </div>
    </section>
  </div>;
}

/* ------------------------------------------------------------------ */
/* Manual checkout: works with no backend and no payment gateway, so   */
/* seats can be sold while the gateway merchant account is in review.  */

function Checkout({ uiLang, cfg, code }: { uiLang: UiLang; cfg: PayConfig; code: string }) {
  const ref = orderRef(code);
  const [copied, setCopied] = useState("");
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(""), 1600);
    return () => clearTimeout(t);
  }, [copied]);
  const copy = (what: string, text: string) => {
    navigator.clipboard?.writeText(text).then(() => setCopied(what)).catch(() => setCopied(""));
  };
  const copyLabel = (k: string) =>
    copied === k ? T(uiLang, "已复制", "Tersalin", "Copied") : T(uiLang, "复制", "Salin", "Copy");

  const hasBank = !!(cfg.bank && cfg.bank.account && cfg.bank.name);
  const hasQris = !!cfg.qris;
  const hasWa = !!cfg.whatsapp;

  if (!hasBank && !hasQris && !hasWa) {
    return <p className="offer-hint">
      {T(uiLang, "支付通道正在开通中，很快就能在这里直接付款。",
                 "Kanal pembayaran sedang disiapkan dan akan segera aktif di sini.",
                 "Payment is being set up and will open here shortly.")}
    </p>;
  }

  const waText = encodeURIComponent(
    T(uiLang,
      `你好，我要购买 KetikLab 永久会员，订单号 ${ref}`,
      `Halo, saya mau membeli KetikLab Anggota Seumur Hidup. Nomor pesanan ${ref}`,
      `Hi, I'd like to buy the KetikLab lifetime membership. Order ${ref}`));

  return <div className="checkout">
    <div className="checkout-ref">
      <div>
        <small>{T(uiLang, "你的订单号", "Nomor pesananmu", "Your order number")}</small>
        <b>{ref}</b>
      </div>
      <button onClick={() => copy("ref", ref)}>{copyLabel("ref")}</button>
    </div>
    <p className="checkout-lead">
      {T(uiLang, "转账时请务必备注订单号，我们核对到款后为你开通，通常几小时内。",
                 "Cantumkan nomor pesanan pada berita transfer. Akun diaktifkan setelah pembayaran dicek, biasanya dalam beberapa jam.",
                 "Put the order number in the transfer note. We activate your account once payment clears, usually within a few hours.")}
    </p>

    {hasQris && <div className="pay-method">
      <small>QRIS</small>
      <img src={cfg.qris} alt="QRIS" />
    </div>}

    {hasBank && <div className="pay-method">
      <small>{T(uiLang, "银行转账", "Transfer bank", "Bank transfer")}</small>
      <div className="pay-row"><span>{cfg.bank!.name}</span></div>
      <div className="pay-row">
        <b>{cfg.bank!.account}</b>
        <button onClick={() => copy("acct", cfg.bank!.account!)}>{copyLabel("acct")}</button>
      </div>
      {cfg.bank!.holder && <div className="pay-row"><span>a.n. {cfg.bank!.holder}</span></div>}
    </div>}

    {hasWa && <a className="wa-cta" href={`https://wa.me/${cfg.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer">
      {T(uiLang, "发送付款凭证到 WhatsApp", "Kirim bukti bayar via WhatsApp", "Send proof of payment on WhatsApp")}
    </a>}
  </div>;
}
