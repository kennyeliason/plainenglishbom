import { MetadataRoute } from "next";

// Get the base URL from environment variable or use default
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://plainenglishbom.com";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

