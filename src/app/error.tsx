"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="animate-fade-in text-center py-16">
      <p
        className="text-sm uppercase tracking-widest mb-4"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-source-serif), serif",
        }}
      >
        Something went wrong
      </p>
      <h1
        className="text-5xl sm:text-6xl mb-6"
        style={{
          fontFamily: "var(--font-cormorant), serif",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        An Error Occurred
      </h1>
      <p className="decorative-rule mb-8">
        <span
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "1.25rem",
            color: "var(--color-accent)",
          }}
        >
          Even the plates had imperfections
        </span>
      </p>
      <p
        className="text-lg max-w-md mx-auto mb-10 leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        We encountered an unexpected error. Please try again.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors cursor-pointer"
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Try Again
      </button>
    </div>
  );
}
