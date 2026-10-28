import { createContext } from "react";

const LANGUAGE_KEY = "aicon_preferred_language";
const DEFAULT_LANGUAGE = "en";

export const LanguageContext = createContext(null);
export { DEFAULT_LANGUAGE, LANGUAGE_KEY };
