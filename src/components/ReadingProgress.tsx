"use client";

import { useEffect } from "react";

const STORAGE_KEY = "bom-reading-progress";

export interface ReadingProgress {
  bookSlug: string;
  bookName: string;
  chapterNum: number;
  timestamp: number;
}

export function getReadingProgress(): ReadingProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
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
