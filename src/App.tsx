import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang, Word, WordCategory, ReadingPiece, DictEntry, DictInfo } from "./types";
import { recordReview, getStats, getDueKeys, resetAll, type SrsStats } from "./srs";
import { keyClick, errorBeep, successChime, setSoundEnabled, initSoundPref } from "./sounds";

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
  const [soundOn, setSoundOn] = useState(true);
  const [wrongFlash, setWrongFlash] = useState(false);
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
    setSoundOn(initSoundPref());
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
  const filtered = useMemo(() => activeWords.filter(w => `${w.en} ${w.id} ${w.zh}`.toLowerCase().includes(search.toLowerCase())), [activeWords, search]);


  const sourceKey = source === "trio" ? `trio:${category}` : source;

  // restore chapter per source, and reset the chapter run when switching source/category
  useEffect(() => {
    let saved = 0;
    try { saved = JSON.parse(localStorage.getItem("lingotrio-chapters") || "{}")[sourceKey] || 0; } catch { /* ignore */ }
    setChapter(saved);
    setChapterFinished(false); setChDone(0); setChWrongKeys([]); setWrongCountWord(0);
    chapterStart.current = Date.now();
    setIndex(0); setTyped("");
    hadWrong.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  useEffect(() => { setWrongCountWord(0); setReveal(false); }, [index]);
  useEffect(() => { try { localStorage.setItem("lingotrio-days", JSON.stringify(dayCounts)); } catch { /* ignore */ } }, [dayCounts]);

  const ready = words.length > 0;

  if (!ready) {
    return <div className={dark ? "app dark" : "app"}>
      <div className="loading-screen">
        <span className="loading-mark">LT</span>
        <p>{dataError ? "内容加载失败，请刷新页面重试。" : t.loading}</p>
      </div>
    </div>;
  }

  const dictInfo = source !== "trio" && dictWords ? dicts.find(d => d.id === source) || null : null;
  const practiceLang: Lang = dictInfo ? dictInfo.lang : lang;
  const activeItems = (dictInfo && dictWords)
    ? dictWords.map(e => ({
        key: e.name,
        text: e.name,
        sub: e.usphone ? `American English · /${e.usphone}/` : (dictInfo.lang === "id" ? "Bahasa Indonesia" : "English"),
        meaning: e.trans.join("；"),
        example: undefined as string | undefined,
        voice: dictInfo.lang === "id" ? "id-ID" : "en-US",
      }))
    : activeWords.map(w => ({
        key: w.en,
        text: wordValue(w, lang),
        sub: pronunciation(w, lang),
        meaning: w[defLang],
        example: w.examples[lang] as string | undefined,
        voice: LANGUAGE_META[lang].voice,
      }));
  const reviewItems = reviewKeys ? activeItems.filter(i => reviewKeys.includes(i.key)) : null;
  const chapterCount = Math.max(1, Math.ceil(activeItems.length / 20));
  const chapterSafe = Math.min(chapter, chapterCount - 1);
  const chapterItems = activeItems.slice(chapterSafe * 20, chapterSafe * 20 + 20);
  const learnItems = (reviewItems && reviewItems.length) ? reviewItems : (chapterItems.length ? chapterItems : activeItems);
  const item = learnItems[index % Math.max(learnItems.length, 1)] || learnItems[0];
  const prevItem = learnItems[(index - 1 + learnItems.length) % Math.max(learnItems.length, 1)];
  const nextItem = learnItems[(index + 1) % Math.max(learnItems.length, 1)];
  const targetWord = item.text;
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
  const reading = readings.find(piece => piece.id === readingId) || readings[0];
  const readingTarget = reading.lines[readingLine] || "";
  const readingAccuracy = readingTyped.length
    ? Math.round(readingTyped.split("").filter((character, i) => character === readingTarget[i]).length / readingTyped.length * 100)
    : 100;
  const readingProgress = Math.round(((readingLine + Math.min(readingTyped.length / Math.max(readingTarget.length, 1), 1)) / reading.lines.length) * 100);
  const keyLookup = new Map<string, { text: string; meaning: string }>();
  words.forEach(w => keyLookup.set(w.en, { text: wordValue(w, lang), meaning: w[defLang] }));
  if (dictWords) dictWords.forEach(e => { if (!keyLookup.has(e.name)) keyLookup.set(e.name, { text: e.name, meaning: e.trans.join("；") }); });
  const dueEntries = reviewKeys ? [] : mistakes.map(k => ({ key: k, info: keyLookup.get(k) })).filter(x => x.info) as { key: string; info: { text: string; meaning: string } }[];

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
    window.setTimeout(() => {
      if (autoAdvance.current !== token) return;
      setTyped("");
      const wasWrong = hadWrong.current;
      hadWrong.current = false;
      advanceOrFinishChapter(wasWrong);
    }, 320);
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
      setWrongCountWord(n => n + 1);
      setMistakes(m => Array.from(new Set([item.key, ...m])).slice(0, 30));
      window.setTimeout(() => { setTyped(""); setWrongFlash(false); input.current?.focus(); }, 350);
    }
  }
  function handleGhostKeys(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Tab") { event.preventDefault(); setReveal(true); return; }
    if (event.key === "Enter") { event.preventDefault(); skipWord(); return; }
    if (event.key === " " && (event.ctrlKey || event.metaKey || (practiceLang === "zh"))) {
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
  function chooseReading(id: string) {
    setReadingId(id); setReadingLine(0); setReadingTyped(""); setReadingSeconds(0); setReadingActive(false); setReadingDone(false);
    setTimeout(() => readingInput.current?.focus(), 30);
  }
  function submitReading() {
    readingAuto.current++;
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
        <div className="mini-progress"><span>{t.daily}<b>{Math.min(todayCount, 20)}/20</b></span><div><i style={{width:`${Math.min(todayCount/20*100,100)}%`}} /></div></div>
        <div className="profile"><span>S</span><div><b>Susi</b><small>Free learner</small></div><i>•••</i></div>
      </div>
    </aside>

    <main className="main">
      <header>
        <button className="chapter" onClick={() => setView("library")}><small>{t.choose}</small><b>{dictInfo ? dictInfo.name : (category === "all" ? t.all : CATEGORY_META[category][uiLang])} · {reviewKeys ? learnItems.length : activeItems.length}</b></button>
        <div className="header-actions">
          <button className="round" onClick={() => setDark(v => !v)} aria-label="Dark mode">{dark ? "☀" : "☾"}</button>
          <label className="language"><span>文</span><select value={lang} onChange={e => changeLanguage(e.target.value as Lang)} aria-label={t.language}><option value="zh">中文</option><option value="id">Indonesia</option><option value="en">English</option></select></label>
          <button className={running ? "primary running" : "primary"} onClick={start}>{running ? t.pause : t.start}<span>→</span></button>
        </div>
      </header>

      {view === "learn" && <section className="learn-view">
        {reviewKeys && <div className="review-banner"><span>◎ {t.reviewing} · {learnItems.length}</span><button onClick={exitReview}>{t.exitReview}</button></div>}
        <div className="session-meta"><span><i className="live" />{running ? "FOCUS MODE" : t.keyboard}</span>{!reviewKeys && <span className="chapter-nav"><button onClick={() => setChapterTo(chapterSafe - 1)} disabled={chapterSafe === 0} aria-label="Prev chapter">‹</button><select className="chapter-select" value={chapterSafe} onChange={e => setChapterTo(Number(e.target.value))} aria-label="Jump to chapter">{Array.from({ length: chapterCount }, (_, ci) => <option key={ci} value={ci}>{uiLang === "zh" ? `第 ${ci + 1} / ${chapterCount} 章` : uiLang === "id" ? `Bab ${ci + 1} / ${chapterCount}` : `Chapter ${ci + 1} / ${chapterCount}`}</option>)}</select><button onClick={() => setChapterTo(chapterSafe + 1)} disabled={chapterSafe >= chapterCount - 1} aria-label="Next chapter">›</button></span>}<b>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</b></div>
        <div className="mode-row"><span>{uiLang === "zh" ? "默写" : uiLang === "id" ? "Dikte" : "Dictation"}</span>{([["off", uiLang === "zh" ? "关" : uiLang === "id" ? "Mati" : "Off"], ["all", uiLang === "zh" ? "全隐藏" : uiLang === "id" ? "Semua" : "Hide all"], ["vowel", uiLang === "zh" ? "隐元音" : uiLang === "id" ? "Vokal" : "Vowels"], ["random", uiLang === "zh" ? "随机" : uiLang === "id" ? "Acak" : "Random"]] as ["off" | "all" | "vowel" | "random", string][]).map(([mode, label]) => <button key={mode} className={dictation === mode ? "active" : ""} onClick={() => { setDictation(mode); setTimeout(() => input.current?.focus(), 20); }}>{label}</button>)}{dictation !== "off" && <em>{uiLang === "zh" ? "TAB 显示答案" : uiLang === "id" ? "TAB lihat jawaban" : "TAB to peek"}</em>}</div>
        {!chapterFinished && <>
        <div className="word-card" onClick={() => input.current?.focus()}>
          <div className="word-count">{String((index % learnItems.length) + 1).padStart(2,"0")} <span>/ {learnItems.length}</span></div>
          <button className={speakingWord === targetWord ? "sound speaking" : "sound"} onClick={e => { e.stopPropagation(); speak(); }} aria-label="Play pronunciation">▶</button>
          <h1 className={`target-word ${practiceLang === "zh" ? "zh" : practiceLang} ${wrongFlash ? "shake" : ""}`}>{targetWord.split("").map((letter,i)=><span key={i} className={`${typed[i] ? ((practiceLang === "zh" ? typed[i] === letter : typed[i].toLowerCase() === letter.toLowerCase()) ? "letter right" : "letter wrong") : "letter"}${letterVisible(i) ? "" : " masked"}`}>{letter === " " ? "\u00a0" : letter}</span>)}</h1>
          <p className="phonetic">{item.sub}</p>
          <div className="meanings">
            <span><small>{dictInfo ? "中文" : LANGUAGE_META[defLang].label}</small>{item.meaning}</span>
            {item.example && <span><small>{LANGUAGE_META[lang].example}</small>{item.example}</span>}
          </div>
          <input ref={input} className="ghost-input" value={typed} onChange={e=>handleType(e.target.value)} onKeyDown={handleGhostKeys} onKeyUp={e => { if (e.key === "Tab") setReveal(false); }} onFocus={()=>setRunning(true)} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label={PROMPTS[uiLang][practiceLang]} />
          <p className="hint">{uiLang === "zh" ? <>直接敲键盘 <span>·</span> 打错整词重来 &nbsp;&nbsp; ENTER <span>·</span> 跳过 &nbsp;&nbsp; {practiceLang === "zh" ? "SPACE" : "CTRL+SPACE"} <span>·</span> 重播发音</> : uiLang === "id" ? <>Langsung ketik <span>·</span> salah = ulang kata &nbsp;&nbsp; ENTER <span>·</span> lewati &nbsp;&nbsp; {practiceLang === "zh" ? "SPACE" : "CTRL+SPACE"} <span>·</span> ulang suara</> : <>Just type <span>·</span> a mistake restarts the word &nbsp;&nbsp; ENTER <span>·</span> skip &nbsp;&nbsp; {practiceLang === "zh" ? "SPACE" : "CTRL+SPACE"} <span>·</span> replay</>}</p>
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

      {view === "library" && <Panel title={t.library} eyebrow="TRILINGUAL COLLECTION">
        <div className="library-section-title"><b>{uiLang === "zh" ? "LingoTrio 三语精选" : uiLang === "id" ? "Pilihan Trilingual LingoTrio" : "LingoTrio Trilingual Collection"}</b><span>{words.length} {uiLang === "id" ? "kata" : uiLang === "zh" ? "词" : "words"}</span></div>
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
        <div className="toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}/><span>{dictInfo ? activeItems.filter(it => `${it.text} ${it.meaning}`.toLowerCase().includes(search.toLowerCase())).length : filtered.length} {uiLang === "id" ? "kata" : uiLang === "zh" ? "个词" : "words"}</span></div>
        {dictInfo
          ? <div className="word-grid">{activeItems.map((it, ix) => ({ it, ix })).filter(({ it }) => `${it.text} ${it.meaning}`.toLowerCase().includes(search.toLowerCase())).slice(0, 300).map(({ it, ix }) => <button className={`vocab-card ${dictInfo.lang}`} key={`${it.key}-${ix}`} onClick={() => jumpToItem(ix)}><span>{String(ix + 1).padStart(3, "0")}</span><h3>{it.text}</h3><p>{it.sub}</p><em>{dictInfo.name}</em><div><b>{it.meaning}</b></div></button>)}</div>
          : <div className="word-grid">{filtered.slice(0, 300).map((w,i)=><button className={`vocab-card ${lang}`} key={w.en} onClick={()=>practiceWord(w)}><span>{String(i+1).padStart(3,"0")}</span><h3>{wordValue(w, lang)}</h3><p>{pronunciation(w, lang)}</p><em>{w.level} · {CATEGORY_META[w.category][uiLang]}</em><div><b>{w[defLang]}</b></div></button>)}</div>}
        <div className="source-note"><b>{uiLang === "zh" ? "词库来源" : uiLang === "id" ? "Sumber kosakata" : "Vocabulary sources"}</b><p>NGSL · Open English WordNet · Wordnet Bahasa · CC-CEDICT</p><span>{uiLang === "zh" ? "首批词条已经按三语概念对齐；重点词条将继续人工校对例句、拼音和音标。" : uiLang === "id" ? "Kosakata diselaraskan berdasarkan konsep dalam tiga bahasa dan akan terus ditinjau secara manual." : "Entries are aligned by concept across three languages and will continue through editorial review."}</span></div>
      </Panel>}

      {view === "mistakes" && <Panel title={t.mistakes} eyebrow="SPACED REPETITION">
        <div className="review-summary"><Metric value={srs.due} label={t.due} accent="violet"/><Metric value={srs.mastered} label={t.mastered} accent="mint"/><Metric value={srs.learning} label={t.learning} accent="amber"/></div>
        <div className="review-cta"><div><b>{t.reviewHint}</b><small>{srs.total} {uiLang === "zh" ? "个词在复习计划中" : uiLang === "id" ? "kata dalam jadwal" : "words in schedule"}</small></div><button className={(srs.due || mistakes.length) ? "ready" : ""} disabled={!srs.due && !mistakes.length} onClick={startReview}>{t.startReview}{srs.due ? ` · ${srs.due}` : ""}</button></div>
        <div className="mistake-list">{dueEntries.length ? dueEntries.map((x,i)=><button key={x.key} onClick={()=>jumpToKey(x.key)}><span>{i+1}</span><b>{x.info.text}</b><em>{x.info.meaning}</em><i>Practice →</i></button>) : <div className="empty"><b>✓</b><h3>{t.noDueTitle}</h3><p>{t.noDueNote}</p></div>}</div>
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
                  <textarea ref={readingInput} value={readingTyped} onFocus={() => setReadingActive(true)} onChange={e => { const v = e.target.value.replace(/\n/g,""); setReadingTyped(v); if (v === readingTarget) { const tk = ++readingAuto.current; window.setTimeout(() => { if (readingAuto.current === tk) submitReading(); }, 300); } }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); submitReading(); }}} placeholder={reading.lang === "zh" ? "照着上方文字输入……" : reading.lang === "id" ? "Ketik baris di atas…" : "Type the line above…"} spellCheck={false} />
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
        <div className="plan-layout"><div className="goal-card"><span>{t.finish}</span><strong>{Math.min(todayCount*5,100)}%</strong><div className="goal-ring" style={{"--p":`${Math.min(todayCount*5,100)*3.6}deg`} as React.CSSProperties}><b>{Math.min(todayCount,20)}</b><small>/20 words</small></div></div><div className="week">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=><div className={i<4?"done":i===4?"today":""} key={d}><span>{d}</span><b>{i<4?"✓":i===4?"12":"·"}</b><small>{i<4?"20 words":i===4?"of 20":"Rest"}</small></div>)}</div></div>
      </Panel>}

      {view === "stats" && <Panel title={t.stats} eyebrow="YOUR LEARNING SIGNALS">
        <div className="stats-top"><Metric value={correct} label={t.words} accent="violet"/><Metric value={`${accuracy}%`} label={t.accuracy} accent="mint"/><Metric value={`${streakDays} ${t.day}`} label={t.streak} accent="amber"/></div>
        <div className="chart-card"><div><h3>Learning activity</h3><p>Words practiced in the last 7 days</p></div><div className="bars">{last7.map((d,i)=><span key={i}><i style={{height:`${Math.max(4, Math.round(d.count / last7max * 100))}%`}}/><small>{d.label}</small></span>)}</div></div>
      </Panel>}

      {view === "settings" && <Panel title={t.settings} eyebrow="MAKE IT YOURS">
        <div className="settings-grid"><Setting title={MODAL_T[uiLang].title} detail={`${MODAL_T[uiLang].ui} + ${MODAL_T[uiLang].learn}`}><button onClick={()=>setShowLangSetup(true)}>{uiLang === "zh" ? "打开设置" : uiLang === "id" ? "Buka" : "Open"}</button></Setting><Setting title="Learning language" detail="中文 · Bahasa Indonesia · English"><select value={lang} onChange={e=>changeLanguage(e.target.value as Lang)}><option value="zh">中文</option><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></Setting><Setting title="Theme" detail="Choose a comfortable reading mode"><button onClick={()=>setDark(v=>!v)}>{dark?"Light":"Dark"} mode</button></Setting><Setting title="Pronunciation" detail={`${LANGUAGE_META[lang].label} · 0.8×`}><button onClick={()=>speak(targetWord,targetVoice)}>Test sound ▶</button></Setting><Setting title={uiLang === "zh" ? "打字音效" : uiLang === "id" ? "Efek suara ketikan" : "Typing sounds"} detail={uiLang === "zh" ? "按键 / 错误 / 完成提示音" : "key · error · success"}><button onClick={()=>{ const v = !soundOn; setSoundOn(v); setSoundEnabled(v); }}>{soundOn ? "ON" : "OFF"}</button></Setting><Setting title="Learning data" detail="Stored privately on this device"><button onClick={()=>{setCorrect(0);setAttempts(0);setMistakes([]);resetAll().then(refreshSrs)}}>Reset progress</button></Setting></div>
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
