"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getReadingProgress, type ReadingProgress } from "./ReadingProgress";

export function ContinueReading() {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  useEffect(() => {
    setProgress(getReadingProgress());
  }, []);

  if (!progress) return null;

  return (
    <div
      className="mb-12 p-4 sm:p-6 rounded-xl text-center"
      style={{
        background: "var(--color-bg-tertiary)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p
        className="text-sm uppercase tracking-widest mb-2"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-source-serif), serif",
        }}
      >
        Continue Reading
      </p>
      <Link
        href={`/${progress.bookSlug}/${progress.chapterNum}`}
        className="group inline-flex items-center gap-3"
      >
        <span
          className="text-xl sm:text-2xl group-hover:text-[var(--color-accent)] transition-colors"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {progress.bookName} Chapter {progress.chapterNum}
        </span>
        <svg
          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
          style={{ color: "var(--color-accent)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
}
