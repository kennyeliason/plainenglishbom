/**
 * Sync translations to the public plainenglishbom-translations repo
 *
 * This script exports ONLY the translations (not the original KJV text)
 * to keep the public repo focused on community-editable content.
 *
 * Usage: pnpm sync-translations
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const TRANSLATIONS_REPO = path.join(__dirname, "..", "..", "plainenglishbom-translations");
const DATA_DIR = path.join(__dirname, "..", "data", "transformed");

const LANGUAGES = ["en", "es"];

interface SourceVerse {
  number: number;
  text: string;
  plainText?: string;
}

interface SourceChapter {
  number: number;
  verses: SourceVerse[];
}

interface SourceBook {
  name: string;
  shortName: string;
  chapters: SourceChapter[];
}

interface SourceData {
  title: string;
  books: SourceBook[];
}

// Output format - only translations, no KJV
interface OutputVerse {
  number: number;
  text: string;
}

interface OutputChapter {
  number: number;
  verses: OutputVerse[];
}

interface OutputBook {
  name: string;
  shortName: string;
  chapters: OutputChapter[];
}

interface OutputData {
  title: string;
  books: OutputBook[];
}

function transformData(source: SourceData, lang: string): OutputData {
  return {
    title: source.title,
    books: source.books.map((book) => ({
      name: book.name,
      shortName: book.shortName,
      chapters: book.chapters.map((chapter) => ({
        number: chapter.number,
        verses: chapter.verses.map((verse) => ({
          number: verse.number,
          // For English: use plainText (the modern translation)
          // For other languages: use plainText (the translated text)
          // Fall back to original text if no translation exists
          text: verse.plainText || verse.text,
        })),
      })),
    })),
  };
}

async function syncTranslations() {
  console.log("📦 Syncing translations to public repo...\n");

  // Check if translations repo exists
  if (!fs.existsSync(TRANSLATIONS_REPO)) {
    console.error("❌ Translations repo not found at:", TRANSLATIONS_REPO);
    console.error("   Clone it first: git clone git@github.com:kennyeliason/plainenglishbom-translations.git");
    process.exit(1);
  }

  // Process each language
  for (const lang of LANGUAGES) {
    const sourcePath = path.join(DATA_DIR, lang, "parsed.json");
    const destPath = path.join(TRANSLATIONS_REPO, lang, "book-of-mormon.json");

    if (fs.existsSync(sourcePath)) {
      // Ensure destination directory exists
      fs.mkdirSync(path.dirname(destPath), { recursive: true });

      // Read source data
      const sourceData: SourceData = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));

      // Transform to output format (translations only, no KJV)
      const outputData = transformData(sourceData, lang);

      // Write the transformed data
      fs.writeFileSync(destPath, JSON.stringify(outputData, null, 2));

      const stats = fs.statSync(destPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

      // Count verses
      const verseCount = outputData.books.reduce(
        (sum, book) => sum + book.chapters.reduce(
          (chSum, ch) => chSum + ch.verses.length, 0
        ), 0
      );

      console.log(`✅ ${lang}: ${verseCount} verses exported (${sizeMB} MB)`);
    } else {
      console.log(`⏭️  ${lang}: source not found, skipping`);
    }
  }

  // Check for changes in the translations repo
  process.chdir(TRANSLATIONS_REPO);

  const status = execSync("git status --porcelain").toString().trim();

  if (!status) {
    console.log("\n✨ No changes to sync");
    return;
  }

  console.log("\n📝 Changes detected:");
  console.log(status);

  // Stage and show diff stats
  execSync("git add .");
  const diffStats = execSync("git diff --cached --stat").toString();
  console.log("\n" + diffStats);

  console.log("\n🚀 To publish these changes:");
  console.log("   cd ../plainenglishbom-translations");
  console.log("   git commit -m 'Update translations'");
  console.log("   git push origin main");
}

syncTranslations().catch(console.error);
