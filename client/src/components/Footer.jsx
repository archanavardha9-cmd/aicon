import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { contactDetails, facebookUrl } from "../data/contact";
import useCategories from "../hooks/useCategories";

export default function Footer() {
  const { categories, loading, error } = useCategories();

  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="site-footer__main">
          <div className="site-footer__brand">
            <Link className="brand-lockup" to="/" aria-label="AICON home">
              <span className="brand-lockup__mark" aria-hidden="true">
                <img src="/aicon-logo.webp" alt="" />
              </span>
            </Link>
            <p>
              A considered range of home appliance categories, gathered under
              one name.
            </p>
            <a
              className="site-footer__social"
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="AICON on Facebook (opens in a new tab)"
            >
              <span aria-hidden="true">f</span>
            </a>
          </div>

          <div className="site-footer__column">
            <h2>Explore</h2>
            <Link to="/">Home</Link>
            <Link to="/products">The collection</Link>
            <Link to="/about">Our story</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="site-footer__column">
            <h2>Categories</h2>
            {loading && (
              <span className="site-footer__status">Loading categories…</span>
            )}
            {error && (
              <span className="site-footer__status">
                Categories unavailable.
              </span>
            )}
            {!loading &&
              !error &&
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                >
                  {category.label}
                </Link>
              ))}
          </div>

          <div className="site-footer__column site-footer__contact">
            <h2>Headquarters</h2>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactDetails.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={15} />
              <span>{contactDetails.address}</span>
              <ArrowUpRight size={13} />
            </a>
            <a href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}>
              <Phone size={15} />
              <span>
                {contactDetails.phone} / {contactDetails.phoneSecondary}
              </span>
            </a>
            <a href={`mailto:${contactDetails.email}`}>
              <Mail size={15} />
              <span>{contactDetails.email}</span>
            </a>
            <span className="site-footer__cin">CIN: {contactDetails.cin}</span>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>
            © {new Date().getFullYear()} {contactDetails.companyName}. All
            rights reserved.
          </span>
          <span>
            Innovation <i /> Quality <i /> Trust
          </span>
          <Link to="/contact">
            Product Enquiries & Support <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
