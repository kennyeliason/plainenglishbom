import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  getAllBooks,
  getBookSlugsForLocale,
  unslugifyForLocale,
} from "@/lib/data";
import { generatePageMetadata, generateFAQSchema } from "@/lib/seo";
import { ContinueReading } from "@/components/ContinueReading";
import { StructuredData } from "@/components/StructuredData";
import { AppBanner } from "@/components/AppBanner";
import { locales } from "../../../i18n/config";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    ...generatePageMetadata({
      title:
        locale === "es"
          ? "Libro de Mormón en Español Sencillo - Traducción Moderna"
          : "Plain English Book of Mormon - Modern Translation",
      description:
        locale === "es"
          ? "Lee el Libro de Mormón en español sencillo - los 15 libros traducidos a un lenguaje moderno y claro. Perfecto para lectores que encuentran difícil el inglés antiguo."
          : "Read the Plain English Book of Mormon - all 15 books translated into clear, modern language. Perfect for readers who find King James English challenging.",
      path: locale === "en" ? "/" : `/${locale}`,
      locale,
    }),
    title: {
      absolute:
        locale === "es"
          ? "Libro de Mormón en Español Sencillo - Traducción Moderna"
          : "Plain English Book of Mormon - Modern Translation",
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tHome = await getTranslations("home");
  const tFaq = await getTranslations("faq");
  const tChapter = await getTranslations("chapter");

  const books = getAllBooks(locale);
  const bookSlugs = getBookSlugsForLocale(locale);

  const faqs = [
    { question: tFaq("q1"), answer: tFaq("a1") },
    { question: tFaq("q2"), answer: tFaq("a2") },
    { question: tFaq("q3"), answer: tFaq("a3") },
    { question: tFaq("q4"), answer: tFaq("a4") },
  ];

  const faqSchema = generateFAQSchema(faqs);

  // Get the URL prefix based on locale
  const urlPrefix = `/${locale}`;

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
            {tHome("title")}
          </h1>
          <p className="decorative-rule mb-6">
            <span
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "1.25rem",
                color: "var(--color-accent)",
              }}
            >
              {tHome("subtitle")}
            </span>
          </p>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {tHome("description")}
          </p>
        </div>

        {/* App Banner */}
        <AppBanner />

        {/* Continue Reading */}
        <ContinueReading locale={locale} />

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
            {tHome("selectBook")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {books.map((book, index) => {
              const verseCount = book.chapters.reduce(
                (sum, ch) => sum + ch.verses.length,
                0
              );
              // Get the localized slug for this book
              const bookSlug = bookSlugs[index];
              return (
                <Link
                  key={book.shortName}
                  href={`${urlPrefix}/${bookSlug}`}
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
                      {unslugifyForLocale(bookSlug, locale)}
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {tChapter("chapters", { count: book.chapters.length })}
                      <span
                        className="mx-2"
                        style={{ color: "var(--color-border-strong)" }}
                      >
                        ·
                      </span>
                      {tChapter("verses", { count: verseCount })}
                    </p>
                    <div
                      className="mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--color-accent)" }}
                    >
                      <span>{tHome("beginReading")}</span>
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
            {tHome("faq")}
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
