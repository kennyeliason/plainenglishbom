import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  getBook,
  getBookSlugsForLocale,
  unslugifyForLocale,
} from "@/lib/data";
import {
  generatePageMetadata,
  generateBookSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { StructuredData } from "@/components/StructuredData";
import { locales } from "../../../../i18n/config";

interface BookPageProps {
  params: Promise<{ locale: string; book: string }>;
}

export function generateStaticParams() {
  const params: { locale: string; book: string }[] = [];

  for (const locale of locales) {
    const slugs = getBookSlugsForLocale(locale);
    for (const book of slugs) {
      params.push({ locale, book });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { locale, book: bookSlug } = await params;
  const bookName = unslugifyForLocale(bookSlug, locale);
  const book = getBook(bookSlug, locale);

  if (!book) {
    return {};
  }

  const totalVerses = book.chapters.reduce(
    (sum, ch) => sum + ch.verses.length,
    0
  );

  const description =
    locale === "es"
      ? `${bookName} del Libro de Mormón en español sencillo. ${book.chapters.length} capítulo${book.chapters.length !== 1 ? "s" : ""}, ${totalVerses.toLocaleString()} versículos. Lee las escrituras en lenguaje moderno y accesible.`
      : `${bookName} from the Book of Mormon in plain English. ${book.chapters.length} chapter${book.chapters.length !== 1 ? "s" : ""}, ${totalVerses.toLocaleString()} verses. Read scripture in modern, accessible language.`;

  const urlPrefix = `/${locale}`;

  return generatePageMetadata({
    title:
      locale === "es"
        ? `${bookName} - Libro de Mormón en Español Sencillo`
        : `${bookName} - Plain English Book of Mormon`,
    description,
    path: `${urlPrefix}/${bookSlug}`,
    locale,
  });
}

export default async function BookPage({ params }: BookPageProps) {
  const { locale, book: bookSlug } = await params;
  setRequestLocale(locale);

  const bookName = unslugifyForLocale(bookSlug, locale);
  const book = getBook(bookSlug, locale);

  if (!book) {
    notFound();
  }

  const urlPrefix = `/${locale}`;

  // Redirect single-chapter books directly to chapter 1
  if (book.chapters.length === 1) {
    redirect(`${urlPrefix}/${bookSlug}/1`);
  }

  const t = await getTranslations("navigation");
  const tBook = await getTranslations("book");
  const tChapter = await getTranslations("chapter");

  const totalVerses = book.chapters.reduce(
    (sum, ch) => sum + ch.verses.length,
    0
  );

  const bookSchema = generateBookSchema({
    name: bookName,
    numberOfPages: book.chapters.length,
    about:
      locale === "es"
        ? `${bookName} del Libro de Mormón, traducido a español sencillo`
        : `${bookName} from the Book of Mormon, translated into plain English`,
    isPartOf:
      locale === "es" ? "El Libro de Mormón" : "The Book of Mormon",
  });

  const homeUrl = locale === "en" ? "/" : `/${locale}`;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: locale === "es" ? "Inicio" : "Home", url: homeUrl },
    { name: bookName, url: `${urlPrefix}/${bookSlug}/` },
  ]);

  return (
    <>
      <StructuredData data={[bookSchema, breadcrumbSchema]} />
      <div className="animate-fade-in">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href={homeUrl}
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
            <span>{t("allBooks")}</span>
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
            {bookName}
          </h1>
          <p className="decorative-rule">
            <span
              className="text-sm"
              style={{
                color: "var(--color-text-tertiary)",
                fontFamily: "var(--font-source-serif), serif",
              }}
            >
              {tChapter("chapters", { count: book.chapters.length })}
              <span
                className="mx-3"
                style={{ color: "var(--color-border-strong)" }}
              >
                ·
              </span>
              {tChapter("verses", { count: totalVerses })}
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
            {tBook("selectChapter")}
          </h2>
          <div className="grid gap-3 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 stagger-children">
            {book.chapters.map((chapter) => (
              <Link
                key={chapter.number}
                href={`${urlPrefix}/${bookSlug}/${chapter.number}/`}
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
            {tBook("notSureWhereToStart")}
          </p>
          <Link
            href={`${urlPrefix}/${bookSlug}/1/`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all hover:scale-[1.02]"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-bg-primary)",
              fontFamily: "var(--font-source-serif), serif",
              fontWeight: 500,
            }}
          >
            <span>{tBook("beginWithChapter1")}</span>
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
