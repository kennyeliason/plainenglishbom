import * as fs from "fs";
import * as path from "path";
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
  mode: TransformMode
): Promise<string> {
  if (mode === "rules") {
    return applyRuleBasedTransform(verse.text);
  } else if (mode === "ai") {
    const result = await aiTransformVerse(verse.text);
    return result.transformed;
  } else {
    // Combined: apply rules first, then AI for cleanup
    const ruleTransformed = applyRuleBasedTransform(verse.text);
    // Only use AI if the text is still complex
    if (ruleTransformed.length > 100 || ruleTransformed.includes(";")) {
      const result = await aiTransformVerse(ruleTransformed);
      return result.transformed;
    }
    return ruleTransformed;
  }
}

async function transformBook(
  book: Book,
  mode: TransformMode,
  existing?: Book
): Promise<Book> {
  const transformedChapters: Chapter[] = [];

  for (const chapter of book.chapters) {
    const existingChapter = existing?.chapters.find(
      (c) => c.number === chapter.number
    );
    const transformedVerses: Verse[] = [];

    for (const verse of chapter.verses) {
      const existingVerse = existingChapter?.verses.find(
        (v) => v.number === verse.number
      );

      // Skip if already transformed
      if (existingVerse?.plainText) {
        transformedVerses.push(existingVerse);
        processedVerses++;
        continue;
      }

      try {
        const plainText = await transformVerse(verse, mode);
        transformedVerses.push({
          ...verse,
          plainText,
        });
      } catch (error) {
        console.error(
          `\nError transforming ${book.shortName} ${chapter.number}:${verse.number}:`,
          error
        );
        transformedVerses.push({
          ...verse,
          plainText: applyRuleBasedTransform(verse.text), // Fallback to rules
        });
      }

      processedVerses++;
      printProgress(book.shortName, chapter.number, verse.number);

      // Add small delay for AI mode to avoid rate limits
      if (mode === "ai" || mode === "combined") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    transformedChapters.push({
      ...chapter,
      verses: transformedVerses,
    });
  }

  return {
    ...book,
    chapters: transformedChapters,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const mode: TransformMode = (args[0] as TransformMode) || "rules";
  const bookFilter = args[1]; // Optional: specific book to transform

  if (!["rules", "ai", "combined"].includes(mode)) {
    console.error("Usage: npx tsx scripts/transform-text.ts [rules|ai|combined] [book-name]");
    console.error("Examples:");
    console.error("  npx tsx scripts/transform-text.ts rules");
    console.error("  npx tsx scripts/transform-text.ts ai '1 Nephi'");
    console.error("  npx tsx scripts/transform-text.ts combined");
    process.exit(1);
  }

  console.log(`Transformation mode: ${mode}`);
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

  // Transform each book
  for (const book of original.books) {
    if (bookFilter && book.shortName !== bookFilter) {
      // Keep existing book data if filtering
      const existingBook = transformed.books.find(
        (b) => b.shortName === book.shortName
      );
      if (existingBook) {
        // Already in transformed, skip
        continue;
      }
      continue;
    }

    console.log(`\nTransforming ${book.shortName}...`);
    const existingBook = transformed.books.find(
      (b) => b.shortName === book.shortName
    );
    const transformedBook = await transformBook(book, mode, existingBook);

    // Update or add the transformed book
    const existingIndex = transformed.books.findIndex(
      (b) => b.shortName === book.shortName
    );
    if (existingIndex >= 0) {
      transformed.books[existingIndex] = transformedBook;
    } else {
      transformed.books.push(transformedBook);
    }

    // Save progress after each book
    saveTransformed(transformed);
    console.log(`\nSaved progress for ${book.shortName}`);
  }

  console.log("\n\n=== Transformation Complete ===");
  console.log(`Total verses transformed: ${countTransformedVerses(transformed)}`);
  console.log(`Output saved to: ${TRANSFORMED_PATH}`);
}

main().catch(console.error);
