import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Types inline to avoid import path issues in monorepo
interface Verse {
  number: number;
  text: string;
  plainText?: string;
}

interface Chapter {
  number: number;
  verses: Verse[];
}

interface Book {
  name: string;
  shortName: string;
  chapters: Chapter[];
}

interface BookOfMormon {
  books: Book[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");

const GUTENBERG_URL = "https://www.gutenberg.org/cache/epub/17/pg17.txt";

// Book order in the Book of Mormon
const BOOK_ORDER = [
  "1 Nephi",
  "2 Nephi",
  "Jacob",
  "Enos",
  "Jarom",
  "Omni",
  "Words of Mormon",
  "Mosiah",
  "Alma",
  "Helaman",
  "3 Nephi",
  "4 Nephi",
  "Mormon",
  "Ether",
  "Moroni",
];

// Book name mappings (full name -> short name)
const BOOK_MAPPINGS: Record<string, string> = {
  "THE FIRST BOOK OF NEPHI": "1 Nephi",
  "THE SECOND BOOK OF NEPHI": "2 Nephi",
  "THE BOOK OF JACOB": "Jacob",
  "THE BOOK OF ENOS": "Enos",
  "THE BOOK OF JAROM": "Jarom",
  "THE BOOK OF OMNI": "Omni",
  "THE WORDS OF MORMON": "Words of Mormon",
  "THE BOOK OF MOSIAH": "Mosiah",
  "THE BOOK OF ALMA": "Alma",
  "THE BOOK OF HELAMAN": "Helaman",
  "THIRD BOOK OF NEPHI": "3 Nephi",
  "FOURTH NEPHI": "4 Nephi",
  "THE BOOK OF MORMON": "Mormon",
  "THE BOOK OF ETHER": "Ether",
  "THE BOOK OF MORONI": "Moroni",
};

async function downloadText(): Promise<string> {
  console.log("Downloading Book of Mormon text from Project Gutenberg...");
  const response = await fetch(GUTENBERG_URL);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  return response.text();
}

function findStartOfContent(text: string): number {
  const marker = "*** START OF THE PROJECT GUTENBERG EBOOK";
  const idx = text.indexOf(marker);
  if (idx === -1) return 0;
  return text.indexOf("\n", idx) + 1;
}

function findEndOfContent(text: string): number {
  const marker = "*** END OF THE PROJECT GUTENBERG EBOOK";
  const idx = text.indexOf(marker);
  if (idx === -1) return text.length;
  return idx;
}

function parseBookOfMormon(rawText: string): BookOfMormon {
  const startIdx = findStartOfContent(rawText);
  const endIdx = findEndOfContent(rawText);
  const content = rawText.slice(startIdx, endIdx);

  const books: Book[] = [];
  let currentBook: Book | null = null;
  let currentChapter: Chapter | null = null;
  let currentVerseText = "";
  let currentVerseNum = 0;

  const lines = content.split("\n");

  // Patterns
  // Book headers like "THE BOOK OF ENOS" or "FOURTH NEPHI"
  const bookHeaderPattern = /^\s*(THE FIRST BOOK OF NEPHI|THE SECOND BOOK OF NEPHI|THE BOOK OF JACOB|THE BOOK OF ENOS|THE BOOK OF JAROM|THE BOOK OF OMNI|THE WORDS OF MORMON|THE BOOK OF MOSIAH|THE BOOK OF ALMA|THE BOOK OF HELAMAN|THIRD BOOK OF NEPHI|FOURTH NEPHI|THE BOOK OF MORMON|THE BOOK OF ETHER|THE BOOK OF MORONI)\s*$/i;

  // Chapter header like "1 Nephi Chapter 1" or "Jacob Chapter 5"
  const chapterHeaderPattern = /^(\d\s*Nephi|Jacob|Mosiah|Alma|Helaman|Mormon|Ether|Moroni)\s+Chapter\s+(\d+)/i;

  // 4 Nephi format: "4 Nephi 1:1 text..."
  const fourNephiVersePattern = /^4\s*Nephi\s+(\d+):(\d+)\s+(.+)/i;

  // 3 Nephi format: "3 Nephi 1:1 text..."
  const threeNephiVersePattern = /^3\s*Nephi\s+(\d+):(\d+)\s+(.+)/i;

  // Standard verse: "1:1 text..." or "chapter:verse text"
  const versePattern = /^(\d+):(\d+)\s+(.+)/;

  function saveCurrentVerse() {
    if (currentChapter && currentVerseNum > 0 && currentVerseText.trim()) {
      currentChapter.verses.push({
        number: currentVerseNum,
        text: currentVerseText.trim(),
      });
    }
    currentVerseText = "";
    currentVerseNum = 0;
  }

  function saveCurrentChapter() {
    saveCurrentVerse();
    if (currentBook && currentChapter && currentChapter.verses.length > 0) {
      currentBook.chapters.push(currentChapter);
    }
    currentChapter = null;
  }

  function saveCurrentBook() {
    saveCurrentChapter();
    if (currentBook && currentBook.chapters.length > 0) {
      books.push(currentBook);
    }
    currentBook = null;
  }

  function startNewBook(shortName: string, fullName: string) {
    saveCurrentBook();
    currentBook = {
      name: fullName,
      shortName: shortName,
      chapters: [],
    };
  }

  function startNewChapter(chapterNum: number) {
    saveCurrentChapter();
    currentChapter = {
      number: chapterNum,
      verses: [],
    };
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Check for book header
    const bookMatch = line.match(bookHeaderPattern);
    if (bookMatch) {
      const fullName = bookMatch[1]!.toUpperCase();
      const shortName = BOOK_MAPPINGS[fullName];
      if (shortName) {
        startNewBook(shortName, fullName);
        // Single-chapter books start chapter 1 implicitly
        if (["Enos", "Jarom", "Omni", "Words of Mormon", "4 Nephi"].includes(shortName)) {
          startNewChapter(1);
        }
      }
      continue;
    }

    // Check for chapter header (multi-chapter books)
    const chapterMatch = line.match(chapterHeaderPattern);
    if (chapterMatch) {
      const bookShortName = chapterMatch[1]!.replace(/\s+/g, " ");
      const chapterNum = parseInt(chapterMatch[2]!, 10);

      // Ensure we have the right book
      if (!currentBook || currentBook.shortName !== bookShortName) {
        const fullName = Object.entries(BOOK_MAPPINGS).find(
          ([, short]) => short.toLowerCase() === bookShortName.toLowerCase()
        )?.[0] ?? bookShortName.toUpperCase();
        startNewBook(bookShortName, fullName);
      }

      startNewChapter(chapterNum);
      continue;
    }

    // Check for 3 Nephi verse format
    const threeNephiMatch = line.match(threeNephiVersePattern);
    if (threeNephiMatch) {
      const chapterNum = parseInt(threeNephiMatch[1]!, 10);
      const verseNum = parseInt(threeNephiMatch[2]!, 10);
      const verseText = threeNephiMatch[3] ?? "";

      // Ensure we have 3 Nephi book
      if (!currentBook || currentBook.shortName !== "3 Nephi") {
        startNewBook("3 Nephi", "THIRD BOOK OF NEPHI");
      }

      // Check if we need a new chapter
      if (!currentChapter || currentChapter.number !== chapterNum) {
        startNewChapter(chapterNum);
      }

      saveCurrentVerse();
      currentVerseNum = verseNum;
      currentVerseText = verseText;
      continue;
    }

    // Check for 4 Nephi verse format
    const fourNephiMatch = line.match(fourNephiVersePattern);
    if (fourNephiMatch) {
      const chapterNum = parseInt(fourNephiMatch[1]!, 10);
      const verseNum = parseInt(fourNephiMatch[2]!, 10);
      const verseText = fourNephiMatch[3] ?? "";

      // Ensure we have 4 Nephi book
      if (!currentBook || currentBook.shortName !== "4 Nephi") {
        startNewBook("4 Nephi", "FOURTH NEPHI");
      }

      // Check if we need a new chapter
      if (!currentChapter || currentChapter.number !== chapterNum) {
        startNewChapter(chapterNum);
      }

      saveCurrentVerse();
      currentVerseNum = verseNum;
      currentVerseText = verseText;
      continue;
    }

    // Check for standard verse pattern
    const verseMatch = line.match(versePattern);
    if (verseMatch && currentBook && currentChapter) {
      const chapterNum = parseInt(verseMatch[1]!, 10);
      const verseNum = parseInt(verseMatch[2]!, 10);
      const verseText = verseMatch[3] ?? "";

      // For single-chapter books, chapter in verse reference should be 1
      // For multi-chapter books, if chapter number changes, start new chapter
      if (currentChapter.number !== chapterNum && !["Enos", "Jarom", "Omni", "Words of Mormon", "4 Nephi"].includes(currentBook.shortName)) {
        startNewChapter(chapterNum);
      }

      saveCurrentVerse();
      currentVerseNum = verseNum;
      currentVerseText = verseText;
      continue;
    }

    // Continue multi-line verse - but check for embedded verse references
    if (currentVerseNum > 0 && line) {
      // Check for embedded verse pattern (e.g., "...text. 2:13 More text...")
      const embeddedVersePattern = /^(.*?)\s+(\d+):(\d+)\s+(.+)$/;
      const embeddedMatch = line.match(embeddedVersePattern);

      if (embeddedMatch && currentChapter) {
        const beforeText = embeddedMatch[1]?.trim() ?? "";
        const chapterNum = parseInt(embeddedMatch[2]!, 10);
        const verseNum = parseInt(embeddedMatch[3]!, 10);
        const afterText = embeddedMatch[4] ?? "";

        // Add the text before the embedded reference to current verse
        if (beforeText) {
          currentVerseText += " " + beforeText;
        }

        // Save current verse and start new one
        saveCurrentVerse();

        // Handle chapter change for multi-chapter books
        if (currentChapter.number !== chapterNum && !["Enos", "Jarom", "Omni", "Words of Mormon", "4 Nephi"].includes(currentBook?.shortName ?? "")) {
          startNewChapter(chapterNum);
        }

        currentVerseNum = verseNum;
        currentVerseText = afterText;
      } else {
        currentVerseText += " " + line;
      }
    }
  }

  // Save final book
  saveCurrentBook();

  // Sort books to match canonical order
  books.sort((a, b) => {
    const aIdx = BOOK_ORDER.indexOf(a.shortName);
    const bIdx = BOOK_ORDER.indexOf(b.shortName);
    return aIdx - bIdx;
  });

  return { books };
}

async function main() {
  try {
    const rawText = await downloadText();

    // Ensure directories exist
    fs.mkdirSync(path.join(DATA_DIR, "original"), { recursive: true });

    const rawPath = path.join(DATA_DIR, "original/raw.txt");
    fs.writeFileSync(rawPath, rawText);
    console.log(`Saved raw text to ${rawPath}`);

    console.log("Parsing text...");
    const bookOfMormon = parseBookOfMormon(rawText);

    const jsonPath = path.join(DATA_DIR, "original/parsed.json");
    fs.writeFileSync(jsonPath, JSON.stringify(bookOfMormon, null, 2));
    console.log(`Saved parsed JSON to ${jsonPath}`);

    console.log("\n=== Summary ===");
    console.log(`Books: ${bookOfMormon.books.length}`);
    let totalVerses = 0;
    for (const book of bookOfMormon.books) {
      const verseCount = book.chapters.reduce((sum, ch) => sum + ch.verses.length, 0);
      totalVerses += verseCount;
      console.log(`  ${book.shortName}: ${book.chapters.length} chapters, ${verseCount} verses`);
    }
    console.log(`\nTotal verses: ${totalVerses}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
