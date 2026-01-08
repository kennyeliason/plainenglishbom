import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBook,
  getChapter,
  getAllBooks,
  slugify,
  unslugify,
} from "@/lib/data";
import { getChapterComparison } from "@/lib/comparison";
import {
  generatePageMetadata,
  generateChapterSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { StructuredData } from "@/components/StructuredData";

interface ChapterPageProps {
  params: Promise<{ book: string; chapter: string }>;
}

export function generateStaticParams() {
  const params: { book: string; chapter: string }[] = [];

  for (const book of getAllBooks()) {
    for (const chapter of book.chapters) {
      params.push({
        book: slugify(book.shortName),
        chapter: chapter.number.toString(),
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { book: bookSlug, chapter: chapterStr } = await params;
  const bookName = unslugify(bookSlug);
  const chapterNum = parseInt(chapterStr, 10);

  const book = getBook(bookName);
  const chapter = getChapter(bookName, chapterNum);

  if (!book || !chapter) {
    return {};
  }

  // Get preview text from first verse
  const previewText = chapter.verses[0]?.plainText || chapter.verses[0]?.text || "";
  const preview = previewText.length > 150 ? previewText.substring(0, 150) + "..." : previewText;

  const description = `${book.shortName} Chapter ${chapterNum} in plain English. ${chapter.verses.length} verses. ${preview}`;

  return generatePageMetadata({
    title: `${book.shortName} Chapter ${chapterNum} - Plain English`,
    description,
    path: `/${slugify(book.shortName)}/${chapterNum}`,
    type: "article",
  });
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { book: bookSlug, chapter: chapterStr } = await params;
  const bookName = unslugify(bookSlug);
  const chapterNum = parseInt(chapterStr, 10);

  const book = getBook(bookName);
  const chapter = getChapter(bookName, chapterNum);

  if (!book || !chapter) {
    notFound();
  }

  // Check if comparison exists
  const comparison = getChapterComparison(bookName, chapterNum);

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter =
    chapterNum < book.chapters.length ? chapterNum + 1 : null;

  // Generate schema markup
  const chapterSchema = generateChapterSchema({
    name: `${book.shortName} Chapter ${chapter.number}`,
    position: chapter.number,
    isPartOf: {
      "@type": "Book",
      name: book.shortName,
    },
    hasPart: chapter.verses.map((verse) => ({
      "@type": "Verse",
      name: `Verse ${verse.number}`,
    })),
  });

  const articleSchema = generateArticleSchema({
    headline: `${book.shortName} Chapter ${chapter.number}`,
    description: `${book.shortName} Chapter ${chapter.number} in plain English with ${chapter.verses.length} verses`,
    author: {
      "@type": "Organization",
      name: "Plain English Book of Mormon",
    },
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: book.shortName, url: `/${slugify(book.shortName)}` },
    { name: `Chapter ${chapter.number}`, url: `/${slugify(book.shortName)}/${chapter.number}` },
  ]);

  return (
    <>
      <StructuredData data={[chapterSchema, articleSchema, breadcrumbSchema]} />
      <div className="animate-fade-in">
      {/* Top Navigation */}
      <nav className="mb-8 flex items-center justify-between">
        <Link
          href={`/${slugify(book.shortName)}`}
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
          <span>{book.shortName}</span>
        </Link>
        <div className="flex items-center gap-4">
          {prevChapter && (
            <Link
              href={`/${slugify(book.shortName)}/${prevChapter}`}
              className="nav-link text-sm hidden sm:inline-flex items-center gap-1"
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
              <span>Chapter {prevChapter}</span>
            </Link>
          )}
          {nextChapter && (
            <Link
              href={`/${slugify(book.shortName)}/${nextChapter}`}
              className="nav-link text-sm hidden sm:inline-flex items-center gap-1"
            >
              <span>Chapter {nextChapter}</span>
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
          {book.shortName}
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
          Chapter {chapter.number}
        </h1>
        <p className="decorative-rule">
          <span
            className="text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {chapter.verses.length} verses
          </span>
        </p>
        {/* Compare Models button - hidden for 1 Nephi, but logic kept for future testing */}
        {comparison && book.shortName !== "1 Nephi" && (
          <div className="mt-4">
            <Link
              href={`/compare/${bookSlug}/${chapterNum}`}
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
              Compare Models
            </Link>
          </div>
        )}
      </header>

      {/* Verses */}
      <div className="max-w-3xl mx-auto space-y-2">
        {chapter.verses.map((verse, index) => (
          <article
            key={verse.number}
            className="verse-card"
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
                      <span>Show original text</span>
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
        className="mt-16 pt-8 flex items-center justify-between"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        {prevChapter ? (
          <Link
            href={`/${slugify(book.shortName)}/${prevChapter}`}
            className="group flex items-center gap-3 p-4 -m-4 rounded-lg transition-colors"
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
                Previous
              </p>
              <p
                className="font-medium"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                Chapter {prevChapter}
              </p>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {nextChapter && (
          <Link
            href={`/${slugify(book.shortName)}/${nextChapter}`}
            className="group flex items-center gap-3 p-4 -m-4 rounded-lg transition-colors text-right"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Next
              </p>
              <p
                className="font-medium"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                Chapter {nextChapter}
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

      {/* Return to Chapter List */}
      <div className="mt-12 text-center">
        <Link
          href={`/${slugify(book.shortName)}`}
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
          <span>View all chapters</span>
        </Link>
      </div>
    </div>
    </>
  );
}
