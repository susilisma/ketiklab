import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { Lang, MeaningLang, Word, WordCategory, ReadingPiece, DictEntry, DictInfo, PracticeItem } from "./types";
import { recordReview, getStats, getDueKeys, deleteRecords, resetAll, getAllRecords, restoreRecords, type SrsStats } from "./srs";
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
type MeaningPrefs = Partial<Record<Lang, MeaningLang>>;
// a line the extra-meanings setting stacks under the main meaning
type ExtraMeaning = { text: string; label: string; kind: "gloss" | "def" | "example" };
type ExtraMeanings = "none" | "def" | "all";

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
  zh: { learn: "开始学习", library: "词库", mistakes: "间隔复习", articles: "阅读", plan: "学习计划", stats: "数据统计", member: "会员", settings: "设置", language: "语言", start: "开始", pause: "暂停", prompt: "输入上方中文词语", daily: "今日目标", streak: "连续学习", words: "已学词语", accuracy: "正确率", day: "天", chapter: "中文商务词汇 · 第 1 章", finish: "今日完成度", keyboard: "按任意键开始", choose: "选择词库", all: "全部分类", search: "搜索词语…", readingTagline: "读经典，照着输入，让文字经过眼睛，也经过手指。", allReadings: "全部", classics: "经典选集", pieces: "篇", readAll: "朗读全文", read: "朗读", lineLabel: "第几句", nextLine: "下一句", typingHelp: "红色字符需要修改；标点和大小写也要与原文一致。", completed: "已完成", completedNote: "你刚刚完整地输入了一篇经典作品。", characters: "字符", timeUsed: "用时", practiceAgain: "再练一次", loading: "正在加载词库…", due: "今日待复习", mastered: "已掌握", learning: "学习中", startReview: "开始复习", reviewing: "复习模式", exitReview: "退出复习", noDueTitle: "暂无到期复习", noDueNote: "继续在“开始学习”里练习。答对的词会按遗忘曲线拉长间隔，答错的词很快再次出现。", reviewHint: "按遗忘曲线：答对间隔变长，答错很快再见" },
  id: { learn: "Mulai Belajar", library: "Daftar Kata", mistakes: "Ulasan Berkala", articles: "Bacaan", plan: "Rencana Belajar", stats: "Statistik", member: "Anggota", settings: "Pengaturan", language: "Bahasa", start: "Mulai", pause: "Jeda", prompt: "Ketik kata bahasa Indonesia di atas", daily: "Target hari ini", streak: "Hari berturut-turut", words: "Kata dipelajari", accuracy: "Akurasi", day: "hari", chapter: "Kosakata Bisnis Indonesia · Bab 1", finish: "Progres hari ini", keyboard: "Ketik huruf pertama untuk mulai", choose: "Pilih daftar kata", all: "Semua kategori", search: "Cari kata…", readingTagline: "Baca karya klasik sambil mengetik, agar kata-katanya melewati mata dan jemari.", allReadings: "Semua", classics: "Koleksi klasik", pieces: "bacaan", readAll: "Bacakan seluruh teks", read: "Bacakan", lineLabel: "Baris", nextLine: "Baris berikutnya", typingHelp: "Perbaiki karakter merah; tanda baca dan huruf besar harus sama dengan teks asli.", completed: "Selesai", completedNote: "Kamu baru saja mengetik satu karya klasik secara lengkap.", characters: "karakter", timeUsed: "waktu", practiceAgain: "Latihan lagi", loading: "Memuat kosakata…", due: "Jatuh tempo hari ini", mastered: "Dikuasai", learning: "Dipelajari", startReview: "Mulai ulasan", reviewing: "Mode ulasan", exitReview: "Keluar", noDueTitle: "Belum ada ulasan jatuh tempo", noDueNote: "Terus berlatih di “Mulai Belajar”. Kata yang benar dijadwalkan makin jarang; yang salah muncul lagi segera.", reviewHint: "Kurva lupa: benar makin jarang, salah segera kembali" },
  en: { learn: "Start Learning", library: "Word Lists", mistakes: "Spaced Review", articles: "Reading", plan: "Study Plan", stats: "Statistics", member: "Membership", settings: "Settings", language: "Language", start: "Start", pause: "Pause", prompt: "Type the English word above", daily: "Daily goal", streak: "Study streak", words: "Words learned", accuracy: "Accuracy", day: "days", chapter: "Business English · Chapter 1", finish: "Today's progress", keyboard: "Press any letter key to start", choose: "Choose word list", all: "All categories", search: "Search words…", readingTagline: "Read the classics as you type, letting every line pass through your eyes and fingers.", allReadings: "All", classics: "Classic collection", pieces: "readings", readAll: "Read full text aloud", read: "Read aloud", lineLabel: "Line", nextLine: "Next line", typingHelp: "Correct the red characters; punctuation and capitalization must match the original.", completed: "Completed", completedNote: "You have typed an entire classic work.", characters: "characters", timeUsed: "time", practiceAgain: "Practice again", loading: "Loading vocabulary…", due: "Due today", mastered: "Mastered", learning: "Learning", startReview: "Start review", reviewing: "Review mode", exitReview: "Exit review", noDueTitle: "Nothing due yet", noDueNote: "Keep practicing in “Start Learning”. Correct words are scheduled further out; missed words return soon.", reviewHint: "Forgetting curve: correct spreads out, wrong returns soon" },
};

// prompt above the typing box: what to type (learn lang), written in the interface lang
const PROMPTS: Record<Lang, Record<Lang, string>> = {
  zh: { zh: "输入上方中文词语", id: "输入上方印尼语单词", en: "输入上方英语单词" },
  id: { zh: "Ketik kata bahasa Mandarin di atas", id: "Ketik kata bahasa Indonesia di atas", en: "Ketik kata bahasa Inggris di atas" },
  en: { zh: "Type the Chinese word above", id: "Type the Indonesian word above", en: "Type the English word above" },
};

const MODAL_T: Record<Lang, { title: string; subtitle: string; ui: string; uiDesc: string; learn: string; learnDesc: string; def: string; defDesc: string; defRequired: string; defSame: string; noneDesc: string; selected: string; cancel: string; save: string }> = {
  zh: { title: "语言设置", subtitle: "配置界面语言、学习语言和释义语言", ui: "界面语言", uiDesc: "选择应用界面的显示语言", learn: "学习语言", learnDesc: "选择你要练习打字的语言", def: "释义用哪种语言", defDesc: "选你最熟悉的语言", defRequired: "请选一项再保存", defSame: "正在学的语言", noneDesc: "只练打字", selected: "已选择", cancel: "取消", save: "保存设置" },
  id: { title: "Pengaturan Bahasa", subtitle: "Atur bahasa antarmuka, bahasa belajar, dan bahasa arti", ui: "Bahasa Antarmuka", uiDesc: "Pilih bahasa tampilan aplikasi", learn: "Bahasa Belajar", learnDesc: "Pilih bahasa yang ingin kamu latih mengetik", def: "Arti ditampilkan dalam", defDesc: "Pilih bahasa yang paling kamu pahami", defRequired: "Pilih salah satu sebelum menyimpan", defSame: "Bahasa yang sedang dipelajari", noneDesc: "Hanya latihan mengetik", selected: "Dipilih", cancel: "Batal", save: "Simpan" },
  en: { title: "Language Settings", subtitle: "Choose interface, learning, and meaning language", ui: "Interface Language", uiDesc: "Language used for menus and labels", learn: "Learning Language", learnDesc: "The language you practice typing", def: "Show meanings in", defDesc: "Pick the language you read best", defRequired: "Pick one to save", defSame: "The language you are learning", noneDesc: "Typing only", selected: "Selected", cancel: "Cancel", save: "Save" },
};

const EYEBROW: Record<string, Record<Lang, string>> = {
  library: { zh: "词汇库", id: "Koleksi Kosakata", en: "WORD COLLECTIONS" },
  mistakes: { zh: "间隔复习", id: "Ulasan Berkala", en: "SPACED REPETITION" },
  articles: { zh: "照着经典打字", id: "Ketik Karya Klasik", en: "TYPE THE CLASSICS" },
  plan: { zh: "适合你的节奏", id: "Ritme yang Pas", en: "A RHYTHM THAT WORKS" },
  stats: { zh: "你的学习信号", id: "Sinyal Belajarmu", en: "YOUR LEARNING SIGNALS" },
  settings: { zh: "按你的习惯来", id: "Sesuai Seleramu", en: "MAKE IT YOURS" },
};
const TX = (zh: string, id: string, en: string, lg: Lang) => lg === "zh" ? zh : lg === "id" ? id : en;

const LANG_CARDS: { code: Lang; name: string; uiDesc: string; learnDesc: string; defDesc: string }[] = [
  { code: "zh", name: "中文", uiDesc: "中文界面", learnDesc: "练习中文打字与词汇", defDesc: "用中文显示释义" },
  { code: "id", name: "Bahasa Indonesia", uiDesc: "Antarmuka bahasa Indonesia", learnDesc: "Latihan mengetik bahasa Indonesia", defDesc: "Arti dalam bahasa Indonesia" },
  { code: "en", name: "English", uiDesc: "English interface", learnDesc: "Practice English typing", defDesc: "Meanings in English" },
];
const LANGS: Lang[] = ["zh", "id", "en"];

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

// shown in place of the meaning when the chosen language has none for this word,
// written in that language rather than falling back to a different one
const MEANING_MISSING: Record<Lang, string> = { zh: "这个词暂无中文释义", id: "Belum ada arti Indonesia", en: "No English meaning yet" };
// [written in][language]
const LANG_NAME: Record<Lang, Record<Lang, string>> = { zh: { zh: "中文", id: "印尼语", en: "英语" }, id: { zh: "Mandarin", id: "Indonesia", en: "Inggris" }, en: { zh: "Chinese", id: "Indonesian", en: "English" } };
// [written in][meaning language], for the notes that say what a list carries
const MEANING_NAME: Record<Lang, Record<Lang, string>> = {
  zh: { zh: "中文释义", id: "印尼语释义", en: "英文释义" },
  id: { zh: "Arti Mandarin", id: "Arti Indonesia", en: "Arti Inggris" },
  en: { zh: "Chinese meanings", id: "Indonesian meanings", en: "English meanings" },
};

function browserTag(): string {
  // "in" is the legacy code some Android WebViews still report for Indonesian
  try { const tag = (navigator.language || "").slice(0, 2).toLowerCase(); return tag === "in" ? "id" : tag; } catch { return ""; }
}
const isLang = (x: unknown): x is Lang => x === "zh" || x === "id" || x === "en";
// The generated landing pages link into the app with ?ui=<lang>, ?lib=<id> and
// ?view=articles. They are read once here and dropped from the address bar, so a
// bookmark or a reload does not replay them; the values apply on the first render.
const ENTRY: { ui: Lang | null; lib: string | null; articles: boolean } = (() => {
  try {
    const p = new URLSearchParams(location.search);
    const ui = p.get("ui"), lib = p.get("lib"), view = p.get("view");
    if (p.has("ui") || p.has("lib") || p.has("view")) history.replaceState(null, "", location.pathname + location.hash);
    // the landing pages /zh/ /id/ /en/ embed the app: opening one is opening the app in that
    // language, whatever the browser's locale says (a saved choice still wins, see the restore effect)
    const path = location.pathname.match(/^\/(zh|id|en)\/(index\.html)?$/)?.[1];
    return { ui: isLang(ui) ? ui : isLang(path) ? path : null, lib, articles: view === "articles" };
  } catch { return { ui: null, lib: null, articles: false }; }
})();
// the interface language before any choice: the link's, else the browser's when it is one of ours
const initialUi = (): Lang => ENTRY.ui ?? (isLang(browserTag()) ? browserTag() as Lang : "zh");
// The meaning language nobody chose: the interface language when it differs from the
// learning language, else a different zh/id/en browser locale, else none — a Chinese
// interface for learning Chinese says nothing about which other language the learner reads.
function defaultDef(ui: Lang, learn: Lang, browserLang: string): Lang | null {
  if (ui !== learn) return ui;
  return (browserLang === "zh" || browserLang === "id" || browserLang === "en") && browserLang !== learn ? browserLang : null;
}
// defByLearn holds explicit choices only; def mirrors the one for learn for older tabs
function writeLangs(ui: Lang, learn: Lang, defByLearn: MeaningPrefs) {
  try { localStorage.setItem("ketiklab-langs", JSON.stringify({ ui, learn, def: defByLearn[learn], defByLearn, v: 2 })); } catch { /* ignore */ }
}
function cleanGlosses(g: Partial<Record<Lang, string>>, learn: Lang): Partial<Record<Lang, string>> {
  const out: Partial<Record<Lang, string>> = {};
  for (const l of LANGS) { const s = g[l]?.trim(); if (l !== learn && s) out[l] = s; }
  return out;
}
// trans is English in a zh dictionary and Chinese in the others
function dictGlosses(d: DictInfo, e: DictEntry): Partial<Record<Lang, string>> {
  const tr = e.trans.join(d.lang === "zh" ? "; " : "；"), idt = (e.idtrans || []).join("; ");
  return cleanGlosses(d.lang === "zh" ? { en: tr, id: idt } : { zh: tr, id: idt }, d.lang);
}

function wordValue(word: Word, language: Lang) {
  return language === "zh" ? word.zh.split("；")[0] : word[language];
}
const trioGlosses = (w: Word, lg: Lang) => cleanGlosses({ zh: w.zh, id: w.id, en: w.en }, lg);

// the label names the language being learned, in its own language; the call to action
// when no transcription exists is written in the interface language
function pronunciation(word: Word, language: Lang, ui: Lang) {
  const hear = TX("点击播放标准发音", "ketuk untuk mendengar", "tap to hear pronunciation", ui);
  if (language === "zh") return word.pinyin ? `普通话 · ${word.pinyin}` : `普通话 · ${hear}`;
  if (language === "id") return word.idSyllables ? `Bahasa Indonesia · ${word.idSyllables}` : `Bahasa Indonesia · ${hear}`;
  return word.phonetic ? `American English · ${word.phonetic}` : `English · ${hear}`;
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
  // a tap on the hidden-meaning placeholder shows the meaning for the rest of this word
  const [meaningPeek, setMeaningPeek] = useState(false);
  const [dayCounts, setDayCounts] = useState<Record<string, number>>({});

  const [view, setView] = useState<View>(ENTRY.articles ? "articles" : "learn");
  const [lang, setLang] = useState<Lang>("zh");
  const [uiLang, setUiLang] = useState<Lang>(initialUi);
  useEffect(() => { document.documentElement.lang = uiLang === "zh" ? "zh-CN" : uiLang; }, [uiLang]);
  // the meaning language the learner chose per learning language; a missing entry follows defaultDef
  const [defByLearn, setDefByLearn] = useState<MeaningPrefs>({});
  const [extraMeanings, setExtraMeanings] = useState<ExtraMeanings>(() => {
    try { const v = localStorage.getItem("ketiklab-extra-meanings"); return v === "def" || v === "all" ? v : "none"; } catch { return "none"; }
  });
  const [meaningVisibility, setMeaningVisibility] = useState<"shown" | "hidden">(() => {
    try { return localStorage.getItem("ketiklab-meaning-visibility") === "hidden" ? "hidden" : "shown"; } catch { return "shown"; }
  });
  const [hidePron, setHidePron] = useState(() => { try { return localStorage.getItem("ketiklab-hide-pron") === "1"; } catch { return false; } });
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
  // The IME box is uncontrolled and is only synced to `typed` between compositions.
  // When a word finishes (or rolls back) while the next composition is already open,
  // the box cannot be cleared, so its committed text stays in front of the next
  // commit: compStartLen is what the box held when that composition opened, and
  // staleLen is how much of the box to ignore when the commit is graded.
  const compStartLen = useRef(0);
  const staleLen = useRef(0);
  // set the moment a word is graded, cleared when its advance timer fires: keys
  // that land in that window must not grade the same word again or skip it
  const finishing = useRef(false);
  // a slip on any repetition of a looped word is its one lapse
  const lapseRecorded = useRef(false);
  // the Pause button was pressed: the word-advance and rollback timers must not hand
  // the focus back to the input, whose onFocus would start the clock again
  const pausedByButton = useRef(false);
  const flashToken = useRef(0);
  const [sessionWords, setSessionWords] = useState(0);
  const cancelFlash = () => { flashToken.current++; setWrongFlash(false); };
  // every path that leaves the current word behind: drop the pending advance and
  // strict-mode flash timers so neither can act on the word that replaced it, and
  // start its repetitions, reveal and slip count from zero — the [index] effect
  // does the same but only fires when the index actually changes
  const resetWordRun = () => { autoAdvance.current++; finishing.current = false; hadWrong.current = false; lapseRecorded.current = false; cancelFlash(); setLoopIx(0); setReveal(false); setMeaningPeek(false); setWrongCountWord(0); };
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
      // with the language dialog open its buttons hold focus; a key must not reach the word behind it
      if (view !== "learn" || showLangSetup) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey || (e.key.length !== 1 && e.key !== "Process")) return;
      isComposing.current = false;
      input.current?.focus();
      // the veil says "press any key": a SPACE is the gesture, not the first letter —
      // left alone it lands in the freshly focused box and is graded as a wrong key
      if (e.key === " ") e.preventDefault();
    };
    window.addEventListener("keydown", onAnyKey);
    return () => window.removeEventListener("keydown", onAnyKey);
  }, [view, showLangSetup]);

  useEffect(() => {
    const el = input.current;
    if (!el || !el.classList.contains("ime-input") || isComposing.current) return;
    // between compositions the box is made to match `typed`, so nothing stale is left in it
    if (el.value !== typed) el.value = typed;
    staleLen.current = 0;
  });
  // a word left behind while a composition is open: remember what the box still holds
  const markStale = () => { if (isComposing.current) staleLen.current = compStartLen.current; };
  const t = UI[uiLang];

  // The exam libraries live behind manifest.json. Run at mount and again from the
  // retry button, so it cannot rely on the mount effect's own cleanup flag.
  function loadManifest() {
    setDictsError(false);
    loadDictFile<DictInfo[]>("manifest.json").then((m: DictInfo[]) => {
      if (!mounted.current) return;
      setDicts(m);
      // restore the previously selected dictionary — unless the learner has
      // already picked a list (sourceReq counts every such choice). A library
      // page's "practise this list" link names the list instead.
      try {
        const linked = ENTRY.lib && m.find(x => x.id === ENTRY.lib);
        const savedSource = localStorage.getItem("ketiklab-source");
        const d = linked || (savedSource && m.find(x => x.id === savedSource));
        if (d && !sourceReq.current) {
          // a first visit from that page is a visit to learn that list's language
          if (linked) { persistSource(d.id); if (!localStorage.getItem("ketiklab-langs")) setLang(d.lang); }
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
  // The 错词本 can only list a word whose list is at hand: a dictionary missed word from a
  // list not opened this session was silently left out, so the list disagreed with the
  // button above it. Fetch those dictionaries (as 开始复习 does) and render again.
  const [, setDictTick] = useState(0);
  useEffect(() => {
    if (!ready || view !== "mistakes" || !mistakes.length || !dicts.length) return;
    const missing = mistakes.filter(k => !lookupKey(k));
    if (!missing.length) return;
    let alive = true;
    resolveReviewRefs(missing).then(() => { if (alive) setDictTick(n => n + 1); }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, mistakes, dicts]);

  // language preferences: restore on first load; show the setup modal on first visit and
  // whenever the learning language has no meaning language, chosen or defaulted
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ketiklab-langs");
      if (!saved) { setShowLangSetup(true); return; }
      const v = JSON.parse(saved);
      const ui: Lang = isLang(v?.ui) ? v.ui : "zh";
      const learn: Lang = isLang(v?.learn) ? v.learn : "zh";
      const byLearn: MeaningPrefs = {};
      if (v?.v === 2) {
        const raw: unknown = v.defByLearn;
        if (raw && typeof raw === "object") for (const l of LANGS) { const m: unknown = (raw as Record<string, unknown>)[l]; if (m === "none") byLearn[l] = "none"; else if (isLang(m) && m !== l) byLearn[l] = m; }
      } else {
        // before v2 an untouched def was saved as learn en → zh, otherwise en (the dialog started
        // on English); only a def other than that was the learner's choice, the rest now follows defaultDef
        if (isLang(v?.def) && v.def !== learn && v.def !== (learn === "en" ? "zh" : "en")) byLearn[learn] = v.def;
        writeLangs(ui, learn, byLearn);
      }
      setUiLang(ui); setLang(learn); setDefByLearn(byLearn);
      if (!byLearn[learn] && !defaultDef(ui, learn, browserTag())) setShowLangSetup(true);
    } catch { setShowLangSetup(true); }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ketiklab-state");
      if (saved) { const v = JSON.parse(saved); setCorrect(Number(v?.correct) || 0); setAttempts(Number(v?.attempts) || 0); setMistakes(Array.isArray(v?.mistakes) ? v.mistakes.filter((k: unknown) => typeof k === "string") : []); }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { localStorage.setItem("ketiklab-state", JSON.stringify({ correct, attempts, mistakes })); } catch { /* ignore */ } }, [correct, attempts, mistakes]);
  // the clock belongs to the practice card: it pauses while another view is open
  useEffect(() => { if (!running || view !== "learn") return; const timer = setInterval(() => setSeconds(s => s + 1), 1000); return () => clearInterval(timer); }, [running, view]);
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

  useEffect(() => { setWrongCountWord(0); setReveal(false); setMeaningPeek(false); setLoopIx(0); hadWrong.current = false; lapseRecorded.current = false; }, [index]);
  useEffect(() => { try { localStorage.setItem("ketiklab-days", JSON.stringify(dayCounts)); } catch { /* ignore */ } }, [dayCounts]);
  useEffect(() => { try { localStorage.setItem("ketiklab-dark", dark ? "1" : "0"); } catch { /* ignore */ } }, [dark]);
  useEffect(() => { try { localStorage.setItem("ketiklab-fav", JSON.stringify(favorites)); } catch { /* ignore */ } }, [favorites]);
  useEffect(() => { try { localStorage.setItem("ketiklab-input", inputMode); } catch { /* ignore */ } }, [inputMode]);
  useEffect(() => { try { localStorage.setItem("ketiklab-extra-meanings", extraMeanings); } catch { /* ignore */ } }, [extraMeanings]);
  useEffect(() => { try { localStorage.setItem("ketiklab-meaning-visibility", meaningVisibility); } catch { /* ignore */ } }, [meaningVisibility]);
  useEffect(() => { try { localStorage.setItem("ketiklab-hide-pron", hidePron ? "1" : "0"); } catch { /* ignore */ } }, [hidePron]);
  useEffect(() => { try { localStorage.setItem("ketiklab-name", profileName); } catch { /* ignore */ } }, [profileName]);
  useEffect(() => { try { localStorage.setItem("ketiklab-category", category); } catch { /* ignore */ } }, [category]);
  // a password-reset link, a sign-up confirmation link and the reload that follows a
  // cloud restore all land on the home view; cloud.ts asks for the account panel
  useEffect(() => onAccountWanted(() => setView("account")), []);
  // A favourite saved before glosses existed holds one meaning as text. Once its trio word
  // or dictionary is at hand it gets the glosses and follows the meaning choice like the
  // rest; the stored dict name was localized, so it is matched in all three languages.
  // Dictionaries are fetched for this only while the favourites are being practised.
  useEffect(() => {
    if (!words.length || !favorites.some(f => !f.glosses)) return;
    let alive = true;
    const byEn = new Map(words.map(w => [w.en, w]));
    const dictOf = (f: PracticeItem) => f.dict ? dicts.find(d => d.lang === f.lang && (d.id === f.dictId || [d.name, d.name_id, d.name_en].includes(f.dict))) : undefined;
    (async () => {
      if (source === "fav") for (const d of dicts) {
        if (dictCache.current.has(d.id) || !favorites.some(f => !f.glosses && dictOf(f) === d)) continue;
        try { dictCache.current.set(d.id, await loadDict(d)); } catch { /* the snapshot stays */ }
        if (!alive) return;
      }
      if (!alive || !mounted.current) return;
      const upgrade = (f: PracticeItem): PracticeItem => {
        if (f.glosses) return f;
        if (!f.dict) { const w = byEn.get(f.key); return w ? { ...f, glosses: trioGlosses(w, f.lang) } : f; }
        const d = dictOf(f), e = d && dictCache.current.get(d.id)?.find(x => x.name === f.key);
        // the old snapshot kept the English definition in example
        return d && e ? { ...f, dictId: d.id, glosses: dictGlosses(d, e), def: e.def || undefined, example: undefined } : f;
      };
      setFavorites(list => { const next = list.map(upgrade); return next.some((f, i) => f !== list[i]) ? next : list; });
    })();
    return () => { alive = false; };
  }, [favorites, words, dicts, source]);

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
  // Every surface asks these for a word's meaning, keyed on the word's own language, so a
  // review list mixing zh and en words shows each in the language chosen for it.
  // meaningFor: null means nothing chosen and no default — the learner still has to pick.
  const meaningFor = (learn: Lang): MeaningLang | null => defByLearn[learn] ?? defaultDef(uiLang, learn, browserTag());
  // An English word with no gloss in the chosen language (an idtrans gap) falls back to its English
  // definition, labelled as one in the reader's language; def: true marks that line.
  const resolveMeaning = (it: Pick<PracticeItem, "lang" | "glosses" | "def">): { text: string; lang: Lang; label: string; def: boolean } | null => {
    const ml = meaningFor(it.lang);
    if (!ml || ml === "none") return null;
    const text = it.glosses?.[ml];
    if (text) return { text, lang: ml, label: LANGUAGE_META[ml].label, def: false };
    return it.glosses && it.lang === "en" && it.def ? { text: it.def, lang: ml, label: TX("英文释义", "Definisi Inggris", "English definition", ml), def: true } : null;
  };
  const extrasFor = (it: Pick<PracticeItem, "lang" | "glosses" | "def" | "example">): ExtraMeaning[] => {
    if (extraMeanings === "none") return [];
    const def: ExtraMeaning[] = it.def ? [{ text: it.def, label: TX("英文释义", "Definisi Inggris", "English definition", uiLang), kind: "def" }] : [];
    // a definition already on the main line is not repeated under it
    const r = resolveMeaning(it), main = r?.lang;
    if (extraMeanings === "def") return it.lang === "en" && !r?.def ? def : [];
    const glosses = LANGS.flatMap((l): ExtraMeaning[] => { const s = it.glosses?.[l]; return l !== main && s ? [{ text: s, label: LANGUAGE_META[l].label, kind: "gloss" }] : []; });
    // a zh library's def often repeats its English trans word for word
    const same = (s?: string) => (s || "").trim().toLowerCase() === (it.def || "").trim().toLowerCase();
    // a favourite saved before glosses existed kept the dictionary def in example
    const example: ExtraMeaning[] = it.glosses && it.example ? [{ text: it.example, label: LANGUAGE_META[it.lang].example, kind: "example" }] : [];
    return [...glosses, ...(r?.def || LANGS.some(l => same(it.glosses?.[l])) ? [] : def), ...example];
  };
  // A list with nothing at all in the chosen language says which languages it has instead
  // of "no meaning yet" on every card. Written in w: the learner's meaning language on a
  // card, the interface language on the list's own card.
  const onlyNote = (d: DictInfo, w: Lang) => {
    const cov = d.coverage, has = cov ? LANGS.filter(l => l !== d.lang && cov[l] > 0).map(l => MEANING_NAME[w][l]).join(" / ") : "";
    return has
      ? TX(`这个词库只有${has}`, `Daftar ini hanya punya ${has.replace(/Arti/g, "arti")}`, `This list has ${has} only`, w)
      : TX("这个词库没有释义", "Daftar ini tidak punya arti", "This list has no meanings", w);
  };
  const missingNote = (it: Pick<PracticeItem, "dictId">, ml: Lang) => {
    const d = it.dictId ? dicts.find(x => x.id === it.dictId) : undefined;
    return d && d.coverage && !d.coverage[ml] ? onlyNote(d, ml) : MEANING_MISSING[ml];
  };
  // the one line a reference list prints: the meaning, a legacy favourite's snapshot, a muted
  // note when the chosen language has none, or nothing for "none" and for no choice yet
  // A line that is really the English definition (an idtrans gap) carries its label, as the
  // practice card does: unlabelled, it read as one more Indonesian or Chinese gloss.
  const listMeaning = (it: Pick<PracticeItem, "lang" | "glosses" | "def" | "meaning" | "dictId">): { text: string; note: boolean; label?: string } => {
    const r = resolveMeaning(it);
    if (r) return { text: r.text, note: false, label: r.def ? r.label : undefined };
    if (!it.glosses) return { text: it.meaning, note: false };
    const ml = meaningFor(it.lang);
    return ml && ml !== "none" ? { text: missingNote(it, ml), note: true } : { text: "", note: false };
  };
  const defTag = (label?: string) => label ? <i className="meaning-def">{label} · </i> : null;
  const meaningCell = (m: { text: string; note: boolean; label?: string }) => m.note ? <small className="meaning-missing">{m.text}</small> : <b>{defTag(m.label)}{m.text}</b>;
  // what this learner gets from a list, from the manifest counts; a row without them keeps the old note
  const coverageNote = (d: DictInfo) => {
    const cov = d.coverage, ml = meaningFor(d.lang);
    if (!cov) return d.lang === "zh" ? TX("英文 / 印尼语释义", "arti Inggris / Indonesia", "EN / ID glosses", uiLang) : d.lang === "en" && uiLang === "id" ? "arti Mandarin / Indonesia" : TX("中文释义", "arti Mandarin", "Chinese glosses", uiLang);
    if (ml === "none") return TX("不显示释义", "Tanpa arti", "No meanings shown", uiLang);
    if (!ml) return LANGS.filter(l => l !== d.lang && cov[l] > 0).map(l => MEANING_NAME[uiLang][l]).join(" / ");
    if (!cov[ml]) return onlyNote(d, uiLang);
    if (cov[ml] >= d.length) return MEANING_NAME[uiLang][ml];
    return `${MEANING_NAME[uiLang][ml]} · ${Math.floor(cov[ml] / d.length * 100)}% · ${d.lang === "en" && cov.def >= d.length ? TX("其余为英文释义", "sisanya definisi Inggris", "the rest show the English definition", uiLang) : TX("其余暂无释义", "sisanya tanpa arti", "the rest have none", uiLang)}`;
  };
  // lists with nothing in this learner's meaning language go to the end of the grid
  const lacksMeaning = (d: DictInfo) => { const ml = meaningFor(d.lang); return !!d.coverage && ml !== null && ml !== "none" && !d.coverage[ml]; };
  const dictOrder = dicts.filter(d => !lacksMeaning(d)).concat(dicts.filter(lacksMeaning));
  const dictItem = (d: DictInfo, e: DictEntry): PracticeItem => {
    const it: PracticeItem = {
      key: e.name,
      text: e.name,
      sub: d.lang === "zh"
        ? (e.usphone ? `普通话 · ${e.usphone}` : "普通话")
        : e.usphone ? `American English · /${e.usphone}/` : (d.lang === "id" ? "Bahasa Indonesia" : "English"),
      meaning: "",
      voice: d.lang === "id" ? "id-ID" : d.lang === "zh" ? "zh-CN" : "en-US",
      lang: d.lang,
      dict: dictName(d),
      dictId: d.id,
      glosses: dictGlosses(d, e),
      def: e.def || undefined,
    };
    it.meaning = resolveMeaning(it)?.text ?? "";
    return it;
  };
  const trioItem = (w: Word, lg: Lang = lang): PracticeItem => {
    const raw = wordValue(w, lg);
    // "full (after eating)": the gloss tells the library entries apart, but it is
    // not part of what gets typed — it moves next to the pronunciation instead
    const gloss = lg === "zh" ? undefined : raw.match(/\s*\(([^)]*)\)\s*$/)?.[1];
    const it: PracticeItem = {
      key: w.en,
      text: gloss ? raw.replace(/\s*\([^)]*\)\s*$/, "") : raw,
      sub: (lg === "zh" && zhToned(zhMap, wordValue(w, "zh"))
        ? `普通话 · ${zhToned(zhMap, wordValue(w, "zh"))}`
        : pronunciation(w, lg, uiLang)) + (gloss ? ` · (${gloss})` : ""),
      meaning: "",
      example: w.examples?.[lg] as string | undefined,
      voice: LANGUAGE_META[lg].voice,
      lang: lg,
      glosses: trioGlosses(w, lg),
    };
    it.meaning = resolveMeaning(it)?.text ?? "";
    return it;
  };
  // No branch may yield an empty list: `item` is dereferenced unguarded below.
  // ladderWords cannot be empty here — `ready` means words.json loaded.
  const activeItems: PracticeItem[] = source === "fav" && favorites.length
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
  const itemMeaningLang = meaningFor(item.lang);
  const itemMeaning = resolveMeaning(item);
  const itemExtras = extrasFor(item);
  // 975 trio first senses have no zh-pinyin entry; the ladder filters them out but
  // favourites do not, so fall back to the word's own (toned) pinyin
  const trioW = item.dict ? undefined : wordByEn.get(item.key);
  const zhToneText = zhToned(zhMap, targetWord) || trioW?.pinyin || "";
  const plainPy = zhPlain(zhMap, targetWord) || trioW?.pinyin || "";
  // a word with no pinyin at all cannot be passed at 打拼音, so that rung types it through the IME
  const zhLadder = practiceLang === "zh" && zhStep !== "hanzi" && (zhStep !== "pinyin" || !!plainPy);
  // Hide meaning: dictation keeps the meaning as the cue for the form, and 认读 promises it on
  // screen. The peek is TAB held in the App input, or a tap — 打拼音 owns TAB for its pinyin.
  const meaningHidden = meaningVisibility === "hidden" && dictation === "off" && !(zhLadder && zhStep === "read") && !reveal && !meaningPeek;
  // extra lines are a second cue: in dictation they wait for TAB like the letters
  const extrasShown = (dictation === "off" || reveal) && !meaningHidden;
  // a word this list has no meaning for in the chosen language: another gloss it does have waits
  // behind a tap, unless "All languages" already lists it; not for a list that lacks the language outright
  const missNote = itemMeaningLang && itemMeaningLang !== "none" && !itemMeaning ? missingNote(item, itemMeaningLang) : "";
  const missOther = missNote && itemMeaningLang && itemMeaningLang !== "none" && missNote === MEANING_MISSING[itemMeaningLang] && !(extraMeanings === "all" && extrasShown)
    ? LANGS.find(l => l !== itemMeaningLang && !!item.glosses?.[l]) : undefined;
  // mousedown keeps focus where it is: the pinyin box or the App input
  const peekButton = (label: string) => <button type="button" className="meaning-peek" onMouseDown={e => e.preventDefault()} onClick={e => { e.stopPropagation(); setMeaningPeek(true); }}>{label}</button>;
  const peekLabel = zhLadder ? TX("点一下查看释义", "Ketuk untuk melihat arti", "Tap to see the meaning", uiLang) : TX("按住 TAB 或点一下查看释义", "Tahan TAB atau ketuk untuk melihat arti", "Hold TAB or tap to see the meaning", uiLang);
  // Hide pronunciation in dictation: only under "hide all" on the steps that print a pronunciation
  // line, and the word is not read aloud on its own either until CTRL+SPACE or TAB
  const holdSpeech = hidePron && dictation === "all" && !zhLadder;
  const pronHidden = holdSpeech && !reveal;
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
    // the ladder steps have no letter-by-letter input and no TAB to reveal: 认读 exists to
    // show the word, 打拼音 and 选汉字 need it on screen, so dictation applies from 输入法 on
    if (dictation === "off" || reveal || zhLadder) return true;
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
  type KeyInfo = { text: string; meaning: string; note: boolean; label?: string };
  function lookupKey(id: string): KeyInfo | undefined {
    const [lg, key] = splitId(id);
    const w = wordByEn.get(key);
    if (w) { const m = listMeaning({ lang: lg, glosses: trioGlosses(w, lg), meaning: "" }); return { text: wordValue(w, lg), meaning: m.text, note: m.note, label: m.label }; }
    for (const d of dicts) {
      if (d.lang !== lg) continue;
      const e = dictCache.current.get(d.id)?.find(x => x.name === key);
      if (e) { const m = listMeaning({ lang: lg, glosses: dictGlosses(d, e), def: e.def, meaning: "", dictId: d.id }); return { text: e.name, meaning: m.text, note: m.note, label: m.label }; }
    }
    return undefined;
  }
  const dueEntries: { key: string; info: KeyInfo }[] = view === "mistakes"
    ? mistakes.map(k => ({ key: k, info: lookupKey(k) })).filter(x => x.info) as { key: string; info: KeyInfo }[]
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
  const globalResults: { src: string; key: string; text: string; sub: string; meaning: string; note: boolean; label?: string; lang: Lang; dictName?: string; rank: number }[] = [];
  let globalTotal = 0;
  if (globalSearch && gq) {
    // a hit matches on the headword or on any of its meanings (idtrans too, so Indonesian
    // readers can search in Indonesian) and shows the one meaning line this learner reads
    for (const w of words) {
      const text = wordValue(w, lang), hay = `${w.en} ${w.id} ${w.zh}`;
      if (!hay.toLowerCase().includes(gq)) continue;
      const m = listMeaning({ lang, glosses: trioGlosses(w, lang), meaning: "" });
      globalResults.push({ src: "trio", key: w.en, text, sub: pronunciation(w, lang, uiLang), meaning: m.text, note: m.note, lang, rank: rankMatch(text + " " + w.en, hay, gq) });
    }
    for (const d of dicts) {
      const data = allDicts[d.id]; if (!data) continue;
      for (const e of data) {
        const hay = `${e.name} ${e.trans.join(" ")} ${(e.idtrans || []).join(" ")}`;
        if (!hay.toLowerCase().includes(gq)) continue;
        const m = listMeaning({ lang: d.lang, glosses: dictGlosses(d, e), def: e.def, meaning: "", dictId: d.id });
        globalResults.push({ src: d.id, key: e.name, text: e.name, sub: e.usphone ? `/${e.usphone}/` : "", meaning: m.text, note: m.note, label: m.label, lang: d.lang, dictName: dictName(d), rank: rankMatch(e.name, hay, gq) });
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
    // a review session keeps its own tally: exitReview clears it, so the summary
    // after 退出复习 never counts words from other lists
    setChDone(n => n + 1); if (wasWrong) setChWrongKeys(k => Array.from(new Set([...k, wordId])));
    const atEnd = (index % Math.max(learnItems.length, 1)) === learnItems.length - 1;
    // a review that answered its last word used to wrap round to the first one
    // and go on for ever; it ends on the same card a chapter does
    if (atEnd) {
      setChElapsed(Math.round((Date.now() - chapterStart.current) / 1000));
      setChapterFinished(true);
      setRunning(false);
    } else {
      const ni = (index + 1) % Math.max(learnItems.length, 1);
      const nx = learnItems[ni];
      setIndex(ni);
      if (nx && !holdSpeech) {
        autoSpokenWord.current = `${source}:${nx.key}`;
        window.setTimeout(() => speak(nx.text, nx.voice), 160);
      }
      setTimeout(() => { if (!pausedByButton.current) input.current?.focus(); }, 20);
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
        markStale();
        setTyped(""); setLoopIx(n => n + 1);
        setTimeout(() => input.current?.focus(), 20);
      }, 320);
      return;
    }
    window.setTimeout(() => {
      if (autoAdvance.current !== token) return;
      finishing.current = false;
      markStale();
      setTyped(""); setLoopIx(0);
      const wasWrong = hadWrong.current;
      hadWrong.current = false; lapseRecorded.current = false;
      advanceOrFinishChapter(wasWrong);
    }, 320);
  }
  function toggleFav() {
    if (!item) return;
    if (!isFav) { setFavorites(list => [{ key: item.key, text: item.text, sub: item.sub, meaning: item.meaning, example: item.example, voice: item.voice, lang: item.lang, dict: item.dict, dictId: item.dictId, glosses: item.glosses, def: item.def }, ...list].slice(0, 500)); return; }
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
      setChapterFinished(false); setChDone(0); setChWrongKeys([]); chapterStart.current = Date.now();
      setIndex(0); setTyped(""); resetWordRun(); autoSpokenWord.current = null;
      setRunning(true);
      setTimeout(() => input.current?.focus(), 30);
    }).catch(() => {});
  }
  function handleType(raw: string) {
    if (finishing.current || wrongFlash) return;
    if (isComposing.current) return; // ignore mid-IME-composition (Chinese pinyin etc.)
    // the box still shows the previous word (or the rolled-back text) in front of
    // this commit: grade only what was committed since, after the kept prefix
    if (practiceLang === "zh" && staleLen.current > 0) raw = typed + raw.slice(staleLen.current);
    // iOS and macOS smart punctuation type ’ for the apostrophe in driver's license
    raw = raw.replace(/[\u2018\u2019\u02BC]/g, "'");
    // Never let the buffer grow past the target: extra keystrokes are simply
    // ignored, the way every other typing trainer behaves.
    const clean = (practiceLang === "zh"
      ? raw.replace(/[^㐀-鿿]/g, "")
      : raw.replace(/[^a-zA-Z0-9 '\-\.&]/g, "")).slice(0, targetWord.length);
    if (typed.length === 0 && clean.length > 0 && autoSpokenWord.current !== targetKey && !holdSpeech) {
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
        markStale();
        setTyped(fullReset ? "" : targetWord.slice(0, k));
        setWrongFlash(false); if (!pausedByButton.current) input.current?.focus();
      }, 350);
    }
  }
  function handleGhostKeys(event: React.KeyboardEvent<HTMLInputElement>) {
    if (isComposing.current || (event.nativeEvent as any).isComposing || event.key === "Process" || (event as any).keyCode === 229) return;
    // Shift+TAB and Escape leave the input, so the page stays reachable by keyboard
    if (event.key === "Escape") { input.current?.blur(); return; }
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault(); setReveal(true);
      // held speech: the TAB that shows the pronunciation line also plays it, once per word
      if (holdSpeech && autoSpokenWord.current !== targetKey) { autoSpokenWord.current = targetKey; speak(targetWord, targetVoice); }
      return;
    }
    if (event.key === "Enter") { event.preventDefault(); skipWord(); return; }
    if (event.key === " " && (event.ctrlKey || event.metaKey)) {
      event.preventDefault(); speak(targetWord, targetVoice); return;
    }
  }
  // the meaning language lives in defByLearn per learning language, so switching back
  // brings back the one chosen for it instead of overwriting it
  function changeLanguage(nextLanguage: Lang) {
    setLang(nextLanguage);
    setTyped(""); resetWordRun();
    autoSpokenWord.current = null;
    setSpeakingWord(null);
    writeLangs(uiLang, nextLanguage, defByLearn);
    setTimeout(() => input.current?.focus(), 30);
  }
  function saveLangSetup(ui: Lang, learn: Lang, def: MeaningLang) {
    const byLearn: MeaningPrefs = { ...defByLearn };
    byLearn[learn] = def;
    setUiLang(ui);
    setDefByLearn(byLearn);
    if (learn !== lang) {
      setLang(learn);
      setTyped(""); resetWordRun();
      autoSpokenWord.current = null;
      setSpeakingWord(null);
    }
    writeLangs(ui, learn, byLearn);
    setShowLangSetup(false);
  }
  // the meaning language for one learning language: the Settings select passes the current one,
  // the practice card the word's own
  function changeMeaning(next: MeaningLang, learn: Lang = lang) {
    const byLearn: MeaningPrefs = { ...defByLearn };
    byLearn[learn] = next;
    setDefByLearn(byLearn);
    writeLangs(uiLang, lang, byLearn);
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
  // the click moved focus to the button; refocusing the input would run its onFocus,
  // which sets running again, so only a start gives the focus back
  function start() {
    if (running) { pausedByButton.current = true; setRunning(false); return; }
    setRunning(true); setTimeout(() => input.current?.focus(), 20);
  }
  // Keys are "<lang>:<word key>". Within a language an English key can still exist
  // both in the trio collection and in an English dictionary: prefer the dictionary
  // being practised, then the trio collection, then the other dictionaries in
  // manifest order.
  // `report` receives the keys no list holds; complete is false when a dictionary
  // could not be fetched, so a missing key may still exist there
  async function resolveReviewRefs(keys: string[], report?: { unresolved: string[]; complete: boolean }): Promise<ReviewRef[]> {
    const found = new Map<string, ReviewRef>();
    // no manifest yet (still loading, or failed) means no dictionary was checked: a
    // key it holds must not be taken for a removed word and retired
    let complete = dicts.length > 0;
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
      if (!data) { try { data = await loadDict(d); dictCache.current.set(d.id, data); } catch { complete = false; continue; } }
      scan(d, data);
    }
    if (report) { report.unresolved = keys.filter(k => !found.has(k)); report.complete = complete; }
    return keys.map(k => found.get(k)).filter((r): r is ReviewRef => !!r);
  }
  async function startReview() {
    const due = await getDueKeys();
    let keys = due.length ? due : mistakes.slice();
    if (!keys.length) return;
    const report = { unresolved: [] as string[], complete: true };
    let refs = await resolveReviewRefs(keys, report);
    // a word renamed or removed by a content update has no list to be practised in:
    // its row would count as due forever, so it is retired (only once every
    // dictionary could be checked), and the 错词本 drops it too
    if (report.complete && report.unresolved.length) {
      const gone = new Set(report.unresolved);
      if (due.length) deleteRecords(report.unresolved).then(refreshSrs).catch(() => {});
      setMistakes(m => m.filter(k => !gone.has(k)));
      if (!refs.length && due.length && mistakes.length) { keys = mistakes.filter(k => !gone.has(k)); refs = await resolveReviewRefs(keys); }
    }
    if (!refs.length) return;
    sourceReq.current++;
    // 认读 only shows the word and schedules nothing, so a review held on that rung
    // would never clear a single due word; it starts one rung up
    if (zhStep === "read") setZhStep("pinyin");
    setReviewRefs(refs);
    setReviewKeys(keys);
    setChapterFinished(false); setChDone(0); setChWrongKeys([]); chapterStart.current = Date.now();
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
      <button className="brand" onClick={() => setView("learn")} aria-label={TX("KetikLab 首页", "Beranda KetikLab", "KetikLab home", uiLang)}><span>KL</span><b>KetikLab</b></button>
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
          <button className="round" onClick={() => setDark(v => !v)} aria-label={TX("深色模式", "Mode gelap", "Dark mode", uiLang)}>{dark ? "☀" : "☾"}</button>
          <label className="language"><span>文</span><select value={lang} onChange={e => changeLanguage(e.target.value as Lang)} aria-label={t.language}><option value="zh">中文</option><option value="id">Indonesia</option><option value="en">English</option></select></label>
          <button className={running ? "primary running" : "primary"} onClick={start}>{running ? t.pause : t.start}<span>→</span></button>
        </div>
      </header>

      {view === "learn" && <section className="learn-view">
        {reviewKeys && <div className="review-banner"><span>◎ {reviewItems && reviewItems.length ? `${t.reviewing} · ${reviewItems.length}${reviewKeys.length > reviewItems.length ? ` / ${reviewKeys.length}` : ""}` : TX("本列表没有到期的复习词", "Tidak ada kata jatuh tempo di daftar ini", "Nothing due in this list", uiLang)}</span><button onClick={exitReview}>{t.exitReview}</button></div>}
        <div className="session-meta"><span><i className="live" />{running ? TX("专注模式", "MODE FOKUS", "FOCUS MODE", uiLang) : t.keyboard}</span>{!reviewKeys && <span className="chapter-nav"><button onClick={() => setChapterTo(chapterSafe - 1)} disabled={chapterSafe === 0} aria-label={TX("上一章", "Bab sebelumnya", "Previous chapter", uiLang)}>‹</button><select className="chapter-select" value={chapterSafe} onChange={e => setChapterTo(Number(e.target.value))} aria-label={TX("跳到某一章", "Lompat ke bab", "Jump to chapter", uiLang)}>{Array.from({ length: chapterCount }, (_, ci) => <option key={ci} value={ci}>{uiLang === "zh" ? `第 ${ci + 1} / ${chapterCount} 章` : uiLang === "id" ? `Bab ${ci + 1} / ${chapterCount}` : `Chapter ${ci + 1} / ${chapterCount}`}</option>)}</select><button onClick={() => setChapterTo(chapterSafe + 1)} disabled={chapterSafe >= chapterCount - 1} aria-label={TX("下一章", "Bab berikutnya", "Next chapter", uiLang)}>›</button></span>}<b>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</b></div>
        <div className="mode-row">{!zhLadder && <span className="mode-group"><span>{uiLang === "zh" ? "默写" : uiLang === "id" ? "Dikte" : "Dictation"}</span>{([["off", uiLang === "zh" ? "关" : uiLang === "id" ? "Mati" : "Off"], ["all", uiLang === "zh" ? "全隐藏" : uiLang === "id" ? "Semua" : "Hide all"], ["vowel", uiLang === "zh" ? "隐元音" : uiLang === "id" ? "Vokal" : "Vowels"], ["random", uiLang === "zh" ? "随机" : uiLang === "id" ? "Acak" : "Random"]] as ["off" | "all" | "vowel" | "random", string][]).map(([mode, label]) => <button key={mode} className={dictation === mode ? "active" : ""} onClick={() => { setDictation(mode); setTimeout(() => input.current?.focus(), 20); }}>{label}</button>)}{dictation !== "off" && <em>{uiLang === "zh" ? "TAB 显示答案" : uiLang === "id" ? "TAB lihat jawaban" : "TAB to peek"}</em>}</span>}{!zhLadder && <span className="mode-sep" />}<span className="mode-group"><span>{uiLang === "zh" ? "纠错" : uiLang === "id" ? "Koreksi" : "Correction"}</span>{([["strict", TX("自动回退", "Mundur otomatis", "Auto rollback", uiLang)], ["soft", uiLang === "zh" ? "退格改错" : uiLang === "id" ? "Backspace" : "Backspace"]] as ["strict" | "soft", string][]).map(([mode, label]) => <button key={mode} className={inputMode === mode ? "active" : ""} onClick={() => { setInputMode(mode); setTyped(""); cancelFlash(); setTimeout(() => input.current?.focus(), 20); }}>{label}</button>)}{inputMode === "soft" && <em>{uiLang === "zh" ? "打错不清空，按退格改" : uiLang === "id" ? "Salah? tekan Backspace" : "Backspace to fix"}</em>}</span></div>
        {!chapterFinished && <>
        <div className={practiceLang === "zh" ? "word-card zh-compact" : "word-card"} onClick={() => input.current?.focus()}>
          {!typingFocus && !zhLadder && <div className="type-veil" onClick={() => input.current?.focus()}><b>{uiLang === "zh" ? (running ? "按任意键继续" : "按任意键开始") : uiLang === "id" ? (running ? "Tekan tombol apa saja untuk lanjut" : "Tekan tombol apa saja untuk mulai") : (running ? "Press any key to continue" : "Press any key to start")}</b></div>}
          <div className="word-count">{String((index % learnItems.length) + 1).padStart(2,"0")} <span>/ {learnItems.length}</span></div>
          <button className={speakingWord === targetWord ? "sound speaking" : "sound"} onClick={e => { e.stopPropagation(); speak(); }} aria-label={TX("播放发音", "Putar pelafalan", "Play pronunciation", uiLang)}>▶</button>
          {speechBlocked && <button className="speech-unlock" onClick={e => { e.stopPropagation(); speechPrimed.current = false; setSpeechBlocked(false); speak(); }}>
            {uiLang === "zh" ? "点此启用发音" : uiLang === "id" ? "Ketuk untuk mengaktifkan suara" : "Tap to enable sound"}
          </button>}
          <button className={isFav ? "fav-btn on" : "fav-btn"} onClick={e => { e.stopPropagation(); toggleFav(); }} aria-label={isFav ? TX("取消收藏", "Hapus dari favorit", "Remove from favorites", uiLang) : TX("收藏", "Tambah ke favorit", "Add to favorites", uiLang)}>{isFav ? "★" : "☆"}</button>
          {loopTimes > 1 && <div className="loop-dots">{Array.from({ length: loopTimes }, (_, li) => <i key={li} className={li <= loopIx ? "on" : ""} />)}</div>}
          {practiceLang === "zh" && (zhStep === "read" || zhStep === "choose") &&
            <p className={zhStep === "choose" ? "zh-annot solo" : "zh-annot"}
               onClick={e => { e.stopPropagation(); speak(); }}>{zhToneText || "—"}</p>}
          {!(practiceLang === "zh" && zhStep === "choose") && <h1 className={`target-word ${practiceLang === "zh" ? "zh" : practiceLang} ${wrongFlash ? "shake" : ""}`}>{targetWord.split("").map((letter,i)=><Fragment key={i}><span className={`${typed[i] ? ((practiceLang === "zh" ? typed[i] === letter : typed[i].toLowerCase() === letter.toLowerCase()) ? "letter right" : "letter wrong") : "letter"}${letterVisible(i) ? "" : " masked"}`}>{letter === " " ? "\u00a0" : letter}</span>{/* the space is a no-break space so its span keeps its width at a line end, and
              the <wbr> after it is the only break opportunity: without one, overflow-wrap:anywhere
              splits a phrase in the middle of a word (pelayan / an) */}{letter === " " && <wbr />}</Fragment>)}</h1>}
          {!zhLadder && <p className={pronHidden ? "phonetic pron-hidden" : "phonetic"} aria-hidden={pronHidden || undefined}>{item.sub}</p>}
          {/* the meaning sits right under the word stack; the ladder pills come after it */}
          {(itemMeaningLang !== "none" || (itemExtras.length > 0 && (extrasShown || meaningHidden))) && <div className="meanings">
            {itemMeaningLang === "none" ? (meaningHidden ? peekButton(peekLabel) : null)
              // a favourite saved before glosses existed has its text, with no language to name
              : !itemMeaning && (item.glosses || !item.meaning)
                ? (itemMeaningLang
                  ? (missOther && meaningPeek ? <><span className="meaning-missing">{missNote}</span><span><small>{LANGUAGE_META[missOther].label}</small>{item.glosses?.[missOther]}</span></>
                    : missOther ? peekButton(`${missNote} · ${LANGUAGE_META[missOther].label}`)
                    : <span className="meaning-missing">{missNote}</span>)
                  // the dialog sets the current learning language; a review word from another one picks in place
                  : item.lang === lang ? <button type="button" className="meaning-pick" onClick={e => { e.stopPropagation(); setShowLangSetup(true); }}>{TX("选择释义语言", "Pilih bahasa arti", "Choose a meaning language", uiLang)}</button>
                  : <select className="meaning-pick" value="" aria-label={TX("释义语言", "Bahasa arti", "Meaning language", uiLang)} onClick={e => e.stopPropagation()} onChange={e => changeMeaning(e.target.value as MeaningLang, item.lang)}><option value="" disabled>{TX("选择释义语言", "Pilih bahasa arti", "Choose a meaning language", uiLang)}</option>{LANG_CARDS.filter(c => c.code !== item.lang).map(c => <option key={c.code} value={c.code}>{c.name}</option>)}<option value="none">{TX("不显示释义", "Tanpa arti", "No meaning", uiLang)}</option></select>)
              : meaningHidden ? peekButton(peekLabel)
              : itemMeaning ? <span><small>{itemMeaning.label}</small>{itemMeaning.text}</span>
              : <span>{item.meaning}</span>}
            {extrasShown && itemExtras.map(x => <span key={`${x.kind}:${x.label}`} className={`meaning-extra ${x.kind}`}><small>{x.label}</small>{x.text}</span>)}
          </div>}
          {practiceLang === "zh" && <div className="zh-ladder" onClick={e => e.stopPropagation()}>
            {ZH_STEPS.map(st => <button key={st.id} className={zhStep === st.id ? "on" : ""} disabled={!!reviewKeys && st.id === "read"} onClick={() => { setZhStep(st.id); setTyped(""); resetWordRun(); }}>
              <i>{st.num}</i>{uiLang === "zh" ? st.zh : uiLang === "id" ? st.idn : st.en}
            </button>)}
          </div>}
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
          <input ref={input} key={practiceLang} lang={practiceLang === "zh" ? "zh-CN" : practiceLang} placeholder={practiceLang === "zh" ? TX("请用拼音输入", "Ketik lewat pinyin", "Type through pinyin", uiLang) : ""} className={practiceLang === "zh" ? "ime-input" : "ghost-input"} value={practiceLang === "zh" ? undefined : typed} defaultValue="" onChange={e=>handleType(e.target.value)} onCompositionStart={e=>{ isComposing.current = true; compStartLen.current = e.currentTarget.value.length; }} onCompositionEnd={e=>{ isComposing.current = false; handleType(e.currentTarget.value); }} onKeyDown={handleGhostKeys} onKeyUp={e => { if (e.key === "Tab") setReveal(false); }} onFocus={()=>{ isComposing.current = false; pausedByButton.current = false; setTypingFocus(true); setRunning(true); }} onBlur={()=>{ setTypingFocus(false); setReveal(false); }} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label={PROMPTS[uiLang][practiceLang]} />
          <p className="hint">{TX("直接敲键盘", "Langsung ketik", "Just type", uiLang)} <span>·</span> {inputMode === "soft" ? TX("打错按退格改", "salah? tekan Backspace", "Backspace fixes a mistake", uiLang) : TX("打错自动回退", "salah = mundur otomatis", "a mistake rolls back", uiLang)} &nbsp;&nbsp; ENTER <span>·</span> {TX("跳过", "lewati", "skip", uiLang)} &nbsp;&nbsp; {"CTRL+SPACE"} <span>·</span> {TX("重播发音", "ulang suara", "replay", uiLang)}</p>
          </>}
          {wrongCountWord >= 3 && <button className="skip-btn" onClick={e => { e.stopPropagation(); skipWord(); }}>{uiLang === "zh" ? "跳过这个词" : uiLang === "id" ? "Lewati kata ini" : "Skip this word"} →</button>}
        </div>
        <div className="prevnext"><span>‹ {prevItem && prevItem.key !== item.key ? prevItem.text : "—"}</span><span>{nextItem && nextItem.key !== item.key ? nextItem.text : "—"} ›</span></div>
        </>}
        {chapterFinished && <div className="reading-complete chapter-complete">
          <span>✓</span><small>{reviewKeys ? TX("复习完成", "ULASAN SELESAI", "REVIEW COMPLETE", uiLang) : uiLang === "zh" ? "本章完成" : uiLang === "id" ? "BAB SELESAI" : "CHAPTER COMPLETE"}</small>
          <h2>{reviewKeys ? t.reviewing : uiLang === "zh" ? `第 ${chapterSafe + 1} 章` : uiLang === "id" ? `Bab ${chapterSafe + 1}` : `Chapter ${chapterSafe + 1}`}</h2>
          <p>{uiLang === "zh" ? `${chDone} 个词 · ${chWrongKeys.length} 个错词` : uiLang === "id" ? `${chDone} kata · ${chWrongKeys.length} salah` : `${chDone} words · ${chWrongKeys.length} missed`}</p>
          <div><b>{Math.max(0, Math.round((chDone - chWrongKeys.length) / Math.max(chDone, 1) * 100))}%</b><small>{t.accuracy}</small><b>{String(Math.floor(chElapsed / 60)).padStart(2, "0")}:{String(chElapsed % 60).padStart(2, "0")}</b><small>{t.timeUsed}</small></div>
          {chWrongKeys.length > 0 && <div className="finish-wrong">{chWrongKeys.map(k => { const info = lookupKey(k); return <span key={k}><b>{info ? info.text : k}</b><small className={info?.note ? "meaning-missing" : undefined}>{defTag(info?.label)}{info ? info.meaning : ""}</small></span>; })}</div>}
          <div className="chapter-actions">
            {/* after a review: practise its missed words again or leave it; the chapter buttons belong to a chapter */}
            {!reviewKeys && <button onClick={retryChapter}>{uiLang === "zh" ? "重练本章" : uiLang === "id" ? "Ulangi bab" : "Retry chapter"}</button>}
            {chWrongKeys.length > 0 && <button onClick={practiceChapterWrong}>{uiLang === "zh" ? `练习错词 (${chWrongKeys.length})` : uiLang === "id" ? `Latih kata salah (${chWrongKeys.length})` : `Practice missed (${chWrongKeys.length})`}</button>}
            {reviewKeys ? <button className="go" onClick={exitReview}>{t.exitReview} →</button>
              : <button className="go" onClick={nextChapter}>{uiLang === "zh" ? "下一章" : uiLang === "id" ? "Bab berikutnya" : "Next chapter"} →</button>}
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
        <div className="library-section-title"><b>{TX("KetikLab 主题词汇", "Kosakata Tematik KetikLab", "KetikLab Words by Topic", uiLang)}</b><span>{words.length} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"}</span></div>{favorites.length > 0 && <button className={source === "fav" ? "fav-source active" : "fav-source"} onClick={selectFav}>★ {uiLang === "zh" ? "我的收藏" : uiLang === "id" ? "Favorit saya" : "My favorites"} · {favorites.length}</button>}
        <div className="category-tabs">
          {CATEGORIES.map(catItem => <button key={catItem} className={source === "trio" && category === catItem ? "active" : ""} onClick={() => selectTrio(catItem)}>{catItem === "all" ? t.all : CATEGORY_META[catItem][uiLang]}<small>{catItem === "all" ? words.length : words.filter(wordItem => wordItem.category === catItem).length}</small></button>)}
        </div>
        {dictsError && <div className="review-banner"><span>⚠ {TX("考试词库加载失败", "Kamus ujian gagal dimuat", "Exam libraries failed to load", uiLang)}</span><button onClick={loadManifest}>{TX("重试", "Coba lagi", "Retry", uiLang)}</button></div>}
        {dicts.length > 0 && <>
          <div className="library-section-title"><b>{TX("考试词库", "Kamus ujian", "Exam libraries", uiLang)}</b><span>{dicts.reduce((a, d) => a + d.length, 0)} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"}</span></div>
          <div className="dict-grid">
            {dictOrder.map(d => <button key={d.id} className={source === d.id ? "dict-card active" : "dict-card"} onClick={() => selectDict(d)}>
              <span className={`piece-language ${d.lang}`}>{d.lang === "id" ? "ID" : d.lang === "zh" ? "中" : "EN"}</span>
              <div><b>{dictName(d)}</b><p>{dictDesc(d)}</p><small>{d.length} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"} · {coverageNote(d)}</small></div>
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
                  ? <div className="empty"><b>🌐</b><h3>{uiLang === "zh" ? "输入关键词，在全部词库中搜索" : uiLang === "id" ? "Ketik untuk mencari di semua kamus" : "Type to search across all libraries"}</h3><p>{TX(`主题词汇 + ${searchable.length} 个考试词库，共 ${globalCount} 词`, `Kosakata Tematik + ${searchable.length} kamus ujian · ${globalCount} kata`, `Words by Topic + ${searchable.length} exam libraries · ${globalCount} words`, uiLang)}</p></div>
                  : (globalResults.length
                      ? <div className="word-grid">{globalResults.map((r, i) => <button className={`vocab-card ${r.lang === "zh" ? "zh" : r.lang}`} key={`${r.src}-${r.key}-${i}`} onClick={() => r.src === "trio" ? gotoTrioWord(words.find(w => w.en === r.key)!) : gotoDictWord(r.src, r.key)}><span className={`res-src ${r.lang}`}>{r.dictName || TX("主题词汇", "Tematik", "Topics", uiLang)}</span><h3>{r.text}</h3><p>{r.sub}</p><div>{meaningCell({ text: r.meaning, note: r.note, label: r.label })}</div></button>)}</div>
                      : <div className="empty"><b>🔍</b><h3>{uiLang === "zh" ? "没有找到" : uiLang === "id" ? "Tidak ditemukan" : "No matches"}</h3></div>)))
          : dictInfo
          ? <div className="word-grid">{activeItems.map((it, ix) => ({ it, ix })).filter(({ it }) => `${it.text} ${it.meaning}`.toLowerCase().includes(search.toLowerCase())).slice(0, LIB_CAP).map(({ it, ix }) => <button className={`vocab-card ${dictInfo.lang}`} key={`${it.key}-${ix}`} onClick={() => jumpToItem(ix)}><span>{String(ix + 1).padStart(3, "0")}</span><h3>{it.text}</h3><p>{it.sub}</p><em>{dictName(dictInfo)}</em><div>{meaningCell(listMeaning(it))}</div></button>)}</div>
          : <div className="word-grid">{filtered.slice(0, LIB_CAP).map((w,i)=><button className={`vocab-card ${lang}`} key={w.en} onClick={()=>practiceWord(w)}><span>{String(i+1).padStart(3,"0")}</span><h3>{wordValue(w, lang)}</h3><p>{pronunciation(w, lang, uiLang)}</p><em>{w.level} · {CATEGORY_META[w.category][uiLang]}</em><div>{meaningCell(listMeaning({ lang, glosses: trioGlosses(w, lang), meaning: "" }))}</div></button>)}</div>}
        <div className="source-note"><b>{uiLang === "zh" ? "词库来源" : uiLang === "id" ? "Sumber kosakata" : "Vocabulary sources"}</b><p><a href={DATA + "SOURCES.md"} target="_blank" rel="noreferrer">Open English WordNet · Chinese Open Wordnet · Wordnet Bahasa · wordfreq · CMUdict · pypinyin</a></p><span>{uiLang === "zh" ? "各词库的具体来源与授权见上方链接；其中托福词表取自第三方备考材料，未获再分发授权。" : uiLang === "id" ? "Sumber dan lisensi tiap kamus ada di tautan di atas; daftar TOEFL berasal dari materi pihak ketiga tanpa izin distribusi." : "Per-library sources and licences are linked above; the TOEFL list comes from third-party material with no redistribution licence."}</span></div>
      </Panel>}

      {view === "mistakes" && <Panel title={t.mistakes} eyebrow={EYEBROW.mistakes[uiLang]}>
        <div className="review-summary"><Metric value={srs.due} label={t.due} accent="violet"/><Metric value={srs.mastered} label={t.mastered} accent="mint"/><Metric value={srs.learning} label={t.learning} accent="amber"/></div>
        <div className="review-cta"><div><b>{t.reviewHint}</b><small>{srs.total} {uiLang === "zh" ? "个词在复习计划中" : uiLang === "id" ? "kata dalam jadwal" : "words in schedule"}</small></div><button className={(srs.due || mistakes.length) ? "ready" : ""} disabled={!srs.due && !mistakes.length} onClick={startReview}>{t.startReview}{srs.due ? ` · ${srs.due}` : ""}</button></div>
        {dueEntries.length > 0 && <div className="library-section-title" style={{marginTop:0}}><b>{TX("错词本", "Buku kesalahan", "Words you missed", uiLang)}</b><span>{dueEntries.length}</span></div>}
        {/* "nothing due" only when nothing is: due rows whose list is not loaded, or a
            clean run with no missed word, have no entry here but are still due above */}
        <div className="mistake-list">{dueEntries.length ? dueEntries.map((x,i)=><button key={x.key} onClick={()=>jumpToKey(x.key)}><span>{i+1}</span><b>{x.info.text}</b><em className={x.info.note ? "meaning-missing" : undefined}>{defTag(x.info.label)}{x.info.meaning}</em><i>{TX("练习 →", "Latih →", "Practice →", uiLang)}</i></button>)
          : srs.due || mistakes.length ? <div className="empty"><b>◎</b><h3>{TX("错词本里没有可显示的词", "Buku kesalahan kosong", "Nothing to list here", uiLang)}</h3><p>{srs.due ? TX(`有 ${srs.due} 个词到期，点上方「开始复习」。`, `${srs.due} kata jatuh tempo — tekan “Mulai ulasan” di atas.`, `${srs.due} ${srs.due === 1 ? "word is" : "words are"} due: press “Start review” above.`, uiLang) : TX("错过的词在别的词库里，打开那个词库后会显示。", "Kata yang salah ada di daftar lain; buka daftar itu untuk melihatnya.", "The missed words belong to another list; open it to see them here.", uiLang)}</p></div>
          : <div className="empty"><b>✓</b><h3>{t.noDueTitle}</h3><p>{t.noDueNote}</p></div>}</div>
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
                  <textarea ref={readingInput} value={readingTyped} onFocus={() => setReadingActive(true)} onChange={e => { const v = e.target.value.replace(/\n/g,""); setReadingTyped(v); if (v === readingTarget) { const tk = ++readingAuto.current; window.setTimeout(() => { if (readingAuto.current === tk) submitReading(v); }, 220); } }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); submitReading(); }}} placeholder={TX("照着上方文字输入……", "Ketik baris di atas…", "Type the line above…", uiLang)} spellCheck={false} />
                  <button className={readingTyped === readingTarget ? "ready" : ""} onClick={() => submitReading()} disabled={readingTyped !== readingTarget}>{t.nextLine} <span>↵</span></button>
                </div>
                {readingTyped && readingTyped !== readingTarget && <p className="typing-help">{t.typingHelp}</p>}
              </div>
            </> : <div className="reading-complete">
              <span>✓</span><small>{t.completed}</small><h2>{reading.title}</h2><p>{t.completedNote}</p><div><b>{reading.lines.join("").length}</b><small>{t.characters}</small><b>{String(Math.floor(readingSeconds/60)).padStart(2,"0")}:{String(readingSeconds%60).padStart(2,"0")}</b><small>{t.timeUsed}</small></div><button onClick={restartReading}>{t.practiceAgain}</button>
            </div>}

            {/* the notes are written in Chinese for pieces in every language */}
            <div className="reader-footer">{uiLang === "zh" && reading.note && <p>{reading.note}</p>}<div><span>{readingProgress}%</span><i><b style={{width:`${readingProgress}%`}} /></i><time>{String(Math.floor(readingSeconds/60)).padStart(2,"0")}:{String(readingSeconds%60).padStart(2,"0")}</time></div></div>
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
        <div className="settings-grid"><Setting title={MODAL_T[uiLang].title} detail={`${MODAL_T[uiLang].ui} + ${MODAL_T[uiLang].learn}`}><button onClick={()=>setShowLangSetup(true)}>{uiLang === "zh" ? "打开设置" : uiLang === "id" ? "Buka" : "Open"}</button></Setting><Setting title={TX("学习语言", "Bahasa belajar", "Learning language", uiLang)} detail={TX("中文、印尼语或英语", "Mandarin, Indonesia, atau Inggris", "Chinese, Indonesian or English", uiLang)}><select value={lang} onChange={e=>changeLanguage(e.target.value as Lang)}><option value="zh">中文</option><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></Setting><Setting title={TX("释义语言", "Bahasa arti", "Meaning language", uiLang)} detail={TX(`学${LANG_NAME.zh[lang]}时显示的释义，每种学习语言分别记住`, `Arti saat belajar bahasa ${LANG_NAME.id[lang]}; diingat per bahasa belajar`, `Meanings while learning ${LANG_NAME.en[lang]}; remembered per learning language`, uiLang)}><select value={meaningFor(lang) ?? ""} onChange={e => changeMeaning(e.target.value as MeaningLang)}>{meaningFor(lang) === null && <option value="" disabled>{TX("请选择", "Pilih", "Choose", uiLang)}</option>}{LANG_CARDS.filter(c => c.code !== lang).map(c => <option key={c.code} value={c.code}>{c.name}</option>)}<option value="none">{TX("不显示释义", "Tanpa arti", "No meaning", uiLang)}</option></select></Setting><Setting title={TX("附加释义", "Arti tambahan", "Extra meanings", uiLang)} detail={TX("在释义下方另起一行；英文释义只用于英文词", "Baris kecil di bawah arti; definisi Inggris hanya untuk kata bahasa Inggris", "Smaller lines under the meaning; the English definition is for English words", uiLang)}><select value={extraMeanings} onChange={e => setExtraMeanings(e.target.value as ExtraMeanings)}><option value="none">{TX("无", "Tidak ada", "None", uiLang)}</option><option value="def">{TX("英文释义", "Definisi Inggris", "English definition", uiLang)}</option><option value="all">{TX("全部语言", "Semua bahasa", "All languages", uiLang)}</option></select></Setting><Setting title={TX("释义", "Arti", "Meaning", uiLang)} detail={TX("默写和认读时照常显示", "Dikte dan Kenali tetap menampilkannya", "Dictation and Recognize still show it", uiLang)}><select value={meaningVisibility} onChange={e => setMeaningVisibility(e.target.value === "hidden" ? "hidden" : "shown")}><option value="shown">{TX("一直显示", "Selalu tampil", "Always shown", uiLang)}</option><option value="hidden">{TX("隐藏（按住 TAB 或点一下查看）", "Disembunyikan (tahan TAB atau ketuk untuk melihat)", "Hidden (hold TAB or tap to peek)", uiLang)}</option></select></Setting><Setting title={TX("默写时隐藏发音行", "Sembunyikan pelafalan saat dikte", "Hide pronunciation in dictation", uiLang)} detail={TX("只在「全隐藏」时生效，也不自动朗读，按 TAB 或 CTRL+SPACE 再听", "Hanya saat dikte Semua; kata tidak dibacakan sampai TAB atau CTRL+SPACE", "Only under Hide all; the word is not read aloud until TAB or CTRL+SPACE", uiLang)}><select value={hidePron ? "1" : "0"} onChange={e => setHidePron(e.target.value === "1")}><option value="0">{TX("关闭", "Mati", "Off", uiLang)}</option><option value="1">{TX("开启", "Nyala", "On", uiLang)}</option></select></Setting><Setting title={TX("主题", "Tema", "Theme", uiLang)} detail={TX("选择舒适的阅读模式", "Pilih mode yang nyaman", "Choose a comfortable reading mode", uiLang)}><button onClick={()=>setDark(v=>!v)}>{dark ? TX("浅色模式", "Mode terang", "Light mode", uiLang) : TX("深色模式", "Mode gelap", "Dark mode", uiLang)}</button></Setting><Setting title={TX("发音", "Pelafalan", "Pronunciation", uiLang)} detail={`${LANGUAGE_META[lang].label} · 0.8×`}><button onClick={()=>speak(targetWord,targetVoice)}>{TX("测试发音", "Tes suara", "Test sound", uiLang)} ▶</button></Setting><Setting title={uiLang === "zh" ? "键盘音效" : uiLang === "id" ? "Suara ketik" : "Keyboard sound"} detail={TX("柔和 / 清脆 / 打字机 / 关", "lembut · renyah · mesin tik · mati", "soft · crisp · typewriter · off", uiLang)}><select value={soundProfile} onChange={e=>pickSound(e.target.value as SoundProfile)}><option value="soft">{TX("柔和", "Lembut", "Soft", uiLang)}</option><option value="crisp">{TX("清脆", "Renyah", "Crisp", uiLang)}</option><option value="typewriter">{TX("打字机", "Mesin tik", "Typewriter", uiLang)}</option><option value="off">{TX("关闭", "Mati", "Off", uiLang)}</option></select></Setting><Setting title={uiLang === "zh" ? "每词重复" : uiLang === "id" ? "Ulang tiap kata" : "Repeat each word"} detail={TX("连续打对几遍再进入下一个", "kali diketik benar sebelum kata berikutnya", "times before the next word", uiLang)}><select value={loopTimes} onChange={e=>changeLoop(Number(e.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={3}>3×</option></select></Setting><Setting title={TX("学习数据", "Data belajar", "Learning data", uiLang)} detail={TX("仅保存在本设备", "Tersimpan di perangkat ini", "Stored privately on this device", uiLang)}><button onClick={resetProgress}>{TX("重置进度", "Reset progres", "Reset progress", uiLang)}</button></Setting></div>
      </Panel>}
    </main>

    {/* closing stores nothing: a first visit that never saved asks again on the next load */}
    {/* keyed on the learning language: a first visit from a library page learns which one while the dialog is already open */}
    {showLangSetup && <LangSetup key={lang} initialUi={uiLang} initialLearn={lang} defByLearn={defByLearn} onSave={saveLangSetup} onClose={() => setShowLangSetup(false)} />}
  </div>;
}

function LangSetup({ initialUi, initialLearn, defByLearn, onSave, onClose }: { initialUi: Lang; initialLearn: Lang; defByLearn: MeaningPrefs; onSave: (ui: Lang, learn: Lang, def: MeaningLang) => void; onClose: () => void }) {
  const [ui, setUi] = useState<Lang>(initialUi);
  const [learn, setLearn] = useState<Lang>(initialLearn);
  // null until the learner touches the meaning row; until then the pre-selection follows
  // the two rows above, and a pick that became the learning language no longer counts
  const [picked, setPicked] = useState<MeaningLang | null>(null);
  const def: MeaningLang | null = picked && picked !== learn ? picked : defByLearn[learn] ?? defaultDef(ui, learn, browserTag());
  const mt = MODAL_T[ui];
  const first = useRef<HTMLButtonElement>(null);
  // a dialog takes the focus with it, or keys keep landing on the practice card behind it
  useEffect(() => { first.current?.focus(); }, []);
  return <div className="lang-modal-backdrop" role="dialog" aria-modal="true" onKeyDown={e => { if (e.key === "Escape") onClose(); }}>
    <div className="lang-modal">
      <button className="lang-modal-close" onClick={onClose} aria-label={mt.cancel}>✕</button>
      <h2>{mt.title}</h2>
      <p className="lang-modal-subtitle">{mt.subtitle}</p>
      <div className="lang-modal-section">
        <h3>🖥 {mt.ui}</h3>
        <p>{mt.uiDesc}</p>
        <div className="lang-cards">
          {LANG_CARDS.map((c, i) => <button key={c.code} ref={i === 0 ? first : undefined} className={ui === c.code ? "lang-card active" : "lang-card"} onClick={() => setUi(c.code)}>
            <b>{c.name}</b><small>{c.uiDesc}</small>{ui === c.code && <span>{mt.selected}</span>}
          </button>)}
        </div>
      </div>
      <div className="lang-modal-section">
        <h3>⌨ {mt.learn}</h3>
        <p>{mt.learnDesc}</p>
        <div className="lang-cards">
          {LANG_CARDS.map(c => <button key={c.code} className={learn === c.code ? "lang-card active" : "lang-card"} onClick={() => setLearn(c.code)}>
            <b>{c.name}</b><small>{c.learnDesc}</small>{learn === c.code && <span>{mt.selected}</span>}
          </button>)}
        </div>
      </div>
      <div className="lang-modal-section">
        <h3>🌐 {mt.def}</h3>
        <p>{mt.defDesc}{def === null && <b> · {mt.defRequired}</b>}</p>
        <div className="lang-cards">
          {LANG_CARDS.map(c => <button key={c.code} className={def === c.code ? "lang-card active" : "lang-card"} disabled={c.code === learn} onClick={() => setPicked(c.code)}>
            <b>{c.name}</b><small>{c.code === learn ? mt.defSame : c.defDesc}</small>{def === c.code && <span>{mt.selected}</span>}
          </button>)}
          <button className={def === "none" ? "lang-card active" : "lang-card"} onClick={() => setPicked("none")}>
            <b>不显示释义 · Tanpa arti · No meaning</b><small>{mt.noneDesc}</small>{def === "none" && <span>{mt.selected}</span>}
          </button>
        </div>
      </div>
      <div className="lang-modal-actions">
        <button className="lang-modal-cancel" onClick={onClose}>{mt.cancel}</button>
        <button className="lang-modal-save" disabled={def === null} onClick={() => { if (def !== null) onSave(ui, learn, def); }}>{mt.save}</button>
      </div>
    </div>
  </div>;
}

function Metric({value,label,accent}:{value:string|number;label:string;accent:string}) { return <div className={`metric ${accent}`}><i/><div><strong>{value}</strong><span>{label}</span></div></div> }
function Panel({title,eyebrow,children}:{title:string;eyebrow:string;children:React.ReactNode}) { return <section className="panel"><div className="panel-head"><span>{eyebrow}</span><h1>{title}</h1></div>{children}</section> }
function Setting({title,detail,children}:{title:string;detail:string;children:React.ReactNode}) { return <div className="setting"><div><b>{title}</b><p>{detail}</p></div>{children}</div> }
