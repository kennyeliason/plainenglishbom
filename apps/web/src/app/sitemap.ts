import { MetadataRoute } from "next";
import { getAllBooks, getBookSlugsForLocale } from "@/lib/data";
import { listAvailableComparisons } from "@/lib/comparison";
import { locales } from "../../i18n/config";

// Get the base URL from environment variable or use default
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.plainenglishbom.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const urls: MetadataRoute.Sitemap = [];

  // Get comparisons (English only)
  const availableComparisons = listAvailableComparisons();
  const comparisonMap = new Set(
    availableComparisons.map((c) => `${c.book}-${c.chapter}`)
  );

  // Generate URLs for each locale
  for (const locale of locales) {
    const urlPrefix = locale === "en" ? "" : `/${locale}`;
    const bookSlugs = getBookSlugsForLocale(locale);
    const books = getAllBooks(locale);

    // Home page - highest priority
    urls.push({
      url: `${baseUrl}${urlPrefix}/`,
      changeFrequency: "weekly",
      priority: locale === "en" ? 1.0 : 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/`,
          es: `${baseUrl}/es/`,
        },
      },
    });

    // Static pages
    urls.push({
      url: `${baseUrl}${urlPrefix}/privacy/`,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          en: `${baseUrl}/privacy/`,
          es: `${baseUrl}/es/privacy/`,
        },
      },
    });
    urls.push({
      url: `${baseUrl}${urlPrefix}/support/`,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          en: `${baseUrl}/support/`,
          es: `${baseUrl}/es/support/`,
        },
      },
    });

    // Add all book pages
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const bookSlug = bookSlugs[i];
      const enSlug = getBookSlugsForLocale("en")[i];
      const esSlug = getBookSlugsForLocale("es")[i];
      const bookUrl = `${baseUrl}${urlPrefix}/${bookSlug}/`;

      urls.push({
        url: bookUrl,
        changeFrequency: "monthly",
        priority: locale === "en" ? 0.8 : 0.7,
        alternates: {
          languages: {
            en: `${baseUrl}/${enSlug}/`,
            es: `${baseUrl}/es/${esSlug}/`,
          },
        },
      });

      // Add all chapter pages for this book
      for (const chapter of book.chapters) {
        const chapterUrl = `${baseUrl}${urlPrefix}/${bookSlug}/${chapter.number}/`;

        urls.push({
          url: chapterUrl,
          changeFrequency: "monthly",
          priority: locale === "en" ? 0.7 : 0.6,
          alternates: {
            languages: {
              en: `${baseUrl}/${enSlug}/${chapter.number}/`,
              es: `${baseUrl}/es/${esSlug}/${chapter.number}/`,
            },
          },
        });

        // Add comparison page if it exists (English only, excluding 1 Nephi)
        if (locale === "en") {
          const comparisonKey = `${book.shortName}-${chapter.number}`;
          if (comparisonMap.has(comparisonKey) && book.shortName !== "1 Nephi") {
            const compareUrl = `${baseUrl}/compare/${bookSlug}/${chapter.number}/`;

            urls.push({
              url: compareUrl,
              changeFrequency: "monthly",
              priority: 0.5,
            });
          }
        }
      }
    }
  }

  return urls;
}
