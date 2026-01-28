import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  getBook,
  getChapter,
  getAllBooks,
  getBookSlugsForLocale,
  unslugifyForLocale,
  getCanonicalSlug,
} from "@/lib/data";
import { getChapterComparison } from "@/lib/comparison";
import {
  generatePageMetadata,
  generateChapterSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { StructuredData } from "@/components/StructuredData";
import { KeyboardNavigation } from "@/components/KeyboardNavigation";
import { ReadingProgressTracker } from "@/components/ReadingProgress";
import { locales } from "../../../../../i18n/config";

interface ChapterPageProps {
  params: Promise<{ locale: string; book: string; chapter: string }>;
}

export function generateStaticParams() {
  const params: { locale: string; book: string; chapter: string }[] = [];

  for (const locale of locales) {
    const slugs = getBookSlugsForLocale(locale);
    const books = getAllBooks(locale);

    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const bookSlug = slugs[i];
      for (const chapter of book.chapters) {
        params.push({
          locale,
          book: bookSlug,
          chapter: chapter.number.toString(),
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { locale, book: bookSlug, chapter: chapterStr } = await params;
  const bookName = unslugifyForLocale(bookSlug, locale);
  const chapterNum = parseInt(chapterStr, 10);

  const book = getBook(bookSlug, locale);
  const chapter = getChapter(bookSlug, chapterNum, locale);

  if (!book || !chapter) {
    return {};
  }

  // Get preview text from first verse
  const previewText =
    chapter.verses[0]?.plainText || chapter.verses[0]?.text || "";
  const preview =
    previewText.length > 150 ? previewText.substring(0, 150) + "..." : previewText;

  const description =
    locale === "es"
      ? `${bookName} Capítulo ${chapterNum} en español sencillo. ${chapter.verses.length} versículos. ${preview}`
      : `${bookName} Chapter ${chapterNum} in plain English. ${chapter.verses.length} verses. ${preview}`;

  const urlPrefix = `/${locale}`;

  return generatePageMetadata({
    title:
      locale === "es"
        ? `${bookName} ${chapterNum} - Libro de Mormón en Español Sencillo`
        : `${bookName} ${chapterNum} - Plain English Book of Mormon`,
    description,
    path: `${urlPrefix}/${bookSlug}/${chapterNum}`,
    type: "article",
    locale,
  });
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { locale, book: bookSlug, chapter: chapterStr } = await params;
  setRequestLocale(locale);

  const bookName = unslugifyForLocale(bookSlug, locale);
  const chapterNum = parseInt(chapterStr, 10);

  const book = getBook(bookSlug, locale);
  const chapter = getChapter(bookSlug, chapterNum, locale);

  if (!book || !chapter) {
    notFound();
  }

  const t = await getTranslations("navigation");
  const tChapter = await getTranslations("chapter");

  const urlPrefix = `/${locale}`;
  const homeUrl = locale === "en" ? "/" : `/${locale}`;

  // Check if comparison exists (only for English, using canonical slug)
  const canonicalSlug = getCanonicalSlug(bookSlug);
  const comparison = locale === "en" ? getChapterComparison(unslugifyForLocale(canonicalSlug, "en"), chapterNum) : null;

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter =
    chapterNum < book.chapters.length ? chapterNum + 1 : null;

  // Generate schema markup
  const chapterSchema = generateChapterSchema({
    name:
      locale === "es"
        ? `${bookName} Capítulo ${chapter.number}`
        : `${bookName} Chapter ${chapter.number}`,
    position: chapter.number,
    isPartOf: {
      "@type": "Book",
      name: bookName,
    },
    hasPart: chapter.verses.map((verse) => ({
      "@type": "Verse",
      name: locale === "es" ? `Versículo ${verse.number}` : `Verse ${verse.number}`,
    })),
  });

  const articleSchema = generateArticleSchema({
    headline:
      locale === "es"
        ? `${bookName} Capítulo ${chapter.number}`
        : `${bookName} Chapter ${chapter.number}`,
    description:
      locale === "es"
        ? `${bookName} Capítulo ${chapter.number} en español sencillo con ${chapter.verses.length} versículos`
        : `${bookName} Chapter ${chapter.number} in plain English with ${chapter.verses.length} verses`,
    author: {
      "@type": "Organization",
      name:
        locale === "es"
          ? "Libro de Mormón en Español Sencillo"
          : "Plain English Book of Mormon",
    },
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: locale === "es" ? "Inicio" : "Home", url: homeUrl },
    { name: bookName, url: `${urlPrefix}/${bookSlug}/` },
    {
      name: locale === "es" ? `Capítulo ${chapter.number}` : `Chapter ${chapter.number}`,
      url: `${urlPrefix}/${bookSlug}/${chapter.number}`,
    },
  ]);

  const prevUrl = prevChapter
    ? `${urlPrefix}/${bookSlug}/${prevChapter}/`
    : null;
  const nextUrl = nextChapter
    ? `${urlPrefix}/${bookSlug}/${nextChapter}/`
    : null;

  return (
    <>
      <StructuredData data={[chapterSchema, articleSchema, breadcrumbSchema]} />
      <KeyboardNavigation prevUrl={prevUrl} nextUrl={nextUrl} />
      <ReadingProgressTracker
        bookSlug={bookSlug}
        chapterNum={chapterNum}
        bookName={book.shortName}
      />
      <div className="animate-fade-in">
        {/* Top Navigation */}
        <nav className="mb-8 flex items-center justify-between">
          <Link
            href={
              book.chapters.length === 1
                ? homeUrl
                : `${urlPrefix}/${bookSlug}/`
            }
            className="nav-link inline-flex items-center gap-2 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>
              {book.chapters.length === 1 ? t("allBooks") : bookName}
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {prevChapter && (
              <Link
                href={`${urlPrefix}/${bookSlug}/${prevChapter}/`}
                className="nav-link text-sm inline-flex items-center gap-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">{t("chapter")}</span>{" "}
                <span>{prevChapter}</span>
              </Link>
            )}
            {nextChapter && (
              <Link
                href={`${urlPrefix}/${bookSlug}/${nextChapter}/`}
                className="nav-link text-sm inline-flex items-center gap-1"
              >
                <span className="hidden sm:inline">{t("chapter")}</span>{" "}
                <span>{nextChapter}</span>
                <svg
                  className="w-3 h-3"
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
            )}
          </div>
        </nav>

        {/* Chapter Header */}
        <header className="text-center mb-12">
          <p
            className="text-sm uppercase tracking-widest mb-2"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-source-serif), serif",
            }}
          >
            {bookName}
          </p>
          <h1
            className="text-4xl sm:text-5xl mb-4"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {t("chapter")} {chapter.number}
          </h1>
          <p className="decorative-rule">
            <span
              className="text-sm"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {tChapter("verses", { count: chapter.verses.length })}
            </span>
          </p>
          {/* Chapter Summary */}
          {chapter.summary && (
            <div
              className="mt-8 max-w-2xl mx-auto text-left px-4 py-3 rounded"
              style={{
                borderLeft: "3px solid var(--color-accent)",
                backgroundColor: "var(--color-bg-secondary)",
              }}
            >
              <p
                className="text-xs uppercase tracking-widest mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                {tChapter("overview")}
              </p>
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {chapter.summary}
              </p>
            </div>
          )}
          {/* Compare Models button - hidden for 1 Nephi, but logic kept for future testing */}
          {comparison && book.shortName !== "1 Nephi" && locale === "en" && (
            <div className="mt-4">
              <Link
                href={`/compare/${bookSlug}/${chapterNum}/`}
                className="compare-link inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                {tChapter("compareModels")}
              </Link>
            </div>
          )}
        </header>

        {/* Verses */}
        <div className="max-w-3xl mx-auto space-y-2">
          {chapter.verses.map((verse, index) => (
            <article
              key={verse.number}
              id={`v${verse.number}`}
              className="verse-card scroll-mt-24"
              style={{
                animationDelay: `${Math.min(index * 30, 300)}ms`,
              }}
            >
              <div className="flex items-start gap-4">
                <span className="verse-number">{verse.number}</span>
                <div className="flex-1 space-y-3">
                  <p
                    className="text-lg leading-relaxed"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {verse.plainText || verse.text}
                  </p>
                  {verse.plainText && (
                    <details className="group">
                      <summary className="original-text-toggle inline-flex items-center gap-1 select-none">
                        <svg
                          className="w-3 h-3 transform transition-transform group-open:rotate-90"
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
                        <span>{tChapter("showOriginal")}</span>
                      </summary>
                      <p className="original-text">{verse.text}</p>
                    </details>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Navigation */}
        <nav
          className="mt-16 pt-8 flex items-center justify-between overflow-hidden"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {prevChapter ? (
            <Link
              href={`${urlPrefix}/${bookSlug}/${prevChapter}/`}
              className="group flex items-center gap-3 py-2 rounded-lg transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                style={{ color: "var(--color-accent)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {t("previous")}
                </p>
                <p
                  className="font-medium"
                  style={{ fontFamily: "var(--font-cormorant), serif" }}
                >
                  {t("chapter")} {prevChapter}
                </p>
              </div>
            </Link>
          ) : (
            <span />
          )}
          {nextChapter && (
            <Link
              href={`${urlPrefix}/${bookSlug}/${nextChapter}/`}
              className="group flex items-center gap-3 py-2 rounded-lg transition-colors text-right"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {t("next")}
                </p>
                <p
                  className="font-medium"
                  style={{ fontFamily: "var(--font-cormorant), serif" }}
                >
                  {t("chapter")} {nextChapter}
                </p>
              </div>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                style={{ color: "var(--color-accent)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}
        </nav>

        {/* Return to Chapter List - hide for single-chapter books */}
        {book.chapters.length > 1 && (
          <div className="mt-12 text-center">
            <Link
              href={`${urlPrefix}/${bookSlug}`}
              className="inline-flex items-center gap-2 text-sm animated-underline"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              <span>{tChapter("viewAllChapters")}</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
