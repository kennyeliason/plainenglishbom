import * as fs from "fs";
import * as path from "path";

// Types inline to avoid import path issues
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

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const TRANSFORMED_PATH = path.join(SCRIPT_DIR, "../data/transformed/parsed.json");

function normalizeQuotes(text: string): string {
  let result = text;

  // Convert all quote variants to straight quotes first for consistency
  // Curly double quotes
  result = result.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
  // Curly single quotes and apostrophes
  result = result.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

  // Remove space before closing quotes (after sentence-ending punctuation)
  // Only target periods, exclamation, question marks - NOT commas (which precede opening quotes)
  result = result.replace(/([.!?])\s+"/g, '$1"');
  result = result.replace(/([.!?])\s+'/g, "$1'");

  // Also remove space before quote at end of string
  result = result.replace(/\s+"$/g, '"');
  result = result.replace(/\s+'$/g, "'");

  // Remove double quotes (e.g., "" or '')
  result = result.replace(/""+/g, '"');
  result = result.replace(/''+/g, "'");

  // Fix quote after punctuation that should close (e.g., `." "` -> `."`)
  result = result.replace(/([.!?])\s*"\s*"/g, '$1"');

  return result;
}

function fixUnbalancedQuotes(text: string): string {
  let result = text;

  // Count quotes
  const doubleQuotes = (result.match(/"/g) || []).length;

  // If odd number of double quotes, we have an unbalanced situation
  if (doubleQuotes % 2 !== 0) {
    // Check if it ends with punctuation but no closing quote
    if (/[.!?]$/.test(result) && !/"$/.test(result)) {
      // Find the last opening quote position
      const lastOpenQuote = result.lastIndexOf('"');
      if (lastOpenQuote !== -1) {
        // Add closing quote at the end
        result = result + '"';
      }
    }
  }

  return result;
}

function convertToSmartQuotes(text: string): string {
  let result = text;

  // Convert to smart/curly quotes for better typography
  // Opening quotes (after space, start of string, or opening paren/bracket)
  result = result.replace(/(^|[\s(\[])"([^\s])/g, '$1"$2');
  result = result.replace(/(^|[\s(\[])'([^\s])/g, "$1'$2");

  // Closing quotes (before space, end of string, punctuation, or closing paren/bracket)
  result = result.replace(/([^\s])"([\s.,!?;:\])]|$)/g, '$1"$2');
  result = result.replace(/([^\s])'([\s.,!?;:\])]|$)/g, "$1'$2");

  // Handle apostrophes in contractions (e.g., don't, it's)
  result = result.replace(/(\w)'(\w)/g, "$1'$2");

  return result;
}

function processText(text: string): string {
  let result = text;
  result = normalizeQuotes(result);
  result = fixUnbalancedQuotes(result);
  result = convertToSmartQuotes(result);
  return result;
}

async function main() {
  console.log("Loading transformed data...");
  const content = fs.readFileSync(TRANSFORMED_PATH, "utf-8");
  const data: BookOfMormon = JSON.parse(content);

  let fixedCount = 0;
  let totalVerses = 0;

  console.log("Fixing quotes in all verses...");

  for (const book of data.books) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        totalVerses++;
        if (verse.plainText) {
          const original = verse.plainText;
          const fixed = processText(verse.plainText);
          if (original !== fixed) {
            verse.plainText = fixed;
            fixedCount++;
            // Show some examples
            if (fixedCount <= 10) {
              console.log(`\n${book.shortName} ${chapter.number}:${verse.number}`);
              console.log(`  Before: ${original}`);
              console.log(`  After:  ${fixed}`);
            }
          }
        }
      }
    }
  }

  console.log(`\n\nFixed ${fixedCount} out of ${totalVerses} verses`);

  // Save the fixed data
  console.log("Saving fixed data...");
  fs.writeFileSync(TRANSFORMED_PATH, JSON.stringify(data, null, 2));
  console.log(`Saved to ${TRANSFORMED_PATH}`);
}

main().catch(console.error);
