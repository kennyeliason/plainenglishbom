import * as fs from "fs";
import * as path from "path";
import type { BookOfMormon, Book, Chapter } from "@plainenglishbom/core";
import { slugify, unslugify, getBookSlugs } from "@plainenglishbom/core";

// Re-export core utilities for convenience
export { slugify, unslugify, getBookSlugs };

const DATA_PATH = path.join(process.cwd(), "../../data/transformed/parsed.json");

let cachedData: BookOfMormon | null = null;

export function getBookOfMormon(): BookOfMormon {
  if (cachedData) return cachedData;

  const content = fs.readFileSync(DATA_PATH, "utf-8");
  cachedData = JSON.parse(content) as BookOfMormon;
  return cachedData;
}

export function getAllBooks(): Book[] {
  return getBookOfMormon().books;
}

export function getBook(shortName: string): Book | undefined {
  return getAllBooks().find(
    (b) => b.shortName.toLowerCase() === shortName.toLowerCase()
  );
}

export function getChapter(
  bookShortName: string,
  chapterNumber: number
): Chapter | undefined {
  const book = getBook(bookShortName);
  return book?.chapters.find((c) => c.number === chapterNumber);
}
