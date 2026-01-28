export type { DataProvider } from "./types";

/**
 * Map of book slugs to proper display names by locale.
 * Used for URL routing on both web and mobile.
 */
export const BOOK_SLUGS: Record<string, Record<string, string>> = {
  en: {
    "1-nephi": "1 Nephi",
    "2-nephi": "2 Nephi",
    "3-nephi": "3 Nephi",
    "4-nephi": "4 Nephi",
    jacob: "Jacob",
    enos: "Enos",
    jarom: "Jarom",
    omni: "Omni",
    "words-of-mormon": "Words of Mormon",
    mosiah: "Mosiah",
    alma: "Alma",
    helaman: "Helaman",
    mormon: "Mormon",
    ether: "Ether",
    moroni: "Moroni",
  },
  es: {
    "1-nefi": "1 Nefi",
    "2-nefi": "2 Nefi",
    "3-nefi": "3 Nefi",
    "4-nefi": "4 Nefi",
    jacob: "Jacob",
    enos: "Enós",
    jarom: "Jarom",
    omni: "Omni",
    "palabras-de-mormon": "Palabras de Mormón",
    mosiah: "Mosíah",
    alma: "Alma",
    helaman: "Helamán",
    mormon: "Mormón",
    eter: "Éter",
    moroni: "Moroni",
  },
};

/**
 * Cross-locale slug mapping for language switcher.
 * Maps any locale's slug to all equivalent slugs.
 */
export const SLUG_EQUIVALENTS: Record<string, Record<string, string>> = {
  // English slugs
  "1-nephi": { en: "1-nephi", es: "1-nefi" },
  "2-nephi": { en: "2-nephi", es: "2-nefi" },
  "3-nephi": { en: "3-nephi", es: "3-nefi" },
  "4-nephi": { en: "4-nephi", es: "4-nefi" },
  jacob: { en: "jacob", es: "jacob" },
  enos: { en: "enos", es: "enos" },
  jarom: { en: "jarom", es: "jarom" },
  omni: { en: "omni", es: "omni" },
  "words-of-mormon": { en: "words-of-mormon", es: "palabras-de-mormon" },
  mosiah: { en: "mosiah", es: "mosiah" },
  alma: { en: "alma", es: "alma" },
  helaman: { en: "helaman", es: "helaman" },
  mormon: { en: "mormon", es: "mormon" },
  ether: { en: "ether", es: "eter" },
  moroni: { en: "moroni", es: "moroni" },
  // Spanish slugs (duplicate mappings for reverse lookup)
  "1-nefi": { en: "1-nephi", es: "1-nefi" },
  "2-nefi": { en: "2-nephi", es: "2-nefi" },
  "3-nefi": { en: "3-nephi", es: "3-nefi" },
  "4-nefi": { en: "4-nephi", es: "4-nefi" },
  "palabras-de-mormon": { en: "words-of-mormon", es: "palabras-de-mormon" },
  eter: { en: "ether", es: "eter" },
};

/**
 * Legacy BOOK_SLUG_MAP for backwards compatibility.
 * Maps to English slugs.
 * @deprecated Use BOOK_SLUGS.en instead
 */
export const BOOK_SLUG_MAP = BOOK_SLUGS.en;

/**
 * Convert a book name to a URL-safe slug.
 * Example: "1 Nephi" -> "1-nephi"
 */
export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Convert a URL slug back to the proper book name for a given locale.
 * Example: "1-nephi" (en) -> "1 Nephi", "1-nefi" (es) -> "1 Nefi"
 */
export function unslugifyForLocale(slug: string, locale: string): string {
  const localeMap = BOOK_SLUGS[locale] ?? BOOK_SLUGS.en;
  return localeMap[slug] ?? slug;
}

/**
 * Convert a URL slug back to the proper book name (English).
 * Example: "1-nephi" -> "1 Nephi"
 */
export function unslugify(slug: string): string {
  return unslugifyForLocale(slug, "en");
}

/**
 * Get all valid book slugs for a given locale.
 */
export function getBookSlugsForLocale(locale: string): string[] {
  const localeMap = BOOK_SLUGS[locale] ?? BOOK_SLUGS.en;
  return Object.keys(localeMap);
}

/**
 * Get all valid book slugs (English).
 */
export function getBookSlugs(): string[] {
  return getBookSlugsForLocale("en");
}

/**
 * Translate a slug from one locale to another.
 * Example: translateSlug("1-nephi", "en", "es") -> "1-nefi"
 */
export function translateSlug(
  slug: string,
  fromLocale: string,
  toLocale: string
): string {
  if (fromLocale === toLocale) return slug;

  const equivalents = SLUG_EQUIVALENTS[slug];
  if (equivalents && equivalents[toLocale]) {
    return equivalents[toLocale];
  }

  // If no equivalent found, return original slug
  return slug;
}

/**
 * Get the English slug for any locale's slug.
 * This is useful for data lookups since data uses English book names.
 */
export function getCanonicalSlug(slug: string): string {
  const equivalents = SLUG_EQUIVALENTS[slug];
  return equivalents?.en ?? slug;
}

/**
 * Check if a slug is valid for a given locale.
 */
export function isValidSlug(slug: string, locale: string): boolean {
  const localeMap = BOOK_SLUGS[locale] ?? BOOK_SLUGS.en;
  return slug in localeMap;
}
