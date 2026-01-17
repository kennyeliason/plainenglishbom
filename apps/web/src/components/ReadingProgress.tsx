"use client";

import { useEffect } from "react";
import { READING_PROGRESS_KEY, type ReadingProgress } from "@plainenglishbom/core";

export type { ReadingProgress };

export function getReadingProgress(): ReadingProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(READING_PROGRESS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }
  return null;
}

export function saveReadingProgress(progress: ReadingProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore errors (e.g., localStorage full or disabled)
  }
}

interface ReadingProgressTrackerProps {
  bookSlug: string;
  bookName: string;
  chapterNum: number;
}

export function ReadingProgressTracker({
  bookSlug,
  bookName,
  chapterNum,
}: ReadingProgressTrackerProps) {
  useEffect(() => {
    saveReadingProgress({
      bookSlug,
      bookName,
      chapterNum,
      timestamp: Date.now(),
    });
  }, [bookSlug, bookName, chapterNum]);

  // This component only saves progress, renders nothing
  return null;
}
