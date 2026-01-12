import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

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

const ORIGINAL_PATH = path.join(DATA_DIR, "original/parsed.json");
const TRANSFORMED_PATH = path.join(DATA_DIR, "transformed/parsed.json");

function main() {
  console.log("Loading original and transformed data...");

  const original: BookOfMormon = JSON.parse(fs.readFileSync(ORIGINAL_PATH, "utf-8"));
  const transformed: BookOfMormon = JSON.parse(fs.readFileSync(TRANSFORMED_PATH, "utf-8"));

  console.log(`Original: ${countVerses(original)} verses`);
  console.log(`Transformed: ${countVerses(transformed)} verses`);

  // Create a map of transformed verses for quick lookup
  const transformedMap = new Map<string, Verse>();
  for (const book of transformed.books) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        const key = `${book.shortName}:${chapter.number}:${verse.number}`;
        transformedMap.set(key, verse);
      }
    }
  }

  // Merge: use original structure, but keep translations from transformed
  // Re-translate if: no existing translation OR original text changed
  let newVerses = 0;
  let changedVerses = 0;
  let keptTranslations = 0;

  const merged: BookOfMormon = {
    books: original.books.map(book => ({
      ...book,
      chapters: book.chapters.map(chapter => ({
        ...chapter,
        verses: chapter.verses.map(verse => {
          const key = `${book.shortName}:${chapter.number}:${verse.number}`;
          const existingTranslation = transformedMap.get(key);

          if (existingTranslation?.plainText) {
            // Check if original text changed (meaning embedded verse was split out)
            if (existingTranslation.text !== verse.text) {
              changedVerses++;
              console.log(`  Changed verse: ${book.shortName} ${chapter.number}:${verse.number}`);
              console.log(`    Old: ${existingTranslation.text.substring(0, 60)}...`);
              console.log(`    New: ${verse.text.substring(0, 60)}...`);
              return verse; // Needs re-translation
            }
            keptTranslations++;
            return {
              ...verse,
              plainText: existingTranslation.plainText,
            };
          } else {
            newVerses++;
            console.log(`  New verse: ${book.shortName} ${chapter.number}:${verse.number}`);
            return verse; // No translation yet
          }
        }),
      })),
    })),
  };

  console.log(`\nMerge complete:`);
  console.log(`  Kept translations: ${keptTranslations}`);
  console.log(`  New verses needing translation: ${newVerses}`);
  console.log(`  Changed verses needing re-translation: ${changedVerses}`);

  // Save merged data
  fs.writeFileSync(TRANSFORMED_PATH, JSON.stringify(merged, null, 2));
  console.log(`\nSaved merged data to ${TRANSFORMED_PATH}`);
}

function countVerses(data: BookOfMormon): number {
  return data.books.reduce(
    (sum, book) =>
      sum + book.chapters.reduce((chSum, ch) => chSum + ch.verses.length, 0),
    0
  );
}

main();
