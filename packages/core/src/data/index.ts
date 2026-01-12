export type { DataProvider } from "./types";

/**
 * Map of book slugs to proper display names.
 * Used for URL routing on both web and mobile.
 */
export const BOOK_SLUG_MAP: Record<string, string> = {
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
};

/**
 * Convert a book name to a URL-safe slug.
 * Example: "1 Nephi" -> "1-nephi"
 */
export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Convert a URL slug back to the proper book name.
 * Example: "1-nephi" -> "1 Nephi"
 */
export function unslugify(slug: string): string {
  return BOOK_SLUG_MAP[slug] ?? slug;
}

/**
 * Get all valid book slugs.
 */
export function getBookSlugs(): string[] {
  return Object.keys(BOOK_SLUG_MAP);
}
