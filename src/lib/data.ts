import * as fs from "fs";
import * as path from "path";
import type { BookOfMormon, Book, Chapter } from "./types";

const DATA_PATH = path.join(process.cwd(), "data/transformed/parsed.json");

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

export function getBookSlugs(): string[] {
  return getAllBooks().map((b) => slugify(b.shortName));
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function unslugify(slug: string): string {
  // Map common slugs back to proper names
  const slugMap: Record<string, string> = {
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

  return slugMap[slug] ?? slug;
}
