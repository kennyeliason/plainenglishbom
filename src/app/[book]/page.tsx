import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook, getBookSlugs, slugify, unslugify } from "@/lib/data";
import { generatePageMetadata, generateBookSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { StructuredData } from "@/components/StructuredData";

interface BookPageProps {
  params: Promise<{ book: string }>;
}

export function generateStaticParams() {
  return getBookSlugs().map((book) => ({ book }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { book: bookSlug } = await params;
  const bookName = unslugify(bookSlug);
  const book = getBook(bookName);

  if (!book) {
    return {};
  }

  const totalVerses = book.chapters.reduce((sum, ch) => sum + ch.verses.length, 0);
  const description = `${book.shortName} from the Book of Mormon in plain English. ${book.chapters.length} chapter${book.chapters.length !== 1 ? "s" : ""}, ${totalVerses.toLocaleString()} verses. Read scripture in modern, accessible language.`;

  return generatePageMetadata({
    title: `${book.shortName} - Plain English Book of Mormon`,
    description,
    path: `/${slugify(book.shortName)}`,
  });
}

export default async function BookPage({ params }: BookPageProps) {
  const { book: bookSlug } = await params;
  const bookName = unslugify(bookSlug);
  const book = getBook(bookName);

  if (!book) {
    notFound();
  }

  const totalVerses = book.chapters.reduce(
    (sum, ch) => sum + ch.verses.length,
    0
  );

  const bookSchema = generateBookSchema({
    name: book.shortName,
    numberOfPages: book.chapters.length,
    about: `${book.shortName} from the Book of Mormon, translated into plain English`,
    isPartOf: "The Book of Mormon",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: book.shortName, url: `/${slugify(book.shortName)}` },
  ]);

  return (
    <>
      <StructuredData data={[bookSchema, breadcrumbSchema]} />
      <div className="animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/"
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
          <span>All Books</span>
        </Link>
      </nav>

      {/* Book Header */}
      <header className="text-center mb-12">
        <h1
          className="text-4xl sm:text-5xl mb-4"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {book.shortName}
        </h1>
        <p className="decorative-rule">
          <span
            className="text-sm"
            style={{
              color: "var(--color-text-tertiary)",
              fontFamily: "var(--font-source-serif), serif",
            }}
          >
            {book.chapters.length} chapter
            {book.chapters.length !== 1 ? "s" : ""}
            <span className="mx-3" style={{ color: "var(--color-border-strong)" }}>
              ·
            </span>
            {totalVerses.toLocaleString()} verses
          </span>
        </p>
      </header>

      {/* Chapter Selection */}
      <div className="mb-12">
        <h2
          className="text-sm uppercase tracking-widest mb-6 text-center"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-source-serif), serif",
            fontWeight: 500,
          }}
        >
          Select a Chapter
        </h2>
        <div className="grid gap-3 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 stagger-children">
          {book.chapters.map((chapter) => (
            <Link
              key={chapter.number}
              href={`/${slugify(book.shortName)}/${chapter.number}`}
              className="chapter-link"
            >
              {chapter.number}
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Start Suggestion */}
      <div
        className="text-center p-8 rounded-xl"
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p
          className="text-sm mb-4"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Not sure where to start?
        </p>
        <Link
          href={`/${slugify(book.shortName)}/1`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all hover:scale-[1.02]"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-bg-primary)",
            fontFamily: "var(--font-source-serif), serif",
            fontWeight: 500,
          }}
        >
          <span>Begin with Chapter 1</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
    </>
  );
}
