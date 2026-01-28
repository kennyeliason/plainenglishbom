#!/usr/bin/env tsx
/**
 * Plain English Book of Mormon - Book Generator
 *
 * Generates print-ready PDF and EPUB versions of the translation.
 *
 * Usage:
 *   npm run generate           # Generate both PDF and EPUB
 *   npm run generate:pdf       # Generate PDF only
 *   npm run generate:epub      # Generate EPUB only
 */

import * as path from "path";
import * as fs from "fs";
import { loadBookOfMormon, getBookStats } from "./load-data";
import { generatePDF } from "./generate-pdf";
import { generateEPUB } from "./generate-epub";
import { BOOK_CONFIG, getVersion } from "./config";

type Format = "pdf" | "epub" | "all";

async function main() {
  const args = process.argv.slice(2);
  let format: Format = "all";

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--format" && args[i + 1]) {
      const f = args[i + 1].toLowerCase();
      if (f === "pdf" || f === "epub" || f === "all") {
        format = f;
      }
      i++;
    }
  }

  console.log(`\n📖 ${BOOK_CONFIG.title}`);
  console.log(`   Version: ${getVersion()}`);
  console.log(`   Format: ${format}\n`);

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Load data
  console.log("📚 Loading Book of Mormon data...");
  const data = loadBookOfMormon("en");
  const stats = getBookStats(data);

  console.log(`   Books: ${stats.totalBooks}`);
  console.log(`   Chapters: ${stats.totalChapters}`);
  console.log(`   Verses: ${stats.totalVerses}`);
  console.log(
    `   Translated: ${stats.translatedVerses} (${stats.percentTranslated}%)\n`
  );

  if (stats.percentTranslated < 100) {
    console.log(
      `⚠️  Warning: Only ${stats.percentTranslated}% of verses have plain English translations.`
    );
    console.log(`   Untranslated verses will use the original KJV text.\n`);
  }

  // Generate requested formats
  const results: string[] = [];

  if (format === "pdf" || format === "all") {
    console.log("📄 Generating PDF...");
    try {
      const pdfPath = await generatePDF(data, outputDir);
      results.push(pdfPath);
    } catch (error) {
      console.error("❌ PDF generation failed:", error);
    }
  }

  if (format === "epub" || format === "all") {
    console.log("📱 Generating EPUB...");
    try {
      const epubPath = await generateEPUB(data, outputDir);
      results.push(epubPath);
    } catch (error) {
      console.error("❌ EPUB generation failed:", error);
    }
  }

  // Summary
  console.log("\n✨ Generation complete!");
  if (results.length > 0) {
    console.log("   Output files:");
    for (const file of results) {
      const size = fs.statSync(file).size;
      const sizeStr =
        size > 1024 * 1024
          ? `${(size / (1024 * 1024)).toFixed(1)} MB`
          : `${(size / 1024).toFixed(0)} KB`;
      console.log(`   - ${path.basename(file)} (${sizeStr})`);
    }
  }
}

main().catch(console.error);
