import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang, Word, WordCategory, ReadingPiece, DictEntry, DictInfo, PracticeItem } from "./types";
import { recordReview, getStats, getDueKeys, resetAll, getAllRecords, restoreRecords, type SrsStats } from "./srs";
import { keyClick, errorBeep, successChime, setSoundProfile, initSoundPref, type SoundProfile } from "./sounds";
import { Account } from "./Account";
import { onAccountWanted, SYNCED_KEYS } from "./cloud";
import { ZhSteps, ZH_STEPS, useZhMap, zhToned, zhPlain, zhLevel, zhMaxLevel, type ZhStep } from "./ZhSteps";

type View = "learn" | "library" | "mistakes" | "articles" | "plan" | "stats" | "member" | "account" | "settings";
type ReadingLang = "all" | "en" | "id" | "zh";
type WordFilter = "all" | WordCategory;
// a due word resolved to where it lives: the trio collection (in the language it
// was practised in) or one dictionary
type ReviewRef = { key: string; w: Word; lang: Lang } | { key: string; d: DictInfo; e: DictEntry };
// a practice item that also knows which language its gloss is in: a dictionary
// entry shows Indonesian when the interface is Indonesian and it has an idtrans,
// otherwise its Chinese (or, for a zh dictionary, English) gloss
type LearnItem = PracticeItem & { meaningLang?: Lang };

const DATA = import.meta.env.BASE_URL + "data/";

// Dictionary files ship flat under data/; data/dicts/ is the older layout kept as a
// fallback. Probing dicts/ first cost a 404 on every single load — one for the
// manifest on every page view, eleven more the first time the library opens.
function loadDictFile<T>(name: string): Promise<T> {
  const ok = (r: Response) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); };
  return fetch(DATA + name).then(ok).catch(() => fetch(DATA + "dicts/" + name).then(ok));
}
// What the practice input accepts per language. A headword that fails it (a hanzi
// row inside the Indonesian list) could never be completed, only skipped as a miss.
const TYPEABLE: Record<Lang, RegExp> = { zh: /^[㐀-鿿]+$/, id: /^[a-zA-Z0-9 '\-\.&]+$/, en: /^[a-zA-Z0-9 '\-\.&]+$/ };
const loadDict = (d: DictInfo) => loadDictFile<DictEntry[]>(d.file).then(data => data.filter(e => TYPEABLE[d.lang].test(e.name)));

const UI = {
  zh: { learn: "开始学习", library: "词库", mistakes: "间隔复习", articles: "阅读", plan: "学习计划", stats: "数据统计", member: "会员", settings: "设置", language: "语言", start: "开始", pause: "暂停", prompt: "输入上方中文词语", meaning: "三语释义", daily: "今日目标", streak: "连续学习", words: "已学词语", accuracy: "正确率", day: "天", chapter: "中文商务词汇 · 第 1 章", finish: "今日完成度", keyboard: "输入第一个汉字开始", choose: "选择词库", all: "全部分类", search: "搜索词语…", readingTagline: "读经典，照着输入，让文字经过眼睛，也经过手指。", allReadings: "全部", classics: "经典选集", pieces: "篇", readAll: "朗读全文", read: "朗读", lineLabel: "第几句", nextLine: "下一句", typingHelp: "红色字符需要修改；标点和大小写也要与原文一致。", completed: "已完成", completedNote: "你刚刚完整地输入了一篇经典作品。", characters: "字符", timeUsed: "用时", practiceAgain: "再练一次", loading: "正在加载词库…", due: "今日待复习", mastered: "已掌握", learning: "学习中", startReview: "开始复习", reviewing: "复习模式", exitReview: "退出复习", noDueTitle: "暂无到期复习", noDueNote: "继续在“开始学习”里练习。答对的词会按遗忘曲线拉长间隔，答错的词很快再次出现。", reviewHint: "按遗忘曲线：答对间隔变长，答错很快再见" },
  id: { learn: "Mulai Belajar", library: "Daftar Kata", mistakes: "Ulasan Berkala", articles: "Bacaan", plan: "Rencana Belajar", stats: "Statistik", member: "Anggota", settings: "Pengaturan", language: "Bahasa", start: "Mulai", pause: "Jeda", prompt: "Ketik kata bahasa Indonesia di atas", meaning: "Arti tiga bahasa", daily: "Target hari ini", streak: "Hari berturut-turut", words: "Kata dipelajari", accuracy: "Akurasi", day: "hari", chapter: "Kosakata Bisnis Indonesia · Bab 1", finish: "Progres hari ini", keyboard: "Ketik huruf pertama untuk mulai", choose: "Pilih daftar kata", all: "Semua kategori", search: "Cari kata…", readingTagline: "Baca karya klasik sambil mengetik, agar kata-katanya melewati mata dan jemari.", allReadings: "Semua", classics: "Koleksi klasik", pieces: "bacaan", readAll: "Bacakan seluruh teks", read: "Bacakan", lineLabel: "Baris", nextLine: "Baris berikutnya", typingHelp: "Perbaiki karakter merah; tanda baca dan huruf besar harus sama dengan teks asli.", completed: "Selesai", completedNote: "Kamu baru saja mengetik satu karya klasik secara lengkap.", characters: "karakter", timeUsed: "waktu", practiceAgain: "Latihan lagi", loading: "Memuat kosakata…", due: "Jatuh tempo hari ini", mastered: "Dikuasai", learning: "Dipelajari", startReview: "Mulai ulasan", reviewing: "Mode ulasan", exitReview: "Keluar", noDueTitle: "Belum ada ulasan jatuh tempo", noDueNote: "Terus berlatih di “Mulai Belajar”. Kata yang benar dijadwalkan makin jarang; yang salah muncul lagi segera.", reviewHint: "Kurva lupa: benar makin jarang, salah segera kembali" },
  en: { learn: "Start Learning", library: "Word Lists", mistakes: "Spaced Review", articles: "Reading", plan: "Study Plan", stats: "Statistics", member: "Membership", settings: "Settings", language: "Language", start: "Start", pause: "Pause", prompt: "Type the English word above", meaning: "Trilingual meaning", daily: "Daily goal", streak: "Study streak", words: "Words learned", accuracy: "Accuracy", day: "days", chapter: "Business English · Chapter 1", finish: "Today's progress", keyboard: "Press any letter key to start", choose: "Choose word list", all: "All categories", search: "Search words…", readingTagline: "Read the classics as you type, letting every line pass through your eyes and fingers.", allReadings: "All", classics: "Classic collection", pieces: "readings", readAll: "Read full text aloud", read: "Read aloud", lineLabel: "Line", nextLine: "Next line", typingHelp: "Correct the red characters; punctuation and capitalization must match the original.", completed: "Completed", completedNote: "You have typed an entire classic work.", characters: "characters", timeUsed: "time", practiceAgain: "Practice again", loading: "Loading vocabulary…", due: "Due today", mastered: "Mastered", learning: "Learning", startReview: "Start review", reviewing: "Review mode", exitReview: "Exit review", noDueTitle: "Nothing due yet", noDueNote: "Keep practicing in “Start Learning”. Correct words are scheduled further out; missed words return soon.", reviewHint: "Forgetting curve: correct spreads out, wrong returns soon" },
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

const NAV: { id: Exclude<View, "account">; icon: string }[] = [
  { id: "learn", icon: "⌨" }, { id: "library", icon: "▤" }, { id: "mistakes", icon: "◎" },
  { id: "articles", icon: "¶" }, { id: "plan", icon: "✓" }, { id: "stats", icon: "↗" }, { id: "settings", icon: "⚙" },
];

const EMPTY_STATS: SrsStats = { due: 0, learning: 0, mastered: 0, total: 0 };
const DAILY_GOAL = 20;
const CATEGORIES: WordFilter[] = ["all", "daily", "business", "indonesia", "study"];
// What a backup file may carry: the synced progress plus this device's own
// preferences. Never the Supabase session, the referrer code or the sync uid —
// a hand-made "backup" would otherwise sign the importer into someone else's account.
const BACKUP_KEYS = new Set([...SYNCED_KEYS, "ketiklab-category", "ketiklab-zh-step", "ketiklab-dark", "ketiklab-sound", "ketiklab-sound-profile"]);

// The single definition of what the learn view practises. The zh steps are a
// difficulty ladder: 认读 admits level 1, 打拼音 2, 选汉字 3, 输入法 everything.
// Navigation helpers resolve indexes against this same list, so a word opened
// from the library lands on itself rather than on whatever sits at that offset.
function buildLadder(all: Word[], zhMap: Record<string, string>, lang: Lang, step: ZhStep, cat: WordFilter) {
  const inCatAll = cat === "all" ? all : all.filter(item => item.category === cat);
  if (lang !== "zh" || step === "hanzi") return { list: inCatAll, broad: false };
  const cap = zhMaxLevel(step);
  const byLevel = (a: Word, b: Word) => zhLevel(zhMap, a.zh.split("；")[0]) - zhLevel(zhMap, b.zh.split("；")[0]);
  const inCat = inCatAll.filter(w => zhLevel(zhMap, w.zh.split("；")[0]) <= cap);
  if (inCat.length >= 20) return { list: inCat.slice().sort(byLevel), broad: false };
  const wide = all.filter(w => zhLevel(zhMap, w.zh.split("；")[0]) <= cap);
  if (wide.length < 20) return { list: inCatAll, broad: false };
  return { list: wide.slice().sort(byLevel), broad: true };
}

// A chapter position belongs to a rung: 商务工作 holds 53 words at 认读 and 590 at
// 输入法, so "第 3 章" is not the same 20 words in both.
const trioChapterKey = (cat: WordFilter, lang: Lang, step: ZhStep) =>
  `trio:${cat}${lang === "zh" && step !== "hanzi" ? ":" + step : ""}`;

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [readings, setReadings] = useState<ReadingPiece[]>([]);
  const [dataError, setDataError] = useState(false);
  const [dicts, setDicts] = useState<DictInfo[]>([]);
  const [dictsError, setDictsError] = useState(false);
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
  // ids whose file did not arrive on the last 🌐 load; they stay out of allDicts
  // so the next load tries them again instead of searching an empty list
  const [globalFailed, setGlobalFailed] = useState<string[]>([]);
  const [chapter, setChapter] = useState(0);
  const [chapterFinished, setChapterFinished] = useState(false);
  const [chDone, setChDone] = useState(0);
  const [chWrongKeys, setChWrongKeys] = useState<string[]>([]);
  const [chElapsed, setChElapsed] = useState(0);
  const [wrongCountWord, setWrongCountWord] = useState(0);
  const [dictation, setDictation] = useState<"off" | "all" | "vowel" | "random">("off");
  // "strict": a wrong key rolls the word back. "soft": wrong letters stay on screen
  // and BACKSPACE fixes them, which beginners need far more than the discipline.
  const [inputMode, setInputMode] = useState<"strict" | "soft">("strict");
  // No accounts yet, so the sidebar profile is whatever name this browser saved.
  const [profileName, setProfileName] = useState("");
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
  const [category, setCategory] = useState<WordFilter>(() => {
    try { const c = localStorage.getItem("ketiklab-category") || ""; return (CATEGORIES as string[]).includes(c) ? c as WordFilter : "business"; } catch { return "business"; }
  });
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [readingLang, setReadingLang] = useState<ReadingLang>("all");
  const [openReadingGroup, setOpenReadingGroup] = useState<string | null>(null);
  const [readingId, setReadingId] = useState("");
  const [readingLine, setReadingLine] = useState(0);
  const [readingTyped, setReadingTyped] = useState("");
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [readingActive, setReadingActive] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [srs, setSrs] = useState<SrsStats>(EMPTY_STATS);
  const [reviewKeys, setReviewKeys] = useState<string[] | null>(null);
  const [reviewRefs, setReviewRefs] = useState<ReviewRef[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const readingInput = useRef<HTMLTextAreaElement>(null);
  const autoSpokenWord = useRef<string | null>(null);
  const speechRequest = useRef(0);
  const autoAdvance = useRef(0);
  const readingAuto = useRef(0);
  const hadWrong = useRef(false);
  const dictCache = useRef(new Map<string, DictEntry[]>());
  // the 🌐 load in flight, so toggling the button off and on mid-load joins it
  // instead of fetching the same ten files a second time
  const globalLoad = useRef<Promise<void> | null>(null);
  const mounted = useRef(true);
  const chapterStart = useRef(Date.now());
  const pendingIndex = useRef<number | null>(null);
  // bumped by every choice of list; a dictionary fetch that was started for an
  // older choice sees the mismatch and drops its result instead of applying it
  const sourceReq = useRef(0);
  const isComposing = useRef(false);
  // set the moment a word is graded, cleared when its advance timer fires: keys
  // that land in that window must not grade the same word again or skip it
  const finishing = useRef(false);
  // a slip on any repetition of a looped word is its one lapse
  const lapseRecorded = useRef(false);
  const flashToken = useRef(0);
  const [sessionWords, setSessionWords] = useState(0);
  const cancelFlash = () => { flashToken.current++; setWrongFlash(false); };
  // every path that leaves the current word behind: drop the pending advance and
  // strict-mode flash timers so neither can act on the word that replaced it, and
  // start its repetitions, reveal and slip count from zero — the [index] effect
  // does the same but only fires when the index actually changes
  const resetWordRun = () => { autoAdvance.current++; finishing.current = false; hadWrong.current = false; lapseRecorded.current = false; cancelFlash(); setLoopIx(0); setReveal(false); setWrongCountWord(0); };
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
    try { const s = localStorage.getItem("ketiklab-zh-step"); return ZH_STEPS.some(st => st.id === s) ? s as ZhStep : "read"; } catch { return "read"; }
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

  // The exam libraries live behind manifest.json. Run at mount and again from the
  // retry button, so it cannot rely on the mount effect's own cleanup flag.
  function loadManifest() {
    setDictsError(false);
    loadDictFile<DictInfo[]>("manifest.json").then((m: DictInfo[]) => {
      if (!mounted.current) return;
      setDicts(m);
      // restore the previously selected dictionary — unless the learner has
      // already picked a list (sourceReq counts every such choice)
      try {
        const savedSource = localStorage.getItem("ketiklab-source");
        const d = savedSource && m.find(x => x.id === savedSource);
        if (d && !sourceReq.current) {
          loadDict(d).then((data: DictEntry[]) => {
            if (!mounted.current) return;
            dictCache.current.set(d.id, data);
            // the learner may have picked another list while this loaded
            if (sourceReq.current) return;
            setDictWords(data);
            setSource(d.id);
          }).catch(() => {});
        }
      } catch { /* ignore */ }
    }).catch(() => { if (mounted.current) setDictsError(true); });
  }

  // Load content (words + readings) as JSON at runtime so the app bundle stays
  // small and the content can grow hourly without a code change.
  useEffect(() => {
    let alive = true;
    mounted.current = true;
    Promise.all([
      fetch(DATA + "words.json").then(r => r.json()),
      fetch(DATA + "readings.json").then(r => r.json()),
    ]).then(([w, r]: [Word[], ReadingPiece[]]) => {
      if (!alive) return;
      setWords(w);
      setReadings(r);
      if (r.length) setReadingId(r[0].id);
    }).catch(() => { if (alive) setDataError(true); });
    loadManifest();
    { const sp = initSoundPref(); setSoundProfileState(sp.profile); }
    try { const lp = Number(localStorage.getItem("ketiklab-loop")); if (lp >= 1 && lp <= 5) setLoopTimes(lp); } catch { /* ignore */ }
    // stored values are shape-checked: a hand-edited backup that put "{}" here would
    // otherwise throw at favorites.some(...) on every load until site data is cleared
    try {
      const f = JSON.parse(localStorage.getItem("ketiklab-fav") || "[]");
      const favs: PracticeItem[] = Array.isArray(f) ? f.filter((x: unknown) => !!x && typeof x === "object" && typeof (x as PracticeItem).key === "string" && typeof (x as PracticeItem).text === "string" && typeof (x as PracticeItem).lang === "string") : [];
      setFavorites(favs);
      // "fav" is not a manifest id, so the dictionary restore above never matches it
      if (favs.length && localStorage.getItem("ketiklab-source") === "fav") setSource("fav");
    } catch { /* ignore */ }
    try { if (localStorage.getItem("ketiklab-dark") === "1") setDark(true); } catch { /* ignore */ }
    try { if (localStorage.getItem("ketiklab-input") === "soft") setInputMode("soft"); } catch { /* ignore */ }
    try { setProfileName(localStorage.getItem("ketiklab-name") || ""); } catch { /* ignore */ }
    try {
      const dc: unknown = JSON.parse(localStorage.getItem("ketiklab-days") || "{}");
      const clean: Record<string, number> = {};
      if (dc && typeof dc === "object" && !Array.isArray(dc)) for (const [k, n] of Object.entries(dc)) if (typeof n === "number") clean[k] = n;
      setDayCounts(clean);
    } catch { /* ignore */ }
    return () => { alive = false; mounted.current = false; };
  }, []);

  const refreshSrs = () => { getStats().then(setSrs).catch(() => {}); };
  useEffect(() => { refreshSrs(); }, []);

  // language preferences: restore on first load; show the setup modal on first visit
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ketiklab-langs");
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
    try {
      const saved = localStorage.getItem("ketiklab-state");
      if (saved) { const v = JSON.parse(saved); setCorrect(Number(v?.correct) || 0); setAttempts(Number(v?.attempts) || 0); setMistakes(Array.isArray(v?.mistakes) ? v.mistakes.filter((k: unknown) => typeof k === "string") : []); }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { localStorage.setItem("ketiklab-state", JSON.stringify({ correct, attempts, mistakes })); } catch { /* ignore */ } }, [correct, attempts, mistakes]);
  useEffect(() => { if (!running) return; const timer = setInterval(() => setSeconds(s => s + 1), 1000); return () => clearInterval(timer); }, [running]);
  // the reading state outlives the reading panel, so the clock must stop when the learner leaves it
  useEffect(() => { if (!readingActive || readingDone || view !== "articles") return; const timer = setInterval(() => setReadingSeconds(s => s + 1), 1000); return () => clearInterval(timer); }, [readingActive, readingDone, view]);

  const activeWords = useMemo(() => category === "all" ? words : words.filter(item => item.category === category), [category, words]);
  const ladder = useMemo(() => buildLadder(words, zhMap, lang, zhStep, category), [words, zhMap, lang, zhStep, category]);
  const ladderWords = ladder.list;
  // the rung admits fewer words than the category holds, and the library still
  // lists all of them — say so instead of printing the narrowed number alone
  const ladderNarrowed = source === "trio" && !ladder.broad && ladderWords.length < activeWords.length;
  const filtered = useMemo(() => activeWords.filter(w => `${w.en} ${w.id} ${w.zh}`.toLowerCase().includes(search.toLowerCase())), [activeWords, search]);
  const wordByEn = useMemo(() => new Map(words.map(w => [w.en, w])), [words]);


  const sourceKey = source === "trio" ? trioChapterKey(category, lang, zhStep) : source;

  // restore chapter per source, and reset the chapter run when switching source/category
  useEffect(() => {
    let saved = 0;
    try { saved = Math.max(0, Math.floor(Number(JSON.parse(localStorage.getItem("ketiklab-chapters") || "{}")[sourceKey]) || 0)); } catch { /* ignore */ }
    setChapter(saved);
    setChapterFinished(false); setChDone(0); setChWrongKeys([]); setWrongCountWord(0);
    chapterStart.current = Date.now();
    if (pendingIndex.current != null) { setIndex(pendingIndex.current); pendingIndex.current = null; }
    else setIndex(0);
    setTyped("");
    resetWordRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  useEffect(() => { setWrongCountWord(0); setReveal(false); setLoopIx(0); hadWrong.current = false; lapseRecorded.current = false; }, [index]);
  useEffect(() => { try { localStorage.setItem("ketiklab-days", JSON.stringify(dayCounts)); } catch { /* ignore */ } }, [dayCounts]);
  useEffect(() => { try { localStorage.setItem("ketiklab-dark", dark ? "1" : "0"); } catch { /* ignore */ } }, [dark]);
  useEffect(() => { try { localStorage.setItem("ketiklab-fav", JSON.stringify(favorites)); } catch { /* ignore */ } }, [favorites]);
  useEffect(() => { try { localStorage.setItem("ketiklab-input", inputMode); } catch { /* ignore */ } }, [inputMode]);
  useEffect(() => { try { localStorage.setItem("ketiklab-name", profileName); } catch { /* ignore */ } }, [profileName]);
  useEffect(() => { try { localStorage.setItem("ketiklab-category", category); } catch { /* ignore */ } }, [category]);
  // a password-reset link, a sign-up confirmation link and the reload that follows a
  // cloud restore all land on the home view; cloud.ts asks for the account panel
  useEffect(() => onAccountWanted(() => setView("account")), []);

  // readings gates too: readings[0] is dereferenced unguarded below, and both
  // files resolve from the same Promise.all, so requiring both costs nothing.
  const ready = words.length > 0 && readings.length > 0;

  if (!ready) {
    return <div className={dark ? "app dark" : "app"}>
      <div className="loading-screen">
        <span className="loading-mark">KL</span>
        <p>{dataError ? TX("内容加载失败，请刷新页面重试。", "Gagal memuat konten. Muat ulang halaman untuk mencoba lagi.", "Couldn't load content. Please reload the page to try again.", uiLang) : t.loading}</p>
      </div>
    </div>;
  }

  const dictInfo = source !== "trio" && source !== "fav" && dictWords ? dicts.find(d => d.id === source) || null : null;
  // manifest rows carry a Chinese name and description plus optional Indonesian
  // and English ones; a row the generators wrote without them shows the Chinese
  const dictName = (d: DictInfo) => (uiLang === "id" ? d.name_id : uiLang === "en" ? d.name_en : undefined) || d.name;
  const dictDesc = (d: DictInfo) => (uiLang === "id" ? d.description_id : uiLang === "en" ? d.description_en : undefined) || d.description;
  // No branch may yield an empty list: `item` is dereferenced unguarded below.
  // ladderWords cannot be empty here — `ready` means words.json loaded.
  const dictItem = (d: DictInfo, e: DictEntry): LearnItem => {
    const useId = uiLang === "id" && !!e.idtrans && e.idtrans.length > 0;
    return {
      key: e.name,
      text: e.name,
      sub: d.lang === "zh"
        ? (e.usphone ? `普通话 · ${e.usphone}` : "普通话")
        : e.usphone ? `American English · /${e.usphone}/` : (d.lang === "id" ? "Bahasa Indonesia" : "English"),
      meaning: useId && e.idtrans ? e.idtrans.join("; ") : e.trans.join("；"),
      example: e.def || undefined,
      voice: d.lang === "id" ? "id-ID" : d.lang === "zh" ? "zh-CN" : "en-US",
      lang: d.lang,
      dict: dictName(d),
      meaningLang: useId ? "id" : d.lang === "zh" ? "en" : "zh",
    };
  };
  const trioItem = (w: Word, lg: Lang = lang): LearnItem => {
    const raw = wordValue(w, lg);
    // "full (after eating)": the gloss tells the library entries apart, but it is
    // not part of what gets typed — it moves next to the pronunciation instead
    const gloss = lg === "zh" ? undefined : raw.match(/\s*\(([^)]*)\)\s*$/)?.[1];
    return {
      key: w.en,
      text: gloss ? raw.replace(/\s*\([^)]*\)\s*$/, "") : raw,
      sub: (lg === "zh" && zhToned(zhMap, wordValue(w, "zh"))
        ? `普通话 · ${zhToned(zhMap, wordValue(w, "zh"))}`
        : pronunciation(w, lg)) + (gloss ? ` · (${gloss})` : ""),
      meaning: w[fixDef(lg, defLang)],
      example: w.examples?.[lg] as string | undefined,
      voice: LANGUAGE_META[lg].voice,
      lang: lg,
      meaningLang: fixDef(lg, defLang),
    };
  };
  const activeItems: LearnItem[] = source === "fav" && favorites.length
    ? favorites
    : (dictInfo && dictWords && dictWords.length)
    ? dictWords.map(e => dictItem(dictInfo, e))
    : ladderWords.map(w => trioItem(w));
  // Due keys span every category, rung and dictionary. Intersecting them with the
  // current list practised 4 of 47 due words — or, when none overlapped, fell back to
  // an ordinary chapter while still calling it review. Practise the due words themselves.
  const reviewItems = reviewKeys ? reviewRefs.map(r => "w" in r ? trioItem(r.w, r.lang) : dictItem(r.d, r.e)) : null;
  // both library grids stop at 300 cards; the counter above them used to report the
  // full match count, so the list just ended with nothing saying it had been cut
  const LIB_CAP = 300;
  const libMatches = dictInfo
    ? activeItems.filter(it => `${it.text} ${it.meaning}`.toLowerCase().includes(search.toLowerCase())).length
    : filtered.length;
  const chapterCount = Math.max(1, Math.ceil(activeItems.length / 20));
  const chapterSafe = Math.min(chapter, chapterCount - 1);
  const chapterItems = activeItems.slice(chapterSafe * 20, chapterSafe * 20 + 20);
  const learnItems = (reviewItems && reviewItems.length) ? reviewItems : (chapterItems.length ? chapterItems : activeItems);
  const item = learnItems[index % Math.max(learnItems.length, 1)] || learnItems[0];
  const practiceLang: Lang = (item && item.lang) || lang;
  // one identity for favourites, the 错词本 and the SRS row: the Indonesian "air"
  // and the English "air" are different words and must not share progress
  const wordId = item ? `${item.lang}:${item.key}` : "";
  const isFav = favorites.some(f => `${f.lang}:${f.key}` === wordId);
  const prevItem = learnItems[(index - 1 + learnItems.length) % Math.max(learnItems.length, 1)];
  const nextItem = learnItems[(index + 1) % Math.max(learnItems.length, 1)];
  const targetWord = item.text;
  // a favourite saved before items carried meaningLang: a dictionary word glosses
  // in Chinese (English for a zh dictionary), a trio word in the definition language
  const meaningLang: Lang = item.meaningLang ?? (item.dict ? (item.lang === "zh" ? "en" : "zh") : defLang);
  // 975 trio first senses have no zh-pinyin entry; the ladder filters them out but
  // favourites do not, so fall back to the word's own (toned) pinyin
  const trioW = item.dict ? undefined : wordByEn.get(item.key);
  const zhToneText = zhToned(zhMap, targetWord) || trioW?.pinyin || "";
  const plainPy = zhPlain(zhMap, targetWord) || trioW?.pinyin || "";
  // a word with no pinyin at all cannot be passed at 打拼音, so that rung types it through the IME
  const zhLadder = practiceLang === "zh" && zhStep !== "hanzi" && (zhStep !== "pinyin" || !!plainPy);
  // 选汉字 distractors: hanzi only, and enough of them — a favourites list holds a
  // few zh words next to English and Indonesian ones
  const zhOwn = Array.from(new Set(learnItems.filter(i => i.lang === "zh").map(i => i.text)));
  const zhPool = zhOwn.length >= 4 ? zhOwn : zhOwn.concat(ladderWords.concat(words).map(w => wordValue(w, "zh")).filter(z => z && !zhOwn.includes(z)).slice(0, 40));
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
  const goalPct = Math.min(Math.round(todayCount / DAILY_GOAL * 100), 100);
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
  // "<lang>:<key>" → the trio word in that language, else a loaded dictionary of that language
  const splitId = (id: string): [Lang, string] => { const i = id.indexOf(":"); return i < 0 ? [lang, id] : [id.slice(0, i) as Lang, id.slice(i + 1)]; };
  function lookupKey(id: string): { text: string; meaning: string } | undefined {
    const [lg, key] = splitId(id);
    const w = wordByEn.get(key);
    if (w) return { text: wordValue(w, lg), meaning: w[fixDef(lg, defLang)] };
    for (const d of dicts) {
      if (d.lang !== lg) continue;
      const e = dictCache.current.get(d.id)?.find(x => x.name === key);
      if (e) return { text: e.name, meaning: e.trans.join("；") };
    }
    return undefined;
  }
  const dueEntries: { key: string; info: { text: string; meaning: string } }[] = view === "mistakes" && !reviewKeys
    ? mistakes.map(k => ({ key: k, info: lookupKey(k) })).filter(x => x.info) as { key: string; info: { text: string; meaning: string } }[]
    : [];
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
  let globalTotal = 0;
  if (globalSearch && gq) {
    for (const w of words) {
      const text = wordValue(w, lang); const meaning = w[defLang];
      if (`${w.en} ${w.id} ${w.zh} ${meaning}`.toLowerCase().includes(gq)) globalResults.push({ src: "trio", key: w.en, text, sub: pronunciation(w, lang), meaning, lang, rank: rankMatch(text + " " + w.en, meaning, gq) });
    }
    for (const d of dicts) {
      const data = allDicts[d.id]; if (!data) continue;
      for (const e of data) {
        const meaning = e.trans.join("；");
        if (e.name.toLowerCase().includes(gq) || meaning.toLowerCase().includes(gq)) globalResults.push({ src: d.id, key: e.name, text: e.name, sub: e.usphone ? `/${e.usphone}/` : "", meaning, lang: d.lang, dictName: dictName(d), rank: rankMatch(e.name, meaning, gq) });
      }
    }
    globalResults.sort((a, b) => a.rank - b.rank || a.text.length - b.text.length);
    globalTotal = globalResults.length;
    globalResults.length = Math.min(globalResults.length, 240);
  }
  // what 🌐 can actually search: the trio list plus the dictionaries whose file
  // arrived, not the manifest total that used to be shown even after a failed load
  const searchable = dicts.filter(d => allDicts[d.id]);
  const globalCount = words.length + searchable.reduce((a, d) => a + d.length, 0);

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
    // a review answer is not part of the chapter's tally, or the summary after
    // 退出复习 counts words from other lists
    if (!reviewKeys) { setChDone(n => n + 1); if (wasWrong) setChWrongKeys(k => Array.from(new Set([...k, wordId]))); }
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
    if (finishing.current) return;
    finishing.current = true;
    successChime();
    setRunning(true);
    const cleanRun = !hadWrong.current;
    const lastRep = loopIx + 1 >= loopTimes;
    // one review per word, not per repetition: a slip on any repetition is the
    // lapse, logged as soon as it happens; a clean answer counts once the loop is
    // done. 认读 only shows the word, so it is not a recall and schedules none.
    const recognizeOnly = practiceLang === "zh" && zhStep === "read";
    if (!cleanRun && !lapseRecorded.current) { lapseRecorded.current = true; recordReview(wordId, false).then(refreshSrs).catch(() => {}); }
    else if (lastRep && cleanRun && !recognizeOnly) recordReview(wordId, true).then(refreshSrs).catch(() => {});
    if (lastRep) { setAttempts(n => n + 1); if (cleanRun) setCorrect(n => n + 1); setSessionWords(n => n + 1); bumpToday(); }
    const token = ++autoAdvance.current;
    // repeat the same word loopTimes before moving on (reference "loop word" mode)
    if (!lastRep) {
      window.setTimeout(() => {
        if (autoAdvance.current !== token) return;
        finishing.current = false;
        setTyped(""); setLoopIx(n => n + 1);
        setTimeout(() => input.current?.focus(), 20);
      }, 320);
      return;
    }
    window.setTimeout(() => {
      if (autoAdvance.current !== token) return;
      finishing.current = false;
      setTyped(""); setLoopIx(0);
      const wasWrong = hadWrong.current;
      hadWrong.current = false; lapseRecorded.current = false;
      advanceOrFinishChapter(wasWrong);
    }, 320);
  }
  function toggleFav() {
    if (!item) return;
    if (!isFav) { setFavorites(list => [{ key: item.key, text: item.text, sub: item.sub, meaning: item.meaning, example: item.example, voice: item.voice, lang: item.lang, dict: item.dict }, ...list].slice(0, 500)); return; }
    const remaining = favorites.filter(f => `${f.lang}:${f.key}` !== wordId);
    setFavorites(remaining);
    if (source !== "fav") return;
    // the next favourite slides into this slot: nothing typed so far belongs to it
    if (!reviewKeys) { setTyped(""); resetWordRun(); autoSpokenWord.current = null; }
    // an empty favourites list would fall back to the ladder while still labelled 我的收藏
    if (!remaining.length) { sourceReq.current++; setSource("trio"); persistSource("trio"); }
  }
  function changeLoop(n: number) {
    setLoopTimes(n); setLoopIx(0);
    try { localStorage.setItem("ketiklab-loop", String(n)); } catch { /* ignore */ }
    setTimeout(() => input.current?.focus(), 20);
  }
  function pickSound(pf: SoundProfile) {
    setSoundProfileState(pf); setSoundProfile(pf);
    if (pf !== "off") keyClick();
  }
  async function exportProgress() {
    const reviews = await getAllRecords().catch(() => []);
    const payload = {
      app: "ketiklab", version: 1, exportedAt: new Date().toISOString().slice(0, 19),
      local: Object.fromEntries(Object.keys(localStorage).filter(k => BACKUP_KEYS.has(k)).map(k => [k, localStorage.getItem(k)])),
      reviews,
    };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ketiklab-backup-${todayStr(0)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function importProgress(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data.app !== "ketiklab") throw new Error("bad file");
        if (data.local && typeof data.local === "object") for (const [k, v] of Object.entries(data.local)) if (BACKUP_KEYS.has(k) && typeof v === "string") localStorage.setItem(k, v);
        if (Array.isArray(data.reviews)) await restoreRecords(data.reviews).catch(() => {});
        window.location.reload();
      } catch { alert(TX("导入失败：文件格式不对", "Impor gagal: format file tidak valid", "Import failed: invalid file", uiLang)); }
    };
    reader.readAsText(file);
  }
  function skipWord() {
    if (finishing.current) return;
    if (!lapseRecorded.current) recordReview(wordId, false).then(refreshSrs).catch(() => {});
    resetWordRun();
    setAttempts(n => n + 1);
    setMistakes(m => Array.from(new Set([wordId, ...m])).slice(0, 30));
    setTyped("");
    advanceOrFinishChapter(true);
  }
  function setChapterTo(n: number) {
    const target = Math.max(0, Math.min(n, chapterCount - 1));
    sourceReq.current++;
    setChapter(target);
    try {
      const m = JSON.parse(localStorage.getItem("ketiklab-chapters") || "{}");
      m[sourceKey] = target;
      localStorage.setItem("ketiklab-chapters", JSON.stringify(m));
    } catch { /* ignore */ }
    setChapterFinished(false); setChDone(0); setChWrongKeys([]); setWrongCountWord(0);
    chapterStart.current = Date.now();
    setIndex(0); setTyped(""); resetWordRun(); autoSpokenWord.current = null;
    setTimeout(() => input.current?.focus(), 30);
  }
  function retryChapter() { setChapterTo(chapterSafe); }
  function nextChapter() { setChapterTo(chapterSafe + 1 >= chapterCount ? 0 : chapterSafe + 1); }
  function practiceChapterWrong() {
    if (!chWrongKeys.length) return;
    const keys = chWrongKeys.slice();
    // the review list is built from refs, so resolve the missed words the same way a due list is
    resolveReviewRefs(keys).then(refs => {
      if (!refs.length) return;
      setReviewRefs(refs); setReviewKeys(keys);
      setChapterFinished(false); setChDone(0);
      setIndex(0); setTyped(""); resetWordRun(); autoSpokenWord.current = null;
      setRunning(true);
      setTimeout(() => input.current?.focus(), 30);
    }).catch(() => {});
  }
  function handleType(raw: string) {
    if (finishing.current || wrongFlash) return;
    if (isComposing.current) return; // ignore mid-IME-composition (Chinese pinyin etc.)
    // Never let the buffer grow past the target: extra keystrokes are simply
    // ignored, the way every other typing trainer behaves.
    const clean = (practiceLang === "zh"
      ? raw.replace(/[^㐀-鿿]/g, "")
      : raw.replace(/[^a-zA-Z0-9 '\-\.&]/g, "")).slice(0, targetWord.length);
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
    } else if (inputMode === "soft") {
      // Soft mode: keep what was typed, mark the bad letters red, let BACKSPACE
      // undo them. Only count one mistake per word so the stats stay meaningful.
      errorBeep();
      if (!hadWrong.current) {
        hadWrong.current = true;
        setWrongCountWord(n => n + 1);
        setMistakes(m => Array.from(new Set([wordId, ...m])).slice(0, 30));
      }
      setTyped(clean);
    } else {
      errorBeep();
      hadWrong.current = true;
      setTyped(clean);
      setWrongFlash(true);
      const firstError = wrongCountWord === 0;
      setWrongCountWord(n => n + 1);
      setMistakes(m => Array.from(new Set([wordId, ...m])).slice(0, 30));
      // graded forgiveness: full restart only on a short word's first slip;
      // otherwise keep the correct prefix so long words / phrases / repeat errors
      // don't force retyping everything from scratch.
      let k = 0;
      while (k < expected.length && k < current.length && expected[k] === current[k]) k++;
      const fullReset = firstError && targetWord.length <= 8;
      // the timer belongs to this word: a skip or a jump in the meantime
      // invalidates it, or the old prefix would be written over the new word
      const tok = ++flashToken.current;
      window.setTimeout(() => {
        if (flashToken.current !== tok) return;
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
    try { localStorage.setItem("ketiklab-langs", JSON.stringify({ ui, learn, def })); } catch { /* ignore */ }
  }
  function fixDef(learn: Lang, preferred: Lang): Lang {
    return preferred !== learn ? preferred : learn === "zh" ? "en" : "zh";
  }
  function changeLanguage(nextLanguage: Lang) {
    const nextDef = fixDef(nextLanguage, defLang);
    setLang(nextLanguage);
    setDefLang(nextDef);
    setTyped(""); resetWordRun();
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
      setTyped(""); resetWordRun();
      autoSpokenWord.current = null;
      setSpeakingWord(null);
    }
    persistLangs(ui, learn, finalDef);
    setShowLangSetup(false);
  }
  function changeCategory(nextCategory: WordFilter) {
    sourceReq.current++; pendingIndex.current = null;
    setReviewKeys(null);
    setCategory(nextCategory);
    setIndex(0);
    setTyped("");
    setSearch("");
    resetWordRun();
    autoSpokenWord.current = null;
  }
  function persistSource(id: string) {
    try { localStorage.setItem("ketiklab-source", id); } catch { /* ignore */ }
  }
  function selectTrio(nextCategory: WordFilter) {
    setSource("trio");
    persistSource("trio");
    changeCategory(nextCategory);
  }
  async function selectDict(d: DictInfo) {
    setSearch("");
    const req = ++sourceReq.current;
    let data = dictCache.current.get(d.id);
    if (!data) {
      try {
        data = await loadDict(d);
        dictCache.current.set(d.id, data);
      } catch { return; }
      if (req !== sourceReq.current) return;
    }
    pendingIndex.current = null;
    setDictWords(data);
    setSource(d.id);
    persistSource(d.id);
    setReviewKeys(null); setIndex(0); setTyped(""); resetWordRun();
    autoSpokenWord.current = null;
    setView("learn");
    setTimeout(() => input.current?.focus(), 40);
  }
  function selectFav() {
    sourceReq.current++; pendingIndex.current = null;
    setSource("fav"); persistSource("fav");
    setReviewKeys(null); setIndex(0); setTyped(""); resetWordRun();
    autoSpokenWord.current = null;
    setView("learn"); setTimeout(() => input.current?.focus(), 40);
  }
  // A file that fails is left out of allDicts (never stored as []), so the next
  // call fetches it again and gotoDictWord / resolveReviewRefs still fetch on demand.
  function ensureAllDicts(): Promise<void> {
    if (globalLoad.current) return globalLoad.current;
    const need = dicts.filter(d => !allDicts[d.id]);
    if (!need.length) return Promise.resolve();
    setGlobalLoading(true); setGlobalFailed([]);
    const run = (async () => {
      const loaded: Record<string, DictEntry[]> = {};
      const failed: string[] = [];
      for (const d of need) {
        let data = dictCache.current.get(d.id);
        if (!data) { try { data = await loadDict(d); dictCache.current.set(d.id, data); } catch { failed.push(d.id); continue; } }
        loaded[d.id] = data;
      }
      if (!mounted.current) return;
      // the closure's allDicts is as old as the click that started this load
      setAllDicts(prev => ({ ...prev, ...loaded }));
      setGlobalFailed(failed);
      setGlobalLoading(false);
    })().finally(() => { globalLoad.current = null; });
    globalLoad.current = run;
    return run;
  }
  function toggleGlobal() {
    const next = !globalSearch;
    setGlobalSearch(next);
    if (next) ensureAllDicts();
  }
  function writeChapter(key: string, ch: number) {
    try { const m = JSON.parse(localStorage.getItem("ketiklab-chapters") || "{}"); m[key] = ch; localStorage.setItem("ketiklab-chapters", JSON.stringify(m)); } catch { /* ignore */ }
  }
  // Land on position gi of the list that is already open. The learn view shows one
  // 20-word chapter, so a whole-list index has to become chapter + offset; and since
  // sourceKey does not change, the restore effect will not re-fire to do it.
  function moveWithinList(gi: number) {
    const ch = Math.floor(gi / 20);
    writeChapter(sourceKey, ch); setChapter(ch);
    setChapterFinished(false); setChDone(0); setChWrongKeys([]); setWrongCountWord(0);
    chapterStart.current = Date.now();
    pendingIndex.current = null;
    setIndex(gi % 20);
  }
  // Opening a word harder than the current rung is an explicit request for that
  // word, so climb to the step that holds it instead of landing somewhere else.
  function stepForWord(w: Word, lg: Lang = lang): ZhStep {
    if (lg !== "zh" || zhStep === "hanzi") return zhStep;
    const level = zhLevel(zhMap, w.zh.split("；")[0]);
    if (level <= zhMaxLevel(zhStep)) return zhStep;
    const next = ZH_STEPS.find(st => zhMaxLevel(st.id) >= level);
    const step: ZhStep = next ? next.id : "hanzi";
    setZhStep(step);
    return step;
  }
  function gotoTrioWord(w: Word) {
    const step = stepForWord(w);
    const gi = buildLadder(words, zhMap, lang, step, "all").list.findIndex(x => x.en === w.en);
    if (gi < 0) return;
    sourceReq.current++;
    const key = trioChapterKey("all", lang, step);
    if (source === "trio" && key === sourceKey) moveWithinList(gi);
    else { pendingIndex.current = gi % 20; writeChapter(key, Math.floor(gi / 20)); }
    setGlobalSearch(false);
    setReviewKeys(null); setCategory("all"); setSource("trio"); persistSource("trio");
    setTyped(""); resetWordRun(); autoSpokenWord.current = null;
    setView("learn"); setTimeout(() => input.current?.focus(), 60);
  }
  async function gotoDictWord(dictId: string, key: string) {
    const d = dicts.find(x => x.id === dictId); if (!d) return;
    const req = ++sourceReq.current;
    let data = dictCache.current.get(d.id) || allDicts[d.id];
    if (!data) { try { data = await loadDict(d); dictCache.current.set(d.id, data); } catch { return; } }
    if (req !== sourceReq.current) return;
    const gi = data.findIndex(e => e.name === key); if (gi < 0) return;
    if (source === d.id) moveWithinList(gi);
    else { pendingIndex.current = gi % 20; writeChapter(d.id, Math.floor(gi / 20)); }
    setGlobalSearch(false);
    setDictWords(data); setReviewKeys(null); setSource(d.id); persistSource(d.id);
    setTyped(""); resetWordRun(); autoSpokenWord.current = null;
    setView("learn"); setTimeout(() => input.current?.focus(), 60);
  }
  function jumpToItem(ix: number) {
    sourceReq.current++;
    moveWithinList(Math.max(0, ix));
    setReviewKeys(null); setTyped(""); resetWordRun();
    autoSpokenWord.current = null; setView("learn");
    setTimeout(() => input.current?.focus(), 40);
  }
  function jumpToKey(id: string) {
    const ix = activeItems.findIndex(i => `${i.lang}:${i.key}` === id);
    if (ix >= 0) { jumpToItem(ix); return; }
    const [lg, key] = splitId(id);
    const w = wordByEn.get(key);
    if (w) { if (lg !== lang) changeLanguage(lg); practiceWord(w, lg); return; }
    for (const d of dicts) if (d.lang === lg && dictCache.current.get(d.id)?.some(e => e.name === key)) { gotoDictWord(d.id, key); return; }
  }
  function start() { setRunning(v => !v); setTimeout(() => input.current?.focus(), 20); }
  // Keys are "<lang>:<word key>". Within a language an English key can still exist
  // both in the trio collection and in an English dictionary: prefer the dictionary
  // being practised, then the trio collection, then the other dictionaries in
  // manifest order.
  async function resolveReviewRefs(keys: string[]): Promise<ReviewRef[]> {
    const found = new Map<string, ReviewRef>();
    const scan = (d: DictInfo, data: DictEntry[]) => {
      const byName = new Map(data.map(e => [e.name, e]));
      for (const k of keys) {
        const [lg, name] = splitId(k);
        if (lg !== d.lang || found.has(k)) continue;
        const e = byName.get(name); if (e) found.set(k, { key: k, d, e });
      }
    };
    if (dictInfo && dictWords) scan(dictInfo, dictWords);
    for (const k of keys) { const [lg, en] = splitId(k); const w = wordByEn.get(en); if (w && !found.has(k)) found.set(k, { key: k, w, lang: lg }); }
    for (const d of dicts) {
      if (found.size === keys.length) break;
      if (!keys.some(k => !found.has(k) && splitId(k)[0] === d.lang)) continue;
      let data = dictCache.current.get(d.id) || allDicts[d.id];
      if (!data) { try { data = await loadDict(d); dictCache.current.set(d.id, data); } catch { continue; } }
      scan(d, data);
    }
    return keys.map(k => found.get(k)).filter((r): r is ReviewRef => !!r);
  }
  async function startReview() {
    let keys = await getDueKeys();
    if (!keys.length) keys = mistakes.slice();
    if (!keys.length) return;
    const refs = await resolveReviewRefs(keys);
    if (!refs.length) return;
    sourceReq.current++;
    setReviewRefs(refs);
    setReviewKeys(keys);
    setChapterFinished(false); setChDone(0); setChWrongKeys([]);
    setIndex(0); setTyped(""); resetWordRun(); autoSpokenWord.current = null;
    setView("learn"); setRunning(true);
    setTimeout(() => input.current?.focus(), 40);
  }
  // the chapter restarts at word 1, so its tally and clock restart with it
  function exitReview() {
    setReviewKeys(null);
    setChapterFinished(false); setChDone(0); setChWrongKeys([]);
    chapterStart.current = Date.now();
    setIndex(0); setTyped(""); resetWordRun(); autoSpokenWord.current = null;
  }
  function practiceWord(w: Word, lg: Lang = lang) {
    setReviewKeys(null);
    const cat: WordFilter = category === "all" || w.category === category ? category : w.category;
    const step = stepForWord(w, lg);
    // index into the list the learn view consumes, not the unfiltered category:
    // it slices 20 at a time, so an index taken from a 590-long list landed on
    // whatever sat at that offset inside the current chapter
    const gi = buildLadder(words, zhMap, lg, step, cat).list.findIndex(x => x.en === w.en);
    if (gi < 0) return;
    sourceReq.current++;
    const key = trioChapterKey(cat, lg, step);
    if (source === "trio" && key === sourceKey) moveWithinList(gi);
    else {
      pendingIndex.current = gi % 20;
      writeChapter(key, Math.floor(gi / 20));
      if (cat !== category) setCategory(cat);
      if (source !== "trio") { setSource("trio"); persistSource("trio"); }
    }
    setTyped(""); resetWordRun(); autoSpokenWord.current = null; setView("learn");
  }
  function resetProgress() {
    if (!window.confirm(TX("确定清除全部学习进度？此操作无法撤销（可先在数据统计页导出备份）", "Hapus semua progres? Tidak bisa dibatalkan (ekspor cadangan dulu di halaman statistik)", "Erase all progress? This cannot be undone (export a backup from Stats first)", uiLang))) return;
    setCorrect(0); setAttempts(0); setMistakes([]); setDayCounts({}); setSessionWords(0);
    try { localStorage.removeItem("ketiklab-chapters"); } catch { /* ignore */ }
    if (reviewKeys) exitReview();
    setChapterTo(0);
    resetAll().then(refreshSrs).catch(() => {});
  }
  function changeReadingFilter(code: ReadingLang) {
    setReadingLang(code);
    setOpenReadingGroup(null);
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

  return <div className={`app${dark ? " dark" : ""}${running && view === "learn" ? " focused" : ""}`}>
    <aside className="sidebar">
      <button className="brand" onClick={() => setView("learn")} aria-label="KetikLab home"><span>KL</span><b>KetikLab</b></button>
      <nav>{NAV.map(item => <button key={item.id} className={view === item.id ? "nav active" : "nav"} title={t[item.id]} aria-label={t[item.id]} onClick={() => setView(item.id)}><i>{item.icon}</i><span>{t[item.id]}</span>{item.id === "mistakes" && srs.due > 0 && <em className="nav-badge">{srs.due}</em>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="mini-progress"><span>{t.daily}<b>{Math.min(todayCount, DAILY_GOAL)}/{DAILY_GOAL}</b></span><div><i style={{width:`${Math.min(todayCount / DAILY_GOAL * 100, 100)}%`}} /></div></div>
        <button className="profile" onClick={() => setView("account")} title={TX("账号", "Akun", "Account", uiLang)}>
          <span>{(profileName.trim()[0] || "?").toUpperCase()}</span>
          <div><b>{profileName.trim() || TX("学习者", "Pelajar", "Learner", uiLang)}</b><small>{TX("账号与同步", "Akun & sinkron", "Account & sync", uiLang)}</small></div>
          <i>›</i>
        </button>
      </div>
    </aside>

    <main className="main">
      <header>
        <button className="chapter" onClick={() => setView("library")}><small>{t.choose}</small><b>{dictInfo ? dictName(dictInfo) : source === "fav" ? TX("我的收藏", "Favorit saya", "My favorites", uiLang) : ladder.broad ? TX("入门阶梯", "Tangga dasar", "Starter ladder", uiLang) : (category === "all" ? t.all : CATEGORY_META[category][uiLang])} · {reviewKeys ? learnItems.length : activeItems.length}{ladderNarrowed ? ` / ${activeWords.length}` : ""}</b></button>
        <div className="header-actions">
          <button className="round" onClick={() => setDark(v => !v)} aria-label="Dark mode">{dark ? "☀" : "☾"}</button>
          <label className="language"><span>文</span><select value={lang} onChange={e => changeLanguage(e.target.value as Lang)} aria-label={t.language}><option value="zh">中文</option><option value="id">Indonesia</option><option value="en">English</option></select></label>
          <button className={running ? "primary running" : "primary"} onClick={start}>{running ? t.pause : t.start}<span>→</span></button>
        </div>
      </header>

      {view === "learn" && <section className="learn-view">
        {reviewKeys && <div className="review-banner"><span>◎ {reviewItems && reviewItems.length ? `${t.reviewing} · ${reviewItems.length}${reviewKeys.length > reviewItems.length ? ` / ${reviewKeys.length}` : ""}` : TX("本列表没有到期的复习词", "Tidak ada kata jatuh tempo di daftar ini", "Nothing due in this list", uiLang)}</span><button onClick={exitReview}>{t.exitReview}</button></div>}
        <div className="session-meta"><span><i className="live" />{running ? TX("专注模式", "MODE FOKUS", "FOCUS MODE", uiLang) : t.keyboard}</span>{!reviewKeys && <span className="chapter-nav"><button onClick={() => setChapterTo(chapterSafe - 1)} disabled={chapterSafe === 0} aria-label="Prev chapter">‹</button><select className="chapter-select" value={chapterSafe} onChange={e => setChapterTo(Number(e.target.value))} aria-label="Jump to chapter">{Array.from({ length: chapterCount }, (_, ci) => <option key={ci} value={ci}>{uiLang === "zh" ? `第 ${ci + 1} / ${chapterCount} 章` : uiLang === "id" ? `Bab ${ci + 1} / ${chapterCount}` : `Chapter ${ci + 1} / ${chapterCount}`}</option>)}</select><button onClick={() => setChapterTo(chapterSafe + 1)} disabled={chapterSafe >= chapterCount - 1} aria-label="Next chapter">›</button></span>}<b>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</b></div>
        <div className="mode-row"><span className="mode-group"><span>{uiLang === "zh" ? "默写" : uiLang === "id" ? "Dikte" : "Dictation"}</span>{([["off", uiLang === "zh" ? "关" : uiLang === "id" ? "Mati" : "Off"], ["all", uiLang === "zh" ? "全隐藏" : uiLang === "id" ? "Semua" : "Hide all"], ["vowel", uiLang === "zh" ? "隐元音" : uiLang === "id" ? "Vokal" : "Vowels"], ["random", uiLang === "zh" ? "随机" : uiLang === "id" ? "Acak" : "Random"]] as ["off" | "all" | "vowel" | "random", string][]).map(([mode, label]) => <button key={mode} className={dictation === mode ? "active" : ""} onClick={() => { setDictation(mode); setTimeout(() => input.current?.focus(), 20); }}>{label}</button>)}{dictation !== "off" && <em>{uiLang === "zh" ? "TAB 显示答案" : uiLang === "id" ? "TAB lihat jawaban" : "TAB to peek"}</em>}</span><span className="mode-sep" /><span className="mode-group"><span>{uiLang === "zh" ? "纠错" : uiLang === "id" ? "Koreksi" : "Correction"}</span>{([["strict", TX("自动回退", "Mundur otomatis", "Auto rollback", uiLang)], ["soft", uiLang === "zh" ? "退格改错" : uiLang === "id" ? "Backspace" : "Backspace"]] as ["strict" | "soft", string][]).map(([mode, label]) => <button key={mode} className={inputMode === mode ? "active" : ""} onClick={() => { setInputMode(mode); setTyped(""); cancelFlash(); setTimeout(() => input.current?.focus(), 20); }}>{label}</button>)}{inputMode === "soft" && <em>{uiLang === "zh" ? "打错不清空，按退格改" : uiLang === "id" ? "Salah? tekan Backspace" : "Backspace to fix"}</em>}</span></div>
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
          {practiceLang === "zh" && (zhStep === "read" || zhStep === "choose") &&
            <p className={zhStep === "choose" ? "zh-annot solo" : "zh-annot"}
               onClick={e => { e.stopPropagation(); speak(); }}>{zhToneText || "—"}</p>}
          {!(practiceLang === "zh" && zhStep === "choose") && <h1 className={`target-word ${practiceLang === "zh" ? "zh" : practiceLang} ${wrongFlash ? "shake" : ""}`}>{targetWord.split("").map((letter,i)=><span key={i} className={`${typed[i] ? ((practiceLang === "zh" ? typed[i] === letter : typed[i].toLowerCase() === letter.toLowerCase()) ? "letter right" : "letter wrong") : "letter"}${letterVisible(i) ? "" : " masked"}`}>{letter === " " ? "\u00a0" : letter}</span>)}</h1>}
          {!zhLadder && <p className="phonetic">{item.sub}</p>}
          {practiceLang === "zh" && <div className="zh-ladder" onClick={e => e.stopPropagation()}>
            {ZH_STEPS.map(st => <button key={st.id} className={zhStep === st.id ? "on" : ""} onClick={() => { setZhStep(st.id); setTyped(""); resetWordRun(); }}>
              <i>{st.num}</i>{uiLang === "zh" ? st.zh : uiLang === "id" ? st.idn : st.en}
            </button>)}
          </div>}
          <div className="meanings">
            <span><small>{LANGUAGE_META[meaningLang].label}</small>{item.meaning}</span>
            {item.example && <span><small>{item.dict ? (uiLang === "zh" ? "英文释义" : uiLang === "id" ? "Definisi Inggris" : "English definition") : LANGUAGE_META[lang].example}</small>{item.example}</span>}
          </div>
          {zhLadder ? <ZhSteps
            key={`${wordId}:${loopIx}`}
            step={zhStep}
            word={targetWord}
            plain={plainPy}
            pool={zhPool}
            uiLang={uiLang}
            active={!showLangSetup}
            onPass={finishWord}
            onSkip={skipWord}
            onMiss={() => { if (finishing.current || hadWrong.current) return; hadWrong.current = true; setWrongCountWord(n => n + 1); setMistakes(m => Array.from(new Set([wordId, ...m])).slice(0, 30)); }}
            onSpeak={() => speak()}
          /> : <>
          <input ref={input} key={practiceLang} lang={practiceLang === "zh" ? "zh-CN" : practiceLang} placeholder={practiceLang === "zh" ? "请用拼音输入" : ""} className={practiceLang === "zh" ? "ime-input" : "ghost-input"} value={practiceLang === "zh" ? undefined : typed} defaultValue="" onChange={e=>handleType(e.target.value)} onCompositionStart={()=>{ isComposing.current = true; }} onCompositionEnd={e=>{ isComposing.current = false; handleType(e.currentTarget.value); }} onKeyDown={handleGhostKeys} onKeyUp={e => { if (e.key === "Tab") setReveal(false); }} onFocus={()=>{ isComposing.current = false; setTypingFocus(true); setRunning(true); }} onBlur={()=>setTypingFocus(false)} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label={PROMPTS[uiLang][practiceLang]} />
          <p className="hint">{TX("直接敲键盘", "Langsung ketik", "Just type", uiLang)} <span>·</span> {inputMode === "soft" ? TX("打错按退格改", "salah? tekan Backspace", "Backspace fixes a mistake", uiLang) : TX("打错自动回退", "salah = mundur otomatis", "a mistake rolls back", uiLang)} &nbsp;&nbsp; ENTER <span>·</span> {TX("跳过", "lewati", "skip", uiLang)} &nbsp;&nbsp; {"CTRL+SPACE"} <span>·</span> {TX("重播发音", "ulang suara", "replay", uiLang)}</p>
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
          {chWrongKeys.length > 0 && <div className="finish-wrong">{chWrongKeys.map(k => { const info = lookupKey(k); return <span key={k}><b>{info ? info.text : k}</b><small>{info ? info.meaning : ""}</small></span>; })}</div>}
          <div className="chapter-actions">
            <button onClick={retryChapter}>{uiLang === "zh" ? "重练本章" : uiLang === "id" ? "Ulangi bab" : "Retry chapter"}</button>
            {chWrongKeys.length > 0 && <button onClick={practiceChapterWrong}>{uiLang === "zh" ? `练习错词 (${chWrongKeys.length})` : uiLang === "id" ? `Latih kata salah (${chWrongKeys.length})` : `Practice missed (${chWrongKeys.length})`}</button>}
            <button className="go" onClick={nextChapter}>{uiLang === "zh" ? "下一章" : uiLang === "id" ? "Bab berikutnya" : "Next chapter"} →</button>
          </div>
        </div>}
        <div className="metrics">
          <Metric value={correct} label={t.words} accent="violet" />
          <Metric value={`${accuracy}%`} label={t.accuracy} accent="mint" />
          <Metric value={sessionWords && seconds ? Math.round(sessionWords / seconds * 60) : 0} label="WPM" accent="amber" />
          <Metric value={`${streakDays} ${t.day}`} label={t.streak} accent="blue" />
        </div>
      </section>}

      {view === "library" && <Panel title={t.library} eyebrow={EYEBROW.library[uiLang]}>
        <div className="library-section-title"><b>{uiLang === "zh" ? "KetikLab 三语精选" : uiLang === "id" ? "Pilihan Trilingual KetikLab" : "KetikLab Trilingual Collection"}</b><span>{words.length} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"}</span></div>{favorites.length > 0 && <button className={source === "fav" ? "fav-source active" : "fav-source"} onClick={selectFav}>★ {uiLang === "zh" ? "我的收藏" : uiLang === "id" ? "Favorit saya" : "My favorites"} · {favorites.length}</button>}
        <div className="category-tabs">
          {CATEGORIES.map(catItem => <button key={catItem} className={source === "trio" && category === catItem ? "active" : ""} onClick={() => selectTrio(catItem)}>{catItem === "all" ? t.all : CATEGORY_META[catItem][uiLang]}<small>{catItem === "all" ? words.length : words.filter(wordItem => wordItem.category === catItem).length}</small></button>)}
        </div>
        {dictsError && <div className="review-banner"><span>⚠ {TX("考试词库加载失败", "Kamus ujian gagal dimuat", "Exam libraries failed to load", uiLang)}</span><button onClick={loadManifest}>{TX("重试", "Coba lagi", "Retry", uiLang)}</button></div>}
        {dicts.length > 0 && <>
          <div className="library-section-title"><b>{TX("考试词库", "Kamus ujian", "Exam libraries", uiLang)}</b><span>{dicts.reduce((a, d) => a + d.length, 0)} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"}</span></div>
          <div className="dict-grid">
            {dicts.map(d => <button key={d.id} className={source === d.id ? "dict-card active" : "dict-card"} onClick={() => selectDict(d)}>
              <span className={`piece-language ${d.lang}`}>{d.lang === "id" ? "ID" : d.lang === "zh" ? "中" : "EN"}</span>
              <div><b>{dictName(d)}</b><p>{dictDesc(d)}</p><small>{d.length} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"} · {d.lang === "zh" ? TX("英文 / 印尼语释义", "arti Inggris / Indonesia", "EN / ID glosses", uiLang) : d.lang === "en" && uiLang === "id" ? "arti Mandarin / Indonesia" : TX("中文释义", "arti Mandarin", "Chinese glosses", uiLang)}</small></div>
              {source === d.id && <em>✓</em>}
            </button>)}
          </div>
        </>}
        <div className="toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={globalSearch ? (uiLang === "zh" ? "在全部词库中搜索…" : uiLang === "id" ? "Cari di semua kamus…" : "Search all libraries…") : t.search}/><button className={globalSearch ? "global-toggle on" : "global-toggle"} onClick={toggleGlobal}>🌐 {TX("全部词库", "Semua kamus", "All libraries", uiLang)}</button><span>{globalSearch ? (globalLoading ? "…" : gq ? `${globalResults.length}${globalTotal > globalResults.length ? "+" : ""}` : `${globalCount}`) : (libMatches > LIB_CAP ? `${LIB_CAP} / ${libMatches}` : libMatches)} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"}</span></div>
        {globalSearch && !globalLoading && globalFailed.length > 0 && <div className="review-banner"><span>⚠ {TX(`有 ${globalFailed.length} 个词库加载失败，搜索不包含它们`, `${globalFailed.length} kamus gagal dimuat dan tidak ikut dicari`, `${globalFailed.length} ${globalFailed.length === 1 ? "library" : "libraries"} failed to load and can't be searched`, uiLang)}</span><button onClick={() => { ensureAllDicts(); }}>{TX("重试", "Coba lagi", "Retry", uiLang)}</button></div>}
        {globalSearch
          ? (globalLoading
              ? <div className="empty"><b>⏳</b><h3>{uiLang === "zh" ? "正在加载全部词库…" : uiLang === "id" ? "Memuat semua kamus…" : "Loading all libraries…"}</h3></div>
              : (!gq
                  ? <div className="empty"><b>🌐</b><h3>{uiLang === "zh" ? "输入关键词，在全部词库中搜索" : uiLang === "id" ? "Ketik untuk mencari di semua kamus" : "Type to search across all libraries"}</h3><p>{TX(`三语精选 + ${searchable.length} 个考试词库，共 ${globalCount} 词`, `Pilihan trilingual + ${searchable.length} kamus ujian · ${globalCount} kata`, `Trilingual collection + ${searchable.length} exam libraries · ${globalCount} words`, uiLang)}</p></div>
                  : (globalResults.length
                      ? <div className="word-grid">{globalResults.map((r, i) => <button className={`vocab-card ${r.lang === "zh" ? "zh" : r.lang}`} key={`${r.src}-${r.key}-${i}`} onClick={() => r.src === "trio" ? gotoTrioWord(words.find(w => w.en === r.key)!) : gotoDictWord(r.src, r.key)}><span className={`res-src ${r.lang}`}>{r.dictName || (uiLang === "zh" ? "精选" : "Trio")}</span><h3>{r.text}</h3><p>{r.sub}</p><div><b>{r.meaning}</b></div></button>)}</div>
                      : <div className="empty"><b>🔍</b><h3>{uiLang === "zh" ? "没有找到" : uiLang === "id" ? "Tidak ditemukan" : "No matches"}</h3></div>)))
          : dictInfo
          ? <div className="word-grid">{activeItems.map((it, ix) => ({ it, ix })).filter(({ it }) => `${it.text} ${it.meaning}`.toLowerCase().includes(search.toLowerCase())).slice(0, LIB_CAP).map(({ it, ix }) => <button className={`vocab-card ${dictInfo.lang}`} key={`${it.key}-${ix}`} onClick={() => jumpToItem(ix)}><span>{String(ix + 1).padStart(3, "0")}</span><h3>{it.text}</h3><p>{it.sub}</p><em>{dictName(dictInfo)}</em><div><b>{it.meaning}</b></div></button>)}</div>
          : <div className="word-grid">{filtered.slice(0, LIB_CAP).map((w,i)=><button className={`vocab-card ${lang}`} key={w.en} onClick={()=>practiceWord(w)}><span>{String(i+1).padStart(3,"0")}</span><h3>{wordValue(w, lang)}</h3><p>{pronunciation(w, lang)}</p><em>{w.level} · {CATEGORY_META[w.category][uiLang]}</em><div><b>{w[defLang]}</b></div></button>)}</div>}
        <div className="source-note"><b>{uiLang === "zh" ? "词库来源" : uiLang === "id" ? "Sumber kosakata" : "Vocabulary sources"}</b><p><a href={DATA + "SOURCES.md"} target="_blank" rel="noreferrer">Open English WordNet · Chinese Open Wordnet · Wordnet Bahasa · wordfreq · CMUdict · pypinyin</a></p><span>{uiLang === "zh" ? "各词库的具体来源与授权见上方链接；其中托福词表取自第三方备考材料，未获再分发授权。" : uiLang === "id" ? "Sumber dan lisensi tiap kamus ada di tautan di atas; daftar TOEFL berasal dari materi pihak ketiga tanpa izin distribusi." : "Per-library sources and licences are linked above; the TOEFL list comes from third-party material with no redistribution licence."}</span></div>
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
              {readingGroups.map(group => {
                const open = openReadingGroup === group.label;
                return <div className={open ? "reading-group open" : "reading-group"} key={group.label}>
                  <button type="button" className="reading-group-head" aria-expanded={open} onClick={() => setOpenReadingGroup(open ? null : group.label)}>
                    <span>{group.label}</span><em>{group.items.length}<i className="reading-chevron">▾</i></em>
                  </button>
                  {open && <div className="reading-group-items">
                    {group.items.map(piece => <button key={piece.id} className={piece.id === reading.id ? "active" : ""} onClick={() => chooseReading(piece.id)}>
                      <span className={`piece-language ${piece.lang}`}>{piece.lang === "en" ? "EN" : piece.lang === "id" ? "ID" : "中"}</span>
                      <div><small>{piece.genre} · {piece.era}</small><b>{piece.title}</b><em>{piece.author}</em></div>
                    </button>)}
                  </div>}
                </div>;
              })}
            </div>
          </aside>

          <article className="typing-reader">
            <div className="reader-top">
              <div><span>{reading.genre} · {reading.era}</span><h2>{reading.title}</h2><p>{reading.author}</p></div>
              <button onClick={() => speak(reading.lines.join(" "), reading.lang === "zh" ? "zh-CN" : reading.lang === "id" ? "id-ID" : "en-US")} aria-label={t.readAll}>▶ <span>{t.read}</span></button>
            </div>

            {!readingDone ? <>
              <div className="passage-preview">
                {reading.lines.map((line, i) => <p key={`${reading.id}-${i}`} className={i < readingLine ? "complete" : i === readingLine ? "current" : "waiting"}>{i < readingLine ? <span>✓</span> : <span>{String(i + 1).padStart(2,"0")}</span>}{line}</p>)}
              </div>
              <div className="line-practice">
                <div className="line-meta"><span>{t.lineLabel} {readingLine + 1} / {reading.lines.length}</span><b>{readingAccuracy}% {t.accuracy}</b></div>
                <div className={`target-line ${reading.lang}`}>
                  {readingTarget.split("").map((character, i) => <span key={`${character}-${i}`} className={readingTyped[i] ? (readingTyped[i] === character ? "right" : "wrong") : i === readingTyped.length ? "cursor" : ""}>{character}</span>)}
                </div>
                <div className="reading-input-wrap">
                  <textarea ref={readingInput} value={readingTyped} onFocus={() => setReadingActive(true)} onChange={e => { const v = e.target.value.replace(/\n/g,""); setReadingTyped(v); if (v === readingTarget) { const tk = ++readingAuto.current; window.setTimeout(() => { if (readingAuto.current === tk) submitReading(v); }, 220); } }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); submitReading(); }}} placeholder={reading.lang === "zh" ? "照着上方文字输入……" : reading.lang === "id" ? "Ketik baris di atas…" : "Type the line above…"} spellCheck={false} />
                  <button className={readingTyped === readingTarget ? "ready" : ""} onClick={() => submitReading()} disabled={readingTyped !== readingTarget}>{t.nextLine} <span>↵</span></button>
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
        <div className="plan-layout">
          <div className="goal-card"><span>{t.finish}</span><strong>{goalPct}%</strong><div className="goal-ring" style={{"--p":`${goalPct*3.6}deg`} as React.CSSProperties}><b>{Math.min(todayCount, DAILY_GOAL)}</b><small>/{DAILY_GOAL} {TX("词", "kata", "words", uiLang)}</small></div></div>
          <div className="week">{last7.map((d, i) => <div className={i === 6 ? "today" : d.count >= DAILY_GOAL ? "done" : ""} key={i}><span>{d.label}</span><b>{i === 6 ? d.count : d.count >= DAILY_GOAL ? "✓" : (d.count || "·")}</b><small>{i === 6 ? `/${DAILY_GOAL}` : d.count ? `${d.count} ${TX("词", "kata", "words", uiLang)}` : TX("未练", "Kosong", "None", uiLang)}</small></div>)}</div>
        </div>
      </Panel>}

      {view === "stats" && <Panel title={t.stats} eyebrow={EYEBROW.stats[uiLang]}>
        <div className="stats-top"><Metric value={totalTyped} label={uiLang === "zh" ? "累计打词" : uiLang === "id" ? "Total kata" : "Total typed"} accent="violet"/><Metric value={`${streakDays} ${t.day}`} label={t.streak} accent="mint"/><Metric value={activeDays} label={uiLang === "zh" ? "学习天数" : uiLang === "id" ? "Hari aktif" : "Active days"} accent="amber"/><Metric value={srs.mastered} label={t.mastered} accent="blue"/></div>
        <div className="chart-card"><div><h3>{uiLang === "zh" ? "学习日历" : uiLang === "id" ? "Kalender belajar" : "Learning calendar"}</h3><p>{uiLang === "zh" ? "最近 13 周，颜色越深当天练得越多" : uiLang === "id" ? "13 minggu terakhir — makin gelap, makin banyak" : "Last 13 weeks — darker = more"}</p></div>
          <div className="heatmap">{Array.from({ length: 13 }, (_, wk) => <div key={wk} className="heat-col">{Array.from({ length: 7 }, (_, dy) => { const cell = heat[wk * 7 + dy]; return <i key={dy} className={`heat l${cell ? heatLevel(cell.count) : 0}`} title={cell ? `${cell.day}: ${cell.count}` : ""} />; })}</div>)}</div>
          <div className="heat-legend"><span>{TX("少", "sedikit", "less", uiLang)}</span><i className="heat l0"/><i className="heat l1"/><i className="heat l2"/><i className="heat l3"/><i className="heat l4"/><span>{TX("多", "banyak", "more", uiLang)}</span></div>
        </div>
        <div className="chart-card"><div><h3>{uiLang === "zh" ? "最近 7 天" : uiLang === "id" ? "7 hari terakhir" : "Last 7 days"}</h3></div><div className="bars">{last7.map((d,i)=><span key={i}><i style={{height:`${Math.max(4, Math.round(d.count / last7max * 100))}%`}}/><small>{d.label}</small></span>)}</div></div>
        <div className="backup-row"><div><b>{uiLang === "zh" ? "进度备份" : uiLang === "id" ? "Cadangan progres" : "Backup progress"}</b><small>{uiLang === "zh" ? "导出成文件，换设备可导入恢复（含错词、复习、收藏、设置）" : uiLang === "id" ? "Ekspor & impor antar perangkat" : "Export / import across devices"}</small></div><div className="backup-btns"><button onClick={exportProgress}>{uiLang === "zh" ? "导出备份" : uiLang === "id" ? "Ekspor" : "Export"} ↓</button><label className="import-btn">{uiLang === "zh" ? "导入" : uiLang === "id" ? "Impor" : "Import"} ↑<input type="file" accept="application/json" onChange={e => { const f = e.target.files?.[0]; if (f) importProgress(f); }} /></label></div></div>
      </Panel>}

      {view === "account" && <Panel title={TX("账号", "Akun", "Account", uiLang)} eyebrow={TX("登录与云端同步", "MASUK & SINKRON CLOUD", "SIGN IN & CLOUD SYNC", uiLang)}>
        <Account uiLang={uiLang} name={profileName} onName={setProfileName} />
      </Panel>}

      {view === "settings" && <Panel title={t.settings} eyebrow={EYEBROW.settings[uiLang]}>
        <div className="settings-grid"><Setting title={MODAL_T[uiLang].title} detail={`${MODAL_T[uiLang].ui} + ${MODAL_T[uiLang].learn}`}><button onClick={()=>setShowLangSetup(true)}>{uiLang === "zh" ? "打开设置" : uiLang === "id" ? "Buka" : "Open"}</button></Setting><Setting title={TX("学习语言", "Bahasa belajar", "Learning language", uiLang)} detail="中文 · Bahasa Indonesia · English"><select value={lang} onChange={e=>changeLanguage(e.target.value as Lang)}><option value="zh">中文</option><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></Setting><Setting title={TX("主题", "Tema", "Theme", uiLang)} detail={TX("选择舒适的阅读模式", "Pilih mode yang nyaman", "Choose a comfortable reading mode", uiLang)}><button onClick={()=>setDark(v=>!v)}>{dark ? TX("浅色模式", "Mode terang", "Light mode", uiLang) : TX("深色模式", "Mode gelap", "Dark mode", uiLang)}</button></Setting><Setting title={TX("发音", "Pelafalan", "Pronunciation", uiLang)} detail={`${LANGUAGE_META[lang].label} · 0.8×`}><button onClick={()=>speak(targetWord,targetVoice)}>{TX("测试发音", "Tes suara", "Test sound", uiLang)} ▶</button></Setting><Setting title={uiLang === "zh" ? "键盘音效" : uiLang === "id" ? "Suara ketik" : "Keyboard sound"} detail={TX("柔和 / 清脆 / 打字机 / 关", "lembut · renyah · mesin tik · mati", "soft · crisp · typewriter · off", uiLang)}><select value={soundProfile} onChange={e=>pickSound(e.target.value as SoundProfile)}><option value="soft">{TX("柔和", "Lembut", "Soft", uiLang)}</option><option value="crisp">{TX("清脆", "Renyah", "Crisp", uiLang)}</option><option value="typewriter">{TX("打字机", "Mesin tik", "Typewriter", uiLang)}</option><option value="off">{TX("关闭", "Mati", "Off", uiLang)}</option></select></Setting><Setting title={uiLang === "zh" ? "每词重复" : uiLang === "id" ? "Ulang tiap kata" : "Repeat each word"} detail={TX("连续打对几遍再进入下一个", "kali diketik benar sebelum kata berikutnya", "times before the next word", uiLang)}><select value={loopTimes} onChange={e=>changeLoop(Number(e.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={3}>3×</option></select></Setting><Setting title={TX("学习数据", "Data belajar", "Learning data", uiLang)} detail={TX("仅保存在本设备", "Tersimpan di perangkat ini", "Stored privately on this device", uiLang)}><button onClick={resetProgress}>{TX("重置进度", "Reset progres", "Reset progress", uiLang)}</button></Setting></div>
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
