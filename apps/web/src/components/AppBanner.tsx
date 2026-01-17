"use client";

import { useState, useEffect } from "react";

export function AppBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("app-banner-dismissed");
    setDismissed(wasDismissed === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("app-banner-dismissed", "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div
      className="relative mb-8 p-4 sm:p-5 rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--color-accent) 0%, #2a5a8a 100%)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss banner"
      >
        <svg
          className="w-5 h-5 text-white/80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 p-3 rounded-xl bg-white/15 backdrop-blur-sm">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3
            className="text-lg font-semibold text-white mb-1"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Mobile App Coming Soon
          </h3>
          <p className="text-sm text-white/85 leading-relaxed">
            Get AI-powered study insights on any verse. Ask questions, explore context,
            and deepen your understanding with our upcoming mobile app.
          </p>
        </div>

        <div className="flex-shrink-0 self-start sm:self-center">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
            In Development
          </span>
        </div>
      </div>
    </div>
  );
}
