import { useEffect, useState } from "react";
import { ArrowUpRight, Globe, Moon, Sun, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { useTheme } from "../hooks/useTheme";

const links = [
  { key: "nav.home", to: "/", end: true },
  { key: "nav.collection", to: "/products" },
  { key: "nav.about", to: "/about" },
  { key: "nav.contact", to: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useTranslation();
  const { theme, setTheme } = useTheme();

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLanguageChange(lang) {
    setLanguage(lang);
    closeMenu();
  }

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [menuOpen]);

  // Handle ESC key to dismiss mobile drawer
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }
    if (menuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link
          className="brand-lockup"
          to="/"
          aria-label="AICON Smart Appliances home"
          onClick={closeMenu}
        >
          <span className="brand-lockup__mark" aria-hidden="true">
            <img src="/aicon-logo.webp" alt="" />
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(({ key, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `desktop-nav__link${isActive ? " is-active" : ""}`
              }
            >
              {t(key)}
            </NavLink>
          ))}
        </nav>

        <div className="header-right">
          <button
            className="desktop-lang-switch"
            type="button"
            onClick={() => {
              const next = language === "en" ? "hi" : "en";
              handleLanguageChange(next);
            }}
            aria-label="Switch language"
          >
            <Globe size={14} />
            <span>{language === "en" ? "EN" : "हिन्दी"}</span>
          </button>
          <button
            className="desktop-theme-toggle"
            type="button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <Link className="header-enquiry" to="/contact">
            <span>{t("nav.makeEnquiry")}</span>
            <ArrowUpRight size={16} strokeWidth={1.7} />
          </Link>
        </div>

        {/* 3-Bar Animated Hamburger Toggle matching reference style */}
        <button
          className={`mobile-menu-toggle menu-toggle${menuOpen ? " open" : ""}`}
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Right-Side Sliding Drawer Navigation matching reference layout & motion */}
      <div
        className={`mobile-drawer-wrapper${menuOpen ? " open" : ""}`}
        id="mobile-drawer-wrapper"
        aria-hidden={!menuOpen}
      >
        {/* Soft Backdrop Overlay (Click to dismiss) */}
        <div
          className="mobile-drawer-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Drawer Content */}
        <nav className="mobile-drawer" id="mobile-drawer" aria-label="Mobile navigation">
          <div className="mobile-drawer-header">
            <Link
              className="brand-lockup mobile-drawer-brand"
              to="/"
              aria-label="AICON Smart Appliances home"
              onClick={closeMenu}
            >
              <span className="brand-lockup__mark" aria-hidden="true">
                <img src="/aicon-logo.webp" alt="" />
              </span>
            </Link>

            <button
              className="mobile-drawer-close"
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMenu}
            >
              <X size={20} strokeWidth={2.2} />
            </button>
          </div>

          <div className="mobile-drawer-links">
            {links.map(({ key, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `mobile-drawer-link${isActive ? " active is-active" : ""}`
                }
              >
                {t(key)}
              </NavLink>
            ))}
          </div>

          <div className="mobile-drawer-footer">
            <div className="mobile-lang-switch">
              {["en", "hi"].map((code) => (
                <button
                  key={code}
                  type="button"
                  className={`mobile-lang-option${code === language ? " is-active" : ""}`}
                  onClick={() => handleLanguageChange(code)}
                >
                  {code === "en" ? "English" : "हिन्दी"}
                </button>
              ))}
            </div>
            <button
              className="mobile-theme-toggle"
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <Link
              className="mobile-drawer-cta button button--gold"
              to="/contact"
              onClick={closeMenu}
            >
              {t("nav.makeEnquiry")} <ArrowUpRight size={16} />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
