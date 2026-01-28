/**
 * Translate chapter summaries to a target language
 */
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LANGUAGE_NAMES: Record<string, string> = {
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  de: "German",
};

async function translateSummary(summary: string, targetLang: string): Promise<string> {
  const langName = LANGUAGE_NAMES[targetLang] || targetLang;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: `You are a translator. Translate the following Book of Mormon chapter summary to ${langName}. Keep it concise and natural-sounding. Only output the translation, nothing else.`,
      },
      {
        role: "user",
        content: summary,
      },
    ],
    max_tokens: 150,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content?.trim() || summary;
}

async function main() {
  const targetLang = process.argv[2] || "es";
  const langName = LANGUAGE_NAMES[targetLang] || targetLang;

  const targetPath = path.join(DATA_DIR, `transformed/${targetLang}/parsed.json`);

  if (!fs.existsSync(targetPath)) {
    console.error(`No data found for language: ${targetLang}`);
    process.exit(1);
  }

  console.log(`Translating summaries to ${langName}...`);

  const data: BookOfMormon = JSON.parse(fs.readFileSync(targetPath, "utf-8"));

  let total = 0;
  let translated = 0;

  // Count chapters with summaries
  for (const book of data.books) {
    for (const chapter of book.chapters) {
      if (chapter.summary) total++;
    }
  }

  console.log(`Found ${total} summaries to translate\n`);

  for (const book of data.books) {
    for (const chapter of book.chapters) {
      if (!chapter.summary) continue;

      translated++;
      process.stdout.write(`\r[${translated}/${total}] ${book.shortName} ${chapter.number}...`);

      try {
        chapter.summary = await translateSummary(chapter.summary, targetLang);

        // Save progress
        fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));

        // Rate limit
        await new Promise(r => setTimeout(r, 200));
      } catch (error) {
        console.error(`\nError translating ${book.shortName} ${chapter.number}:`, error);
      }
    }
  }

  console.log(`\n\nDone! Translated ${translated} summaries to ${langName}`);
}

main().catch(console.error);
