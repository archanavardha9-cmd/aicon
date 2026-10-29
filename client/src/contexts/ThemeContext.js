import { createContext } from "react";

const THEME_KEY = "aicon_preferred_theme";
const DEFAULT_THEME = "light";

export const ThemeContext = createContext(null);
export { THEME_KEY, DEFAULT_THEME };
