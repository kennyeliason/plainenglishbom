import type { BookOfMormon, Book, Chapter } from "@plainenglishbom/core";
import { slugify, unslugify, getBookSlugs } from "@plainenglishbom/core";

// Import the bundled JSON data directly
import bomData from "../assets/data/parsed.json";

// Re-export core utilities
export { slugify, unslugify, getBookSlugs };

// Cast the imported data to our type
const data = bomData as BookOfMormon;

export function getBookOfMormon(): BookOfMormon {
  return data;
}

export function getAllBooks(): Book[] {
  return data.books;
}

export function getBook(shortName: string): Book | undefined {
  return data.books.find(
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
