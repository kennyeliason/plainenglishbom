import { MetadataRoute } from "next";
import { getAllBooks, slugify } from "@/lib/data";
import { listAvailableComparisons } from "@/lib/comparison";

// Get the base URL from environment variable or use default
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://plainenglishbom.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const urls: MetadataRoute.Sitemap = [];

  // Home page - highest priority, change frequency daily
  urls.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  });

  // Get all books and chapters
  const books = getAllBooks();
  const availableComparisons = listAvailableComparisons();

  // Create a map of comparison pages for quick lookup
  // Match by book name (with spaces) and chapter number
  const comparisonMap = new Set(
    availableComparisons.map(
      (c) => `${c.book}-${c.chapter}`
    )
  );

  // Add all book pages
  for (const book of books) {
    const bookSlug = slugify(book.shortName);
    const bookUrl = `${baseUrl}/${bookSlug}`;

    urls.push({
      url: bookUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    // Add all chapter pages for this book
    for (const chapter of book.chapters) {
      const chapterUrl = `${baseUrl}/${bookSlug}/${chapter.number}`;

      urls.push({
        url: chapterUrl,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });

      // Add comparison page if it exists
      // Match by book name (with spaces) and chapter number
      const comparisonKey = `${book.shortName}-${chapter.number}`;
      if (comparisonMap.has(comparisonKey)) {
        const compareUrl = `${baseUrl}/compare/${bookSlug}/${chapter.number}`;

        urls.push({
          url: compareUrl,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  return urls;
}

