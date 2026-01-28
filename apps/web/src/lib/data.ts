import * as fs from "fs";
import * as path from "path";
import type { BookOfMormon, Book, Chapter } from "@plainenglishbom/core";
import {
  slugify,
  unslugify,
  unslugifyForLocale,
  getBookSlugs,
  getBookSlugsForLocale,
  translateSlug,
  getCanonicalSlug,
  isValidSlug,
} from "@plainenglishbom/core";
import { defaultLocale } from "../../i18n/config";

// Re-export core utilities for convenience
export {
  slugify,
  unslugify,
  unslugifyForLocale,
  getBookSlugs,
  getBookSlugsForLocale,
  translateSlug,
  getCanonicalSlug,
  isValidSlug,
};

// Data paths per locale
const DATA_PATHS: Record<string, string> = {
  en: path.join(process.cwd(), "../../data/transformed/en/parsed.json"),
  es: path.join(process.cwd(), "../../data/transformed/es/parsed.json"),
};

// Cache per locale
const cachedData: Record<string, BookOfMormon | null> = {};

/**
 * Check if data exists for a given locale.
 */
export function hasDataForLocale(locale: string): boolean {
  const dataPath = DATA_PATHS[locale];
  if (!dataPath) return false;
  return fs.existsSync(dataPath);
}

/**
 * Get the Book of Mormon data for a given locale.
 * Falls back to default locale if locale data doesn't exist.
 */
export function getBookOfMormon(locale: string = defaultLocale): BookOfMormon {
  // Use the requested locale if data exists, otherwise fall back to default
  const effectiveLocale = hasDataForLocale(locale) ? locale : defaultLocale;

  if (cachedData[effectiveLocale]) {
    return cachedData[effectiveLocale]!;
  }

  const dataPath = DATA_PATHS[effectiveLocale] ?? DATA_PATHS[defaultLocale];
  const content = fs.readFileSync(dataPath, "utf-8");
  cachedData[effectiveLocale] = JSON.parse(content) as BookOfMormon;
  return cachedData[effectiveLocale]!;
}

/**
 * Get all books for a given locale.
 */
export function getAllBooks(locale: string = defaultLocale): Book[] {
  return getBookOfMormon(locale).books;
}

/**
 * Get a specific book by short name for a given locale.
 * Handles localized slugs by converting to canonical English names.
 */
export function getBook(
  shortName: string,
  locale: string = defaultLocale
): Book | undefined {
  // Convert localized slug to English book name for lookup
  const canonicalSlug = getCanonicalSlug(shortName.toLowerCase());
  const englishName = unslugify(canonicalSlug);

  return getAllBooks(locale).find(
    (b) => b.shortName.toLowerCase() === englishName.toLowerCase()
  );
}

/**
 * Get a specific chapter by book short name and chapter number.
 */
export function getChapter(
  bookShortName: string,
  chapterNumber: number,
  locale: string = defaultLocale
): Chapter | undefined {
  const book = getBook(bookShortName, locale);
  return book?.chapters.find((c) => c.number === chapterNumber);
}
