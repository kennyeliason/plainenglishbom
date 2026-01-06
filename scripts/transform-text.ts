// Load environment variables from .env.local
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import * as fs from "fs";
import type { BookOfMormon, Book, Chapter, Verse } from "../src/lib/types";
import { applyRuleBasedTransform } from "../src/lib/transform-rules";
import { aiTransformVerse } from "../src/lib/ai-transform";

const DATA_DIR = path.join(process.cwd(), "data");
const ORIGINAL_PATH = path.join(DATA_DIR, "original/parsed.json");
const TRANSFORMED_PATH = path.join(DATA_DIR, "transformed/parsed.json");

// Progress tracking
let totalVerses = 0;
let processedVerses = 0;
let startTime = Date.now();

function loadOriginal(): BookOfMormon {
  const content = fs.readFileSync(ORIGINAL_PATH, "utf-8");
  return JSON.parse(content) as BookOfMormon;
}

function saveTransformed(data: BookOfMormon): void {
  fs.mkdirSync(path.dirname(TRANSFORMED_PATH), { recursive: true });
  fs.writeFileSync(TRANSFORMED_PATH, JSON.stringify(data, null, 2));
}

function loadProgress(): BookOfMormon | null {
  try {
    if (fs.existsSync(TRANSFORMED_PATH)) {
      const content = fs.readFileSync(TRANSFORMED_PATH, "utf-8");
      return JSON.parse(content) as BookOfMormon;
    }
  } catch {
    // Ignore errors, start fresh
  }
  return null;
}

function countVerses(data: BookOfMormon): number {
  return data.books.reduce(
    (sum, book) =>
      sum + book.chapters.reduce((chSum, ch) => chSum + ch.verses.length, 0),
    0
  );
}

function countTransformedVerses(data: BookOfMormon): number {
  return data.books.reduce(
    (sum, book) =>
      sum +
      book.chapters.reduce(
        (chSum, ch) =>
          chSum + ch.verses.filter((v) => v.plainText !== undefined).length,
        0
      ),
    0
  );
}

function printProgress(book: string, chapter: number, verse: number): void {
  const elapsed = (Date.now() - startTime) / 1000;
  const rate = processedVerses / elapsed;
  const remaining = (totalVerses - processedVerses) / rate;

  process.stdout.write(
    `\r[${processedVerses}/${totalVerses}] ${book} ${chapter}:${verse} - ` +
      `${rate.toFixed(1)} verses/sec, ~${Math.round(remaining)}s remaining   `
  );
}

type TransformMode = "rules" | "ai" | "combined";

async function transformVerse(
  verse: Verse,
  mode: TransformMode,
  options: {
    bookName?: string;
    chapterNumber?: number;
    // previousVerse and nextVerse removed - they cause verse bleed
  } = {}
): Promise<string> {
  if (mode === "rules") {
    return applyRuleBasedTransform(verse.text);
  } else if (mode === "ai") {
    const result = await aiTransformVerse(verse.text, {
      bookName: options.bookName,
      chapterNumber: options.chapterNumber,
      verseNumber: verse.number,
      // previousVerse and nextVerse intentionally not passed
    });
    return result.transformed;
  } else {
    // Combined: apply rules first, then AI for cleanup
    const ruleTransformed = applyRuleBasedTransform(verse.text);
    // Only use AI if the text is still complex
    if (ruleTransformed.length > 100 || ruleTransformed.includes(";")) {
      const result = await aiTransformVerse(ruleTransformed, {
        bookName: options.bookName,
        chapterNumber: options.chapterNumber,
        verseNumber: verse.number,
        // previousVerse and nextVerse intentionally not passed
      });
      return result.transformed;
    }
    return ruleTransformed;
  }
}

async function transformChapter(
  chapter: Chapter,
  book: Book,
  mode: TransformMode,
  existingChapter?: Chapter,
  regenerate: boolean = false
): Promise<Chapter> {
  const transformedVerses: Verse[] = [];

  for (let i = 0; i < chapter.verses.length; i++) {
    const verse = chapter.verses[i];
    const existingVerse = existingChapter?.verses.find(
      (v) => v.number === verse.number
    );

    // Skip if already transformed and not regenerating
    if (!regenerate && existingVerse?.plainText) {
      transformedVerses.push(existingVerse);
      processedVerses++;
      continue;
    }

    try {
      const plainText = await transformVerse(verse, mode, {
        bookName: book.shortName,
        chapterNumber: chapter.number,
        // previousVerse and nextVerse removed - they cause verse bleed
      });
      transformedVerses.push({
        ...verse,
        plainText,
      });
    } catch (error) {
      console.error(
        `\n❌ FAILED to transform ${book.shortName} ${chapter.number}:${verse.number}:`,
        error instanceof Error ? error.message : String(error)
      );
      // Mark as failed - don't silently use original text
      transformedVerses.push({
        ...verse,
        plainText: `[TRANSLATION FAILED: ${
          error instanceof Error ? error.message : String(error)
        }]`,
      });
    }

    processedVerses++;
    printProgress(book.shortName, chapter.number, verse.number);

    // Note: No delay needed - retry logic with exponential backoff handles rate limits
  }

  return {
    ...chapter,
    verses: transformedVerses,
  };
}

async function transformBook(
  book: Book,
  mode: TransformMode,
  existing?: Book,
  regenerate: boolean = false,
  onChapterComplete?: (chapter: Chapter) => void // Callback to save after each chapter
): Promise<Book> {
  const transformedChapters: Chapter[] = [];

  for (const chapter of book.chapters) {
    const existingChapter = existing?.chapters.find(
      (c) => c.number === chapter.number
    );
    const transformedChapter = await transformChapter(
      chapter,
      book,
      mode,
      existingChapter,
      regenerate
    );
    transformedChapters.push(transformedChapter);

    // Call the save callback after each chapter completes
    if (onChapterComplete) {
      onChapterComplete(transformedChapter);
    }
  }

  return {
    ...book,
    chapters: transformedChapters,
  };
}

function parseArgs(): {
  mode: TransformMode;
  regenerate?: boolean;
  regenerateBook?: string;
  regenerateChapter?: { book: string; chapter: number };
  bookFilter?: string;
} {
  const args = process.argv.slice(2);
  const mode: TransformMode = "ai"; // Default to AI
  const result: {
    mode: TransformMode;
    regenerate?: boolean;
    regenerateBook?: string;
    regenerateChapter?: { book: string; chapter: number };
    bookFilter?: string;
  } = { mode };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--regenerate") {
      result.regenerate = true;
    } else if (arg === "--regenerate-book" && args[i + 1]) {
      result.regenerateBook = args[i + 1];
      i++;
    } else if (arg === "--regenerate-chapter" && args[i + 1] && args[i + 2]) {
      result.regenerateChapter = {
        book: args[i + 1],
        chapter: parseInt(args[i + 2], 10),
      };
      i += 2;
    } else if (["rules", "ai", "combined"].includes(arg)) {
      result.mode = arg as TransformMode;
    } else if (!arg.startsWith("--")) {
      result.bookFilter = arg;
    }
  }

  return result;
}

async function main() {
  const { mode, regenerate, regenerateBook, regenerateChapter, bookFilter } =
    parseArgs();

  console.log(`Transformation mode: ${mode} (default is AI)`);
  if (regenerate) {
    console.log("Regenerating all verses");
  }
  if (regenerateBook) {
    console.log(`Regenerating book: ${regenerateBook}`);
  }
  if (regenerateChapter) {
    console.log(
      `Regenerating chapter: ${regenerateChapter.book} ${regenerateChapter.chapter}`
    );
  }
  if (bookFilter) {
    console.log(`Filtering to book: ${bookFilter}`);
  }

  // Load original data
  const original = loadOriginal();
  totalVerses = countVerses(original);
  console.log(`Total verses: ${totalVerses}`);

  // Load existing progress
  let transformed = loadProgress();
  if (transformed) {
    const existingCount = countTransformedVerses(transformed);
    console.log(`Resuming from ${existingCount} already transformed verses`);
    processedVerses = existingCount;
  } else {
    transformed = { books: [] };
  }

  startTime = Date.now();

  // Handle chapter regeneration
  if (regenerateChapter) {
    const { book: bookName, chapter: chapterNum } = regenerateChapter;
    const book = original.books.find((b) => b.shortName === bookName);
    if (!book) {
      console.error(`Book not found: ${bookName}`);
      process.exit(1);
    }
    const chapter = book.chapters.find((c) => c.number === chapterNum);
    if (!chapter) {
      console.error(`Chapter not found: ${bookName} ${chapterNum}`);
      process.exit(1);
    }

    let transformedBook = transformed.books.find(
      (b) => b.shortName === bookName
    );
    if (!transformedBook) {
      transformedBook = { ...book, chapters: [] };
      transformed.books.push(transformedBook);
    }

    const existingChapter = transformedBook.chapters.find(
      (c) => c.number === chapterNum
    );
    const transformedChapter = await transformChapter(
      chapter,
      book,
      mode,
      existingChapter,
      true // regenerate
    );

    const chapterIndex = transformedBook.chapters.findIndex(
      (c) => c.number === chapterNum
    );
    if (chapterIndex >= 0) {
      transformedBook.chapters[chapterIndex] = transformedChapter;
    } else {
      transformedBook.chapters.push(transformedChapter);
    }

    saveTransformed(transformed);
    console.log(`\nRegenerated chapter ${bookName} ${chapterNum}`);
    process.exit(0);
  }

  // Transform each book
  for (const book of original.books) {
    if (bookFilter && book.shortName !== bookFilter) {
      // Keep existing book data if filtering
      const existingBook = transformed.books.find(
        (b) => b.shortName === book.shortName
      );
      if (existingBook) {
        continue;
      }
      continue;
    }

    const shouldRegenerate = !!regenerate || regenerateBook === book.shortName;

    console.log(`\nTransforming ${book.shortName}...`);
    const existingBook = transformed.books.find(
      (b) => b.shortName === book.shortName
    );

    // Ensure the book exists in transformed data (so we can update chapters incrementally)
    let bookIndex = transformed.books.findIndex(
      (b) => b.shortName === book.shortName
    );
    if (bookIndex < 0) {
      transformed.books.push({ ...book, chapters: [] });
      bookIndex = transformed.books.length - 1;
    }

    const transformedBook = await transformBook(
      book,
      mode,
      existingBook,
      shouldRegenerate,
      // Save after each chapter completes
      (completedChapter) => {
        // Update or add the chapter in the book
        const chapterIndex = transformed.books[bookIndex].chapters.findIndex(
          (c) => c.number === completedChapter.number
        );
        if (chapterIndex >= 0) {
          transformed.books[bookIndex].chapters[chapterIndex] =
            completedChapter;
        } else {
          transformed.books[bookIndex].chapters.push(completedChapter);
        }
        // Save to disk
        saveTransformed(transformed);
        console.log(
          `  💾 Saved ${book.shortName} chapter ${completedChapter.number}`
        );
      }
    );

    // Update the full book (ensures chapter order is correct)
    transformed.books[bookIndex] = transformedBook;
    saveTransformed(transformed);
    console.log(`\n✅ Completed ${book.shortName}`);
  }

  console.log("\n\n=== Transformation Complete ===");
  console.log(
    `Total verses transformed: ${countTransformedVerses(transformed)}`
  );
  console.log(`Output saved to: ${TRANSFORMED_PATH}`);
}

main().catch(console.error);
