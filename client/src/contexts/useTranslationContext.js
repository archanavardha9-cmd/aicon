import { useContext } from "react";
import { LanguageContext } from "./LanguageContext";

export function useTranslationContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslationContext must be used within a LanguageProvider");
  }
  return context;
}
