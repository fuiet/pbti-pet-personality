"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE, isAvailableLanguage, translate, type Language, type TranslationKey } from "@/lib/i18n";

const STORAGE_KEY = "pbti-language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && isAvailableLanguage(saved as Language)) {
    return saved as Language;
  }

  return navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLanguage(detectInitialLanguage());
    setHydrated(true);
  }, []);

  function updateLanguage(nextLanguage: Language) {
    setLanguage(isAvailableLanguage(nextLanguage) ? nextLanguage : DEFAULT_LANGUAGE);
  }

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [hydrated, language]);

  const value = useMemo(() => ({ language, setLanguage: updateLanguage, t: (key: TranslationKey) => translate(language, key) }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
