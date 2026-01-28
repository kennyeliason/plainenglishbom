import type { Metadata } from "next";
import { translateSlug } from "@plainenglishbom/core";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.plainenglishbom.com";
const SITE_NAME = "Plain English Book of Mormon";
const SITE_NAME_ES = "Libro de Mormón en Español Sencillo";
const SITE_DESCRIPTION =
  "The Book of Mormon translated into clear, modern English while preserving its original meaning and spiritual power.";
export function getCanonicalUrl(path: string = ""): string {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Ensure trailing slash for consistency with Next.js trailingSlash: true config
  const urlWithSlash = cleanPath === "/" ? cleanPath : `${cleanPath}/`;
  return `${baseUrl}${urlWithSlash}`;
}

/**
 * Translate a path from one locale to another.
 * Handles book slug translation for chapter/book paths.
 */
function translatePath(
  path: string,
  fromLocale: string,
  toLocale: string
): string {
  if (fromLocale === toLocale) return path;

  // Parse the path segments
  const segments = path.split("/").filter(Boolean);

  // Remove locale prefix if present
  if (segments[0] === "en" || segments[0] === "es") {
    segments.shift();
  }

  if (segments.length > 0) {
    // Check if first segment could be a book slug and translate it
    const translatedSlug = translateSlug(segments[0], fromLocale, toLocale);
    if (translatedSlug !== segments[0]) {
      segments[0] = translatedSlug;
    }
  }

  // Rebuild path with new locale prefix
  const translatedPath = segments.length > 0 ? `/${segments.join("/")}` : "";
  return toLocale === "en" ? translatedPath || "/" : `/${toLocale}${translatedPath}`;
}

export function generatePageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  locale = "en",
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "book";
  locale?: string;
}): Metadata {
  const canonicalUrl = path ? getCanonicalUrl(path) : getCanonicalUrl();
  const ogImage = image || `${SITE_URL}/opengraph-image`;
  const siteName = locale === "es" ? SITE_NAME_ES : SITE_NAME;

  // Generate alternate language URLs
  const currentPath = path || "/";
  const enPath =
    locale === "en" ? currentPath : translatePath(currentPath, locale, "en");
  const esPath =
    locale === "es" ? currentPath : translatePath(currentPath, locale, "es");

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: getCanonicalUrl(enPath),
        es: getCanonicalUrl(esPath),
        "x-default": getCanonicalUrl(enPath),
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: locale === "es" ? "es_ES" : "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: type === "article" ? "article" : "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function generateSchemaMarkup(schema: Record<string, unknown>): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    ...schema,
  });
}

export function generateOrganizationSchema() {
  return generateSchemaMarkup({
    "@type": "Organization",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  });
}

export function generateWebSiteSchema() {
  return generateSchemaMarkup({
    "@type": "WebSite",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  });
}

export function generateBookSchema({
  name,
  numberOfPages,
  about,
  isPartOf,
}: {
  name: string;
  numberOfPages: number;
  about: string;
  isPartOf?: string;
}) {
  const schema: Record<string, unknown> = {
    "@type": "Book",
    name,
    numberOfPages,
    about,
  };

  if (isPartOf) {
    schema.isPartOf = {
      "@type": "Book",
      name: isPartOf,
    };
  }

  return generateSchemaMarkup(schema);
}

export function generateChapterSchema({
  name,
  position,
  isPartOf,
  hasPart,
}: {
  name: string;
  position: number;
  isPartOf: {
    "@type": string;
    name: string;
  };
  hasPart?: Array<{
    "@type": string;
    name: string;
  }>;
}) {
  const schema: Record<string, unknown> = {
    "@type": "Chapter",
    name,
    position,
    isPartOf,
  };

  if (hasPart) {
    schema.hasPart = hasPart;
  }

  return generateSchemaMarkup(schema);
}

export function generateArticleSchema({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  image,
}: {
  headline: string;
  description: string;
  author?: {
    "@type": string;
    name: string;
  };
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  const schema: Record<string, unknown> = {
    "@type": "Article",
    headline,
    description,
  };

  if (author) {
    schema.author = author;
  }
  if (datePublished) {
    schema.datePublished = datePublished;
  }
  if (dateModified) {
    schema.dateModified = dateModified;
  }
  if (image) {
    schema.image = image;
  }

  return generateSchemaMarkup(schema);
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return generateSchemaMarkup({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.url),
    })),
  });
}

export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return generateSchemaMarkup({
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  });
}
