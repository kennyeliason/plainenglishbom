"use client";

import { useState, useEffect } from "react";

interface ModelScorerProps {
  book: string;
  chapter: number;
  verseNumber: number;
  models: string[];
}

interface Scores {
  [verseNumber: number]: string; // model name
}

export function ModelScorer({
  book,
  chapter,
  verseNumber,
  models,
}: ModelScorerProps) {
  const storageKey = `model-scores-${book}-${chapter}`;
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const scores: Scores = JSON.parse(stored);
      setSelectedModel(scores[verseNumber] || null);
    }
  }, [storageKey, verseNumber]);

  const handleSelect = (model: string) => {
    setSelectedModel(model);
    const stored = localStorage.getItem(storageKey);
    const scores: Scores = stored ? JSON.parse(stored) : {};
    scores[verseNumber] = model;
    localStorage.setItem(storageKey, JSON.stringify(scores));
    
    // Trigger custom event for stats update
    window.dispatchEvent(new CustomEvent("scoreUpdated", { detail: { book, chapter } }));
  };

  if (!mounted) {
    return (
      <div className="flex gap-2 flex-wrap">
        {models.map((model) => (
          <button
            key={model}
            className="px-3 py-1.5 text-xs rounded border transition-colors opacity-50"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
            disabled
          >
            {model.replace(/-/g, " ")}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {models.map((model) => {
        const isSelected = selectedModel === model;
        return (
          <button
            key={model}
            onClick={() => handleSelect(model)}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-all"
            style={{
              backgroundColor: isSelected
                ? "var(--color-accent-bg)"
                : "var(--color-bg-secondary)",
              borderColor: isSelected
                ? "var(--color-accent)"
                : "var(--color-border)",
              color: isSelected
                ? "var(--color-accent)"
                : "var(--color-text-muted)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "var(--color-accent-soft)";
                e.currentTarget.style.color = "var(--color-text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-muted)";
              }
            }}
          >
            {isSelected && "✓ "}
            {model.replace(/-/g, " ")}
          </button>
        );
      })}
    </div>
  );
}

interface ModelStatsProps {
  book: string;
  chapter: number;
  totalVerses: number;
  models: string[];
}

export function ModelStats({ book, chapter, totalVerses, models }: ModelStatsProps) {
  const storageKey = `model-scores-${book}-${chapter}`;
  const [stats, setStats] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  const updateStats = () => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      setStats({});
      return;
    }

    const scores: Scores = JSON.parse(stored);
    const newStats: Record<string, number> = {};
    
    models.forEach((model) => {
      newStats[model] = Object.values(scores).filter((m) => m === model).length;
    });

    setStats(newStats);
  };

  useEffect(() => {
    setMounted(true);
    updateStats();

    const handleUpdate = () => updateStats();
    window.addEventListener("scoreUpdated", handleUpdate as EventListener);
    return () => window.removeEventListener("scoreUpdated", handleUpdate as EventListener);
  }, [storageKey, models]);

  if (!mounted) return null;

  const totalScored = Object.values(stats).reduce((sum, count) => sum + count, 0);
  const winner = Object.entries(stats).sort(([, a], [, b]) => b - a)[0];
  const winnerName = winner?.[0];
  const winnerCount = winner?.[1] || 0;

  if (totalScored === 0) {
    return (
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Select your favorite translation for each verse to see statistics.
        </p>
      </div>
    );
  }

  // Show sample size warning if too small
  const isSmallSample = totalScored < 10;

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      <h3
        className="text-lg font-semibold mb-3"
        style={{ color: "var(--color-text-primary)" }}
      >
        Model Statistics
      </h3>
      <div className="space-y-2 mb-4">
        {models.map((model) => {
          const count = stats[model] || 0;
          const percentage = totalScored > 0 ? (count / totalScored) * 100 : 0;
          return (
            <div key={model}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-sm capitalize"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {model.replace(/-/g, " ")}
                </span>
                <span
                  className="text-sm font-mono"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {count} / {totalScored} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor:
                      model === winnerName
                        ? "var(--color-accent)"
                        : "var(--color-border)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {winnerName && (
        <div
          className="pt-3 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "var(--color-accent)" }}>
              {winnerName.replace(/-/g, " ")}
            </strong>{" "}
            is winning with {winnerCount} of {totalScored} verses scored.
          </p>
          {isSmallSample && (
            <p className="text-xs italic" style={{ color: "var(--color-text-tertiary)" }}>
              💡 Tip: Score at least 10-20 verses for more reliable statistics. 
              Consider testing more verses with: <code className="px-1 py-0.5 rounded" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>npm run test:models "1 Nephi" 1 20</code>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

