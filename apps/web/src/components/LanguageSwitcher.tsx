"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { languageNames, type Locale } from "../../i18n/config";
import { translateSlug, getBookSlugsForLocale } from "@plainenglishbom/core";

export function LanguageSwitcher() {
  const pathname = usePathname();

  // Determine current locale from pathname (both /en/ and /es/ now have prefixes)
  const currentLocale: Locale = pathname.startsWith("/es") ? "es" : "en";

  // Get the target locale (the one we're switching to)
  const targetLocale: Locale = currentLocale === "en" ? "es" : "en";

  // Build the URL for the other language
  const getTargetUrl = (): string => {
    // Remove the locale prefix (now handles both /en/ and /es/)
    let pathWithoutLocale = pathname;
    if (pathname.startsWith("/es/")) {
      pathWithoutLocale = pathname.slice(3); // Remove /es
    } else if (pathname === "/es") {
      pathWithoutLocale = "";
    } else if (pathname.startsWith("/en/")) {
      pathWithoutLocale = pathname.slice(3); // Remove /en
    } else if (pathname === "/en") {
      pathWithoutLocale = "";
    }

    // Parse the path to translate book slugs
    const segments = pathWithoutLocale.split("/").filter(Boolean);

    if (segments.length > 0) {
      // Check if first segment is a book slug
      const bookSlugs = getBookSlugsForLocale(currentLocale);
      if (bookSlugs.includes(segments[0])) {
        // Translate the book slug
        segments[0] = translateSlug(segments[0], currentLocale, targetLocale);
      }
    }

    // Rebuild the path with target locale prefix (always include prefix now)
    const translatedPath = segments.length > 0 ? `/${segments.join("/")}` : "";
    return `/${targetLocale}${translatedPath}`;
  };

  const targetUrl = getTargetUrl();

  return (
    <Link
      href={targetUrl}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors"
      style={{
        color: "var(--color-text-secondary)",
        background: "transparent",
      }}
      title={`Switch to ${languageNames[targetLocale]}`}
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
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
      <span className="hidden sm:inline">{languageNames[targetLocale]}</span>
      <span className="sm:hidden">{targetLocale.toUpperCase()}</span>
    </Link>
  );
}
