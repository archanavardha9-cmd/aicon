import { ArrowDown, ArrowRight, ArrowUpRight, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__layout page-shell">
        <div className="hero__copy">
          <span className="eyebrow eyebrow--light">
            <span className="eyebrow__line" />
            AICON · Smart Home Appliances
          </span>
          <h1>
            Intelligent Comfort,
            <br />
            Engineered for <em>Everyday Living.</em>
          </h1>
          <p className="hero__description">
            Discover AICON’s complete portfolio of frameless 4K Smart TVs, durable
            twin-tub washing machines, energy-conscious air cooling, and kitchen essentials
            crafted for dependable performance in Indian homes.
          </p>
          <div className="hero__actions">
            <Link className="button button--gold" to="/products">
              Explore Collection <ArrowRight size={17} />
            </Link>
            <Link className="hero__text-link" to="/contact">
              Make an Enquiry <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero__features" aria-label="AICON product highlights">
            <div className="hero__feature-item">
              <Sparkles size={16} className="hero__feature-icon" />
              <span>4K Ultra HD & Dolby Audio</span>
            </div>
            <div className="hero__feature-item">
              <Zap size={16} className="hero__feature-icon" />
              <span>High-Torque Heavy Duty Motors</span>
            </div>
            <div className="hero__feature-item">
              <ShieldCheck size={16} className="hero__feature-icon" />
              <span>Tested for Indian Conditions</span>
            </div>
          </div>
        </div>

        <figure className="hero__visual">
          <div className="hero__product-stage">
            <div className="hero__product-backdrop" aria-hidden="true" />
            <img
              className="hero__product-image"
              src="/images/products/aicon-smart-tv.png"
              alt="AICON 55 Inch 4K Smart LED TV"
              fetchPriority="high"
            />
            <div className="hero__product-badge">
              <span className="hero__badge-kicker">FLAGSHIP SERIES</span>
              <strong>AICON 55" 4K Smart LED TV</strong>
              <small>Frameless Bezel-Less · HDR10 Contrast</small>
            </div>
            <div className="hero__floating-note">
              <span className="hero__floating-kicker">AICON MODCON PVT LTD</span>
              <span>Mumbai, Maharashtra · Est. 2023</span>
            </div>
          </div>
        </figure>
      </div>

      <a className="hero__scroll page-shell" href="#categories">
        <span>Scroll to explore categories</span>
        <ArrowDown size={15} />
      </a>
    </section>
  );
}
