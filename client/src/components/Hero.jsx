import { ArrowRight, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__layout page-shell">
        <div className="hero__copy">
          <span className="eyebrow eyebrow--light">
            <span className="eyebrow__line" />
            {t("hero.eyebrow")}
          </span>
          <h1>
            {t("hero.heading")}
            <br />
            <em>{t("hero.headingEmphasis")}</em>
          </h1>
          <p className="hero__description">
            {t("hero.description")}
          </p>
          <div className="hero__actions">
            <Link className="button button--gold" to="/products">
              {t("hero.exploreCollection")} <ArrowRight size={17} />
            </Link>
            <Link className="hero__text-link" to="/contact">
              {t("hero.makeAnEnquiry")} <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero__features" aria-label="AICON product highlights">
            <div className="hero__feature-item hide-on-mobile">
              <ShieldCheck size={16} className="hero__feature-icon" />
              <span>{t("hero.highlights.reliability")}</span>
            </div>
            <div className="hero__feature-item">
              <CheckCircle2 size={16} className="hero__feature-icon" />
              <span>{t("hero.highlights.indianConditions")}</span>
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
    </section>
  );
}
