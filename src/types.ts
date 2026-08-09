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
