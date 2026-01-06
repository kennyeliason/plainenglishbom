// ============================================================================
// MODEL TESTING SCRIPT
// ============================================================================
// This script tests AI translation on a chapter to compare quality.
// By default, it uses gpt-4.1 (our production model).
// You can add other models to the MODELS array to compare them.
//
// Usage:
//   npx ts-node scripts/test-models.ts [bookName] [chapter] [verseLimit]
//
// Examples:
//   npx ts-node scripts/test-models.ts                     # 1 Nephi 1, all verses
//   npx ts-node scripts/test-models.ts "1 Nephi" 1 5       # First 5 verses
//   npx ts-node scripts/test-models.ts "Mosiah" 3          # Mosiah 3, all verses
// ============================================================================

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import * as fs from "fs";
import type { BookOfMormon, Verse } from "../src/lib/types";
import { aiTransformVerse } from "../src/lib/ai-transform";

const DATA_DIR = path.join(process.cwd(), "data");
const ORIGINAL_PATH = path.join(DATA_DIR, "original/parsed.json");
const TEST_OUTPUT_DIR = path.join(DATA_DIR, "model-comparison");

// ============================================================================
// MODELS TO TEST
// ============================================================================
// gpt-4.1 is our production model - it's reliable and cost-effective.
// Add other models here if you want to compare them.
const MODELS = ["gpt-4.1"];

// ============================================================================
// DATA TYPES
// ============================================================================

interface VerseComparison {
  number: number;
  original: string;
  translations: Record<string, string>;
}

interface ChapterComparison {
  book: string;
  chapter: number;
  verses: VerseComparison[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function loadOriginal(): BookOfMormon {
  const content = fs.readFileSync(ORIGINAL_PATH, "utf-8");
  return JSON.parse(content) as BookOfMormon;
}

// Translate a single verse with a specific model
async function translateVerse(
  verse: Verse,
  model: string,
  options: { bookName: string; chapterNumber: number }
): Promise<string | null> {
  try {
    const result = await aiTransformVerse(verse.text, {
      ...options,
      verseNumber: verse.number,
      model: model,
    });
    return result.transformed;
  } catch (error: unknown) {
    // Check if the model doesn't exist
    const err = error as { code?: string; status?: number };
    if (err?.code === "model_not_found" || err?.status === 404) {
      console.warn(`⚠️  Model ${model} not found. Skipping.`);
      return null;
    }
    console.error(`Error with ${model} on verse ${verse.number}:`, error);
    return verse.text; // Fallback to original
  }
}

// ============================================================================
// MAIN TEST FUNCTION
// ============================================================================

async function testChapter(
  bookName: string,
  chapterNumber: number,
  verseLimit?: number
): Promise<ChapterComparison> {
  // Load the original data
  const original = loadOriginal();
  const book = original.books.find((b) => b.shortName === bookName);
  if (!book) {
    throw new Error(`Book not found: ${bookName}`);
  }

  const chapter = book.chapters.find((c) => c.number === chapterNumber);
  if (!chapter) {
    throw new Error(`Chapter not found: ${bookName} ${chapterNumber}`);
  }

  // Determine which verses to test
  const versesToTest = verseLimit
    ? chapter.verses.slice(0, verseLimit)
    : chapter.verses;

  console.log(`\n📖 Testing ${bookName} Chapter ${chapterNumber}`);
  console.log(
    `   Verses: ${versesToTest.length}${
      verseLimit ? ` (first ${verseLimit})` : ""
    }`
  );
  console.log(`   Models: ${MODELS.join(", ")}\n`);

  const comparison: ChapterComparison = {
    book: bookName,
    chapter: chapterNumber,
    verses: [],
  };

  // Process each verse
  for (let i = 0; i < versesToTest.length; i++) {
    const verse = versesToTest[i]!;
    console.log(`📝 Verse ${verse.number}/${versesToTest.length}...`);

    const verseComparison: VerseComparison = {
      number: verse.number,
      original: verse.text,
      translations: {},
    };

    // Translate with each model
    for (const model of MODELS) {
      console.log(`   → ${model}...`);
      const translated = await translateVerse(verse, model, {
        bookName: book.shortName,
        chapterNumber: chapter.number,
      });
      if (translated !== null) {
        verseComparison.translations[model] = translated;
      }
    }

    comparison.verses.push(verseComparison);
  }

  return comparison;
}

// ============================================================================
// OUTPUT FUNCTIONS
// ============================================================================

function saveComparison(comparison: ChapterComparison): void {
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });

  const baseFilename = `${comparison.book.replace(/\s+/g, "-")}-chapter-${
    comparison.chapter
  }`;

  // Save as JSON (for programmatic access)
  const jsonPath = path.join(TEST_OUTPUT_DIR, `${baseFilename}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(comparison, null, 2));
  console.log(`\n📄 JSON saved: ${jsonPath}`);

  // Save as Markdown (for human reading)
  const mdPath = path.join(TEST_OUTPUT_DIR, `${baseFilename}.md`);
  let md = `# ${comparison.book} Chapter ${comparison.chapter} - Translation Comparison\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += `Models tested: ${MODELS.join(", ")}\n\n`;
  md += `---\n\n`;

  for (const verse of comparison.verses) {
    md += `## Verse ${verse.number}\n\n`;
    md += `**Original:**\n> ${verse.original}\n\n`;

    for (const model of MODELS) {
      const translation = verse.translations[model];
      if (translation) {
        md += `**${model}:**\n> ${translation}\n\n`;
      }
    }
    md += `---\n\n`;
  }

  fs.writeFileSync(mdPath, md);
  console.log(`📝 Markdown saved: ${mdPath}`);
}

// ============================================================================
// ENTRY POINT
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const bookName = args[0] || "1 Nephi";
  const chapterNumber = parseInt(args[1] || "1", 10);
  const verseLimit = args[2] ? parseInt(args[2], 10) : undefined;

  console.log(`\n=== Model Testing Script ===`);
  console.log(`Book: ${bookName}`);
  console.log(`Chapter: ${chapterNumber}`);
  if (verseLimit) console.log(`Verse limit: ${verseLimit}`);

  try {
    const comparison = await testChapter(bookName, chapterNumber, verseLimit);
    saveComparison(comparison);
    console.log(`\n✅ Done! Check: ${TEST_OUTPUT_DIR}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
