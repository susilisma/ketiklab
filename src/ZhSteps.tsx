import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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
    "用普通英文键盘打出拼音，不需要中文输入法。TAB 看答案，ENTER 跳过。",
    "Ketik pinyin-nya dengan keyboard biasa, tanpa IME Mandarin. TAB untuk melihat jawaban, ENTER untuk melewati.",
    "Type the pinyin on a normal keyboard \u2014 no Chinese IME needed. TAB to peek, ENTER to skip.",
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
// tracked from the module's load, not from a ZhSteps effect: at the 输入法 rung (and on a word
// with no pinyin) no ZhSteps is mounted, so the click on the 认读 pill went unseen and the pill
// kept SPACE and ENTER until the next click elsewhere
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", () => { pointerFocus.current = true; }, true);
  window.addEventListener("keydown", (e: KeyboardEvent) => { if (e.key === "Tab") pointerFocus.current = false; }, true);
}

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
// letters typed in the 320 ms after a 打拼音 pass: the box ignored them (the word was full) and
// the next word's instance mounted empty, so a learner typing without a pause at the boundary
// lost the first letters of every word and the key after them was graded a miss. The instance
// of the next word types them in as it mounts; a list change drops them.
// Shared with App's carry for Latin words, so letters typed on across a boundary between a pinyin
// word and an English or Indonesian one (a mixed review or favourites list) reach the next word.
export const pinyinCarry = { current: "" };
export function dropPinyinCarry() { pinyinCarry.current = ""; }
const foldPinyin = (s: string) => s.normalize("NFD").toLowerCase().split(UMLAUT_U).join("v").replace(/[^a-z]/g, "");

// lüe/nüe are the one ü case every IME also takes as lue/nue (no other syllable
// spells that way), so both spellings meet at "ue" — for the target and the typing alike
const norm = (s: string) => s.normalize("NFD").toLowerCase().split(UMLAUT_U).join("v").replace(/[^a-z]/g, "").replace(/([ln])ve/g, "$1ue");
// the fold stays inside a syllable: run over the joined word it turned 女儿 "nv"+"er" into
// "nuer", so "nu er" (努儿) passed for nǚ ér
const normWord = (plain: string) => plain.split(" ").map(norm).join("");

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
  // Escape left the pinyin box on purpose: the App pauses the clock, as it does for its own box
  onLeave: () => void;
  // a key typed into the pinyin box: the App starts (or resumes) the clock, as its own box
  // does on its first key — after Escape the next key was graded on a card still "paused"
  onResume: () => void;
};

export function ZhSteps({ step, word, plain, pool, uiLang, active, onPass, onSkip, onMiss, onSpeak, onLeave, onResume }: Props) {
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState(0);
  const [peek, setPeek] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const box = useRef<HTMLInputElement>(null);
  // how the focused control got its focus (a ref: the effect below re-runs on every render)
  const byPointer = pointerFocus;
  const target = normWord(plain);

  // layout effects, this one and the carry below: as passive effects the next key could land in
  // the still-empty box before the carried letters were typed in, and was graded as a miss
  useLayoutEffect(() => { setTyped(""); setWrong(0); setPeek(false); setPicked(null); }, [word, step]);
  // not while a dialog is open: the box would pull the focus out from under it
  useEffect(() => { if (step === "pinyin" && active) setTimeout(() => box.current?.focus(), 20); }, [step, word, active]);

  const grade = (value: string) => {
    // the typing gets the "ve" → "ue" fold only where the target itself has "ue"
    const v = foldPinyin(value)
      .replace(/([ln])ve/g, (m, c: string, at: number) => target.startsWith("ue", at + 1) ? c + "ue" : m);
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
      // what was accepted so far stays: "celv" for 策略 was taken on its way to "celue", but
      // measured against the folded target it ends at "cel" and the v had to be typed again
      if (v.startsWith(typed)) k = Math.max(k, typed.length);
      // a correct prefix as long as the answer ("shixianq" for shixian) would fill the
      // box without passing it, and the length guard above then ignored every key: like
      // an over-long IME commit in App, it is rolled back one letter short instead
      if (k >= target.length) k = target.length - 1;
      setTyped(v.slice(0, k));
    }
  };
  // the letters carried over from the word just passed, typed into this word as it mounts
  useLayoutEffect(() => {
    const raw = pinyinCarry.current; pinyinCarry.current = "";
    if (!raw || step !== "pinyin") return;
    // only the letters this word's pinyin starts with: the rest was typed before the word was
    // on screen, and dropping it, as before, grades nothing — a carried key never counts a miss.
    // They are taken the way grade takes keys, one at a time ("celv", "celve" for 策略), and
    // the raw text is kept: App's carry needs the space of "ingin tahu"
    const fold = (s: string) => foldPinyin(s).replace(/([ln])ve/g, (m, c: string, at: number) => target.startsWith("ue", at + 1) ? c + "ue" : m);
    const takes = (s: string) => { const f = fold(s); return target.startsWith(f) || (/[ln]v$/.test(f) && target.startsWith(f.slice(0, -1) + "ue")); };
    let v = "", end = 0;
    for (let i = 0; i < raw.length; i++) {
      if (!foldPinyin(raw[i])) continue;
      if (!takes(v + raw[i])) break;
      v += raw[i]; end = i + 1;
      if (fold(v).length === target.length) break;
    }
    if (!v) return;
    grade(v);
    // the carried letters completed this word outright (是 "shi"): what follows them was typed
    // for the word after, and dropping it graded that word's first letters as missing
    if (fold(v).length === target.length && end < raw.length) pinyinCarry.current = raw.slice(end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, step]);


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
    // (a pool of 35, 70, 105… words — a favourites list or a review of 36 Chinese words — divides
    // by both 7 and 5, and the walk then saw only seven slots: 12 of the first 36 topic words got
    // fewer same-length distractors than the pool held, and two showed the answer as the only
    // option of its length again)
    const stride = [7, 5, 11].find(s => others.length % s) || 1;
    const picks: string[] = [];
    // distractors of the answer's own length first: a one-character 是 among 昨天, 法规 and
    // 星期 was the only short option on the card, and the length gave the answer away (12 % of
    // all items, every single-character word of chapter 1); the rest fill in when the chapter
    // has too few words of that length
    const len = Array.from(word).length;
    for (const same of [true, false]) {
      for (let i = 0; i < others.length && picks.length < 3; i++) {
        const c = others[(seed + i * stride) % others.length];
        if ((Array.from(c).length === len) === same && !picks.includes(c)) picks.push(c);
      }
    }
    const all = [word, ...picks];
    return all.sort((a, b) => ((seed + a.charCodeAt(0)) % 7) - ((seed + b.charCodeAt(0)) % 7));
  }, [pool, word]);

  const pick = (o: string) => {
    if (picked === word) return;
    // a pick is the learner's first move on the card: the clock starts (or resumes after a
    // pause) as a key into the pinyin box does — the header used to say 按任意键开始 and the
    // clock to read 00:00 through every wrong pick until the right one passed the word
    onResume();
    setPicked(o);
    if (o === word) { onSpeak(); onPass(); }
    else { onMiss(); setTimeout(() => setPicked(null), 420); }
  };
  const pickRef = useRef(pick); pickRef.current = pick;
  // 1–4 pick the option in that position, as an IME candidate row does: a keyboard user had to
  // Tab through the four buttons to reach the one they could read at a glance.
  // Not while a dialog is open (active, as 认读 and the pinyin box have it): a click on the
  // language dialog's text leaves the focus on <body>, and a digit then picked an option on the
  // card behind it — a wrong one filed a lapse and a 错词本 entry for a word never seen
  useEffect(() => {
    if (step !== "choose" || !active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.key < "1" || e.key > "4") return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable || el.closest("[role=dialog]"))) return;
      const o = options[Number(e.key) - 1];
      if (!o) return;
      e.preventDefault();
      pickRef.current(o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, options, active]);

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
      {/* the choices are hanzi whatever the interface language: a screen reader reads them as Chinese */}
      <div className="zh-options" lang="zh-CN">
        {options.map((o, i) => <button
          key={o}
          className={picked === o ? (o === word ? "ok" : "no") : ""}
          aria-keyshortcuts={String(i + 1)}
          onClick={() => pick(o)}>{o}</button>)}
      </div>
      <p className="zh-tip">{zhStepHint("choose", uiLang)}</p>
    </div>;
  }

  /* step 2 — type the pinyin on a plain ASCII keyboard */
  const syllables = plain ? plain.split(" ") : [];
  return <div className="zh-step">
    <div className="zh-pinbox">
      {syllables.map((s, i) => {
        const before = normWord(syllables.slice(0, i).join(" "));
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
        onResume();
        if (target.length > 0 && typed.length >= target.length) { pinyinCarry.current += e.target.value.slice(typed.length); return; }
        grade(e.target.value);
      }}
      onKeyDown={e => {
        // a key that reaches the box while an IME is composing (isComposing, or the "Process" key
        // with code 229 that Chromium sends in its place) belongs to the IME: a learner who left
        // a Chinese input method on had the ENTER that committed a candidate skip the word with a
        // lapse, and TAB reveal the answer and count a miss
        if (e.nativeEvent.isComposing || e.key === "Process" || e.keyCode === 229) return;
        // Shift+TAB and Escape leave the box, so the page stays reachable by keyboard
        if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); if (!e.repeat) onMiss(); setPeek(true); }
        // leaving the box is a pause: with running left true the header kept saying FOCUS MODE
        // and the clock went on counting seconds the learner was not typing — after Shift+TAB
        // too, which moved the focus out but left the clock running and the sidebar hidden,
        // unlike the App box's Shift+TAB
        if (e.key === "Tab" && e.shiftKey) onLeave();
        if (e.key === "Escape") { onLeave(); box.current?.blur(); }
        if (e.key === "Enter") { e.preventDefault(); if (!e.repeat) onSkip(); }
      }}
      // the box centres its text, so a click (or a tap) back into it put the caret before or inside
      // the letters already typed, and the next letter was graded there — "shi", a click, "xian"
      // filed a correct 实现 as a miss; Shift+TAB then TAB selected the letters and the next key
      // replaced them. The caret goes back to the end unless a selection was made on purpose
      onKeyUp={e => { if (e.key === "Tab") { setPeek(false); const el = e.currentTarget, n = el.value.length; el.setSelectionRange(n, n); } }}
      onMouseUp={e => { const el = e.currentTarget, n = el.value.length; if (el.selectionStart === el.selectionEnd && el.selectionStart !== n) el.setSelectionRange(n, n); }}
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
