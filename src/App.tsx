import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang, Word, WordCategory, ReadingPiece } from "./types";
import { recordReview, getStats, getDueKeys, resetAll, type SrsStats } from "./srs";

type View = "learn" | "library" | "mistakes" | "articles" | "plan" | "stats" | "settings";
type ReadingLang = "all" | "en" | "id" | "zh";
type WordFilter = "all" | WordCategory;

const DATA = import.meta.env.BASE_URL + "data/";

const UI = {
  zh: { learn: "开始学习", library: "词库", mistakes: "间隔复习", articles: "阅读", plan: "学习计划", stats: "数据统计", settings: "设置", language: "语言", start: "开始", pause: "暂停", prompt: "输入上方中文词语", meaning: "三语释义", daily: "今日目标", streak: "连续学习", words: "已学词语", accuracy: "正确率", day: "天", chapter: "中文商务词汇 · 第 1 章", finish: "今日完成度", keyboard: "输入第一个汉字开始", choose: "选择词库", all: "全部词库", search: "搜索词语…", readingTagline: "读经典，照着输入，让文字经过眼睛，也经过手指。", allReadings: "全部", classics: "经典选集", pieces: "篇", readAll: "朗读全文", read: "朗读", lineLabel: "第几句", nextLine: "下一句", typingHelp: "红色字符需要修改；标点和大小写也要与原文一致。", completed: "已完成", completedNote: "你刚刚完整地输入了一篇经典作品。", characters: "字符", timeUsed: "用时", practiceAgain: "再练一次", loading: "正在加载词库…", due: "今日待复习", mastered: "已掌握", learning: "学习中", startReview: "开始复习", reviewing: "复习模式", exitReview: "退出复习", noDueTitle: "暂无到期复习", noDueNote: "继续在“开始学习”里练习。答对的词会按遗忘曲线拉长间隔，答错的词很快再次出现。", reviewHint: "按遗忘曲线：答对间隔变长，答错很快再见" },
  id: { learn: "Mulai Belajar", library: "Daftar Kata", mistakes: "Ulasan Berkala", articles: "Bacaan", plan: "Rencana Belajar", stats: "Statistik", settings: "Pengaturan", language: "Bahasa", start: "Mulai", pause: "Jeda", prompt: "Ketik kata bahasa Indonesia di atas", meaning: "Arti tiga bahasa", daily: "Target hari ini", streak: "Hari berturut-turut", words: "Kata dipelajari", accuracy: "Akurasi", day: "hari", chapter: "Kosakata Bisnis Indonesia · Bab 1", finish: "Progres hari ini", keyboard: "Ketik huruf pertama untuk mulai", choose: "Pilih daftar kata", all: "Semua daftar", search: "Cari kata…", readingTagline: "Baca karya klasik sambil mengetik, agar kata-katanya melewati mata dan jemari.", allReadings: "Semua", classics: "Koleksi klasik", pieces: "bacaan", readAll: "Bacakan seluruh teks", read: "Bacakan", lineLabel: "Baris", nextLine: "Baris berikutnya", typingHelp: "Perbaiki karakter merah; tanda baca dan huruf besar harus sama dengan teks asli.", completed: "Selesai", completedNote: "Kamu baru saja mengetik satu karya klasik secara lengkap.", characters: "karakter", timeUsed: "waktu", practiceAgain: "Latihan lagi", loading: "Memuat kosakata…", due: "Jatuh tempo hari ini", mastered: "Dikuasai", learning: "Dipelajari", startReview: "Mulai ulasan", reviewing: "Mode ulasan", exitReview: "Keluar", noDueTitle: "Belum ada ulasan jatuh tempo", noDueNote: "Terus berlatih di “Mulai Belajar”. Kata yang benar dijadwalkan makin jarang; yang salah muncul lagi segera.", reviewHint: "Kurva lupa: benar makin jarang, salah segera kembali" },
  en: { learn: "Start Learning", library: "Word Lists", mistakes: "Spaced Review", articles: "Reading", plan: "Study Plan", stats: "Statistics", settings: "Settings", language: "Language", start: "Start", pause: "Pause", prompt: "Type the English word above", meaning: "Trilingual meaning", daily: "Daily goal", streak: "Study streak", words: "Words learned", accuracy: "Accuracy", day: "days", chapter: "Business English · Chapter 1", finish: "Today's progress", keyboard: "Press any letter key to start", choose: "Choose word list", all: "All lists", search: "Search words…", readingTagline: "Read the classics as you type, letting every line pass through your eyes and fingers.", allReadings: "All", classics: "Classic collection", pieces: "readings", readAll: "Read full text aloud", read: "Read aloud", lineLabel: "Line", nextLine: "Next line", typingHelp: "Correct the red characters; punctuation and capitalization must match the original.", completed: "Completed", completedNote: "You have typed an entire classic work.", characters: "characters", timeUsed: "time", practiceAgain: "Practice again", loading: "Loading vocabulary…", due: "Due today", mastered: "Mastered", learning: "Learning", startReview: "Start review", reviewing: "Review mode", exitReview: "Exit review", noDueTitle: "Nothing due yet", noDueNote: "Keep practicing in “Start Learning”. Correct words are scheduled further out; missed words return soon.", reviewHint: "Forgetting curve: correct spreads out, wrong returns soon" },
};

// prompt above the typing box: what to type (learn lang), written in the interface lang
const PROMPTS: Record<Lang, Record<Lang, string>> = {
  zh: { zh: "输入上方中文词语", id: "输入上方印尼语单词", en: "输入上方英语单词" },
  id: { zh: "Ketik kata bahasa Mandarin di atas", id: "Ketik kata bahasa Indonesia di atas", en: "Ketik kata bahasa Inggris di atas" },
  en: { zh: "Type the Chinese word above", id: "Type the Indonesian word above", en: "Type the English word above" },
};

const MODAL_T: Record<Lang, { title: string; subtitle: string; ui: string; uiDesc: string; learn: string; learnDesc: string; def: string; defDesc: string; selected: string; cancel: string; save: string }> = {
  zh: { title: "语言设置", subtitle: "配置界面语言、学习语言和释义语言", ui: "界面语言", uiDesc: "选择应用界面的显示语言", learn: "学习语言", learnDesc: "选择你要练习打字的语言", def: "释义语言", defDesc: "选择单词释义的显示语言", selected: "已选择", cancel: "取消", save: "保存设置" },
  id: { title: "Pengaturan Bahasa", subtitle: "Atur bahasa antarmuka, bahasa belajar, dan bahasa arti", ui: "Bahasa Antarmuka", uiDesc: "Pilih bahasa tampilan aplikasi", learn: "Bahasa Belajar", learnDesc: "Pilih bahasa yang ingin kamu latih mengetik", def: "Bahasa Arti", defDesc: "Pilih bahasa untuk menampilkan arti kata", selected: "Dipilih", cancel: "Batal", save: "Simpan" },
  en: { title: "Language Settings", subtitle: "Choose interface, learning, and definition language", ui: "Interface Language", uiDesc: "Language used for menus and labels", learn: "Learning Language", learnDesc: "The language you practice typing", def: "Definition Language", defDesc: "Language used to show word meanings", selected: "Selected", cancel: "Cancel", save: "Save" },
};

const LANG_CARDS: { code: Lang; name: string; uiDesc: string; learnDesc: string; defName: string; defDesc: string }[] = [
  { code: "zh", name: "中文", uiDesc: "中文界面", learnDesc: "练习中文打字与词汇", defName: "中文释义", defDesc: "使用中文释义显示单词含义" },
  { code: "id", name: "Bahasa Indonesia", uiDesc: "Antarmuka bahasa Indonesia", learnDesc: "Latihan mengetik bahasa Indonesia", defName: "Arti Bahasa Indonesia", defDesc: "Tampilkan arti kata dalam bahasa Indonesia" },
  { code: "en", name: "English", uiDesc: "English interface", learnDesc: "Practice English typing", defName: "English Definition", defDesc: "Show word meanings in English" },
];

const LANGUAGE_META: Record<Lang, { label: string; voice: string; example: string }> = {
  zh: { label: "中文", voice: "zh-CN", example: "中文例句" },
  id: { label: "Bahasa Indonesia", voice: "id-ID", example: "Contoh bahasa Indonesia" },
  en: { label: "English", voice: "en-US", example: "English example" },
};

const CATEGORY_META: Record<WordCategory, Record<Lang, string>> = {
  daily: { zh: "日常高频", id: "Kosakata Harian", en: "Daily Essentials" },
  business: { zh: "商务工作", id: "Bisnis & Kerja", en: "Business & Work" },
  indonesia: { zh: "印尼生活", id: "Hidup di Indonesia", en: "Life in Indonesia" },
  study: { zh: "学习与政策", id: "Belajar & Kebijakan", en: "Study & Policy" },
};

const TRANSLATION_ORDER: Record<Lang, Lang[]> = {
  zh: ["en", "id"],
  id: ["zh", "en"],
  en: ["zh", "id"],
};

function wordValue(word: Word, language: Lang) {
  return language === "zh" ? word.zh.split("；")[0] : word[language];
}

function pronunciation(word: Word, language: Lang) {
  if (language === "zh") return word.pinyin ? `普通话 · ${word.pinyin}` : "普通话 · 点击播放标准发音";
  if (language === "id") return word.idSyllables ? `Bahasa Indonesia · ${word.idSyllables}` : "Bahasa Indonesia · klik untuk mendengar";
  return word.phonetic ? `American English · ${word.phonetic}` : "English · tap to hear pronunciation";
}

const NAV: { id: View; icon: string }[] = [
  { id: "learn", icon: "⌨" }, { id: "library", icon: "▤" }, { id: "mistakes", icon: "◎" },
  { id: "articles", icon: "¶" }, { id: "plan", icon: "✓" }, { id: "stats", icon: "↗" }, { id: "settings", icon: "⚙" },
];

const EMPTY_STATS: SrsStats = { due: 0, learning: 0, mastered: 0, total: 0 };

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [readings, setReadings] = useState<ReadingPiece[]>([]);
  const [dataError, setDataError] = useState(false);

  const [view, setView] = useState<View>("learn");
  const [lang, setLang] = useState<Lang>("zh");
  const [uiLang, setUiLang] = useState<Lang>("zh");
  const [defLang, setDefLang] = useState<Lang>("en");
  const [showLangSetup, setShowLangSetup] = useState(false);
  const [dark, setDark] = useState(false);
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<WordFilter>("business");
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [readingLang, setReadingLang] = useState<ReadingLang>("all");
  const [readingId, setReadingId] = useState("");
  const [readingLine, setReadingLine] = useState(0);
  const [readingTyped, setReadingTyped] = useState("");
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [readingActive, setReadingActive] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [srs, setSrs] = useState<SrsStats>(EMPTY_STATS);
  const [reviewKeys, setReviewKeys] = useState<string[] | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const readingInput = useRef<HTMLTextAreaElement>(null);
  const autoSpokenWord = useRef<string | null>(null);
  const speechRequest = useRef(0);
  const t = UI[uiLang];

  // Load content (words + readings) as JSON at runtime so the app bundle stays
  // small and the content can grow hourly without a code change.
  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(DATA + "words.json").then(r => r.json()),
      fetch(DATA + "readings.json").then(r => r.json()),
    ]).then(([w, r]: [Word[], ReadingPiece[]]) => {
      if (!alive) return;
      setWords(w);
      setReadings(r);
      if (r.length) setReadingId(r[0].id);
    }).catch(() => { if (alive) setDataError(true); });
    return () => { alive = false; };
  }, []);

  const refreshSrs = () => { getStats().then(setSrs).catch(() => {}); };
  useEffect(() => { refreshSrs(); }, []);

  // language preferences: restore on first load; show the setup modal on first visit
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lingotrio-langs");
      if (saved) {
        const v = JSON.parse(saved);
        if (v.ui === "zh" || v.ui === "id" || v.ui === "en") setUiLang(v.ui);
        if (v.learn === "zh" || v.learn === "id" || v.learn === "en") setLang(v.learn);
        if ((v.def === "zh" || v.def === "id" || v.def === "en") && v.def !== v.learn) setDefLang(v.def);
        else if (v.learn) setDefLang(v.learn === "zh" ? "en" : "zh");
      } else {
        setShowLangSetup(true);
      }
    } catch { setShowLangSetup(true); }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("lingotrio-state");
    if (saved) try { const v = JSON.parse(saved); setCorrect(v.correct || 0); setAttempts(v.attempts || 0); setMistakes(v.mistakes || []); } catch { /* ignore */ }
  }, []);
  useEffect(() => { localStorage.setItem("lingotrio-state", JSON.stringify({ correct, attempts, mistakes })); }, [correct, attempts, mistakes]);
  useEffect(() => { if (!running) return; const timer = setInterval(() => setSeconds(s => s + 1), 1000); return () => clearInterval(timer); }, [running]);
  useEffect(() => { if (!readingActive || readingDone) return; const timer = setInterval(() => setReadingSeconds(s => s + 1), 1000); return () => clearInterval(timer); }, [readingActive, readingDone]);

  const activeWords = useMemo(() => category === "all" ? words : words.filter(item => item.category === category), [category, words]);
  const filtered = useMemo(() => activeWords.filter(w => `${w.en} ${w.id} ${w.zh}`.toLowerCase().includes(search.toLowerCase())), [activeWords, search]);
  const reviewWords = useMemo(() => reviewKeys ? words.filter(w => reviewKeys.includes(w.en)) : null, [reviewKeys, words]);

  const ready = words.length > 0;

  if (!ready) {
    return <div className={dark ? "app dark" : "app"}>
      <div className="loading-screen">
        <span className="loading-mark">LT</span>
        <p>{dataError ? "内容加载失败，请刷新页面重试。" : t.loading}</p>
      </div>
    </div>;
  }

  const learnWords = (reviewWords && reviewWords.length) ? reviewWords : activeWords;
  const word = learnWords[index % learnWords.length];
  const targetWord = wordValue(word, lang);
  const targetVoice = LANGUAGE_META[lang].voice;
  const targetKey = `${lang}:${word.en}`;
  const accuracy = attempts ? Math.round(correct / attempts * 100) : 100;
  const reading = readings.find(piece => piece.id === readingId) || readings[0];
  const readingTarget = reading.lines[readingLine] || "";
  const readingAccuracy = readingTyped.length
    ? Math.round(readingTyped.split("").filter((character, i) => character === readingTarget[i]).length / readingTyped.length * 100)
    : 100;
  const readingProgress = Math.round(((readingLine + Math.min(readingTyped.length / Math.max(readingTarget.length, 1), 1)) / reading.lines.length) * 100);
  const dueWords = reviewKeys ? [] : mistakes.map(m => words.find(w => w.en === m)).filter(Boolean) as Word[];

  function speak(text = targetWord, voiceLang = targetVoice) {
    const requestId = ++speechRequest.current;
    setSpeakingWord(text);
    window.setTimeout(() => {
      if (speechRequest.current === requestId) setSpeakingWord(null);
    }, 1800);
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
    const synth = window.speechSynthesis;
    let started = false;
    const createUtterance = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang;
      utterance.rate = .82;
      const matchingVoice = synth.getVoices().find(voice => voice.lang.toLowerCase().startsWith(voiceLang.slice(0, 2).toLowerCase()));
      if (matchingVoice) utterance.voice = matchingVoice;
      utterance.onstart = () => { started = true; setSpeakingWord(text); };
      utterance.onend = () => { if (speechRequest.current === requestId) setSpeakingWord(null); };
      utterance.onerror = () => { if (speechRequest.current === requestId) setSpeakingWord(null); };
      return utterance;
    };
    const play = () => {
      synth.resume();
      synth.speak(createUtterance());
    };
    if (synth.speaking || synth.pending) {
      synth.cancel();
      window.setTimeout(play, 80);
    } else {
      play();
    }
    window.setTimeout(() => {
      if (!started && !synth.speaking && !synth.pending) {
        play();
      }
    }, 450);
  }
  function submit() {
    if (!typed.trim()) return;
    setAttempts(n => n + 1);
    const answer = lang === "zh" ? typed.trim() : typed.trim().replace(/\s+/g, " ").toLowerCase();
    const expected = lang === "zh" ? targetWord : targetWord.toLowerCase();
    const isCorrect = answer === expected;
    if (isCorrect) setCorrect(n => n + 1);
    else setMistakes(m => Array.from(new Set([word.en, ...m])).slice(0, 30));
    recordReview(word.en, isCorrect).then(refreshSrs).catch(() => {});
    setTyped(""); setIndex(n => (n + 1) % learnWords.length); setTimeout(() => input.current?.focus(), 20);
  }
  function typeWord(value: string) {
    const cleanValue = lang === "zh"
      ? value.replace(/[^㐀-鿿]/g, "")
      : value.replace(lang === "id" ? /[^a-zA-Z '\-]/g : /[^a-zA-Z\-]/g, "");
    if (typed.length === 0 && cleanValue.length > 0 && autoSpokenWord.current !== targetKey) {
      autoSpokenWord.current = targetKey;
      speak(targetWord, targetVoice);
    }
    setTyped(cleanValue);
  }
  function handleWordKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") { submit(); return; }
    if (event.key === " " && (event.ctrlKey || event.metaKey || lang !== "id" || !targetWord.includes(" "))) {
      event.preventDefault(); speak(targetWord, targetVoice); return;
    }
    if (/^[a-zA-Z]$/.test(event.key) && typed.length === 0 && autoSpokenWord.current !== targetKey) {
      autoSpokenWord.current = targetKey;
      speak(targetWord, targetVoice);
    }
  }
  function persistLangs(ui: Lang, learn: Lang, def: Lang) {
    try { localStorage.setItem("lingotrio-langs", JSON.stringify({ ui, learn, def })); } catch { /* ignore */ }
  }
  function fixDef(learn: Lang, preferred: Lang): Lang {
    return preferred !== learn ? preferred : learn === "zh" ? "en" : "zh";
  }
  function changeLanguage(nextLanguage: Lang) {
    const nextDef = fixDef(nextLanguage, defLang);
    setLang(nextLanguage);
    setDefLang(nextDef);
    setTyped("");
    autoSpokenWord.current = null;
    setSpeakingWord(null);
    persistLangs(uiLang, nextLanguage, nextDef);
    setTimeout(() => input.current?.focus(), 30);
  }
  function saveLangSetup(ui: Lang, learn: Lang, def: Lang) {
    const finalDef = fixDef(learn, def);
    setUiLang(ui);
    setDefLang(finalDef);
    if (learn !== lang) {
      setLang(learn);
      setTyped("");
      autoSpokenWord.current = null;
      setSpeakingWord(null);
    }
    persistLangs(ui, learn, finalDef);
    setShowLangSetup(false);
  }
  function changeCategory(nextCategory: WordFilter) {
    setReviewKeys(null);
    setCategory(nextCategory);
    setIndex(0);
    setTyped("");
    setSearch("");
    autoSpokenWord.current = null;
  }
  function start() { setRunning(v => !v); setTimeout(() => input.current?.focus(), 20); }
  async function startReview() {
    let keys = await getDueKeys();
    if (!keys.length) keys = mistakes.slice();
    if (!keys.length) return;
    setReviewKeys(keys);
    setIndex(0); setTyped(""); autoSpokenWord.current = null;
    setView("learn"); setRunning(true);
    setTimeout(() => input.current?.focus(), 40);
  }
  function exitReview() {
    setReviewKeys(null); setIndex(0); setTyped(""); autoSpokenWord.current = null;
  }
  function practiceWord(w: Word) {
    setReviewKeys(null);
    const list = category === "all" ? words : words.filter(item => item.category === w.category);
    if (category !== "all" && w.category !== category) setCategory(w.category);
    setIndex(Math.max(0, list.indexOf(w)));
    setTyped(""); autoSpokenWord.current = null; setView("learn");
  }
  function chooseReading(id: string) {
    setReadingId(id); setReadingLine(0); setReadingTyped(""); setReadingSeconds(0); setReadingActive(false); setReadingDone(false);
    setTimeout(() => readingInput.current?.focus(), 30);
  }
  function submitReading() {
    if (readingTyped !== readingTarget) return;
    if (readingLine === reading.lines.length - 1) { setReadingDone(true); setReadingActive(false); return; }
    setReadingLine(line => line + 1); setReadingTyped("");
    setTimeout(() => readingInput.current?.focus(), 30);
  }
  function restartReading() {
    setReadingLine(0); setReadingTyped(""); setReadingSeconds(0); setReadingDone(false); setReadingActive(false);
    setTimeout(() => readingInput.current?.focus(), 30);
  }

  return <div className={dark ? "app dark" : "app"}>
    <aside className="sidebar">
      <button className="brand" onClick={() => setView("learn")} aria-label="LingoTrio home"><span>LT</span><b>LingoTrio</b></button>
      <nav>{NAV.map(item => <button key={item.id} className={view === item.id ? "nav active" : "nav"} onClick={() => setView(item.id)}><i>{item.icon}</i><span>{t[item.id]}</span>{item.id === "mistakes" && srs.due > 0 && <em className="nav-badge">{srs.due}</em>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="mini-progress"><span>{t.daily}<b>{Math.min(correct, 20)}/20</b></span><div><i style={{width:`${Math.min(correct/20*100,100)}%`}} /></div></div>
        <div className="profile"><span>S</span><div><b>Susi</b><small>Free learner</small></div><i>•••</i></div>
      </div>
    </aside>

    <main className="main">
      <header>
        <button className="chapter" onClick={() => setView("library")}><small>{t.choose}</small><b>{category === "all" ? t.all : CATEGORY_META[category][uiLang]} · {activeWords.length}</b></button>
        <div className="header-actions">
          <button className="round" onClick={() => setDark(v => !v)} aria-label="Dark mode">{dark ? "☀" : "☾"}</button>
          <label className="language"><span>文</span><select value={lang} onChange={e => changeLanguage(e.target.value as Lang)} aria-label={t.language}><option value="zh">中文</option><option value="id">Indonesia</option><option value="en">English</option></select></label>
          <button className={running ? "primary running" : "primary"} onClick={start}>{running ? t.pause : t.start}<span>→</span></button>
        </div>
      </header>

      {view === "learn" && <section className="learn-view">
        {reviewKeys && <div className="review-banner"><span>◎ {t.reviewing} · {learnWords.length}</span><button onClick={exitReview}>{t.exitReview}</button></div>}
        <div className="session-meta"><span><i className="live" />{running ? "FOCUS MODE" : t.keyboard}</span><b>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</b></div>
        <div className="word-card">
          <div className="word-count">{String((index % learnWords.length) + 1).padStart(2,"0")} <span>/ {learnWords.length}</span></div>
          <button className={speakingWord === targetWord ? "sound speaking" : "sound"} onClick={() => speak()} aria-label="Play pronunciation">▶</button>
          <h1 className={`target-word ${lang}`}>{targetWord.split("").map((letter,i)=><span key={i} className={typed[i] ? ((lang === "zh" ? typed[i] === letter : typed[i].toLowerCase() === letter.toLowerCase()) ? "letter right" : "letter wrong") : "letter"}>{letter === " " ? " " : letter}</span>)}</h1>
          <p className="phonetic">{pronunciation(word, lang)}</p>
          <div className="meanings">
            <span><small>{LANGUAGE_META[defLang].label}</small>{word[defLang]}</span>
            <span><small>{LANGUAGE_META[lang].example}</small>{word.examples[lang]}</span>
          </div>
          <div className="type-area">
            <input ref={input} value={typed} onChange={e=>typeWord(e.target.value)} onKeyDown={handleWordKeyDown} onFocus={()=>setRunning(true)} placeholder={PROMPTS[uiLang][lang]} autoComplete="off" spellCheck={false}/>
            <button onClick={submit} aria-label="Submit">↵</button>
          </div>
          <p className="hint">{lang === "zh" ? <>ENTER <span>·</span> 下一个词 &nbsp;&nbsp; SPACE <span>·</span> 重播发音</> : lang === "id" ? <>ENTER <span>·</span> kata berikutnya &nbsp;&nbsp; CTRL+SPACE <span>·</span> ulang suara</> : <>ENTER <span>·</span> next word &nbsp;&nbsp; SPACE <span>·</span> replay sound</>}</p>
        </div>
        <div className="metrics">
          <Metric value={correct} label={t.words} accent="violet" />
          <Metric value={`${accuracy}%`} label={t.accuracy} accent="mint" />
          <Metric value={attempts ? Math.max(18, Math.round(correct/Math.max(seconds,1)*60)) : 0} label="WPM" accent="amber" />
          <Metric value={`${Math.min(correct,7)} ${t.day}`} label={t.streak} accent="blue" />
        </div>
      </section>}

      {view === "library" && <Panel title={t.library} eyebrow="TRILINGUAL COLLECTION">
        <div className="category-tabs">
          {(["all","daily","business","indonesia","study"] as WordFilter[]).map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => changeCategory(item)}>{item === "all" ? t.all : CATEGORY_META[item][uiLang]}<small>{item === "all" ? words.length : words.filter(wordItem => wordItem.category === item).length}</small></button>)}
        </div>
        <div className="toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}/><span>{filtered.length} {uiLang === "id" ? "kata" : uiLang === "zh" ? "个词" : "words"}</span></div>
        <div className="word-grid">{filtered.slice(0, 300).map((w,i)=><button className={`vocab-card ${lang}`} key={w.en} onClick={()=>practiceWord(w)}><span>{String(i+1).padStart(3,"0")}</span><h3>{wordValue(w, lang)}</h3><p>{pronunciation(w, lang)}</p><em>{w.level} · {CATEGORY_META[w.category][uiLang]}</em><div><b>{w[defLang]}</b></div></button>)}</div>
        <div className="source-note"><b>{uiLang === "zh" ? "词库来源" : uiLang === "id" ? "Sumber kosakata" : "Vocabulary sources"}</b><p>NGSL · Open English WordNet · Wordnet Bahasa · CC-CEDICT</p><span>{uiLang === "zh" ? "首批词条已经按三语概念对齐；重点词条将继续人工校对例句、拼音和音标。" : uiLang === "id" ? "Kosakata diselaraskan berdasarkan konsep dalam tiga bahasa dan akan terus ditinjau secara manual." : "Entries are aligned by concept across three languages and will continue through editorial review."}</span></div>
      </Panel>}

      {view === "mistakes" && <Panel title={t.mistakes} eyebrow="SPACED REPETITION">
        <div className="review-summary"><Metric value={srs.due} label={t.due} accent="violet"/><Metric value={srs.mastered} label={t.mastered} accent="mint"/><Metric value={srs.learning} label={t.learning} accent="amber"/></div>
        <div className="review-cta"><div><b>{t.reviewHint}</b><small>{srs.total} {uiLang === "zh" ? "个词在复习计划中" : uiLang === "id" ? "kata dalam jadwal" : "words in schedule"}</small></div><button className={(srs.due || mistakes.length) ? "ready" : ""} disabled={!srs.due && !mistakes.length} onClick={startReview}>{t.startReview}{srs.due ? ` · ${srs.due}` : ""}</button></div>
        <div className="mistake-list">{dueWords.length ? dueWords.map((w,i)=><button key={w.en} onClick={()=>practiceWord(w)}><span>{i+1}</span><b>{wordValue(w,lang)}</b><em>{w[defLang]}</em><i>Practice →</i></button>) : <div className="empty"><b>✓</b><h3>{t.noDueTitle}</h3><p>{t.noDueNote}</p></div>}</div>
      </Panel>}

      {view === "articles" && <section className="reading-panel">
        <div className="reading-heading">
          <div><span>TYPE THE CLASSICS</span><h1>{t.articles}</h1><p>{t.readingTagline}</p></div>
          <div className="reading-filters">
            {(["all","en","id","zh"] as ReadingLang[]).map(code => <button key={code} className={readingLang === code ? "active" : ""} onClick={() => setReadingLang(code)}>{code === "all" ? t.allReadings : code === "en" ? "English" : code === "id" ? "Indonesia" : "中文"}</button>)}
          </div>
        </div>

        <div className="reading-layout">
          <aside className="reading-library">
            <div className="reading-library-title"><b>{t.classics}</b><span>{readings.filter(piece => readingLang === "all" || piece.lang === readingLang).length} {t.pieces}</span></div>
            <div className="reading-list">
              {readings.filter(piece => readingLang === "all" || piece.lang === readingLang).map((piece, i) => <button key={piece.id} className={piece.id === reading.id ? "active" : ""} onClick={() => chooseReading(piece.id)}>
                <span className={`piece-language ${piece.lang}`}>{piece.lang === "en" ? "EN" : piece.lang === "id" ? "ID" : "中"}</span>
                <div><small>{piece.genre} · {piece.era}</small><b>{piece.title}</b><em>{piece.author}</em></div>
                <i>{String(i + 1).padStart(2,"0")}</i>
              </button>)}
            </div>
          </aside>

          <article className="typing-reader">
            <div className="reader-top">
              <div><span>{reading.genre} · {reading.era}</span><h2>{reading.title}</h2><p>{reading.author}</p></div>
              <button onClick={() => speak(reading.lines.join(" "), reading.lang === "zh" ? "zh-CN" : reading.lang === "id" ? "id-ID" : "en-US")} aria-label={t.readAll}>▶ <span>{t.read}</span></button>
            </div>

            {!readingDone ? <>
              <div className="passage-preview">
                {reading.lines.map((line, i) => <p key={line} className={i < readingLine ? "complete" : i === readingLine ? "current" : "waiting"}>{i < readingLine ? <span>✓</span> : <span>{String(i + 1).padStart(2,"0")}</span>}{line}</p>)}
              </div>
              <div className="line-practice">
                <div className="line-meta"><span>{t.lineLabel} {readingLine + 1} / {reading.lines.length}</span><b>{readingAccuracy}% {t.accuracy}</b></div>
                <div className={`target-line ${reading.lang}`}>
                  {readingTarget.split("").map((character, i) => <span key={`${character}-${i}`} className={readingTyped[i] ? (readingTyped[i] === character ? "right" : "wrong") : i === readingTyped.length ? "cursor" : ""}>{character === " " ? " " : character}</span>)}
                </div>
                <div className="reading-input-wrap">
                  <textarea ref={readingInput} value={readingTyped} onFocus={() => setReadingActive(true)} onChange={e => setReadingTyped(e.target.value.replace(/\n/g,""))} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); submitReading(); }}} placeholder={reading.lang === "zh" ? "照着上方文字输入……" : reading.lang === "id" ? "Ketik baris di atas…" : "Type the line above…"} spellCheck={false} />
                  <button className={readingTyped === readingTarget ? "ready" : ""} onClick={submitReading} disabled={readingTyped !== readingTarget}>{t.nextLine} <span>↵</span></button>
                </div>
                {readingTyped && readingTyped !== readingTarget && <p className="typing-help">{t.typingHelp}</p>}
              </div>
            </> : <div className="reading-complete">
              <span>✓</span><small>{t.completed}</small><h2>{reading.title}</h2><p>{t.completedNote}</p><div><b>{reading.lines.join("").length}</b><small>{t.characters}</small><b>{String(Math.floor(readingSeconds/60)).padStart(2,"0")}:{String(readingSeconds%60).padStart(2,"0")}</b><small>{t.timeUsed}</small></div><button onClick={restartReading}>{t.practiceAgain}</button>
            </div>}

            <div className="reader-footer"><p>{reading.note}</p><div><span>{readingProgress}%</span><i><b style={{width:`${readingProgress}%`}} /></i><time>{String(Math.floor(readingSeconds/60)).padStart(2,"0")}:{String(readingSeconds%60).padStart(2,"0")}</time></div></div>
          </article>
        </div>
      </section>}

      {view === "plan" && <Panel title={t.plan} eyebrow="A RHYTHM THAT WORKS">
        <div className="plan-layout"><div className="goal-card"><span>{t.finish}</span><strong>{Math.min(correct*5,100)}%</strong><div className="goal-ring" style={{"--p":`${Math.min(correct*5,100)*3.6}deg`} as React.CSSProperties}><b>{Math.min(correct,20)}</b><small>/20 words</small></div></div><div className="week">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=><div className={i<4?"done":i===4?"today":""} key={d}><span>{d}</span><b>{i<4?"✓":i===4?"12":"·"}</b><small>{i<4?"20 words":i===4?"of 20":"Rest"}</small></div>)}</div></div>
      </Panel>}

      {view === "stats" && <Panel title={t.stats} eyebrow="YOUR LEARNING SIGNALS">
        <div className="stats-top"><Metric value={correct} label={t.words} accent="violet"/><Metric value={`${accuracy}%`} label={t.accuracy} accent="mint"/><Metric value={`${Math.min(correct,7)} ${t.day}`} label={t.streak} accent="amber"/></div>
        <div className="chart-card"><div><h3>Learning activity</h3><p>Words practiced in the last 7 days</p></div><div className="bars">{[34,58,42,78,64,90,48].map((h,i)=><span key={i}><i style={{height:`${h}%`}}/><small>{["M","T","W","T","F","S","S"][i]}</small></span>)}</div></div>
      </Panel>}

      {view === "settings" && <Panel title={t.settings} eyebrow="MAKE IT YOURS">
        <div className="settings-grid"><Setting title={MODAL_T[uiLang].title} detail={`${MODAL_T[uiLang].ui} + ${MODAL_T[uiLang].learn}`}><button onClick={()=>setShowLangSetup(true)}>{uiLang === "zh" ? "打开设置" : uiLang === "id" ? "Buka" : "Open"}</button></Setting><Setting title="Learning language" detail="中文 · Bahasa Indonesia · English"><select value={lang} onChange={e=>changeLanguage(e.target.value as Lang)}><option value="zh">中文</option><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></Setting><Setting title="Theme" detail="Choose a comfortable reading mode"><button onClick={()=>setDark(v=>!v)}>{dark?"Light":"Dark"} mode</button></Setting><Setting title="Pronunciation" detail={`${LANGUAGE_META[lang].label} · 0.8×`}><button onClick={()=>speak(targetWord,targetVoice)}>Test sound ▶</button></Setting><Setting title="Learning data" detail="Stored privately on this device"><button onClick={()=>{setCorrect(0);setAttempts(0);setMistakes([]);resetAll().then(refreshSrs)}}>Reset progress</button></Setting></div>
      </Panel>}
    </main>

    {showLangSetup && <LangSetup initialUi={uiLang} initialLearn={lang} initialDef={defLang} onSave={saveLangSetup} onClose={() => { persistLangs(uiLang, lang, defLang); setShowLangSetup(false); }} />}
  </div>;
}

function LangSetup({ initialUi, initialLearn, initialDef, onSave, onClose }: { initialUi: Lang; initialLearn: Lang; initialDef: Lang; onSave: (ui: Lang, learn: Lang, def: Lang) => void; onClose: () => void }) {
  const [ui, setUi] = useState<Lang>(initialUi);
  const [learn, setLearn] = useState<Lang>(initialLearn);
  const [def, setDef] = useState<Lang>(initialDef !== initialLearn ? initialDef : initialLearn === "zh" ? "en" : "zh");
  const mt = MODAL_T[ui];
  function pickLearn(code: Lang) {
    setLearn(code);
    if (def === code) setDef(code === "zh" ? "en" : "zh");
  }
  return <div className="lang-modal-backdrop" role="dialog" aria-modal="true">
    <div className="lang-modal">
      <button className="lang-modal-close" onClick={onClose} aria-label="Close">✕</button>
      <h2>{mt.title}</h2>
      <p className="lang-modal-subtitle">{mt.subtitle}</p>
      <div className="lang-modal-section">
        <h3>🖥 {mt.ui}</h3>
        <p>{mt.uiDesc}</p>
        <div className="lang-cards">
          {LANG_CARDS.map(c => <button key={c.code} className={ui === c.code ? "lang-card active" : "lang-card"} onClick={() => setUi(c.code)}>
            <b>{c.name}</b><small>{c.uiDesc}</small>{ui === c.code && <span>{mt.selected}</span>}
          </button>)}
        </div>
      </div>
      <div className="lang-modal-section">
        <h3>⌨ {mt.learn}</h3>
        <p>{mt.learnDesc}</p>
        <div className="lang-cards">
          {LANG_CARDS.map(c => <button key={c.code} className={learn === c.code ? "lang-card active" : "lang-card"} onClick={() => pickLearn(c.code)}>
            <b>{c.name}</b><small>{c.learnDesc}</small>{learn === c.code && <span>{mt.selected}</span>}
          </button>)}
        </div>
      </div>
      <div className="lang-modal-section">
        <h3>🌐 {mt.def}</h3>
        <p>{mt.defDesc}</p>
        <div className="lang-cards">
          {LANG_CARDS.filter(c => c.code !== learn).map(c => <button key={c.code} className={def === c.code ? "lang-card active" : "lang-card"} onClick={() => setDef(c.code)}>
            <b>{c.defName}</b><small>{c.defDesc}</small>{def === c.code && <span>{mt.selected}</span>}
          </button>)}
        </div>
      </div>
      <div className="lang-modal-actions">
        <button className="lang-modal-cancel" onClick={onClose}>{mt.cancel}</button>
        <button className="lang-modal-save" onClick={() => onSave(ui, learn, def)}>{mt.save}</button>
      </div>
    </div>
  </div>;
}

function Metric({value,label,accent}:{value:string|number;label:string;accent:string}) { return <div className={`metric ${accent}`}><i/><div><strong>{value}</strong><span>{label}</span></div></div> }
function Panel({title,eyebrow,children}:{title:string;eyebrow:string;children:React.ReactNode}) { return <section className="panel"><div className="panel-head"><span>{eyebrow}</span><h1>{title}</h1></div>{children}</section> }
function Setting({title,detail,children}:{title:string;detail:string;children:React.ReactNode}) { return <div className="setting"><div><b>{title}</b><p>{detail}</p></div>{children}</div> }
