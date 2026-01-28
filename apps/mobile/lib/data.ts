import type { BookOfMormon, Book, Chapter } from "@plainenglishbom/core";
import {
  slugify,
  unslugifyForLocale,
  getBookSlugsForLocale,
  translateSlug,
  getCanonicalSlug,
} from "@plainenglishbom/core";

// Import bundled JSON data for each locale
// These are synced from data/transformed/ via `npm run sync-data`
import enData from "../assets/data/en.json";
import esData from "../assets/data/es.json";

// Re-export core utilities
export {
  slugify,
  unslugifyForLocale,
  getBookSlugsForLocale,
  translateSlug,
  getCanonicalSlug,
};

// Backward compatibility
export { unslugifyForLocale as unslugify, getBookSlugsForLocale as getBookSlugs };

// Data by locale
const DATA: Record<string, BookOfMormon> = {
  en: enData as BookOfMormon,
  es: esData as BookOfMormon,
};

const DEFAULT_LOCALE = "en";

export function getBookOfMormon(locale: string = DEFAULT_LOCALE): BookOfMormon {
  return DATA[locale] ?? DATA[DEFAULT_LOCALE];
}

export function getAllBooks(locale: string = DEFAULT_LOCALE): Book[] {
  return getBookOfMormon(locale).books;
}

export function getBook(
  shortName: string,
  locale: string = DEFAULT_LOCALE
): Book | undefined {
  const data = getBookOfMormon(locale);
  // Look up by canonical (English) short name since that's how data is keyed
  const canonicalName = getCanonicalSlug(shortName);
  return data.books.find(
    (b) => b.shortName.toLowerCase() === canonicalName.toLowerCase()
  );
}

export function getChapter(
  bookShortName: string,
  chapterNumber: number,
  locale: string = DEFAULT_LOCALE
): Chapter | undefined {
  const book = getBook(bookShortName, locale);
  return book?.chapters.find((c) => c.number === chapterNumber);
}

export function getAvailableLocales(): string[] {
  return Object.keys(DATA);
}

export function isLocaleAvailable(locale: string): boolean {
  return locale in DATA;
}
