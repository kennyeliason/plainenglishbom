import epub, { type Chapter } from "epub-gen-memory";
import * as fs from "fs";
import * as path from "path";
import type { BookOfMormon } from "@plainenglishbom/core";
import { BOOK_CONFIG, getVersion, getOutputFilename } from "./config";

/**
 * Generate an EPUB ebook of the Book of Mormon
 */
export async function generateEPUB(
  data: BookOfMormon,
  outputDir: string
): Promise<string> {
  const outputPath = path.join(outputDir, getOutputFilename("epub"));

  // Build chapters for EPUB
  const chapters: Chapter[] = [];

  // Front matter
  chapters.push({
    title: "Introduction",
    content: `
      <h1>Introduction</h1>
      ${BOOK_CONFIG.frontMatter.introduction
        .split("\n\n")
        .map((p) => `<p>${p}</p>`)
        .join("\n")}

      <h2>About This Translation</h2>
      ${BOOK_CONFIG.frontMatter.aboutTranslation
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .split("\n\n")
        .map((p) => `<p>${p}</p>`)
        .join("\n")}
    `,
  });

  // Each book as a chapter
  for (const book of data.books) {
    let bookContent = `<h1>${book.shortName}</h1>\n`;

    for (const chapter of book.chapters) {
      bookContent += `<h2>Chapter ${chapter.number}</h2>\n`;

      for (const verse of chapter.verses) {
        const text = verse.plainText || verse.text;
        bookContent += `<p><sup>${verse.number}</sup> ${escapeHtml(text)}</p>\n`;
      }
    }

    chapters.push({
      title: book.shortName,
      content: bookContent,
    });
  }

  // Generate EPUB
  const epubOptions = {
    title: BOOK_CONFIG.title,
    author: BOOK_CONFIG.projectName,
    publisher: BOOK_CONFIG.epub.publisher,
    lang: BOOK_CONFIG.epub.language,
    tocTitle: "Contents",
    appendChapterTitles: false,
    css: `
      body {
        font-family: Georgia, serif;
        line-height: 1.6;
        margin: 1em;
      }
      h1 {
        font-size: 1.8em;
        text-align: center;
        margin-top: 2em;
        margin-bottom: 1em;
      }
      h2 {
        font-size: 1.3em;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      p {
        text-align: justify;
        margin: 0.5em 0;
        text-indent: 0;
      }
      sup {
        font-size: 0.7em;
        font-weight: bold;
        color: #666;
        margin-right: 0.2em;
      }
    `,
  };

  try {
    const epubBuffer = await epub(epubOptions, chapters);
    fs.writeFileSync(outputPath, epubBuffer);
    console.log(`✅ EPUB generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Failed to generate EPUB:", error);
    throw error;
  }
}

/**
 * Escape HTML entities in text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
