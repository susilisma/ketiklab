import { useEffect, useMemo, useRef, useState } from "react";

export type ZhStep = "read" | "pinyin" | "choose" | "hanzi";
export type UiLang = "zh" | "id" | "en";

export const ZH_STEPS: { id: ZhStep; num: string; zh: string; idn: string; en: string }[] = [
  { id: "read", num: "1", zh: "认读", idn: "Kenali", en: "Recognize" },
  { id: "pinyin", num: "2", zh: "打拼音", idn: "Ketik pinyin", en: "Type pinyin" },
  { id: "choose", num: "3", zh: "选汉字", idn: "Pilih hanzi", en: "Pick hanzi" },
  { id: "hanzi", num: "4", zh: "输入法", idn: "Ketik hanzi", en: "IME typing" },
];

const HINTS: Record<ZhStep, [string, string, string]> = {
  read: [
    "先看会：汉字 + 拼音 + 意思。按空格进入下一个。",
    "Kenali dulu: hanzi + pinyin + arti. Tekan SPASI untuk lanjut.",
    "Just look: hanzi + pinyin + meaning. Press SPACE for the next one.",
  ],
  pinyin: [
    "用普通英文键盘打出拼音，不需要中文输入法。TAB 看答案。",
    "Ketik pinyin-nya dengan keyboard biasa, tanpa IME Mandarin. TAB untuk melihat jawaban.",
    "Type the pinyin on a normal keyboard \u2014 no Chinese IME needed. TAB to peek.",
  ],
  choose: [
    "看拼音和意思，选出正确的汉字。这是输入法选字的预演。",
    "Lihat pinyin dan artinya, lalu pilih hanzi yang benar. Ini latihan memilih kandidat IME.",
    "Read the pinyin and meaning, then pick the right hanzi \u2014 a dry run of IME candidate picking.",
  ],
  hanzi: [
    "打开中文输入法，用拼音打出这个词。",
    "Nyalakan IME Mandarin, lalu ketik kata ini lewat pinyin.",
    "Turn on a Chinese IME and type the word through pinyin.",
  ],
};

// how the focused control got its focus, shared by every instance: the component is keyed
// per word and remounts on each pass, and a ref inside it forgot the click that focused the
// 认读 pill, so only the first SPACE after a pill click advanced
const pointerFocus = { current: false };

export function zhStepHint(step: ZhStep, ui: UiLang) {
  const h = HINTS[step];
  return ui === "zh" ? h[0] : ui === "id" ? h[1] : h[2];
}

/* ---------- data ---------- */
/* zh-pinyin.json : { "实现": "shí xiàn|shi xian|1", ... }  level 1 = easiest */

export function useZhMap(base: string) {
  const [map, setMap] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    fetch(base + "zh-pinyin.json")
      .then(r => (r.ok ? r.json() : {}))
      .then(d => { if (alive) setMap(d || {}); })
      .catch(() => {});
    return () => { alive = false; };
  }, [base]);
  return map;
}

export function zhToned(map: Record<string, string>, word: string) {
  const v = map[word];
  return v ? v.split("|")[0] : "";
}
export function zhPlain(map: Record<string, string>, word: string) {
  const v = map[word];
  return v ? v.split("|")[1] : "";
}
export function zhLevel(map: Record<string, string>, word: string) {
  const v = map[word];
  return v ? Number(v.split("|")[2]) || 4 : 4;
}

/** max difficulty level allowed at each rung of the ladder */
export function zhMaxLevel(step: ZhStep) {
  return step === "read" ? 1 : step === "pinyin" ? 2 : step === "choose" ? 3 : 9;
}

const T = (ui: UiLang, zh: string, idn: string, en: string) => (ui === "zh" ? zh : ui === "id" ? idn : en);
// NFD first: tone marks fall away, and ü (also ǖǘǚǜ) is then u + U+0308,
// which becomes the IME "v" before the strip
const UMLAUT_U = "u" + String.fromCharCode(0x308);
// lüe/nüe are the one ü case every IME also takes as lue/nue (no other syllable
// spells that way), so both spellings meet at "ue" — for the target and the typing alike
const norm = (s: string) => s.normalize("NFD").toLowerCase().split(UMLAUT_U).join("v").replace(/[^a-z]/g, "").replace(/([ln])ve/g, "$1ue");

type Props = {
  step: ZhStep;
  word: string;
  plain: string;
  pool: string[];
  uiLang: UiLang;
  active: boolean;
  onPass: () => void;
  onSkip: () => void;
  onMiss: () => void;
  onSpeak: () => void;
};

export function ZhSteps({ step, word, plain, pool, uiLang, active, onPass, onSkip, onMiss, onSpeak }: Props) {
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState(0);
  const [peek, setPeek] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const box = useRef<HTMLInputElement>(null);
  // how the focused control got its focus (a ref: the effect below re-runs on every render)
  const byPointer = pointerFocus;
  const target = norm(plain);

  useEffect(() => { setTyped(""); setWrong(0); setPeek(false); setPicked(null); }, [word, step]);
  // how the focused control got its focus: tracked for the component's whole life, since the
  // click that switches to 认读 lands before that rung's effect exists — subscribed there
  // alone, a pill clicked from 打拼音 kept SPACE and ENTER dead until the next click elsewhere
  useEffect(() => {
    const down = () => { pointerFocus.current = true; };
    const key = (e: KeyboardEvent) => { if (e.key === "Tab") pointerFocus.current = false; };
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("keydown", key, true);
    return () => { window.removeEventListener("pointerdown", down, true); window.removeEventListener("keydown", key, true); };
  }, []);
  // not while a dialog is open: the box would pull the focus out from under it
  useEffect(() => { if (step === "pinyin" && active) setTimeout(() => box.current?.focus(), 20); }, [step, word, active]);

  /* step 1 — recognise, advance on SPACE / ENTER */
  useEffect(() => {
    if (step !== "read" || !active) return;
    // :focus-visible cannot tell at keydown time how the control got its focus: Chromium
    // already counts the key being pressed as keyboard use, so a ▶ or ★ that was clicked
    // with the mouse took SPACE for itself and the rung stopped advancing (byPointer above)
    const on = (e: KeyboardEvent) => {
      if (e.key === "Tab") return;
      if (e.key !== " " && e.key !== "Enter") return;
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      const t = e.target instanceof HTMLElement ? e.target : null;
      // fields, dialogs and a control the learner tabbed to keep their own keys;
      // a button that was merely clicked still lets SPACE advance
      if (t && t.closest("[role=dialog], input, textarea, select, [contenteditable=true]")) return;
      if (t && t !== document.body && !t.classList.contains("zh-go") && t.closest("button, a, [role=button]") && !byPointer.current) return;
      e.preventDefault(); onPass();
    };
    window.addEventListener("keydown", on);
    return () => { window.removeEventListener("keydown", on); };
  }, [step, word, onPass, active]);

  /* step 3 — options: correct answer plus three same-level distractors */
  const options = useMemo(() => {
    const others = Array.from(new Set(pool.filter(w => w && w !== word)));
    const seed = word.length + (word.codePointAt(0) || 0);
    // the stride must be coprime with the pool size or the walk keeps landing on the same slots
    const stride = others.length % 7 ? 7 : 5;
    const picks: string[] = [];
    for (let i = 0; i < others.length && picks.length < 3; i++) {
      const c = others[(seed + i * stride) % others.length];
      if (!picks.includes(c)) picks.push(c);
    }
    const all = [word, ...picks];
    return all.sort((a, b) => ((seed + a.charCodeAt(0)) % 7) - ((seed + b.charCodeAt(0)) % 7));
  }, [pool, word]);

  if (step === "read") {
    return <div className="zh-step">
      <button className="zh-go" onClick={onPass}>
        {T(uiLang, "认识了，下一个", "Sudah paham, lanjut", "Got it, next")} <i>SPACE</i>
      </button>
      <p className="zh-tip">{zhStepHint("read", uiLang)}</p>
    </div>;
  }

  if (step === "choose") {
    return <div className="zh-step">
      <div className="zh-options">
        {options.map(o => <button
          key={o}
          className={picked === o ? (o === word ? "ok" : "no") : ""}
          onClick={() => {
            if (picked === word) return;
            setPicked(o);
            if (o === word) { onSpeak(); onPass(); }
            else { onMiss(); setTimeout(() => setPicked(null), 420); }
          }}>{o}</button>)}
      </div>
      <p className="zh-tip">{zhStepHint("choose", uiLang)}</p>
    </div>;
  }

  /* step 2 — type the pinyin on a plain ASCII keyboard */
  const syllables = plain ? plain.split(" ") : [];
  return <div className="zh-step">
    <div className="zh-pinbox">
      {syllables.map((s, i) => {
        const before = norm(syllables.slice(0, i).join(""));
        const done = typed.length >= before.length + norm(s).length;
        const current = !done && typed.length >= before.length;
        return <span key={i} className={done ? "syl done" : current ? "syl now" : "syl"}>
          {peek || wrong >= 2 ? s : done ? s : "•".repeat(s.length)}
        </span>;
      })}
    </div>
    <input
      ref={box}
      className="zh-typebox"
      value={typed}
      inputMode="text"
      placeholder={T(uiLang, "用键盘打拼音，例如 shi xian", "ketik pinyin, mis. shi xian", "type the pinyin, e.g. shi xian")}
      onChange={e => {
        if (target.length > 0 && typed.length >= target.length) return;
        const v = norm(e.target.value);
        // norm reads a finished "lve"/"nve" as "lue"/"nue", but the learner gets there
        // one key at a time: "celv" is on its way to "celve" for 策略, so a trailing
        // l/n + v is accepted when the target goes on with "ue" at that point
        const onItsWay = /[ln]v$/.test(v) && target.startsWith(v.slice(0, -1) + "ue");
        if (target.startsWith(v) || onItsWay) {
          setTyped(v);
          if (v.length === target.length && v.length > 0) { onSpeak(); onPass(); }
        } else {
          onMiss();
          setWrong(n => n + 1);
          // roll back to what was right so far — never to a slice of the target: a paste or
          // an autocorrect that put in several letters at once used to leave the box full
          // (then dead to every key) and, cut by one letter, spelled the answer out
          let k = 0;
          while (k < v.length && k < target.length && v[k] === target[k]) k++;
          setTyped(v.slice(0, k));
        }
      }}
      onKeyDown={e => {
        // Shift+TAB and Escape leave the box, so the page stays reachable by keyboard
        if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); if (!e.repeat) onMiss(); setPeek(true); }
        if (e.key === "Escape") box.current?.blur();
        if (e.key === "Enter") { e.preventDefault(); if (!e.repeat) onSkip(); }
      }}
      onKeyUp={e => { if (e.key === "Tab") setPeek(false); }}
      // Escape or a tap elsewhere while TAB is held: the keyup lands outside the box,
      // so the peek must end with the focus or the whole answer stays on screen
      onBlur={() => setPeek(false)}
      autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
    />
    <p className={wrong >= 3 ? "zh-tip has-skip" : "zh-tip"}>
      {zhStepHint("pinyin", uiLang)}
      {wrong >= 3 && <button className="zh-skip" onClick={onSkip}>{T(uiLang, "跳过", "Lewati", "Skip")} →</button>}
    </p>
  </div>;
}
