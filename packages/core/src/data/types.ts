import type { BookOfMormon, Book, Chapter } from "../types";

/**
 * Abstract interface for data access.
 * Platform-specific implementations provide the actual data loading.
 */
export interface DataProvider {
  getBookOfMormon(): BookOfMormon | Promise<BookOfMormon>;
  getAllBooks(): Book[] | Promise<Book[]>;
  getBook(shortName: string): Book | undefined | Promise<Book | undefined>;
  getChapter(
    bookShortName: string,
    chapterNumber: number
  ): Chapter | undefined | Promise<Chapter | undefined>;
}
