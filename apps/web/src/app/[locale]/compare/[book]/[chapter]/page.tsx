import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getChapterComparison } from "@/lib/comparison";
import { unslugifyForLocale } from "@/lib/data";
import { ModelStats } from "@/components/ModelScorer";
import { TranslationCard } from "@/components/TranslationCard";

interface ComparePageProps {
  params: Promise<{ locale: string; book: string; chapter: string }>;
}

export function generateStaticParams() {
  // Only generate for English locale since comparisons are English-only
  return [];
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { locale, book, chapter } = await params;
  const bookName = unslugifyForLocale(book, locale);
  const chapterNum = parseInt(chapter, 10);

  return {
    title:
      locale === "es"
        ? `Comparación de Modelos: ${bookName} Capítulo ${chapterNum}`
        : `Model Comparison: ${bookName} Chapter ${chapterNum}`,
    description:
      locale === "es"
        ? `Compara traducciones de diferentes modelos de IA para ${bookName} Capítulo ${chapterNum}`
        : `Compare translations from different AI models for ${bookName} Chapter ${chapterNum}`,
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { locale, book, chapter } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("navigation");
  const tCompare = await getTranslations("compare");

  const bookName = unslugifyForLocale(book, "en"); // Always use English for comparison lookup
  const chapterNum = parseInt(chapter, 10);

  const comparison = getChapterComparison(bookName, chapterNum);

  if (!comparison) {
    notFound();
  }

  const models = Object.keys(comparison.verses[0]?.translations || {});
  const urlPrefix = `/${locale}`;
  const displayBookName = unslugifyForLocale(book, locale);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <Link
          href={`${urlPrefix}/${book}/${chapter}/`}
          className="text-sm mb-4 inline-block transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          &larr; {t("backToChapter")}
        </Link>
        <h1
          className="text-4xl mb-2"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {tCompare("title")}
        </h1>
        <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
          {displayBookName} {t("chapter")} {chapterNum}
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
            <div key={verse.number} className="comparison-verse-card">
              {/* Verse Header */}
              <div
                className="flex items-center gap-3 mb-4 pb-3 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span
                  className="font-bold text-lg px-3 py-1 rounded"
                  style={{
                    color: "var(--color-accent)",
                    backgroundColor: "var(--color-accent-bg)",
                  }}
                >
                  {tCompare("verse", { number: verse.number })}
                </span>
              </div>

              {/* Original Text */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="text-sm font-semibold uppercase tracking-wide"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {tCompare("originalText")}
                  </h3>
                  <span
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{
                      color: "var(--color-text-muted)",
                      backgroundColor: "var(--color-bg-secondary)",
                    }}
                  >
                    {tCompare("chars", { count: originalCount })}
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
                <h3
                  className="text-sm font-semibold uppercase tracking-wide mb-3"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {tCompare("translations")}
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
          <strong>{locale === "es" ? "Nota:" : "Note:"}</strong>{" "}
          {tCompare("note")}
        </p>
      </div>
    </div>
  );
}
