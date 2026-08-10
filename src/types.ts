export type Lang = "zh" | "id" | "en";
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

export type DictEntry = { name: string; trans: string[]; usphone?: string };

export type DictInfo = {
  id: string;
  name: string;
  description: string;
  lang: "en" | "id";
  length: number;
  file: string;
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
