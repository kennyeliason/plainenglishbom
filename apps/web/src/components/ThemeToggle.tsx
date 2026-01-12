"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;

    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      setResolvedTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      // System preference
      setTheme("system");
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = systemDark ? "dark" : "light";
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
    }
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only follow system if user hasn't set a manual preference
      if (theme === "system") {
        const resolved = e.matches ? "dark" : "light";
        setResolvedTheme(resolved);
        document.documentElement.setAttribute("data-theme", resolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    // Cycle: system -> light -> dark -> system
    let newTheme: Theme;
    if (theme === "system") {
      newTheme = resolvedTheme === "dark" ? "light" : "dark";
    } else if (theme === "light") {
      newTheme = "dark";
    } else {
      newTheme = "system";
    }

    setTheme(newTheme);

    if (newTheme === "system") {
      localStorage.removeItem("theme");
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = systemDark ? "dark" : "light";
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
    } else {
      localStorage.setItem("theme", newTheme);
      setResolvedTheme(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  if (!mounted) {
    return (
      <button className="theme-toggle" aria-label="Toggle theme">
        <span className="w-5 h-5" />
      </button>
    );
  }

  const getLabel = () => {
    if (theme === "system") return "Following system (click to override)";
    if (theme === "light") return "Light mode (click for dark)";
    return "Dark mode (click for system)";
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {theme === "system" ? (
        // System icon - monitor/computer
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ) : resolvedTheme === "light" ? (
        // Moon icon - click to go to dark
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        // Sun icon - click to go to system
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  );
}
