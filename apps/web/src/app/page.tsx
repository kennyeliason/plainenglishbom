import type { Metadata } from "next";
import Link from "next/link";
import { getAllBooks, slugify } from "@/lib/data";
import { generatePageMetadata } from "@/lib/seo";
import { ContinueReading } from "@/components/ContinueReading";

export const metadata: Metadata = {
  ...generatePageMetadata({
    title: "Book of Mormon in Plain English - Modern Translation",
    description:
      "The Book of Mormon translated into clear, modern English while preserving its original meaning and spiritual power. Read all 15 books with natural, accessible language.",
    path: "/",
  }),
  title: {
    absolute: "Book of Mormon in Plain English - Modern Translation",
  },
};

export default function HomePage() {
  const books = getAllBooks();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1
          className="text-5xl sm:text-6xl mb-6"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          The Book of Mormon
        </h1>
        <p className="decorative-rule mb-6">
          <span
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "1.25rem",
              color: "var(--color-accent)",
            }}
          >
            In Plain English
          </span>
        </p>
        <p
          className="text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Scripture translated into clear, modern language while preserving its
          original meaning and spiritual power. Read the ancient text as it was
          meant to be understood.
        </p>
      </div>

      {/* Continue Reading */}
      <ContinueReading />

      {/* Books Grid */}
      <div className="mb-16">
        <h2
          className="text-sm uppercase tracking-widest mb-8 text-center"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-source-serif), serif",
            fontWeight: 500,
          }}
        >
          Select a Book
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {books.map((book) => {
            const verseCount = book.chapters.reduce(
              (sum, ch) => sum + ch.verses.length,
              0
            );
            return (
              <Link
                key={book.shortName}
                href={`/${slugify(book.shortName)}`}
                className="book-card group block p-6 rounded-xl"
                style={{
                  background: "var(--color-bg-tertiary)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="relative z-10">
                  <h2
                    className="text-xl mb-2 group-hover:text-[var(--color-accent)] transition-colors"
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {book.shortName}
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {book.chapters.length} chapter
                    {book.chapters.length !== 1 ? "s" : ""}
                    <span
                      className="mx-2"
                      style={{ color: "var(--color-border-strong)" }}
                    >
                      ·
                    </span>
                    {verseCount.toLocaleString()} verses
                  </p>
                  <div
                    className="mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--color-accent)" }}
                  >
                    <span>Begin reading</span>
                    <svg
                      className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
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
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* About Section */}
      <div className="about-section">
        <h2
          className="text-2xl mb-4"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          About This Translation
        </h2>
        <div
          className="space-y-4 leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <p>
            This project presents the Book of Mormon with its archaic King James
            English carefully converted to plain, modern language. Phrases like{" "}
            <em
              style={{
                color: "var(--color-text-tertiary)",
                fontStyle: "italic",
              }}
            >
              &ldquo;it came to pass&rdquo;
            </em>{" "}
            are simplified, and pronouns like{" "}
            <em
              style={{
                color: "var(--color-text-tertiary)",
                fontStyle: "italic",
              }}
            >
              thee
            </em>
            ,{" "}
            <em
              style={{
                color: "var(--color-text-tertiary)",
                fontStyle: "italic",
              }}
            >
              thou
            </em>
            , and{" "}
            <em
              style={{
                color: "var(--color-text-tertiary)",
                fontStyle: "italic",
              }}
            >
              ye
            </em>{" "}
            are updated to their modern equivalents.
          </p>
          <p>
            The goal is accessibility without sacrificing substance—making these
            ancient teachings approachable for contemporary readers while
            honoring the sacred nature of the text.
          </p>
        </div>
      </div>
    </div>
  );
}
