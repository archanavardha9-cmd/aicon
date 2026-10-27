import { useEffect, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
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

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [menuOpen]);

  // Handle ESC key to dismiss mobile drawer
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    }
    if (menuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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
            <img src="/aicon-logo.png" alt="" />
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

        {/* 3-Bar Animated Hamburger Toggle matching reference style */}
        <button
          className={`mobile-menu-toggle menu-toggle${menuOpen ? ' open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
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
        className={`mobile-drawer-wrapper${menuOpen ? ' open' : ''}`}
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
        <nav
          className="mobile-drawer"
          id="mobile-drawer"
          aria-label="Mobile navigation"
        >
          <div className="mobile-drawer-header">
            <Link
              className="brand-lockup mobile-drawer-brand"
              to="/"
              aria-label="AICON Smart Appliances home"
              onClick={closeMenu}
            >
              <span className="brand-lockup__mark" aria-hidden="true">
                <img src="/aicon-logo.png" alt="" />
              </span>
              <span className="brand-lockup__copy">
                <span className="brand-lockup__name">AICON</span>
                <span className="brand-lockup__descriptor">Smart appliances</span>
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
            {links.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `mobile-drawer-link${isActive ? ' active is-active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="mobile-drawer-footer">
            <Link
              className="mobile-drawer-cta button button--gold"
              to="/contact"
              onClick={closeMenu}
            >
              Make an enquiry <ArrowUpRight size={16} />
            </Link>


          </div>
        </nav>
      </div>
    </header>
  );
}
