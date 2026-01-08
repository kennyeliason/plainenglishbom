import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StructuredData } from "@/components/StructuredData";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://plainenglishbom.com"
  ),
  title: {
    default: "Plain English Book of Mormon",
    template: "%s | Plain English Book of Mormon",
  },
  description:
    "The Book of Mormon translated into clear, modern English while preserving its original meaning and spiritual power.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
        <header
          className="sticky top-0 z-50 backdrop-blur-md"
          style={{
            background: "var(--color-header-bg)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-2 sm:gap-3"
              style={{ color: "var(--color-header-text)" }}
            >
              <span
                className="text-lg sm:text-2xl"
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                Plain English
              </span>
              <span
                className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs uppercase tracking-widest rounded"
                style={{
                  background: "var(--color-header-accent)",
                  color: "var(--color-header-bg)",
                  fontFamily: "var(--font-source-serif), serif",
                  fontWeight: 500,
                }}
              >
                Book of Mormon
              </span>
            </Link>
            <ThemeToggle />
          </nav>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12">{children}</main>

        <footer
          className="mt-16"
          style={{
            background: "var(--color-bg-secondary)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div className="max-w-5xl mx-auto px-6 py-10">
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
                  Plain English Book of Mormon
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Scripture made accessible for modern readers
                </p>
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Source text from{" "}
                <a
                  href="https://www.gutenberg.org/ebooks/17"
                  className="animated-underline"
                  style={{ color: "var(--color-accent)" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Project Gutenberg
                </a>
              </div>
            </div>
            <div
              className="mt-8 pt-6 text-center text-xs"
              style={{
                borderTop: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              <p className="decorative-rule">
                <span style={{ fontFamily: "var(--font-cormorant), serif" }}>
                  ✦
                </span>
              </p>
            </div>
          </div>
        </footer>
        {/* Google Analytics - Using official Next.js @next/third-parties package */}
        <GoogleAnalytics gaId="G-2B944CWJX8" />
      </body>
    </html>
  );
}
