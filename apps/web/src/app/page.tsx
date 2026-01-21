import type { Metadata } from "next";
import Link from "next/link";
import { getAllBooks, slugify } from "@/lib/data";
import { generatePageMetadata, generateFAQSchema } from "@/lib/seo";
import { ContinueReading } from "@/components/ContinueReading";
import { StructuredData } from "@/components/StructuredData";
import { AppBanner } from "@/components/AppBanner";

export const metadata: Metadata = {
  ...generatePageMetadata({
    title: "Plain English Book of Mormon - Modern Translation",
    description:
      "Read the Plain English Book of Mormon - all 15 books translated into clear, modern language. Perfect for readers who find King James English challenging.",
    path: "/",
  }),
  title: {
    absolute: "Plain English Book of Mormon - Modern Translation",
  },
};

const faqs = [
  {
    question: "How was this translated?",
    answer:
      "We used a mix of find-and-replace rules for common patterns (like thee→you) and AI for trickier passages that needed more context to sound natural. Every verse was checked to make sure the meaning wasn't changed.",
  },
  {
    question: "Is it accurate to the original?",
    answer:
      "Yes. Nothing is added, removed, or changed in meaning—only the old language is updated. You can view the original King James text alongside any verse to compare.",
  },
  {
    question: "Who is this for?",
    answer:
      "Anyone who finds King James English hard to read—new readers, youth, people learning English, or anyone who just prefers modern language. You don't need to know what 'wherefore' means to understand the Book of Mormon.",
  },
  {
    question: "Why was this created?",
    answer:
      "Our bishop challenged the young men to read the Book of Mormon by May. One night, driving home from hockey practice, I had my son read out loud to me. He's a smart kid, but reading old English isn't fun for anyone. He complained about never understanding what he reads—like we all do. Then another night he was reading with my wife and got to the part where Nephi kills Laban. He said \"wait, what?? He did?!\" I swear we've told him that story a hundred times. So I thought: maybe I can fix this. I used AI to convert the King James language into regular English, spent a lot of time tuning it for accuracy, and added an AI you can ask questions about any verse—tap the lightbulb, ask whatever you're wondering, and it keeps a history so you can look back later.",
  },
];

export default function HomePage() {
  const books = getAllBooks();
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <StructuredData data={faqSchema} />
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

      {/* App Banner */}
      <AppBanner />

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

      {/* FAQ Section */}
      <div className="mb-8">
        <h2
          className="text-2xl mb-6"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl overflow-hidden"
              style={{
                background: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border)",
              }}
            >
              <summary
                className="flex items-center justify-between p-5 cursor-pointer select-none"
                style={{ color: "var(--color-text-primary)" }}
              >
                <span
                  className="font-medium pr-4"
                  style={{ fontFamily: "var(--font-source-serif), serif" }}
                >
                  {faq.question}
                </span>
                <svg
                  className="w-5 h-5 flex-shrink-0 transform transition-transform group-open:rotate-180"
                  style={{ color: "var(--color-text-tertiary)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div
                className="px-5 pb-5 leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
