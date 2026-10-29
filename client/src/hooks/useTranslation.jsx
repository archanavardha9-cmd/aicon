import en from "../locales/en";
import hi from "../locales/hi";
import { useTranslationContext } from "../contexts/useTranslationContext";

const locales = { en, hi };

export function useTranslation() {
  const { language, setLanguage } = useTranslationContext();
  const t = (key, params = {}) => {
    const keys = key.split(".");
    let value = locales[language];

    for (const k of keys) {
      if (value == null || typeof value !== "object") {
        return key;
      }
      value = value[k];
    }

    if (typeof value === "string") {
      // Replace {param} placeholders
      return value.replace(/\{(\w+)\}/g, (match, paramName) => {
        return params[paramName] !== undefined ? params[paramName] : match;
      });
    }

    return value;
  };

  return { t, language, setLanguage };
}
