/**
 * Reading progress data structure.
 * Stored in localStorage (web) or AsyncStorage (mobile).
 */
export interface ReadingProgress {
  bookSlug: string;
  bookName: string;
  chapterNum: number;
  timestamp: number;
}

/**
 * Storage key for reading progress.
 */
export const READING_PROGRESS_KEY = "bom-reading-progress";
