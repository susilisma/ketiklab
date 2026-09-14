export type Lang = "zh" | "id" | "en";
// the language a word's meaning is shown in, or "none" for typing practice without one
export type MeaningLang = Lang | "none";
export type WordCategory = "daily" | "business" | "indonesia" | "study";

export type Word = {
  en: string;
  id: string;
  zh: string;
  phonetic?: string;
  idSyllables?: string;
  pinyin?: string;
  examples: Record<Lang, string>;
  category: WordCategory;
  level: "A1" | "A2" | "B1" | "B2";
  source: string;
};

export type DictEntry = { name: string; trans: string[]; idtrans?: string[]; def?: string; usphone?: string };

export type DictInfo = {
  id: string;
  name: string;
  description: string;
  name_id?: string;
  name_en?: string;
  description_id?: string;
  description_en?: string;
  lang: Lang;
  length: number;
  file: string;
  // entries with a non-empty meaning per language: zh = Chinese trans (en-*, indonesian),
  // id = idtrans, en = English trans (zh-*), def = English definition
  coverage?: { zh: number; id: number; en: number; def: number };
};

export type PracticeItem = {
  key: string;
  text: string;
  sub: string;
  meaning: string;
  example?: string;
  voice: string;
  lang: Lang;
  dict?: string;
  dictId?: string;
  // every meaning the word has, keyed by the language it is written in (never item.lang);
  // absent on favourites saved before glosses existed
  glosses?: Partial<Record<Lang, string>>;
  def?: string;
};

export type ReadingPiece = {
  id: string;
  lang: "en" | "id" | "zh";
  title: string;
  author: string;
  era: string;
  genre: string;
  lines: string[];
  note: string;
};
