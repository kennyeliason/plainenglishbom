import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://plainenglishbom.com";
const SITE_NAME = "Plain English Book of Mormon";
const SITE_DESCRIPTION =
  "The Book of Mormon translated into clear, modern English while preserving its original meaning and spiritual power.";

export function getCanonicalUrl(path: string = ""): string {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export function generatePageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "book";
}): Metadata {
  const canonicalUrl = path ? getCanonicalUrl(path) : getCanonicalUrl();
  const ogImage = image || `${SITE_URL}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
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

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
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
