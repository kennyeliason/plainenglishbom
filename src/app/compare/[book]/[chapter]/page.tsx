import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapterComparison } from "@/lib/comparison";
import { unslugify } from "@/lib/data";
import { ModelStats } from "@/components/ModelScorer";
import { TranslationCard } from "@/components/TranslationCard";

interface ComparePageProps {
  params: Promise<{ book: string; chapter: string }>;
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { book, chapter } = await params;
  const bookName = unslugify(book);
  const chapterNum = parseInt(chapter, 10);

  return {
    title: `Model Comparison: ${bookName} Chapter ${chapterNum}`,
    description: `Compare translations from different AI models for ${bookName} Chapter ${chapterNum}`,
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { book, chapter } = await params;
  const bookName = unslugify(book);
  const chapterNum = parseInt(chapter, 10);

  const comparison = getChapterComparison(bookName, chapterNum);

  if (!comparison) {
    notFound();
  }

  const models = Object.keys(comparison.verses[0]?.translations || {});

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <Link
          href={`/${book}/${chapter}`}
          className="text-sm mb-4 inline-block transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          ← Back to Chapter
        </Link>
        <h1
          className="text-4xl mb-2"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          Model Comparison
        </h1>
        <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
          {bookName} Chapter {chapterNum}
        </p>
      </header>

      {/* Statistics */}
      <ModelStats
        book={bookName}
        chapter={chapterNum}
        totalVerses={comparison.verses.length}
        models={models}
      />

      {/* Verses */}
      <div className="space-y-8">
        {comparison.verses.map((verse) => {
          const originalCount = verse.original.length;
          
          return (
            <div
              key={verse.number}
              className="comparison-verse-card"
            >
              {/* Verse Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                <span
                  className="font-bold text-lg px-3 py-1 rounded"
                  style={{
                    color: "var(--color-accent)",
                    backgroundColor: "var(--color-accent-bg)",
                  }}
                >
                  Verse {verse.number}
                </span>
              </div>

              {/* Original Text */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                    Original Text
                  </h3>
                  <span
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{
                      color: "var(--color-text-muted)",
                      backgroundColor: "var(--color-bg-secondary)",
                    }}
                  >
                    {originalCount} chars
                  </span>
                </div>
                <p
                  className="text-base leading-relaxed italic p-3 rounded"
                  style={{
                    color: "var(--color-text-secondary)",
                    backgroundColor: "var(--color-bg-secondary)",
                  }}
                >
                  {verse.original}
                </p>
              </div>

              {/* Translations */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-muted)" }}>
                  Translations
                </h3>
                {models.map((model) => {
                  const translation = verse.translations[model] || "—";
                  return (
                    <TranslationCard
                      key={model}
                      model={model}
                      translation={translation}
                      originalCount={originalCount}
                      book={bookName}
                      chapter={chapterNum}
                      verseNumber={verse.number}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div
        className="mt-8 p-4 rounded-lg border"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          <strong>Note:</strong> This comparison shows translations from different AI
          models for the same verses. Use this to evaluate which model produces the best
          results for your needs.
        </p>
      </div>
    </div>
  );
}
