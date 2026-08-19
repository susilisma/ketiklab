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
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "").replace(/ü/g, "v");

type Props = {
  step: ZhStep;
  word: string;
  toned: string;
  plain: string;
  meaning: string;
  pool: string[];
  uiLang: UiLang;
  onPass: () => void;
  onSkip: () => void;
  onSpeak: () => void;
};

export function ZhSteps({ step, word, toned, plain, pool, uiLang, onPass, onSkip, onSpeak }: Props) {
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState(0);
  const [peek, setPeek] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const box = useRef<HTMLInputElement>(null);
  const target = norm(plain);

  useEffect(() => { setTyped(""); setWrong(0); setPeek(false); setPicked(null); }, [word, step]);
  useEffect(() => { if (step === "pinyin") setTimeout(() => box.current?.focus(), 20); }, [step, word]);

  /* step 1 — recognise, advance on SPACE / ENTER */
  useEffect(() => {
    if (step !== "read") return;
    const on = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); onPass(); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [step, word, onPass]);

  /* step 3 — options: correct answer plus three same-level distractors */
  const options = useMemo(() => {
    const others = pool.filter(w => w && w !== word);
    const seed = word.length + (word.codePointAt(0) || 0);
    const picks: string[] = [];
    for (let i = 0; i < others.length && picks.length < 3; i++) {
      const c = others[(seed + i * 7) % others.length];
      if (!picks.includes(c)) picks.push(c);
    }
    const all = [word, ...picks];
    return all.sort((a, b) => ((seed + a.charCodeAt(0)) % 7) - ((seed + b.charCodeAt(0)) % 7));
  }, [pool, word]);

  if (step === "read") {
    return <div className="zh-step">
      <div className="zh-read">
        <b onClick={onSpeak}>{toned || "—"}</b>
      </div>
      <button className="zh-go" onClick={onPass}>
        {T(uiLang, "认识了，下一个", "Sudah paham, lanjut", "Got it, next")} <i>SPACE</i>
      </button>
      <p className="zh-tip">{zhStepHint("read", uiLang)}</p>
    </div>;
  }

  if (step === "choose") {
    return <div className="zh-step">
      <div className="zh-read">
        <b onClick={onSpeak}>{toned || "—"}</b>
      </div>
      <div className="zh-options">
        {options.map(o => <button
          key={o}
          className={picked === o ? (o === word ? "ok" : "no") : ""}
          onClick={() => {
            setPicked(o);
            if (o === word) { onSpeak(); setTimeout(onPass, 260); }
            else setTimeout(() => setPicked(null), 420);
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
        const active = !done && typed.length >= before.length;
        return <span key={i} className={done ? "syl done" : active ? "syl now" : "syl"}>
          {peek || wrong >= 2 ? s : done ? s : "•".repeat(s.length)}
        </span>;
      })}
    </div>
    <input
      ref={box}
      className="zh-typebox"
      value={typed}
      inputMode="latin"
      placeholder={T(uiLang, "用键盘打拼音，例如 shi xian", "ketik pinyin, mis. shi xian", "type the pinyin, e.g. shi xian")}
      onChange={e => {
        const v = norm(e.target.value);
        if (target.startsWith(v)) {
          setTyped(v);
          if (v.length === target.length && v.length > 0) { onSpeak(); setTimeout(onPass, 240); }
        } else {
          setWrong(n => n + 1);
          setTyped(target.slice(0, v.length - 1 > 0 ? v.length - 1 : 0));
        }
      }}
      onKeyDown={e => {
        if (e.key === "Tab") { e.preventDefault(); setPeek(true); }
        if (e.key === "Enter") { e.preventDefault(); onSkip(); }
      }}
      onKeyUp={e => { if (e.key === "Tab") setPeek(false); }}
      autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
    />
    <p className="zh-tip">
      {zhStepHint("pinyin", uiLang)}
      {wrong >= 3 && <button className="zh-skip" onClick={onSkip}>{T(uiLang, "跳过", "Lewati", "Skip")} →</button>}
    </p>
  </div>;
}
