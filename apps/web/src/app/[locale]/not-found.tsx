import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="animate-fade-in text-center py-16">
      <p
        className="text-sm uppercase tracking-widest mb-4"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-source-serif), serif",
        }}
      >
        {t("label")}
      </p>
      <h1
        className="text-6xl sm:text-8xl mb-6"
        style={{
          fontFamily: "var(--font-cormorant), serif",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        {t("title")}
      </h1>
      <p className="decorative-rule mb-8">
        <span
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "1.25rem",
            color: "var(--color-accent)",
          }}
        >
          {t("subtitle")}
        </span>
      </p>
      <p
        className="text-lg max-w-md mx-auto mb-10 leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {t("description")}
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors"
        style={{
          background: "var(--color-accent)",
          color: "white",
          fontFamily: "var(--font-source-serif), serif",
          fontWeight: 500,
        }}
      >
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        {t("returnHome")}
      </Link>
    </div>
  );
}
