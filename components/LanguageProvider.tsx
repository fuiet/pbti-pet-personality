"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isAvailableLanguage, type Language } from "@/lib/i18n";

const STORAGE_KEY = "pbti-language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && isAvailableLanguage(saved as Language)) {
    return saved as Language;
  }

  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    setLanguage(detectInitialLanguage());
  }, []);

  function updateLanguage(nextLanguage: Language) {
    setLanguage(isAvailableLanguage(nextLanguage) ? nextLanguage : "en");
  }

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage: updateLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
