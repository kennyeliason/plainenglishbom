import * as fs from "fs";
import * as path from "path";

export interface VerseComparison {
  number: number;
  original: string;
  translations: Record<string, string>;
}

export interface ChapterComparison {
  book: string;
  chapter: number;
  verses: VerseComparison[];
}

const COMPARISON_DIR = path.join(process.cwd(), "data/model-comparison");

export function getChapterComparison(
  bookName: string,
  chapterNumber: number
): ChapterComparison | null {
  try {
    const fileName = `${bookName.replace(/\s+/g, "-")}-chapter-${chapterNumber}.json`;
    const filePath = path.join(COMPARISON_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as ChapterComparison;
  } catch {
    return null;
  }
}

export function listAvailableComparisons(): Array<{
  book: string;
  chapter: number;
}> {
  try {
    if (!fs.existsSync(COMPARISON_DIR)) {
      return [];
    }

    const files = fs.readdirSync(COMPARISON_DIR);
    const comparisons: Array<{ book: string; chapter: number }> = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const match = file.match(/^(.+)-chapter-(\d+)\.json$/);
        if (match) {
          const book = match[1]!.replace(/-/g, " ");
          const chapter = parseInt(match[2]!, 10);
          comparisons.push({ book, chapter });
        }
      }
    }

    return comparisons;
  } catch {
    return [];
  }
}

