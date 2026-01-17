"use client";

import { useState, useEffect } from "react";

interface TranslationCardProps {
  model: string;
  translation: string;
  originalCount: number;
  book: string;
  chapter: number;
  verseNumber: number;
}

export function TranslationCard({
  model,
  translation,
  originalCount,
  book,
  chapter,
  verseNumber,
}: TranslationCardProps) {
  const storageKey = `model-scores-${book}-${chapter}`;
  const [isSelected, setIsSelected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const scores: Record<number, string> = JSON.parse(stored);
      setIsSelected(scores[verseNumber] === model);
    }

    const handleUpdate = (e: CustomEvent) => {
      if (e.detail.book === book && e.detail.chapter === chapter) {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const scores: Record<number, string> = JSON.parse(stored);
          setIsSelected(scores[verseNumber] === model);
        }
      }
    };

    window.addEventListener("scoreUpdated", handleUpdate as EventListener);
    return () => window.removeEventListener("scoreUpdated", handleUpdate as EventListener);
  }, [storageKey, verseNumber, model, book, chapter]);

  const handleClick = () => {
    const stored = localStorage.getItem(storageKey);
    const scores: Record<number, string> = stored ? JSON.parse(stored) : {};
    scores[verseNumber] = model;
    localStorage.setItem(storageKey, JSON.stringify(scores));
    setIsSelected(true);
    
    // Trigger custom event for stats update
    window.dispatchEvent(new CustomEvent("scoreUpdated", { detail: { book, chapter } }));
  };

  const charCount = translation === "—" ? 0 : translation.length;
  const diff = charCount - originalCount;
  const diffPercent =
    originalCount > 0 ? ((diff / originalCount) * 100).toFixed(0) : "0";

  return (
    <button
      onClick={handleClick}
      className="p-4 rounded border transition-all text-left w-full"
      style={{
        backgroundColor: isSelected && mounted
          ? "var(--color-accent-bg)"
          : "var(--color-bg-secondary)",
        borderColor: isSelected && mounted
          ? "var(--color-accent)"
          : "var(--color-border)",
        borderWidth: isSelected && mounted ? "2px" : "1px",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        if (!isSelected || !mounted) {
          e.currentTarget.style.borderColor = "var(--color-accent-soft)";
          e.currentTarget.style.backgroundColor = "var(--color-bg-tertiary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected || !mounted) {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4
          className="font-semibold capitalize flex items-center gap-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          {model.replace(/-/g, " ")}
          {isSelected && mounted && (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                color: "var(--color-accent)",
                backgroundColor: "var(--color-bg-tertiary)",
              }}
            >
              ✓ Selected
            </span>
          )}
        </h4>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono px-2 py-1 rounded"
            style={{
              color:
                diff === 0
                  ? "var(--color-text-muted)"
                  : diff > 0
                  ? "var(--color-accent)"
                  : "var(--color-text-tertiary)",
              backgroundColor: "var(--color-bg-tertiary)",
            }}
          >
            {charCount} chars
            {diff !== 0 && (
              <span className="ml-1">
                ({diff > 0 ? "+" : ""}
                {diff}, {diffPercent}%)
              </span>
            )}
          </span>
        </div>
      </div>
      <p
        className="text-base leading-relaxed"
        style={{ color: "var(--color-text-primary)" }}
      >
        {translation}
      </p>
    </button>
  );
}

