import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang, Word, WordCategory, ReadingPiece, DictEntry, DictInfo, PracticeItem } from "./types";
import { recordReview, getStats, getDueKeys, resetAll, getAllRecords, restoreRecords, type SrsStats } from "./srs";
import { keyClick, errorBeep, successChime, setSoundProfile, initSoundPref, type SoundProfile } from "./sounds";
import { ZhSteps, ZH_STEPS, useZhMap, zhToned, zhPlain, zhLevel, zhMaxLevel, type ZhStep } from "./ZhSteps";

type View = "learn" | "library" | "mistakes" | "articles" | "plan" | "stats" | "settings";
type ReadingLang = "all" | "en" | "id" | "zh";
type WordFilter = "all" | WordCategory;

const DATA = import.meta.env.BASE_URL + "data/";

// dictionary files may live under data/dicts/ or flat under data/ - try both
function loadDictFile<T>(name: string): Promise<T> {
  const ok = (r: Response) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); };
  return fetch(DATA + "dicts/" + name).then(ok).catch(() => fetch(DATA + name).then(ok));
}

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

const EYEBROW: Record<string, Record<Lang, string>> = {
  library: { zh: "三语词汇合集", id: "Koleksi Trilingual", en: "TRILINGUAL COLLECTION" },
  mistakes: { zh: "间隔复习", id: "Ulasan Berkala", en: "SPACED REPETITION" },
  articles: { zh: "照着经典打字", id: "Ketik Karya Klasik", en: "TYPE THE CLASSICS" },
  plan: { zh: "适合你的节奏", id: "Ritme yang Pas", en: "A RHYTHM THAT WORKS" },
  stats: { zh: "你的学习信号", id: "Sinyal Belajarmu", en: "YOUR LEARNING SIGNALS" },
  settings: { zh: "按你的习惯来", id: "Sesuai Seleramu", en: "MAKE IT YOURS" },
};
const TX = (zh: string, id: string, en: string, lg: Lang) => lg === "zh" ? zh : lg === "id" ? id : en;

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
  const [dicts, setDicts] = useState<DictInfo[]>([]);
  const [source, setSource] = useState<string>("trio");
  const [dictWords, setDictWords] = useState<DictEntry[] | null>(null);
  const [soundProfile, setSoundProfileState] = useState<SoundProfile>("soft");
  const [wrongFlash, setWrongFlash] = useState(false);
  const [loopTimes, setLoopTimes] = useState(1);
  const [loopIx, setLoopIx] = useState(0);
  const [favorites, setFavorites] = useState<PracticeItem[]>([]);
  const [globalSearch, setGlobalSearch] = useState(false);
  const [allDicts, setAllDicts] = useState<Record<string, DictEntry[]>>({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [chapterFinished, setChapterFinished] = useState(false);
  const [chDone, setChDone] = useState(0);
  const [chWrongKeys, setChWrongKeys] = useState<string[]>([]);
  const [chElapsed, setChElapsed] = useState(0);
  const [wrongCountWord, setWrongCountWord] = useState(0);
  const [dictation, setDictation] = useState<"off" | "all" | "vowel" | "random">("off");
  const [reveal, setReveal] = useState(false);
  const [dayCounts, setDayCounts] = useState<Record<string, number>>({});

  const [view, setView] = useState<View>("learn");
  const [lang, setLang] = useState<Lang>("zh");
  const [uiLang, setUiLang] = useState<Lang>("zh");
  const [defLang, setDefLang] = useState<Lang>("en");
  const [showLangSetup, setShowLangSetup] = useState(false);
  const [dark, setDark] = useState(false);
  const [running, setRunning] = useState(false);
  const [typingFocus, setTypingFocus] = useState(false);
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
  const autoAdvance = useRef(0);
  const readingAuto = useRef(0);
  const hadWrong = useRef(false);
  const dictCache = useRef(new Map<string, DictEntry[]>());
  const chapterStart = useRef(Date.now());
  const pendingIndex = useRef<number | null>(null);
  const isComposing = useRef(false);
  const [speechBlocked, setSpeechBlocked] = useState(false);
  const speechPrimed = useRef(false);
  useEffect(() => {
    // Chrome gates speechSynthesis behind a user activation. IME composition
    // keydowns arrive as key "Process" / keyCode 229 and do NOT grant it, so a
    // learner who only ever types Chinese through an IME never unlocks audio.
    // Prime the engine on the first gesture that does count.
    const prime = () => {
      if (speechPrimed.current || !("speechSynthesis" in window)) return;
      speechPrimed.current = true;
      try {
        const u = new SpeechSynthesisUtterance(" ");
        u.volume = 0;
        window.speechSynthesis.speak(u);
        window.speechSynthesis.resume();
        // NB: do not clear speechBlocked here. This runs on pointerdown, and
        // unmounting the recovery button before its click lands would swallow it.
        // onstart clears the flag once audio genuinely plays.
      } catch { /* ignore */ }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.key === "Process" || (e as any).keyCode === 229) return;
      prime();
    };
    window.addEventListener("pointerdown", prime);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  const [zhStep, setZhStep] = useState<ZhStep>(() => {
    try { return (localStorage.getItem("ketiklab-zh-step") as ZhStep) || "read"; } catch { return "read"; }
  });
  const zhMap = useZhMap(DATA);
  useEffect(() => { try { localStorage.setItem("ketiklab-zh-step", zhStep); } catch { /* ignore */ } }, [zhStep]);
  useEffect(() => {
    const onAnyKey = (e: KeyboardEvent) => {
      if (view !== "learn") return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey || (e.key.length !== 1 && e.key !== "Process")) return;
      isComposing.current = false;
      input.current?.focus();
    };
    window.addEventListener("keydown", onAnyKey);
    return () => window.removeEventListener("keydown", onAnyKey);
  }, [view]);

  useEffect(() => {
    const el = input.current;
    if (el && el.classList.contains("ime-input") && !isComposing.current && el.value !== typed) el.value = typed;
  });
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
    loadDictFile<DictInfo[]>("manifest.json").then((m: DictInfo[]) => {
      if (!alive) return;
      setDicts(m);
      // restore the previously selected dictionary
      try {
        const savedSource = localStorage.getItem("lingotrio-source");
        const d = savedSource && m.find(x => x.id === savedSource);
        if (d) {
          loadDictFile<DictEntry[]>(d.file).then((data: DictEntry[]) => {
            if (!alive) return;
            dictCache.current.set(d.id, data);
            setDictWords(data);
            setSource(d.id);
          }).catch(() => {});
        }
      } catch { /* ignore */ }
    }).catch(() => {});
    { const sp = initSoundPref(); setSoundProfileState(sp.profile); }
    try { const lp = Number(localStorage.getItem("lingotrio-loop")); if (lp >= 1 && lp <= 5) setLoopTimes(lp); } catch { /* ignore */ }
    try { setFavorites(JSON.parse(localStorage.getItem("lingotrio-fav") || "[]")); } catch { /* ignore */ }
    try { if (localStorage.getItem("lingotrio-dark") === "1") setDark(true); } catch { /* ignore */ }
    try { setDayCounts(JSON.parse(localStorage.getItem("lingotrio-days") || "{}")); } catch { /* ignore */ }
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
  const ladder = useMemo(() => {
    if (lang !== "zh" || zhStep === "hanzi") return { list: activeWords, broad: false };
    const cap = zhMaxLevel(zhStep);
    const byLevel = (a: typeof words[number], b: typeof words[number]) =>
      zhLevel(zhMap, a.zh.split("；")[0]) - zhLevel(zhMap, b.zh.split("；")[0]);
    // stay inside the chosen category whenever it has enough words at this rung
    const inCat = activeWords.filter(w => zhLevel(zhMap, w.zh.split("；")[0]) <= cap);
    if (inCat.length >= 20) return { list: inCat.slice().sort(byLevel), broad: false };
    const all = words.filter(w => zhLevel(zhMap, w.zh.split("；")[0]) <= cap);
    if (all.length < 20) return { list: activeWords, broad: false };
    return { list: all.slice().sort(byLevel), broad: true };
  }, [words, activeWords, lang, zhStep, zhMap]);
  const ladderWords = ladder.list;
  const filtered = useMemo(() => activeWords.filter(w => `${w.en} ${w.id} ${w.zh}`.toLowerCase().includes(search.toLowerCase())), [activeWords, search]);


  const sourceKey = source === "trio" ? `trio:${category}` : source;

  // restore chapter per source, and reset the chapter run when switching source/category
  useEffect(() => {
    let saved = 0;
    try { saved = JSON.parse(localStorage.getItem("lingotrio-chapters") || "{}")[sourceKey] || 0; } catch { /* ignore */ }
    setChapter(saved);
    setChapterFinished(false); setChDone(0); setChWrongKeys([]); setWrongCountWord(0);
    chapterStart.current = Date.now();
    if (pendingIndex.current != null) { setIndex(pendingIndex.current); pendingIndex.current = null; }
    else setIndex(0);
    setTyped("");
    hadWrong.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  useEffect(() => { setWrongCountWord(0); setReveal(false); setLoopIx(0); }, [index]);
  useEffect(() => { try { localStorage.setItem("lingotrio-days", JSON.stringify(dayCounts)); } catch { /* ignore */ } }, [dayCounts]);
  useEffect(() => { try { localStorage.setItem("lingotrio-dark", dark ? "1" : "0"); } catch { /* ignore */ } }, [dark]);
  useEffect(() => { try { localStorage.setItem("lingotrio-fav", JSON.stringify(favorites)); } catch { /* ignore */ } }, [favorites]);

  const ready = words.length > 0;

  if (!ready) {
    return <div className={dark ? "app dark" : "app"}>
      <div className="loading-screen">
        <span className="loading-mark">KL</span>
        <p>{dataError ? "内容加载失败，请刷新页面重试。" : t.loading}</p>
      </div>
    </div>;
  }

  const dictInfo = source !== "trio" && source !== "fav" && dictWords ? dicts.find(d => d.id === source) || null : null;
  const activeItems: PracticeItem[] = source === "fav"
    ? favorites
    : (dictInfo && dictWords)
    ? dictWords.map(e => ({
        key: e.name,
        text: e.name,
        sub: e.usphone ? `American English · /${e.usphone}/` : (dictInfo.lang === "id" ? "Bahasa Indonesia" : "English"),
        meaning: e.trans.join("；"),
        example: undefined as string | undefined,
        voice: dictInfo.lang === "id" ? "id-ID" : "en-US",
        lang: dictInfo.lang,
        dict: dictInfo.name,
      }))
    : ladderWords.map(w => ({
        key: w.en,
        text: wordValue(w, lang),
        sub: lang === "zh" && zhToned(zhMap, wordValue(w, "zh"))
          ? `普通话 · ${zhToned(zhMap, wordValue(w, "zh"))}`
          : pronunciation(w, lang),
        meaning: w[defLang],
        example: w.examples[lang] as string | undefined,
        voice: LANGUAGE_META[lang].voice,
        lang,
      }));
  const reviewItems = reviewKeys ? activeItems.filter(i => reviewKeys.includes(i.key)) : null;
  const chapterCount = Math.max(1, Math.ceil(activeItems.length / 20));
  const chapterSafe = Math.min(chapter, chapterCount - 1);
  const chapterItems = activeItems.slice(chapterSafe * 20, chapterSafe * 20 + 20);
  const learnItems = (reviewItems && reviewItems.length) ? reviewItems : (chapterItems.length ? chapterItems : activeItems);
  const item = learnItems[index % Math.max(learnItems.length, 1)] || learnItems[0];
  const practiceLang: Lang = (item && item.lang) || lang;
  const favId = item ? `${item.lang}:${item.key}` : "";
  const isFav = favorites.some(f => `${f.lang}:${f.key}` === favId);
  const prevItem = learnItems[(index - 1 + learnItems.length) % Math.max(learnItems.length, 1)];
  const nextItem = learnItems[(index + 1) % Math.max(learnItems.length, 1)];
  const targetWord = item.text;
  const zhLadder = practiceLang === "zh" && zhStep !== "hanzi";
  const zhPool = learnItems.map(i => i.text);
  const targetVoice = item.voice;
  const targetKey = `${source}:${item.key}`;
  const accuracy = attempts ? Math.round(correct / attempts * 100) : 100;
  function seededVisible(i: number): boolean {
    let h = (i + 7) * 2654435761 >>> 0;
    for (let k = 0; k < targetWord.length; k++) h = ((h * 31) + targetWord.charCodeAt(k)) >>> 0;
    return h % 10 > 3;
  }
  function letterVisible(i: number): boolean {
    if (dictation === "off" || reveal) return true;
    if (typed[i] && (practiceLang === "zh" ? typed[i] === targetWord[i] : typed[i].toLowerCase() === targetWord[i].toLowerCase())) return true;
    if (dictation === "all") return false;
    if (dictation === "vowel") return practiceLang === "zh" ? seededVisible(i) : !"aeiouAEIOU".includes(targetWord[i]);
    return seededVisible(i);
  }
  function todayStr(offset = 0): string {
    const d = new Date(); d.setDate(d.getDate() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  let streakDays = 0;
  {
    let off = (dayCounts[todayStr(0)] || 0) > 0 ? 0 : 1;
    while ((dayCounts[todayStr(off)] || 0) > 0) { streakDays++; off++; }
  }
  const last7 = Array.from({ length: 7 }, (_, k) => {
    const off = 6 - k; const d = new Date(); d.setDate(d.getDate() - off);
    return { label: "SMTWTFS"[d.getDay()], count: dayCounts[todayStr(off)] || 0 };
  });
  const last7max = Math.max(1, ...last7.map(x => x.count));
  const todayCount = dayCounts[todayStr(0)] || 0;
  // last 91 days heatmap (13 weeks x 7), oldest -> newest, plus totals
  const heat = Array.from({ length: 91 }, (_, k) => { const off = 90 - k; return { day: todayStr(off), count: dayCounts[todayStr(off)] || 0 }; });
  const heatMax = Math.max(1, ...heat.map(h => h.count));
  const totalTyped = Object.values(dayCounts).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(dayCounts).filter(v => v > 0).length;
  function heatLevel(c: number): number { if (!c) return 0; const r = c / heatMax; return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1; }
  const reading = readings.find(piece => piece.id === readingId) || readings[0];
  const filteredReadings = readings.filter(pc => readingLang === "all" || pc.lang === readingLang);
  const readingLangName: Record<"zh"|"id"|"en", string> = {
    zh: uiLang === "zh" ? "中文诗词" : uiLang === "id" ? "Puisi Mandarin" : "Chinese Poetry",
    id: uiLang === "zh" ? "印尼语诗歌" : uiLang === "id" ? "Puisi Indonesia" : "Indonesian Poetry",
    en: uiLang === "zh" ? "英文诗歌" : uiLang === "id" ? "Puisi Inggris" : "English Poetry",
  };
  const readingGroups: { label: string; items: ReadingPiece[] }[] = readingLang === "all"
    ? (["zh", "id", "en"] as const).map(lg => ({ label: readingLangName[lg], items: filteredReadings.filter(pc => pc.lang === lg) })).filter(g => g.items.length)
    : (() => { const m = new Map<string, ReadingPiece[]>(); filteredReadings.forEach(pc => { if (!m.has(pc.genre)) m.set(pc.genre, []); m.get(pc.genre)!.push(pc); }); return [...m.entries()].map(([label, items]) => ({ label, items })); })();
  const readingTarget = reading.lines[readingLine] || "";
  const readingAccuracy = readingTyped.length
    ? Math.round(readingTyped.split("").filter((character, i) => character === readingTarget[i]).length / readingTyped.length * 100)
    : 100;
  const readingProgress = Math.round(((readingLine + Math.min(readingTyped.length / Math.max(readingTarget.length, 1), 1)) / reading.lines.length) * 100);
  const keyLookup = new Map<string, { text: string; meaning: string }>();
  words.forEach(w => keyLookup.set(w.en, { text: wordValue(w, lang), meaning: w[defLang] }));
  if (dictWords) dictWords.forEach(e => { if (!keyLookup.has(e.name)) keyLookup.set(e.name, { text: e.name, meaning: e.trans.join("；") }); });
  const dueEntries = reviewKeys ? [] : mistakes.map(k => ({ key: k, info: keyLookup.get(k) })).filter(x => x.info) as { key: string; info: { text: string; meaning: string } }[];
  const gq = search.trim().toLowerCase();
  const rankMatch = (text: string, meaning: string, q: string): number => {
    const tt = text.toLowerCase();
    if (tt === q) return 0;                                   // exact
    if (tt.startsWith(q)) return 1;                            // prefix
    if (new RegExp(`(^|[^a-z])${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i").test(text)) return 2; // whole word
    if (tt.includes(q)) return 3;                             // substring in headword
    if (meaning.toLowerCase().includes(q)) return 4;          // in meaning only
    return 5;
  };
  const globalResults: { src: string; key: string; text: string; sub: string; meaning: string; lang: Lang; dictName?: string; rank: number }[] = [];
  if (globalSearch && gq) {
    for (const w of words) {
      const text = wordValue(w, lang); const meaning = w[defLang];
      if (`${w.en} ${w.id} ${w.zh} ${meaning}`.toLowerCase().includes(gq)) globalResults.push({ src: "trio", key: w.en, text, sub: pronunciation(w, lang), meaning, lang, rank: rankMatch(text + " " + w.en, meaning, gq) });
    }
    for (const d of dicts) {
      const data = allDicts[d.id]; if (!data) continue;
      for (const e of data) {
        const meaning = e.trans.join("；");
        if (e.name.toLowerCase().includes(gq) || meaning.toLowerCase().includes(gq)) globalResults.push({ src: d.id, key: e.name, text: e.name, sub: e.usphone ? `/${e.usphone}/` : "", meaning, lang: d.lang, dictName: d.name, rank: rankMatch(e.name, meaning, gq) });
      }
    }
    globalResults.sort((a, b) => a.rank - b.rank || a.text.length - b.text.length);
    globalResults.length = Math.min(globalResults.length, 240);
  }

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
      utterance.onstart = () => { started = true; setSpeakingWord(text); setSpeechBlocked(false); };
      utterance.onend = () => { if (speechRequest.current === requestId) setSpeakingWord(null); };
      utterance.onerror = (ev) => {
        if ((ev as SpeechSynthesisErrorEvent).error === "not-allowed") setSpeechBlocked(true);
        if (speechRequest.current === requestId) setSpeakingWord(null);
      };
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
  // qwerty-learner style engine: per-keystroke judgement, wrong letter resets the word
  function bumpToday() {
    setDayCounts(m => ({ ...m, [todayStr(0)]: (m[todayStr(0)] || 0) + 1 }));
  }
  function advanceOrFinishChapter(wasWrong: boolean) {
    setChDone(n => n + 1);
    if (wasWrong) setChWrongKeys(k => Array.from(new Set([...k, item.key])));
    const atEnd = (index % Math.max(learnItems.length, 1)) === learnItems.length - 1;
    if (!reviewKeys && atEnd) {
      setChElapsed(Math.round((Date.now() - chapterStart.current) / 1000));
      setChapterFinished(true);
      setRunning(false);
    } else {
      const ni = (index + 1) % Math.max(learnItems.length, 1);
      const nx = learnItems[ni];
      setIndex(ni);
      if (nx) {
        autoSpokenWord.current = `${source}:${nx.key}`;
        window.setTimeout(() => speak(nx.text, nx.voice), 160);
      }
      setTimeout(() => input.current?.focus(), 20);
    }
  }
  function finishWord() {
    successChime();
    setAttempts(n => n + 1);
    const cleanRun = !hadWrong.current;
    if (cleanRun) setCorrect(n => n + 1);
    bumpToday();
    recordReview(item.key, cleanRun).then(refreshSrs).catch(() => {});
    const token = ++autoAdvance.current;
    // repeat the same word loopTimes before moving on (reference "loop word" mode)
    if (loopIx + 1 < loopTimes) {
      window.setTimeout(() => {
        if (autoAdvance.current !== token) return;
        setTyped(""); hadWrong.current = false; setLoopIx(n => n + 1);
        setTimeout(() => input.current?.focus(), 20);
      }, 320);
      return;
    }
    window.setTimeout(() => {
      if (autoAdvance.current !== token) return;
      setTyped(""); setLoopIx(0);
      const wasWrong = hadWrong.current;
      hadWrong.current = false;
      advanceOrFinishChapter(wasWrong);
    }, 320);
  }
  function toggleFav() {
    if (!item) return;
    setFavorites(list => list.some(f => `${f.lang}:${f.key}` === favId)
      ? list.filter(f => `${f.lang}:${f.key}` !== favId)
      : [{ key: item.key, text: item.text, sub: item.sub, meaning: item.meaning, example: item.example, voice: item.voice, lang: item.lang, dict: item.dict }, ...list].slice(0, 500));
  }
  function changeLoop(n: number) {
    setLoopTimes(n); setLoopIx(0);
    try { localStorage.setItem("lingotrio-loop", String(n)); } catch { /* ignore */ }
    setTimeout(() => input.current?.focus(), 20);
  }
  function pickSound(pf: SoundProfile) {
    setSoundProfileState(pf); setSoundProfile(pf);
    if (pf !== "off") keyClick();
  }
  async function exportProgress() {
    const reviews = await getAllRecords().catch(() => []);
    const payload = {
      app: "lingotrio", version: 1, exportedAt: new Date().toISOString().slice(0, 19),
      local: Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith("lingotrio-")).map(k => [k, localStorage.getItem(k)])),
      reviews,
    };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lingotrio-backup-${todayStr(0)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function importProgress(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data.app !== "lingotrio") throw new Error("bad file");
        if (data.local) for (const [k, v] of Object.entries(data.local)) if (typeof v === "string") localStorage.setItem(k, v);
        if (Array.isArray(data.reviews)) await restoreRecords(data.reviews).catch(() => {});
        window.location.reload();
      } catch { alert(uiLang === "zh" ? "导入失败：文件格式不对" : "Import failed: invalid file"); }
    };
    reader.readAsText(file);
  }
  function skipWord() {
    autoAdvance.current++;
    setAttempts(n => n + 1);
    setMistakes(m => Array.from(new Set([item.key, ...m])).slice(0, 30));
    recordReview(item.key, false).then(refreshSrs).catch(() => {});
    setTyped(""); hadWrong.current = false; setWrongFlash(false);
    advanceOrFinishChapter(true);
  }
  function setChapterTo(n: number) {
    const target = Math.max(0, Math.min(n, chapterCount - 1));
    setChapter(target);
    try {
      const m = JSON.parse(localStorage.getItem("lingotrio-chapters") || "{}");
      m[sourceKey] = target;
      localStorage.setItem("lingotrio-chapters", JSON.stringify(m));
    } catch { /* ignore */ }
    setChapterFinished(false); setChDone(0); setChWrongKeys([]); setWrongCountWord(0);
    chapterStart.current = Date.now();
    setIndex(0); setTyped(""); hadWrong.current = false; autoSpokenWord.current = null;
    setTimeout(() => input.current?.focus(), 30);
  }
  function retryChapter() { setChapterTo(chapterSafe); }
  function nextChapter() { setChapterTo(chapterSafe + 1 >= chapterCount ? 0 : chapterSafe + 1); }
  function practiceChapterWrong() {
    if (!chWrongKeys.length) return;
    setReviewKeys(chWrongKeys.slice());
    setChapterFinished(false); setChDone(0);
    setIndex(0); setTyped(""); hadWrong.current = false;
    setRunning(true);
    setTimeout(() => input.current?.focus(), 30);
  }
  function handleType(raw: string) {
    if (wrongFlash) return;
    if (isComposing.current) return; // ignore mid-IME-composition (Chinese pinyin etc.)
    const clean = practiceLang === "zh"
      ? raw.replace(/[^㐀-鿿]/g, "")
      : raw.replace(/[^a-zA-Z '\-\.&]/g, "");
    if (typed.length === 0 && clean.length > 0 && autoSpokenWord.current !== targetKey) {
      autoSpokenWord.current = targetKey;
      speak(targetWord, targetVoice);
    }
    const norm = (x: string) => practiceLang === "zh" ? x : x.toLowerCase();
    const expected = norm(targetWord);
    const current = norm(clean);
    if (expected.startsWith(current)) {
      if (clean.length > typed.length) keyClick();
      setTyped(clean);
      if (current.length === expected.length && current.length > 0) finishWord();
    } else {
      errorBeep();
      hadWrong.current = true;
      setTyped(clean);
      setWrongFlash(true);
      const firstError = wrongCountWord === 0;
      setWrongCountWord(n => n + 1);
      setMistakes(m => Array.from(new Set([item.key, ...m])).slice(0, 30));
      // graded forgiveness: full restart only on a short word's first slip;
      // otherwise keep the correct prefix so long words / phrases / repeat errors
      // don't force retyping everything from scratch.
      let k = 0;
      while (k < expected.length && k < current.length && expected[k] === current[k]) k++;
      const fullReset = firstError && targetWord.length <= 8;
      window.setTimeout(() => {
        setTyped(fullReset ? "" : targetWord.slice(0, k));
        setWrongFlash(false); input.current?.focus();
      }, 350);
    }
  }
  function handleGhostKeys(event: React.KeyboardEvent<HTMLInputElement>) {
    if (isComposing.current || (event.nativeEvent as any).isComposing || event.key === "Process" || (event as any).keyCode === 229) return;
    if (event.key === "Tab") { event.preventDefault(); setReveal(true); return; }
    if (event.key === "Enter") { event.preventDefault(); skipWord(); return; }
    if (event.key === " " && (event.ctrlKey || event.metaKey)) {
      event.preventDefault(); speak(targetWord, targetVoice); return;
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
    hadWrong.current = false;
    autoSpokenWord.current = null;
  }
  function persistSource(id: string) {
    try { localStorage.setItem("lingotrio-source", id); } catch { /* ignore */ }
  }
  function selectTrio(nextCategory: WordFilter) {
    setSource("trio");
    persistSource("trio");
    changeCategory(nextCategory);
  }
  async function selectDict(d: DictInfo) {
    setSearch("");
    let data = dictCache.current.get(d.id);
    if (!data) {
      try {
        data = await loadDictFile<DictEntry[]>(d.file);
        dictCache.current.set(d.id, data);
      } catch { return; }
    }
    setDictWords(data);
    setSource(d.id);
    persistSource(d.id);
    setReviewKeys(null); setIndex(0); setTyped(""); setWrongFlash(false);
    hadWrong.current = false; autoSpokenWord.current = null;
    setView("learn");
    setTimeout(() => input.current?.focus(), 40);
  }
  function selectFav() {
    setSource("fav"); persistSource("fav");
    setReviewKeys(null); setIndex(0); setTyped(""); setWrongFlash(false);
    hadWrong.current = false; autoSpokenWord.current = null;
    setView("learn"); setTimeout(() => input.current?.focus(), 40);
  }
  async function ensureAllDicts() {
    const need = dicts.filter(d => !allDicts[d.id]);
    if (!need.length) return;
    setGlobalLoading(true);
    const loaded: Record<string, DictEntry[]> = { ...allDicts };
    for (const d of dicts) {
      if (loaded[d.id]) continue;
      let data = dictCache.current.get(d.id);
      if (!data) { try { data = await loadDictFile<DictEntry[]>(d.file); dictCache.current.set(d.id, data); } catch { data = []; } }
      loaded[d.id] = data;
    }
    setAllDicts(loaded);
    setGlobalLoading(false);
  }
  function toggleGlobal() {
    const next = !globalSearch;
    setGlobalSearch(next);
    if (next) ensureAllDicts();
  }
  function gotoTrioWord(w: Word) {
    const gi = words.indexOf(w);
    if (gi < 0) return;
    pendingIndex.current = gi % 20;
    try { const m = JSON.parse(localStorage.getItem("lingotrio-chapters") || "{}"); m["trio:all"] = Math.floor(gi / 20); localStorage.setItem("lingotrio-chapters", JSON.stringify(m)); } catch { /* ignore */ }
    setGlobalSearch(false);
    setReviewKeys(null); setCategory("all"); setSource("trio"); persistSource("trio");
    setTyped(""); setWrongFlash(false); hadWrong.current = false; autoSpokenWord.current = null;
    setView("learn"); setTimeout(() => input.current?.focus(), 60);
  }
  async function gotoDictWord(dictId: string, key: string) {
    const d = dicts.find(x => x.id === dictId); if (!d) return;
    let data = dictCache.current.get(d.id) || allDicts[d.id];
    if (!data) { try { data = await loadDictFile<DictEntry[]>(d.file); dictCache.current.set(d.id, data); } catch { return; } }
    const gi = data.findIndex(e => e.name === key); if (gi < 0) return;
    pendingIndex.current = gi % 20;
    try { const m = JSON.parse(localStorage.getItem("lingotrio-chapters") || "{}"); m[d.id] = Math.floor(gi / 20); localStorage.setItem("lingotrio-chapters", JSON.stringify(m)); } catch { /* ignore */ }
    setGlobalSearch(false);
    setDictWords(data); setReviewKeys(null); setSource(d.id); persistSource(d.id);
    setTyped(""); setWrongFlash(false); hadWrong.current = false; autoSpokenWord.current = null;
    setView("learn"); setTimeout(() => input.current?.focus(), 60);
  }
  function jumpToItem(ix: number) {
    setReviewKeys(null); setIndex(Math.max(0, ix)); setTyped(""); setWrongFlash(false);
    hadWrong.current = false; autoSpokenWord.current = null; setView("learn");
    setTimeout(() => input.current?.focus(), 40);
  }
  function jumpToKey(key: string) {
    const ix = activeItems.findIndex(i => i.key === key);
    if (ix >= 0) { jumpToItem(ix); return; }
    const w = words.find(x => x.en === key);
    if (w) practiceWord(w);
  }
  function start() { setRunning(v => !v); setTimeout(() => input.current?.focus(), 20); }
  async function startReview() {
    let keys = await getDueKeys();
    if (!keys.length) keys = mistakes.slice();
    if (!keys.length) return;
    setReviewKeys(keys);
    setChapterFinished(false); setChDone(0);
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
  function changeReadingFilter(code: ReadingLang) {
    setReadingLang(code);
    const first = readings.find(pc => code === "all" || pc.lang === code);
    if (first && first.id !== readingId) chooseReading(first.id);
  }
  function chooseReading(id: string) {
    setReadingId(id); setReadingLine(0); setReadingTyped(""); setReadingSeconds(0); setReadingActive(false); setReadingDone(false);
    setTimeout(() => readingInput.current?.focus(), 30);
  }
  function submitReading(typedNow?: string) {
    readingAuto.current++;
    if ((typedNow ?? readingTyped) !== readingTarget) return;
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
      <button className="brand" onClick={() => setView("learn")} aria-label="KetikLab home"><span>KL</span><b>KetikLab</b></button>
      <nav>{NAV.map(item => <button key={item.id} className={view === item.id ? "nav active" : "nav"} onClick={() => setView(item.id)}><i>{item.icon}</i><span>{t[item.id]}</span>{item.id === "mistakes" && srs.due > 0 && <em className="nav-badge">{srs.due}</em>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="mini-progress"><span>{t.daily}<b>{Math.min(todayCount, 20)}/20</b></span><div><i style={{width:`${Math.min(todayCount/20*100,100)}%`}} /></div></div>
        <div className="profile"><span>S</span><div><b>Susi</b><small>Free learner</small></div><i>•••</i></div>
      </div>
    </aside>

    <main className="main">
      <header>
        <button className="chapter" onClick={() => setView("library")}><small>{t.choose}</small><b>{dictInfo ? dictInfo.name : ladder.broad ? TX("入门阶梯", "Tangga dasar", "Starter ladder", uiLang) : (category === "all" ? t.all : CATEGORY_META[category][uiLang])} · {reviewKeys ? learnItems.length : activeItems.length}</b></button>
        <div className="header-actions">
          <button className="round" onClick={() => setDark(v => !v)} aria-label="Dark mode">{dark ? "☀" : "☾"}</button>
          <label className="language"><span>文</span><select value={lang} onChange={e => changeLanguage(e.target.value as Lang)} aria-label={t.language}><option value="zh">中文</option><option value="id">Indonesia</option><option value="en">English</option></select></label>
          <button className={running ? "primary running" : "primary"} onClick={start}>{running ? t.pause : t.start}<span>→</span></button>
        </div>
      </header>

      {view === "learn" && <section className="learn-view">
        {reviewKeys && <div className="review-banner"><span>◎ {t.reviewing} · {learnItems.length}</span><button onClick={exitReview}>{t.exitReview}</button></div>}
        <div className="session-meta"><span><i className="live" />{running ? TX("专注模式", "MODE FOKUS", "FOCUS MODE", uiLang) : t.keyboard}</span>{!reviewKeys && <span className="chapter-nav"><button onClick={() => setChapterTo(chapterSafe - 1)} disabled={chapterSafe === 0} aria-label="Prev chapter">‹</button><select className="chapter-select" value={chapterSafe} onChange={e => setChapterTo(Number(e.target.value))} aria-label="Jump to chapter">{Array.from({ length: chapterCount }, (_, ci) => <option key={ci} value={ci}>{uiLang === "zh" ? `第 ${ci + 1} / ${chapterCount} 章` : uiLang === "id" ? `Bab ${ci + 1} / ${chapterCount}` : `Chapter ${ci + 1} / ${chapterCount}`}</option>)}</select><button onClick={() => setChapterTo(chapterSafe + 1)} disabled={chapterSafe >= chapterCount - 1} aria-label="Next chapter">›</button></span>}<b>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</b></div>
        <div className="mode-row"><span>{uiLang === "zh" ? "默写" : uiLang === "id" ? "Dikte" : "Dictation"}</span>{([["off", uiLang === "zh" ? "关" : uiLang === "id" ? "Mati" : "Off"], ["all", uiLang === "zh" ? "全隐藏" : uiLang === "id" ? "Semua" : "Hide all"], ["vowel", uiLang === "zh" ? "隐元音" : uiLang === "id" ? "Vokal" : "Vowels"], ["random", uiLang === "zh" ? "随机" : uiLang === "id" ? "Acak" : "Random"]] as ["off" | "all" | "vowel" | "random", string][]).map(([mode, label]) => <button key={mode} className={dictation === mode ? "active" : ""} onClick={() => { setDictation(mode); setTimeout(() => input.current?.focus(), 20); }}>{label}</button>)}{dictation !== "off" && <em>{uiLang === "zh" ? "TAB 显示答案" : uiLang === "id" ? "TAB lihat jawaban" : "TAB to peek"}</em>}</div>
        {!chapterFinished && <>
        <div className={practiceLang === "zh" ? "word-card zh-compact" : "word-card"} onClick={() => input.current?.focus()}>
          {!typingFocus && !zhLadder && <div className="type-veil" onClick={() => input.current?.focus()}><b>{uiLang === "zh" ? (running ? "按任意键继续" : "按任意键开始") : uiLang === "id" ? (running ? "Tekan tombol apa saja untuk lanjut" : "Tekan tombol apa saja untuk mulai") : (running ? "Press any key to continue" : "Press any key to start")}</b></div>}
          <div className="word-count">{String((index % learnItems.length) + 1).padStart(2,"0")} <span>/ {learnItems.length}</span></div>
          <button className={speakingWord === targetWord ? "sound speaking" : "sound"} onClick={e => { e.stopPropagation(); speak(); }} aria-label="Play pronunciation">▶</button>
          {speechBlocked && <button className="speech-unlock" onClick={e => { e.stopPropagation(); speechPrimed.current = false; setSpeechBlocked(false); speak(); }}>
            {uiLang === "zh" ? "点此启用发音" : uiLang === "id" ? "Ketuk untuk mengaktifkan suara" : "Tap to enable sound"}
          </button>}
          <button className={isFav ? "fav-btn on" : "fav-btn"} onClick={e => { e.stopPropagation(); toggleFav(); }} aria-label="Favorite">{isFav ? "★" : "☆"}</button>
          {loopTimes > 1 && <div className="loop-dots">{Array.from({ length: loopTimes }, (_, li) => <i key={li} className={li <= loopIx ? "on" : ""} />)}</div>}
          {!(practiceLang === "zh" && zhStep === "choose") && <h1 className={`target-word ${practiceLang === "zh" ? "zh" : practiceLang} ${wrongFlash ? "shake" : ""}`}>{targetWord.split("").map((letter,i)=><span key={i} className={`${typed[i] ? ((practiceLang === "zh" ? typed[i] === letter : typed[i].toLowerCase() === letter.toLowerCase()) ? "letter right" : "letter wrong") : "letter"}${letterVisible(i) ? "" : " masked"}`}>{letter === " " ? "\u00a0" : letter}</span>)}</h1>}
          {!zhLadder && <p className="phonetic">{item.sub}</p>}
          {practiceLang === "zh" && <div className="zh-ladder" onClick={e => e.stopPropagation()}>
            {ZH_STEPS.map(st => <button key={st.id} className={zhStep === st.id ? "on" : ""} onClick={() => { setZhStep(st.id); setTyped(""); }}>
              <i>{st.num}</i>{uiLang === "zh" ? st.zh : uiLang === "id" ? st.idn : st.en}
            </button>)}
          </div>}
          <div className="meanings">
            <span><small>{dictInfo ? "中文" : LANGUAGE_META[defLang].label}</small>{item.meaning}</span>
            {item.example && <span><small>{LANGUAGE_META[lang].example}</small>{item.example}</span>}
          </div>
          {zhLadder ? <ZhSteps
            step={zhStep}
            word={targetWord}
            toned={zhToned(zhMap, targetWord)}
            plain={zhPlain(zhMap, targetWord)}
            meaning={item.meaning}
            pool={zhPool}
            uiLang={uiLang}
            onPass={finishWord}
            onSkip={skipWord}
            onSpeak={() => speak()}
          /> : <>
          <input ref={input} key={practiceLang} lang={practiceLang === "zh" ? "zh-CN" : practiceLang} placeholder={practiceLang === "zh" ? "请用拼音输入" : ""} className={practiceLang === "zh" ? "ime-input" : "ghost-input"} value={practiceLang === "zh" ? undefined : typed} defaultValue="" onChange={e=>handleType(e.target.value)} onCompositionStart={()=>{ isComposing.current = true; }} onCompositionEnd={e=>{ isComposing.current = false; handleType(e.currentTarget.value); }} onKeyDown={handleGhostKeys} onKeyUp={e => { if (e.key === "Tab") setReveal(false); }} onFocus={()=>{ isComposing.current = false; setTypingFocus(true); setRunning(true); }} onBlur={()=>setTypingFocus(false)} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label={PROMPTS[uiLang][practiceLang]} />
          <p className="hint">{uiLang === "zh" ? <>直接敲键盘 <span>·</span> 打错整词重来 &nbsp;&nbsp; ENTER <span>·</span> 跳过 &nbsp;&nbsp; {"CTRL+SPACE"} <span>·</span> 重播发音</> : uiLang === "id" ? <>Langsung ketik <span>·</span> salah = ulang kata &nbsp;&nbsp; ENTER <span>·</span> lewati &nbsp;&nbsp; {"CTRL+SPACE"} <span>·</span> ulang suara</> : <>Just type <span>·</span> a mistake restarts the word &nbsp;&nbsp; ENTER <span>·</span> skip &nbsp;&nbsp; {"CTRL+SPACE"} <span>·</span> replay</>}</p>
          </>}
          {wrongCountWord >= 3 && <button className="skip-btn" onClick={e => { e.stopPropagation(); skipWord(); }}>{uiLang === "zh" ? "跳过这个词" : uiLang === "id" ? "Lewati kata ini" : "Skip this word"} →</button>}
        </div>
        <div className="prevnext"><span>‹ {prevItem && prevItem.key !== item.key ? prevItem.text : "—"}</span><span>{nextItem && nextItem.key !== item.key ? nextItem.text : "—"} ›</span></div>
        </>}
        {chapterFinished && <div className="reading-complete chapter-complete">
          <span>✓</span><small>{uiLang === "zh" ? "本章完成" : uiLang === "id" ? "BAB SELESAI" : "CHAPTER COMPLETE"}</small>
          <h2>{uiLang === "zh" ? `第 ${chapterSafe + 1} 章` : uiLang === "id" ? `Bab ${chapterSafe + 1}` : `Chapter ${chapterSafe + 1}`}</h2>
          <p>{uiLang === "zh" ? `${chDone} 个词 · ${chWrongKeys.length} 个错词` : uiLang === "id" ? `${chDone} kata · ${chWrongKeys.length} salah` : `${chDone} words · ${chWrongKeys.length} missed`}</p>
          <div><b>{Math.max(0, Math.round((chDone - chWrongKeys.length) / Math.max(chDone, 1) * 100))}%</b><small>{t.accuracy}</small><b>{String(Math.floor(chElapsed / 60)).padStart(2, "0")}:{String(chElapsed % 60).padStart(2, "0")}</b><small>{t.timeUsed}</small></div>
          {chWrongKeys.length > 0 && <div className="finish-wrong">{chWrongKeys.map(k => { const info = keyLookup.get(k); return <span key={k}><b>{info ? info.text : k}</b><small>{info ? info.meaning : ""}</small></span>; })}</div>}
          <div className="chapter-actions">
            <button onClick={retryChapter}>{uiLang === "zh" ? "重练本章" : uiLang === "id" ? "Ulangi bab" : "Retry chapter"}</button>
            {chWrongKeys.length > 0 && <button onClick={practiceChapterWrong}>{uiLang === "zh" ? `练习错词 (${chWrongKeys.length})` : uiLang === "id" ? `Latih kata salah (${chWrongKeys.length})` : `Practice missed (${chWrongKeys.length})`}</button>}
            <button className="go" onClick={nextChapter}>{uiLang === "zh" ? "下一章" : uiLang === "id" ? "Bab berikutnya" : "Next chapter"} →</button>
          </div>
        </div>}
        <div className="metrics">
          <Metric value={correct} label={t.words} accent="violet" />
          <Metric value={`${accuracy}%`} label={t.accuracy} accent="mint" />
          <Metric value={attempts ? Math.max(18, Math.round(correct/Math.max(seconds,1)*60)) : 0} label="WPM" accent="amber" />
          <Metric value={`${streakDays} ${t.day}`} label={t.streak} accent="blue" />
        </div>
      </section>}

      {view === "library" && <Panel title={t.library} eyebrow={EYEBROW.library[uiLang]}>
        <div className="library-section-title"><b>{uiLang === "zh" ? "KetikLab 三语精选" : uiLang === "id" ? "Pilihan Trilingual KetikLab" : "KetikLab Trilingual Collection"}</b><span>{words.length} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"}</span></div>{favorites.length > 0 && <button className={source === "fav" ? "fav-source active" : "fav-source"} onClick={selectFav}>★ {uiLang === "zh" ? "我的收藏" : uiLang === "id" ? "Favorit saya" : "My favorites"} · {favorites.length}</button>}
        <div className="category-tabs">
          {(["all","daily","business","indonesia","study"] as WordFilter[]).map(catItem => <button key={catItem} className={source === "trio" && category === catItem ? "active" : ""} onClick={() => selectTrio(catItem)}>{catItem === "all" ? t.all : CATEGORY_META[catItem][uiLang]}<small>{catItem === "all" ? words.length : words.filter(wordItem => wordItem.category === catItem).length}</small></button>)}
        </div>
        {dicts.length > 0 && <>
          <div className="library-section-title"><b>{uiLang === "zh" ? "考试词库 · 开源社区" : uiLang === "id" ? "Kamus Ujian · Komunitas" : "Exam Dictionaries · Community"}</b><span>{dicts.reduce((a, d) => a + d.length, 0)} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"}</span></div>
          <div className="dict-grid">
            {dicts.map(d => <button key={d.id} className={source === d.id ? "dict-card active" : "dict-card"} onClick={() => selectDict(d)}>
              <span className={`piece-language ${d.lang}`}>{d.lang === "id" ? "ID" : "EN"}</span>
              <div><b>{d.name}</b><p>{d.description}</p><small>{d.length} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"} · {uiLang === "zh" ? "中文释义" : "arti 中文"}</small></div>
              {source === d.id && <em>✓</em>}
            </button>)}
          </div>
        </>}
        <div className="toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={globalSearch ? (uiLang === "zh" ? "在全部词库中搜索…" : uiLang === "id" ? "Cari di semua kamus…" : "Search all libraries…") : t.search}/><button className={globalSearch ? "global-toggle on" : "global-toggle"} onClick={toggleGlobal}>🌐 {uiLang === "zh" ? "全部词库" : uiLang === "id" ? "Semua" : "All"}</button><span>{globalSearch ? (gq ? `${globalResults.length}${globalResults.length >= 240 ? "+" : ""}` : `${dicts.reduce((a, d) => a + d.length, 0) + words.length}`) : (dictInfo ? activeItems.filter(it => `${it.text} ${it.meaning}`.toLowerCase().includes(search.toLowerCase())).length : filtered.length)} {uiLang === "id" ? "kata" : uiLang === "zh" ? "个词" : "words"}</span></div>
        {globalSearch
          ? (globalLoading
              ? <div className="empty"><b>⏳</b><h3>{uiLang === "zh" ? "正在加载全部词库…" : uiLang === "id" ? "Memuat semua kamus…" : "Loading all libraries…"}</h3></div>
              : (!gq
                  ? <div className="empty"><b>🌐</b><h3>{uiLang === "zh" ? "输入关键词，在全部词库中搜索" : uiLang === "id" ? "Ketik untuk mencari di semua kamus" : "Type to search across all libraries"}</h3><p>{uiLang === "zh" ? "三语精选 + 6 个考试词库，共约 " + (words.length + dicts.reduce((a, d) => a + d.length, 0)) + " 词" : `${words.length + dicts.reduce((a, d) => a + d.length, 0)} words`}</p></div>
                  : (globalResults.length
                      ? <div className="word-grid">{globalResults.map((r, i) => <button className={`vocab-card ${r.lang === "zh" ? "zh" : r.lang}`} key={`${r.src}-${r.key}-${i}`} onClick={() => r.src === "trio" ? gotoTrioWord(words.find(w => w.en === r.key)!) : gotoDictWord(r.src, r.key)}><span className={`res-src ${r.lang}`}>{r.dictName || (uiLang === "zh" ? "精选" : "Trio")}</span><h3>{r.text}</h3><p>{r.sub}</p><div><b>{r.meaning}</b></div></button>)}</div>
                      : <div className="empty"><b>🔍</b><h3>{uiLang === "zh" ? "没有找到" : uiLang === "id" ? "Tidak ditemukan" : "No matches"}</h3></div>)))
          : dictInfo
          ? <div className="word-grid">{activeItems.map((it, ix) => ({ it, ix })).filter(({ it }) => `${it.text} ${it.meaning}`.toLowerCase().includes(search.toLowerCase())).slice(0, 300).map(({ it, ix }) => <button className={`vocab-card ${dictInfo.lang}`} key={`${it.key}-${ix}`} onClick={() => jumpToItem(ix)}><span>{String(ix + 1).padStart(3, "0")}</span><h3>{it.text}</h3><p>{it.sub}</p><em>{dictInfo.name}</em><div><b>{it.meaning}</b></div></button>)}</div>
          : <div className="word-grid">{filtered.slice(0, 300).map((w,i)=><button className={`vocab-card ${lang}`} key={w.en} onClick={()=>practiceWord(w)}><span>{String(i+1).padStart(3,"0")}</span><h3>{wordValue(w, lang)}</h3><p>{pronunciation(w, lang)}</p><em>{w.level} · {CATEGORY_META[w.category][uiLang]}</em><div><b>{w[defLang]}</b></div></button>)}</div>}
        <div className="source-note"><b>{uiLang === "zh" ? "词库来源" : uiLang === "id" ? "Sumber kosakata" : "Vocabulary sources"}</b><p>NGSL · Open English WordNet · Wordnet Bahasa · CC-CEDICT</p><span>{uiLang === "zh" ? "首批词条已经按三语概念对齐；重点词条将继续人工校对例句、拼音和音标。" : uiLang === "id" ? "Kosakata diselaraskan berdasarkan konsep dalam tiga bahasa dan akan terus ditinjau secara manual." : "Entries are aligned by concept across three languages and will continue through editorial review."}</span></div>
      </Panel>}

      {view === "mistakes" && <Panel title={t.mistakes} eyebrow={EYEBROW.mistakes[uiLang]}>
        <div className="review-summary"><Metric value={srs.due} label={t.due} accent="violet"/><Metric value={srs.mastered} label={t.mastered} accent="mint"/><Metric value={srs.learning} label={t.learning} accent="amber"/></div>
        <div className="review-cta"><div><b>{t.reviewHint}</b><small>{srs.total} {uiLang === "zh" ? "个词在复习计划中" : uiLang === "id" ? "kata dalam jadwal" : "words in schedule"}</small></div><button className={(srs.due || mistakes.length) ? "ready" : ""} disabled={!srs.due && !mistakes.length} onClick={startReview}>{t.startReview}{srs.due ? ` · ${srs.due}` : ""}</button></div>
        {dueEntries.length > 0 && <div className="library-section-title" style={{marginTop:0}}><b>{TX("错词本", "Buku kesalahan", "Words you missed", uiLang)}</b><span>{dueEntries.length}</span></div>}
        <div className="mistake-list">{dueEntries.length ? dueEntries.map((x,i)=><button key={x.key} onClick={()=>jumpToKey(x.key)}><span>{i+1}</span><b>{x.info.text}</b><em>{x.info.meaning}</em><i>{TX("练习 →", "Latih →", "Practice →", uiLang)}</i></button>) : <div className="empty"><b>✓</b><h3>{t.noDueTitle}</h3><p>{t.noDueNote}</p></div>}</div>
      </Panel>}

      {view === "articles" && <section className="reading-panel">
        <div className="reading-heading">
          <div><span>{EYEBROW.articles[uiLang]}</span><h1>{t.articles}</h1><p>{t.readingTagline}</p></div>
          <div className="reading-filters">
            {(["all","en","id","zh"] as ReadingLang[]).map(code => <button key={code} className={readingLang === code ? "active" : ""} onClick={() => changeReadingFilter(code)}>{code === "all" ? t.allReadings : code === "en" ? "English" : code === "id" ? "Indonesia" : "中文"}</button>)}
          </div>
        </div>

        <div className="reading-layout">
          <aside className="reading-library">
            <div className="reading-library-title"><b>{t.classics}</b><span>{readings.filter(piece => readingLang === "all" || piece.lang === readingLang).length} {t.pieces}</span></div>
            <div className="reading-list">
              {readingGroups.map(group => <div className="reading-group" key={group.label}>
                <div className="reading-group-head"><span>{group.label}</span><em>{group.items.length}</em></div>
                {group.items.map(piece => <button key={piece.id} className={piece.id === reading.id ? "active" : ""} onClick={() => chooseReading(piece.id)}>
                  <span className={`piece-language ${piece.lang}`}>{piece.lang === "en" ? "EN" : piece.lang === "id" ? "ID" : "中"}</span>
                  <div><small>{piece.genre} · {piece.era}</small><b>{piece.title}</b><em>{piece.author}</em></div>
                </button>)}
              </div>)}
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
                  <textarea ref={readingInput} value={readingTyped} onFocus={() => setReadingActive(true)} onChange={e => { const v = e.target.value.replace(/\n/g,""); setReadingTyped(v); if (v === readingTarget) { const tk = ++readingAuto.current; window.setTimeout(() => { if (readingAuto.current === tk) submitReading(v); }, 220); } }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); submitReading(); }}} placeholder={reading.lang === "zh" ? "照着上方文字输入……" : reading.lang === "id" ? "Ketik baris di atas…" : "Type the line above…"} spellCheck={false} />
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

      {view === "plan" && <Panel title={t.plan} eyebrow={EYEBROW.plan[uiLang]}>
        <div className="plan-layout"><div className="goal-card"><span>{t.finish}</span><strong>{Math.min(todayCount*5,100)}%</strong><div className="goal-ring" style={{"--p":`${Math.min(todayCount*5,100)*3.6}deg`} as React.CSSProperties}><b>{Math.min(todayCount,20)}</b><small>/20 words</small></div></div><div className="week">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=><div className={i<4?"done":i===4?"today":""} key={d}><span>{d}</span><b>{i<4?"✓":i===4?"12":"·"}</b><small>{i<4?"20 words":i===4?"of 20":"Rest"}</small></div>)}</div></div>
      </Panel>}

      {view === "stats" && <Panel title={t.stats} eyebrow={EYEBROW.stats[uiLang]}>
        <div className="stats-top"><Metric value={totalTyped} label={uiLang === "zh" ? "累计打词" : uiLang === "id" ? "Total kata" : "Total typed"} accent="violet"/><Metric value={`${streakDays} ${t.day}`} label={t.streak} accent="mint"/><Metric value={activeDays} label={uiLang === "zh" ? "学习天数" : uiLang === "id" ? "Hari aktif" : "Active days"} accent="amber"/><Metric value={srs.mastered} label={t.mastered} accent="blue"/></div>
        <div className="chart-card"><div><h3>{uiLang === "zh" ? "学习日历" : uiLang === "id" ? "Kalender belajar" : "Learning calendar"}</h3><p>{uiLang === "zh" ? "最近 13 周，颜色越深当天练得越多" : uiLang === "id" ? "13 minggu terakhir" : "Last 13 weeks — darker = more"}</p></div>
          <div className="heatmap">{Array.from({ length: 13 }, (_, wk) => <div key={wk} className="heat-col">{Array.from({ length: 7 }, (_, dy) => { const cell = heat[wk * 7 + dy]; return <i key={dy} className={`heat l${cell ? heatLevel(cell.count) : 0}`} title={cell ? `${cell.day}: ${cell.count}` : ""} />; })}</div>)}</div>
          <div className="heat-legend"><span>{uiLang === "zh" ? "少" : "less"}</span><i className="heat l0"/><i className="heat l1"/><i className="heat l2"/><i className="heat l3"/><i className="heat l4"/><span>{uiLang === "zh" ? "多" : "more"}</span></div>
        </div>
        <div className="chart-card"><div><h3>{uiLang === "zh" ? "最近 7 天" : uiLang === "id" ? "7 hari terakhir" : "Last 7 days"}</h3></div><div className="bars">{last7.map((d,i)=><span key={i}><i style={{height:`${Math.max(4, Math.round(d.count / last7max * 100))}%`}}/><small>{d.label}</small></span>)}</div></div>
        <div className="backup-row"><div><b>{uiLang === "zh" ? "进度备份" : uiLang === "id" ? "Cadangan progres" : "Backup progress"}</b><small>{uiLang === "zh" ? "导出成文件，换设备可导入恢复（含错词、复习、收藏、设置）" : uiLang === "id" ? "Ekspor & impor antar perangkat" : "Export / import across devices"}</small></div><div className="backup-btns"><button onClick={exportProgress}>{uiLang === "zh" ? "导出备份" : uiLang === "id" ? "Ekspor" : "Export"} ↓</button><label className="import-btn">{uiLang === "zh" ? "导入" : uiLang === "id" ? "Impor" : "Import"} ↑<input type="file" accept="application/json" onChange={e => { const f = e.target.files?.[0]; if (f) importProgress(f); }} /></label></div></div>
      </Panel>}

      {view === "settings" && <Panel title={t.settings} eyebrow={EYEBROW.settings[uiLang]}>
        <div className="settings-grid"><Setting title={MODAL_T[uiLang].title} detail={`${MODAL_T[uiLang].ui} + ${MODAL_T[uiLang].learn}`}><button onClick={()=>setShowLangSetup(true)}>{uiLang === "zh" ? "打开设置" : uiLang === "id" ? "Buka" : "Open"}</button></Setting><Setting title={TX("学习语言", "Bahasa belajar", "Learning language", uiLang)} detail="中文 · Bahasa Indonesia · English"><select value={lang} onChange={e=>changeLanguage(e.target.value as Lang)}><option value="zh">中文</option><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></Setting><Setting title={TX("主题", "Tema", "Theme", uiLang)} detail={TX("选择舒适的阅读模式", "Pilih mode yang nyaman", "Choose a comfortable reading mode", uiLang)}><button onClick={()=>setDark(v=>!v)}>{dark ? TX("浅色模式", "Mode terang", "Light mode", uiLang) : TX("深色模式", "Mode gelap", "Dark mode", uiLang)}</button></Setting><Setting title={TX("发音", "Pelafalan", "Pronunciation", uiLang)} detail={`${LANGUAGE_META[lang].label} · 0.8×`}><button onClick={()=>speak(targetWord,targetVoice)}>{TX("测试发音", "Tes suara", "Test sound", uiLang)} ▶</button></Setting><Setting title={uiLang === "zh" ? "键盘音效" : uiLang === "id" ? "Suara ketik" : "Keyboard sound"} detail={uiLang === "zh" ? "柔和 / 清脆 / 打字机 / 关" : "soft · crisp · typewriter · off"}><select value={soundProfile} onChange={e=>pickSound(e.target.value as SoundProfile)}><option value="soft">{uiLang==="zh"?"柔和":"Soft"}</option><option value="crisp">{uiLang==="zh"?"清脆":"Crisp"}</option><option value="typewriter">{uiLang==="zh"?"打字机":"Typewriter"}</option><option value="off">{uiLang==="zh"?"关闭":"Off"}</option></select></Setting><Setting title={uiLang === "zh" ? "每词重复" : uiLang === "id" ? "Ulang tiap kata" : "Repeat each word"} detail={uiLang === "zh" ? "连续打对几遍再进入下一个" : "times before next word"}><select value={loopTimes} onChange={e=>changeLoop(Number(e.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={3}>3×</option></select></Setting><Setting title={TX("学习数据", "Data belajar", "Learning data", uiLang)} detail={TX("仅保存在本设备", "Tersimpan di perangkat ini", "Stored privately on this device", uiLang)}><button onClick={()=>{setCorrect(0);setAttempts(0);setMistakes([]);resetAll().then(refreshSrs)}}>{TX("重置进度", "Reset progres", "Reset progress", uiLang)}</button></Setting></div>
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
