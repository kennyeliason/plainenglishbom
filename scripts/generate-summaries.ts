// Generate AI chapter summaries for the Book of Mormon
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import type { BookOfMormon } from "../packages/core/src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../apps/web/.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const DATA_DIR = path.join(__dirname, "../data");
const TRANSFORMED_PATH = path.join(DATA_DIR, "transformed/parsed.json");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function loadData(): BookOfMormon {
  const content = fs.readFileSync(TRANSFORMED_PATH, "utf-8");
  return JSON.parse(content) as BookOfMormon;
}

function saveData(data: BookOfMormon): void {
  fs.writeFileSync(TRANSFORMED_PATH, JSON.stringify(data, null, 2));
}

async function generateSummary(
  bookName: string,
  chapterNum: number,
  verseTexts: string[]
): Promise<string> {
  const chapterContent = verseTexts.join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: `You are a scripture study assistant. Generate a brief, informative chapter summary (1-2 sentences) for Book of Mormon chapters. The summary should:
- Capture the main events, teachings, or themes
- Be written in plain, modern English
- Be neutral and informative (not preachy)
- Be 15-30 words

Examples of good summaries:
- "Lehi prophesies Jerusalem's destruction and is rejected by the people. He takes his family into the wilderness."
- "Nephi and his brothers return to Jerusalem to obtain the brass plates from Laban."
- "Alma teaches about faith, comparing it to a seed that grows when nurtured."`,
      },
      {
        role: "user",
        content: `Generate a summary for ${bookName} chapter ${chapterNum}:\n\n${chapterContent}`,
      },
    ],
    max_tokens: 100,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content?.trim() || "";
}

async function main() {
  const args = process.argv.slice(2);
  const regenerateAll = args.includes("--regenerate-all");
  const specificBook = args.find((a) => a.startsWith("--book="))?.split("=")[1];

  console.log("Loading data...");
  const data = loadData();

  let totalChapters = 0;
  let processedChapters = 0;
  let skippedChapters = 0;

  // Count total chapters
  for (const book of data.books) {
    if (specificBook && book.shortName !== specificBook) continue;
    totalChapters += book.chapters.length;
  }

  console.log(`Found ${totalChapters} chapters to process`);

  for (const book of data.books) {
    if (specificBook && book.shortName !== specificBook) continue;

    for (const chapter of book.chapters) {
      // Skip if already has summary (unless regenerating)
      if (chapter.summary && !regenerateAll) {
        skippedChapters++;
        processedChapters++;
        process.stdout.write(
          `\r[${processedChapters}/${totalChapters}] Skipping ${book.shortName} ${chapter.number} (already has summary)`
        );
        continue;
      }

      process.stdout.write(
        `\r[${processedChapters}/${totalChapters}] Generating summary for ${book.shortName} ${chapter.number}...`
      );

      try {
        // Use plainText if available, otherwise original text
        const verseTexts = chapter.verses.map(
          (v) => `${v.number}. ${v.plainText || v.text}`
        );

        const summary = await generateSummary(
          book.shortName,
          chapter.number,
          verseTexts
        );

        chapter.summary = summary;
        processedChapters++;

        // Save progress after each chapter
        saveData(data);

        // Rate limiting - be nice to the API
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          `\nError generating summary for ${book.shortName} ${chapter.number}:`,
          error
        );
        processedChapters++;
      }
    }
  }

  console.log(`\n\nDone! Generated ${processedChapters - skippedChapters} summaries, skipped ${skippedChapters}`);
}

main().catch(console.error);
