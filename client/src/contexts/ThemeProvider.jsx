import { useState, useEffect } from "react";
import { ThemeContext, THEME_KEY, DEFAULT_THEME } from "./ThemeContext";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved && (saved === "light" || saved === "dark")) {
        return saved;
      }
    } catch {
      // localStorage unavailable
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function setTheme(nextTheme) {
    setThemeState(nextTheme);
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // localStorage unavailable
    }
  }

  const value = { theme, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
