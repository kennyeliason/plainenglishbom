import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StructuredData } from "@/components/StructuredData";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import { locales } from "../../../i18n/config";
import { cormorant, sourceSerif } from "../layout";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: {
      default: t("siteName"),
      template: `%s | ${t("siteName")}`,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("common");
  const tFooter = await getTranslations("footer");

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta
          name="apple-itunes-app"
          content="app-id=6757943123"
        />
        <StructuredData
          data={[generateOrganizationSchema(), generateWebSiteSchema()]}
        />
      </head>
      <body
        className={`${cormorant.variable} ${sourceSerif.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Theme initialization - runs before page becomes interactive to prevent flash */}
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
          style={{
            background: "var(--color-accent)",
            color: "white",
          }}
        >
          {t("skipToContent")}
        </a>
        <div className="w-full overflow-x-hidden">
          <header
            className="sticky top-0 z-50 backdrop-blur-md"
            style={{
              background: "var(--color-header-bg)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <nav className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <Link
                href={locale === "en" ? "/" : `/${locale}`}
                className="group flex flex-col"
                style={{ color: "var(--color-header-text)" }}
              >
                <span
                  className="text-lg sm:text-xl"
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {locale === "es" ? "Libro de Mormón" : "Book of Mormon"}
                </span>
                <span
                  className="text-[10px] sm:text-xs tracking-wide"
                  style={{
                    color: "var(--color-header-accent)",
                    fontFamily: "var(--font-source-serif), serif",
                  }}
                >
                  {t("siteTagline")}
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </nav>
          </header>

          <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            {children}
          </main>

          <footer
            className="mt-16"
            style={{
              background: "var(--color-bg-secondary)",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p
                    className="text-lg mb-1"
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {t("siteName")}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {tFooter("tagline")}
                  </p>
                </div>
                <Link
                  href={`/${locale}/about/`}
                  className="text-sm animated-underline"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {locale === "es" ? "Acerca del proyecto" : "About this project"}
                </Link>
              </div>
              <div
                className="mt-8 pt-6 text-center text-xs"
                style={{
                  borderTop: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
              >
                <p>© {new Date().getFullYear()} The Plain English Book of Mormon Project</p>
              </div>
            </div>
          </footer>
        </div>
        {/* Google Analytics - Using official Next.js @next/third-parties package */}
        {process.env.NODE_ENV === "production" && (
          <GoogleAnalytics gaId="G-2B944CWJX8" />
        )}
        {/* Service Worker for offline support */}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
