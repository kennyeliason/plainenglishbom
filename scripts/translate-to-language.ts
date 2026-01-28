/**
 * Translate the Plain English Book of Mormon to other languages.
 *
 * This script reads the English transformed data and translates the plainText
 * field to the target language using OpenAI's API.
 *
 * Usage:
 *   npm run translate -- --lang es
 *   npm run translate -- --lang es --regenerate-book "1 Nephi"
 *   npm run translate -- --lang es --regenerate-chapter "1 Nephi" 1
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_DIR = __dirname;

// Load environment variables
dotenv.config({ path: path.join(SCRIPT_DIR, "../apps/web/.env.local") });
dotenv.config({ path: path.join(SCRIPT_DIR, "../.env.local") });

// Types
interface Verse {
  number: number;
  text: string;
  plainText?: string;
}

interface Chapter {
  number: number;
  verses: Verse[];
  summary?: string;
}

interface Book {
  name: string;
  shortName: string;
  chapters: Chapter[];
}

interface BookOfMormon {
  books: Book[];
}

// Paths
const DATA_DIR = path.join(SCRIPT_DIR, "../data");

// Language configurations
const LANGUAGE_CONFIGS: Record<
  string,
  {
    name: string;
    systemPrompt: string;
  }
> = {
  es: {
    name: "Spanish",
    systemPrompt: `You are translating modern English scripture text to clear, natural Latin American Spanish.

RULES:
1. Use "tú" form (informal) for addressing God, matching traditional Spanish scripture style
2. Preserve proper nouns (Nephi, Lehi, Moroni, Laban, Jerusalem, etc.) - do not translate names
3. Keep the spiritual tone reverent but accessible
4. Use natural Spanish phrasing - avoid word-for-word translation
5. Output ONLY the translated verse text, no explanations or quotes
6. Maintain the same sentence structure and paragraph breaks as the original
7. Do not add or remove content - translate exactly what is given`,
  },
  pt: {
    name: "Portuguese",
    systemPrompt: `You are translating modern English scripture text to clear, natural Brazilian Portuguese.

RULES:
1. Use "tu" form for addressing God, matching traditional Portuguese scripture style
2. Preserve proper nouns (Nephi, Lehi, Moroni, Laban, Jerusalem, etc.) - do not translate names
3. Keep the spiritual tone reverent but accessible
4. Use natural Portuguese phrasing - avoid word-for-word translation
5. Output ONLY the translated verse text, no explanations or quotes
6. Maintain the same sentence structure and paragraph breaks as the original
7. Do not add or remove content - translate exactly what is given`,
  },
};

// OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Error: OPENAI_API_KEY environment variable is not set");
      console.error(
        "Please set it in apps/web/.env.local or .env.local in the root"
      );
      process.exit(1);
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

// Progress tracking
let totalVerses = 0;
let processedVerses = 0;
let startTime = Date.now();

function loadEnglishData(): BookOfMormon {
  const englishPath = path.join(DATA_DIR, "transformed/en/parsed.json");
  if (!fs.existsSync(englishPath)) {
    console.error(`English data not found at: ${englishPath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(englishPath, "utf-8");
  return JSON.parse(content) as BookOfMormon;
}

function loadTranslatedData(lang: string): BookOfMormon | null {
  const translatedPath = path.join(DATA_DIR, `transformed/${lang}/parsed.json`);
  try {
    if (fs.existsSync(translatedPath)) {
      const content = fs.readFileSync(translatedPath, "utf-8");
      return JSON.parse(content) as BookOfMormon;
    }
  } catch {
    // Ignore errors, start fresh
  }
  return null;
}

function saveTranslatedData(lang: string, data: BookOfMormon): void {
  const translatedPath = path.join(DATA_DIR, `transformed/${lang}/parsed.json`);
  fs.mkdirSync(path.dirname(translatedPath), { recursive: true });
  fs.writeFileSync(translatedPath, JSON.stringify(data, null, 2));
}

function countVerses(data: BookOfMormon): number {
  return data.books.reduce(
    (sum, book) =>
      sum + book.chapters.reduce((chSum, ch) => chSum + ch.verses.length, 0),
    0
  );
}

function countTranslatedVerses(data: BookOfMormon): number {
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
  const rate = processedVerses / elapsed || 0;
  const remaining = rate > 0 ? (totalVerses - processedVerses) / rate : 0;

  process.stdout.write(
    `\r[${processedVerses}/${totalVerses}] ${book} ${chapter}:${verse} - ` +
      `${rate.toFixed(1)} verses/sec, ~${Math.round(remaining)}s remaining   `
  );
}

async function translateText(
  text: string,
  lang: string,
  retries = 3
): Promise<string> {
  const config = LANGUAGE_CONFIGS[lang];
  if (!config) {
    throw new Error(`Unsupported language: ${lang}`);
  }

  const client = getOpenAIClient();

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: config.systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const translated = response.choices[0]?.message?.content?.trim();
      if (!translated) {
        throw new Error("Empty response from OpenAI");
      }

      return translated;
    } catch (error: unknown) {
      const isRateLimit =
        error instanceof Error &&
        (error.message.includes("429") ||
          error.message.includes("rate limit") ||
          error.message.includes("Rate limit"));

      if (isRateLimit && attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(`\n  Rate limited, waiting ${Math.round(delay / 1000)}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw new Error("Max retries exceeded");
}

async function translateChapter(
  chapter: Chapter,
  book: Book,
  lang: string,
  existingChapter?: Chapter,
  regenerate: boolean = false
): Promise<Chapter> {
  const translatedVerses: Verse[] = [];

  for (const verse of chapter.verses) {
    const existingVerse = existingChapter?.verses.find(
      (v) => v.number === verse.number
    );

    // Skip if already translated and not regenerating
    if (
      !regenerate &&
      existingVerse?.plainText &&
      !existingVerse.plainText.startsWith("[TRANSLATION FAILED")
    ) {
      translatedVerses.push(existingVerse);
      processedVerses++;
      continue;
    }

    // Get the English plainText to translate (or original text if no plainText)
    const textToTranslate = verse.plainText || verse.text;

    try {
      const translatedText = await translateText(textToTranslate, lang);
      translatedVerses.push({
        number: verse.number,
        text: verse.text, // Keep original English text
        plainText: translatedText, // Translated text
      });
    } catch (error) {
      console.error(
        `\n❌ FAILED to translate ${book.shortName} ${chapter.number}:${verse.number}:`,
        error instanceof Error ? error.message : String(error)
      );
      translatedVerses.push({
        number: verse.number,
        text: verse.text,
        plainText: `[TRANSLATION FAILED: ${
          error instanceof Error ? error.message : String(error)
        }]`,
      });
    }

    processedVerses++;
    printProgress(book.shortName, chapter.number, verse.number);
  }

  return {
    ...chapter,
    verses: translatedVerses,
  };
}

async function translateBook(
  book: Book,
  lang: string,
  existing?: Book,
  regenerate: boolean = false,
  onChapterComplete?: (chapter: Chapter) => void
): Promise<Book> {
  const translatedChapters: Chapter[] = [];

  for (const chapter of book.chapters) {
    const existingChapter = existing?.chapters.find(
      (c) => c.number === chapter.number
    );
    const translatedChapter = await translateChapter(
      chapter,
      book,
      lang,
      existingChapter,
      regenerate
    );
    translatedChapters.push(translatedChapter);

    if (onChapterComplete) {
      onChapterComplete(translatedChapter);
    }
  }

  return {
    ...book,
    chapters: translatedChapters,
  };
}

function parseArgs(): {
  lang: string;
  regenerate?: boolean;
  regenerateBook?: string;
  regenerateChapter?: { book: string; chapter: number };
} {
  const args = process.argv.slice(2);
  let lang = "";
  const result: {
    lang: string;
    regenerate?: boolean;
    regenerateBook?: string;
    regenerateChapter?: { book: string; chapter: number };
  } = { lang: "" };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === "--lang" || arg === "-l") && args[i + 1]) {
      result.lang = args[i + 1];
      i++;
    } else if (arg === "--regenerate") {
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
    }
  }

  return result;
}

async function main() {
  const { lang, regenerate, regenerateBook, regenerateChapter } = parseArgs();

  if (!lang) {
    console.error("Usage: npm run translate -- --lang <language-code>");
    console.error("Supported languages:", Object.keys(LANGUAGE_CONFIGS).join(", "));
    process.exit(1);
  }

  if (!LANGUAGE_CONFIGS[lang]) {
    console.error(`Unsupported language: ${lang}`);
    console.error("Supported languages:", Object.keys(LANGUAGE_CONFIGS).join(", "));
    process.exit(1);
  }

  console.log(`Translating to: ${LANGUAGE_CONFIGS[lang].name} (${lang})`);

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

  // Load English source data
  const english = loadEnglishData();
  totalVerses = countVerses(english);
  console.log(`Total verses: ${totalVerses}`);

  // Load existing translations
  let translated = loadTranslatedData(lang);
  if (translated) {
    const existingCount = countTranslatedVerses(translated);
    console.log(`Resuming from ${existingCount} already translated verses`);
    processedVerses = existingCount;
  } else {
    translated = { books: [] };
  }

  startTime = Date.now();

  // Handle chapter regeneration
  if (regenerateChapter) {
    const { book: bookName, chapter: chapterNum } = regenerateChapter;
    const book = english.books.find((b) => b.shortName === bookName);
    if (!book) {
      console.error(`Book not found: ${bookName}`);
      process.exit(1);
    }
    const chapter = book.chapters.find((c) => c.number === chapterNum);
    if (!chapter) {
      console.error(`Chapter not found: ${bookName} ${chapterNum}`);
      process.exit(1);
    }

    let translatedBook = translated.books.find(
      (b) => b.shortName === bookName
    );
    if (!translatedBook) {
      translatedBook = { ...book, chapters: [] };
      translated.books.push(translatedBook);
    }

    const existingChapter = translatedBook.chapters.find(
      (c) => c.number === chapterNum
    );
    const translatedChapter = await translateChapter(
      chapter,
      book,
      lang,
      existingChapter,
      true
    );

    const chapterIndex = translatedBook.chapters.findIndex(
      (c) => c.number === chapterNum
    );
    if (chapterIndex >= 0) {
      translatedBook.chapters[chapterIndex] = translatedChapter;
    } else {
      translatedBook.chapters.push(translatedChapter);
    }

    saveTranslatedData(lang, translated);
    console.log(`\nRegenerated chapter ${bookName} ${chapterNum}`);
    process.exit(0);
  }

  // Translate each book
  for (const book of english.books) {
    const shouldRegenerate = !!regenerate || regenerateBook === book.shortName;

    console.log(`\nTranslating ${book.shortName}...`);
    const existingBook = translated.books.find(
      (b) => b.shortName === book.shortName
    );

    // Ensure the book exists in translated data
    let bookIndex = translated.books.findIndex(
      (b) => b.shortName === book.shortName
    );
    if (bookIndex < 0) {
      translated.books.push({ ...book, chapters: [] });
      bookIndex = translated.books.length - 1;
    }

    const translatedBook = await translateBook(
      book,
      lang,
      existingBook,
      shouldRegenerate,
      (completedChapter) => {
        // Update or add the chapter in the book
        const chapterIndex = translated.books[bookIndex].chapters.findIndex(
          (c) => c.number === completedChapter.number
        );
        if (chapterIndex >= 0) {
          translated.books[bookIndex].chapters[chapterIndex] = completedChapter;
        } else {
          translated.books[bookIndex].chapters.push(completedChapter);
        }
        // Save to disk
        saveTranslatedData(lang, translated);
        console.log(
          `  💾 Saved ${book.shortName} chapter ${completedChapter.number}`
        );
      }
    );

    // Update the full book
    translated.books[bookIndex] = translatedBook;
    saveTranslatedData(lang, translated);
    console.log(`\n✅ Completed ${book.shortName}`);
  }

  console.log("\n\n=== Translation Complete ===");
  console.log(`Language: ${LANGUAGE_CONFIGS[lang].name} (${lang})`);
  console.log(`Total verses translated: ${countTranslatedVerses(translated)}`);
  console.log(
    `Output saved to: ${path.join(DATA_DIR, `transformed/${lang}/parsed.json`)}`
  );
}

main().catch(console.error);
