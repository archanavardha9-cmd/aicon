import { useState, useEffect } from "react";
import { LanguageContext, DEFAULT_LANGUAGE, LANGUAGE_KEY } from "./LanguageContext";

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved && (saved === "en" || saved === "hi")) {
        return saved;
      }
    } catch {
      // localStorage unavailable
    }
    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // localStorage unavailable
    }
  }, [language]);

  function setLanguage(lang) {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // localStorage unavailable
    }
  }

  const value = { language, setLanguage };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
