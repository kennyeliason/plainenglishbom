import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";
import type { BookOfMormon } from "@plainenglishbom/core";
import { BOOK_CONFIG, getVersion, getOutputFilename } from "./config";

const config = BOOK_CONFIG.print;

// Convert inches to points (72 points per inch)
const toPoints = (inches: number) => inches * 72;

const PAGE_WIDTH = toPoints(config.trimWidth);
const PAGE_HEIGHT = toPoints(config.trimHeight);
const MARGIN_TOP = toPoints(config.marginTop);
const MARGIN_BOTTOM = toPoints(config.marginBottom);
const MARGIN_INNER = toPoints(config.marginInner);
const MARGIN_OUTER = toPoints(config.marginOuter);

/**
 * Generate a print-ready PDF of the Book of Mormon
 */
export async function generatePDF(
  data: BookOfMormon,
  outputDir: string
): Promise<string> {
  const outputPath = path.join(outputDir, getOutputFilename("pdf"));
  // __dirname doesn't work with tsx, so use import.meta.url
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const fontsDir = path.join(scriptDir, "..", "fonts");

  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    margins: {
      top: MARGIN_TOP,
      bottom: MARGIN_BOTTOM,
      left: MARGIN_INNER,
      right: MARGIN_OUTER,
    },
    bufferPages: true,
    info: {
      Title: BOOK_CONFIG.title,
      Author: BOOK_CONFIG.projectName,
      Subject: "A modern English translation of the Book of Mormon",
      Keywords: "Book of Mormon, scripture, modern translation, plain English",
      Creator: BOOK_CONFIG.projectName,
      Producer: "PDFKit",
    },
  });

  // Register custom fonts
  const titleFont = path.join(fontsDir, "CormorantGaramond-Regular.ttf");
  const bodyFont = path.join(fontsDir, "SourceSerif4-Regular.ttf");
  const boldFont = path.join(fontsDir, "SourceSerif4-Bold.ttf");

  // Check if fonts exist, fall back to built-in if not
  const hasCustomFonts =
    fs.existsSync(titleFont) && fs.existsSync(bodyFont) && fs.existsSync(boldFont);

  if (hasCustomFonts) {
    doc.registerFont("Title", titleFont);
    doc.registerFont("Body", bodyFont);
    doc.registerFont("Bold", boldFont);
  } else {
    console.log("⚠️  Custom fonts not found, using built-in fonts");
  }

  const FONT_TITLE = hasCustomFonts ? "Title" : "Times-Bold";
  const FONT_BODY = hasCustomFonts ? "Body" : "Times-Roman";
  const FONT_BOLD = hasCustomFonts ? "Bold" : "Times-Bold";

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  let pageNumber = 1; // Physical page number (starts at 1 for title page)

  // Helper to get current margins based on page side
  // Recto (right-hand, odd pages): gutter on LEFT
  // Verso (left-hand, even pages): gutter on RIGHT
  const getMargins = (physicalPage: number) => {
    const isRecto = physicalPage % 2 === 1;
    if (isRecto) {
      return { left: MARGIN_INNER, right: MARGIN_OUTER };
    } else {
      return { left: MARGIN_OUTER, right: MARGIN_INNER };
    }
  };

  // Helper to add a new page with proper margins
  const addPage = () => {
    pageNumber++;
    const margins = getMargins(pageNumber);
    doc.addPage({
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      margins: {
        top: MARGIN_TOP,
        bottom: MARGIN_BOTTOM,
        left: margins.left,
        right: margins.right,
      },
    });
  };

  // ===== TITLE PAGE =====
  doc.moveDown(6);
  doc
    .font(FONT_TITLE)
    .fontSize(config.bookTitleSize)
    .text(BOOK_CONFIG.title, {
      align: "center",
    });

  doc.moveDown(0.5);

  doc
    .font(FONT_BODY)
    .fontSize(16)
    .text(BOOK_CONFIG.subtitle, {
      align: "center",
    });

  doc.moveDown(6);

  doc.fontSize(11).text(`Version ${getVersion()}`, {
    align: "center",
  });

  doc.moveDown(1);

  doc.fontSize(10).text(BOOK_CONFIG.projectName, {
    align: "center",
  });

  doc.text(BOOK_CONFIG.website, {
    align: "center",
  });

  // ===== COPYRIGHT PAGE =====
  addPage();
  doc.font(FONT_BODY).fontSize(9);

  doc.moveDown(2);
  doc.text(BOOK_CONFIG.title, { align: "left" });
  doc.text(`Version ${getVersion()}`, { align: "left" });
  doc.moveDown();
  doc.text(`© ${new Date().getFullYear()} ${BOOK_CONFIG.projectName}`);
  doc.moveDown();
  doc.text(
    "This translation is released as an open source project. " +
      "The underlying text of the Book of Mormon is in the public domain."
  );
  doc.moveDown(2);
  doc.text("Published by:");
  doc.text(BOOK_CONFIG.projectName);
  doc.text(BOOK_CONFIG.website);

  // ===== INTRODUCTION =====
  addPage();
  doc
    .font(FONT_TITLE)
    .fontSize(config.chapterTitleSize)
    .text("Introduction", { align: "center" });

  doc.moveDown();

  doc
    .font(FONT_BODY)
    .fontSize(config.fontSize)
    .text(BOOK_CONFIG.frontMatter.introduction, {
      align: "justify",
      lineGap: config.fontSize * (config.lineHeight - 1),
    });

  doc.moveDown(2);

  // About the translation
  doc
    .font(FONT_TITLE)
    .fontSize(14)
    .text("About This Translation", { align: "left" });

  doc.moveDown();

  // Parse markdown-ish content (just bold for now)
  const aboutText = BOOK_CONFIG.frontMatter.aboutTranslation.replace(
    /\*\*(.*?)\*\*/g,
    "$1"
  );
  doc.font(FONT_BODY).fontSize(config.fontSize).text(aboutText, {
    align: "justify",
    lineGap: config.fontSize * (config.lineHeight - 1),
  });

  // ===== TABLE OF CONTENTS =====
  addPage();
  doc
    .font(FONT_TITLE)
    .fontSize(config.chapterTitleSize)
    .text("Contents", { align: "center" });

  doc.moveDown();

  // We'll fill in page numbers after we know them
  const tocEntries: { title: string; page: number }[] = [];

  // ===== BOOK CONTENT =====
  for (const book of data.books) {
    // Start each book on a new page
    addPage();
    const bookStartPage = pageNumber;
    tocEntries.push({ title: book.shortName, page: bookStartPage });

    // Book title
    doc.moveDown(4);
    doc
      .font(FONT_TITLE)
      .fontSize(config.bookTitleSize)
      .text(book.shortName.toUpperCase(), { align: "center" });

    doc.moveDown(3);

    // Chapters
    for (const chapter of book.chapters) {
      // Check if we need a new page (leave room for chapter heading + some verses)
      if (doc.y > PAGE_HEIGHT - MARGIN_BOTTOM - 150) {
        addPage();
      }

      // Chapter heading
      doc
        .font(FONT_TITLE)
        .fontSize(config.chapterTitleSize)
        .text(`Chapter ${chapter.number}`, { align: "left" });

      doc.moveDown(0.5);

      // Verses
      doc.font(FONT_BODY).fontSize(config.fontSize);

      for (const verse of chapter.verses) {
        // Use plainText if available, otherwise original text
        const text = verse.plainText || verse.text;

        // Check if we need a new page
        const textHeight = doc.heightOfString(`${verse.number} ${text}`, {
          width: PAGE_WIDTH - getMargins(pageNumber).left - getMargins(pageNumber).right,
          lineGap: config.fontSize * (config.lineHeight - 1),
        });

        if (doc.y + textHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
          addPage();
          doc.font(FONT_BODY).fontSize(config.fontSize);
        }

        // Verse number in bold, then text
        doc.font(FONT_BOLD).text(`${verse.number} `, { continued: true });
        doc.font(FONT_BODY).text(text, {
          lineGap: config.fontSize * (config.lineHeight - 1),
        });

        doc.moveDown(0.25);
      }

      doc.moveDown(0.75);
    }
  }

  // Finalize the document
  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => {
      console.log(`✅ PDF generated: ${outputPath}`);
      console.log(`   Total pages: ${pageNumber}`);
      resolve(outputPath);
    });
    writeStream.on("error", reject);
  });
}
