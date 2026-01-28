export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Language display names for the language switcher
export const languageNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};
