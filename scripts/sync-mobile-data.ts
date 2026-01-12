// Sync transformed data to mobile app assets
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE = path.join(__dirname, "../data/transformed/parsed.json");
const DEST = path.join(__dirname, "../apps/mobile/assets/data/parsed.json");

// Ensure destination directory exists
fs.mkdirSync(path.dirname(DEST), { recursive: true });

// Copy the file
fs.copyFileSync(SOURCE, DEST);

console.log(`✓ Synced data to mobile app`);
console.log(`  Source: ${SOURCE}`);
console.log(`  Dest: ${DEST}`);

// Show some stats
const data = JSON.parse(fs.readFileSync(SOURCE, "utf-8"));
const totalChapters = data.books.reduce((sum: number, b: any) => sum + b.chapters.length, 0);
const chaptersWithSummaries = data.books.reduce(
  (sum: number, b: any) => sum + b.chapters.filter((c: any) => c.summary).length,
  0
);

console.log(`  ${chaptersWithSummaries}/${totalChapters} chapters have summaries`);
