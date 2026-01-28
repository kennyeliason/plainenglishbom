import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { getAvailableLocales, isLocaleAvailable } from "./data";

const LOCALE_STORAGE_KEY = "@locale_preference";

type Locale = "en" | "es";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale on mount
  useEffect(() => {
    initializeLocale();
  }, []);

  async function initializeLocale() {
    try {
      // Check for stored preference first
      const storedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);

      if (storedLocale && isLocaleAvailable(storedLocale)) {
        setLocaleState(storedLocale as Locale);
      } else {
        // Auto-detect from device locale
        const deviceLocale = Localization.getLocales()[0]?.languageCode || "en";

        // Check if device locale is supported, otherwise default to English
        const detectedLocale = isLocaleAvailable(deviceLocale) ? deviceLocale : "en";
        setLocaleState(detectedLocale as Locale);

        // Save the detected locale as preference
        await AsyncStorage.setItem(LOCALE_STORAGE_KEY, detectedLocale);
      }
    } catch (error) {
      console.error("Failed to initialize locale:", error);
      setLocaleState("en");
    } finally {
      setIsLoading(false);
    }
  }

  async function setLocale(newLocale: Locale) {
    try {
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      setLocaleState(newLocale);
    } catch (error) {
      console.error("Failed to save locale:", error);
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isLoading }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

// UI labels for each locale
export const UI_STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    // Home screen
    title: "Book of Mormon",
    subtitle: "IN PLAIN ENGLISH",
    description: "Scripture translated into clear, modern language while preserving its original meaning and spiritual power.",
    continueReading: "CONTINUE READING",
    allBooks: "ALL BOOKS",
    chapter: "Chapter",
    chapters: "chapters",
    justNow: "Just now",
    minutesAgo: "m ago",
    hoursAgo: "h ago",
    yesterday: "Yesterday",
    daysAgo: "days ago",
    // Book screen
    verses: "verses",
    // Chapter screen
    overview: "Overview",
    previous: "Previous",
    next: "Next",
    showOriginal: "Show original text",
    hideOriginal: "Hide original text",
    bookNotFound: "Book not found",
    chapterNotFound: "Chapter not found",
    // Settings
    settings: "Settings",
    language: "Language",
    languageDescription: "Choose your preferred language for scripture content.",
    aiStudyCompanion: "AI Study Companion",
    aiDescription: "Connect your OpenAI account to get AI-powered insights on any verse. Tap the sparkle icon on any verse to learn more about it.",
    openaiApiKey: "OpenAI API Key",
    connected: "Connected",
    disconnect: "Disconnect",
    connect: "Connect",
    getApiKey: "Get your API key from",
    about: "About",
    aboutText: "Plain English Book of Mormon translates scripture into clear, modern language while preserving its original meaning.",
    version: "Version",
    invalidKey: "Invalid Key",
    invalidKeyMessage: "OpenAI API keys start with 'sk-'",
    success: "Success",
    apiKeySaved: "API key saved securely",
    error: "Error",
    apiKeyError: "Failed to save API key",
    removeApiKey: "Remove API Key",
    removeApiKeyConfirm: "Are you sure you want to remove your API key?",
    cancel: "Cancel",
    remove: "Remove",
    loading: "Loading...",
  },
  es: {
    // Home screen
    title: "Libro de Mormón",
    subtitle: "EN ESPAÑOL SENCILLO",
    description: "Las Escrituras traducidas a un lenguaje claro y moderno, preservando su significado original y poder espiritual.",
    continueReading: "CONTINUAR LEYENDO",
    allBooks: "TODOS LOS LIBROS",
    chapter: "Capítulo",
    chapters: "capítulos",
    justNow: "Ahora",
    minutesAgo: "m",
    hoursAgo: "h",
    yesterday: "Ayer",
    daysAgo: "días",
    // Book screen
    verses: "versículos",
    // Chapter screen
    overview: "Resumen",
    previous: "Anterior",
    next: "Siguiente",
    showOriginal: "Mostrar texto original",
    hideOriginal: "Ocultar texto original",
    bookNotFound: "Libro no encontrado",
    chapterNotFound: "Capítulo no encontrado",
    // Settings
    settings: "Configuración",
    language: "Idioma",
    languageDescription: "Elige tu idioma preferido para el contenido de las Escrituras.",
    aiStudyCompanion: "Compañero de Estudio IA",
    aiDescription: "Conecta tu cuenta de OpenAI para obtener información impulsada por IA sobre cualquier versículo. Toca el icono de destello en cualquier versículo para aprender más.",
    openaiApiKey: "Clave API de OpenAI",
    connected: "Conectado",
    disconnect: "Desconectar",
    connect: "Conectar",
    getApiKey: "Obtén tu clave API en",
    about: "Acerca de",
    aboutText: "El Libro de Mormón en Español Sencillo traduce las Escrituras a un lenguaje claro y moderno, preservando su significado original.",
    version: "Versión",
    invalidKey: "Clave Inválida",
    invalidKeyMessage: "Las claves API de OpenAI comienzan con 'sk-'",
    success: "Éxito",
    apiKeySaved: "Clave API guardada de forma segura",
    error: "Error",
    apiKeyError: "Error al guardar la clave API",
    removeApiKey: "Eliminar Clave API",
    removeApiKeyConfirm: "¿Estás seguro de que quieres eliminar tu clave API?",
    cancel: "Cancelar",
    remove: "Eliminar",
    loading: "Cargando...",
  },
};

// Helper hook for getting localized strings
export function useStrings() {
  const { locale } = useLocale();
  return UI_STRINGS[locale];
}
