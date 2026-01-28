import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { generatePageMetadata } from "@/lib/seo";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;

  return generatePageMetadata({
    title: "About - Plain English Book of Mormon",
    description:
      "Learn about the Plain English Book of Mormon project - a modern translation making scripture accessible to everyone.",
    path: `/${locale}/about`,
    locale,
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href={locale === "en" ? "/" : `/${locale}`}
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
          <span>Home</span>
        </Link>
      </nav>

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
          About This Project
        </h1>
      </header>

      <div
        className="prose prose-lg mx-auto"
        style={{
          fontFamily: "var(--font-source-serif), serif",
          color: "var(--color-text-secondary)",
          lineHeight: 1.8,
        }}
      >
        <section className="mb-10">
          <h2
            className="text-2xl mb-4"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Why Plain English?
          </h2>
          <p className="mb-4">
            The Book of Mormon was originally written using the language patterns
            of the 1611 King James Bible - "thee," "thou," "hath," "wherefore,"
            and complex sentence structures that can be barriers to understanding
            for modern readers.
          </p>
          <p className="mb-4">
            This project aims to make the Book of Mormon accessible to everyone
            by converting archaic language into clear, contemporary English while
            preserving the original meaning and message.
          </p>
          <p>
            This is not a replacement for the original text. It's a reading aid.
            Verse numbers are preserved so you can easily reference the original
            at any time.
          </p>
        </section>

        <section className="mb-10">
          <h2
            className="text-2xl mb-4"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            How It Was Made
          </h2>
          <p className="mb-4">
            This translation uses a combination of rule-based text transformations
            and AI-assisted modernization:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Pronoun updates:</strong> "thee," "thou," "thy," "ye" →
              "you," "your"
            </li>
            <li>
              <strong>Verb modernization:</strong> "hath" → "has," "doth" →
              "does," "saith" → "says"
            </li>
            <li>
              <strong>Phrase simplification:</strong> "it came to pass" →
              contextual alternatives, "wherefore" → "therefore" or "so"
            </li>
            <li>
              <strong>Sentence clarity:</strong> Complex archaic constructions
              rewritten for modern comprehension
            </li>
          </ul>
          <p>
            The goal is accessibility, not interpretation. Doctrinal meaning is
            preserved; only the language is updated.
          </p>
        </section>

        <section className="mb-10">
          <h2
            className="text-2xl mb-4"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Open Source
          </h2>
          <p className="mb-4">
            The translations are open source and available for anyone to use,
            improve, or build upon. Community contributions are welcome.
          </p>
          <p>
            <a
              href="https://github.com/plainenglishbom/plainenglishbom-translations"
              className="animated-underline"
              style={{ color: "var(--color-accent)" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub →
            </a>
          </p>
        </section>

        <section className="mb-10">
          <h2
            className="text-2xl mb-4"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Available Languages
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>English</strong> - Modern English translation from King
              James English
            </li>
            <li>
              <strong>Spanish</strong> - Spanish translation
            </li>
          </ul>
          <p className="mt-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
            More languages coming soon.
          </p>
        </section>

        <section
          className="p-6 rounded-xl text-center"
          style={{
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p className="mb-4">Questions, suggestions, or found an error?</p>
          <a
            href="https://github.com/plainenglishbom/plainenglishbom-translations/issues"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all hover:scale-[1.02]"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-bg-primary)",
              fontWeight: 500,
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Open an Issue on GitHub</span>
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </section>
      </div>
    </div>
  );
}
