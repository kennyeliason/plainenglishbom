import * as fs from "fs";
import * as path from "path";
import type { BookOfMormon } from "@plainenglishbom/core";

/**
 * Load the transformed Book of Mormon data
 */
export function loadBookOfMormon(locale: string = "en"): BookOfMormon {
  const dataPath = path.join(
    process.cwd(),
    `../../data/transformed/${locale}/parsed.json`
  );

  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found: ${dataPath}`);
  }

  const content = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(content) as BookOfMormon;
}

/**
 * Get statistics about the book
 */
export function getBookStats(data: BookOfMormon) {
  let totalVerses = 0;
  let totalChapters = 0;
  let translatedVerses = 0;

  for (const book of data.books) {
    totalChapters += book.chapters.length;
    for (const chapter of book.chapters) {
      totalVerses += chapter.verses.length;
      for (const verse of chapter.verses) {
        if (verse.plainText) {
          translatedVerses++;
        }
      }
    }
  }

  return {
    totalBooks: data.books.length,
    totalChapters,
    totalVerses,
    translatedVerses,
    percentTranslated: Math.round((translatedVerses / totalVerses) * 100),
  };
}
