import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { label: 'Home', to: '/', end: true },
  { label: 'The collection', to: '/products' },
  { label: 'Our story', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

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
            <img src="/aicon-logo.jpg" alt="" />
          </span>
          <span className="brand-lockup__copy">
            <span className="brand-lockup__name">AICON</span>
            <span className="brand-lockup__descriptor">Smart appliances</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `desktop-nav__link${isActive ? ' is-active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <Link className="header-enquiry" to="/contact">
          <span>Make an enquiry</span>
          <ArrowUpRight size={16} strokeWidth={1.7} />
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="mobile-nav"
          id="mobile-navigation"
          aria-label="Mobile navigation"
        >
          {links.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav__link${isActive ? ' is-active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link className="button button--gold mobile-nav__cta" to="/contact" onClick={closeMenu}>
            Make an enquiry <ArrowUpRight size={16} />
          </Link>
        </nav>
      )}
    </header>
  );
}
