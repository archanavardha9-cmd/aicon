import { ArrowRight, Building2, CheckCircle2, Shield, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactDetails } from '../data/contact';
import { useTranslation } from '../hooks/useTranslation';

const values = [
  {
    number: '01',
    titleKey: 'whyChooseUs.pillars.0.title',
    descKey: 'whyChooseUs.pillars.0.desc',
    icon: Sparkles,
  },
  {
    number: '02',
    titleKey: 'whyChooseUs.pillars.1.title',
    descKey: 'whyChooseUs.pillars.1.desc',
    icon: Shield,
  },
  {
    number: '03',
    titleKey: 'whyChooseUs.pillars.2.title',
    descKey: 'whyChooseUs.pillars.2.desc',
    icon: Users,
  },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <main>
      <section className="page-intro page-intro--about">
        <div className="page-shell page-intro__inner">
          <span className="eyebrow eyebrow--light">
            <span className="eyebrow__line" />
            {t("pageIntro.about.eyebrow")}
          </span>
          <h1>
            {t("pageIntro.about.heading")}
            <br />
            <em>{t("pageIntro.about.headingEmphasis")}</em>
          </h1>
          <p>{t("pageIntro.about.description")}</p>
        </div>
      </section>

      <section className="section section--ivory about-editorial">
        <div className="page-shell about-editorial__grid">
          <div className="about-editorial__aside">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              {t("about.eyebrow")}
            </span>
            <div className="about-editorial__badge-card">
              <Building2 size={32} className="about-editorial__badge-icon" />
              <strong>{contactDetails.companyName}</strong>
              <span>{t("contact.corporateHeadquarters")}: {contactDetails.incorporationDate}</span>
              <small>{t("contact.cin")}: {contactDetails.cin}</small>
              <address>{contactDetails.address}</address>
            </div>
          </div>
          <div className="about-editorial__copy">
            <span className="about-editorial__index">{t("about.missionIndex")}</span>
            <h2 className="display-heading">
              {t("about.missionHeading")}
              <br />
              <em>{t("about.missionEmphasis")}</em>
            </h2>
            <p>{t("about.missionDescription")}</p>
            <p>{t("about.missionDescription2")}</p>
            <div className="about-editorial__bullets">
              <div className="about-bullet">
                <CheckCircle2 size={16} className="bullet-icon" />
                <span>{t("about.bullet1")}</span>
              </div>
              <div className="about-bullet">
                <CheckCircle2 size={16} className="bullet-icon" />
                <span>{t("about.bullet2")}</span>
              </div>
              <div className="about-bullet">
                <CheckCircle2 size={16} className="bullet-icon" />
                <span>{t("about.bullet3")}</span>
              </div>
            </div>
            <div className="about-editorial__actions">
              <Link className="button button--gold" to="/products">
                {t("about.exploreCatalogue")} <ArrowRight size={16} />
              </Link>
              <Link className="button button--secondary" to="/contact">
                {t("about.getInTouch")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--light values-section">
        <div className="page-shell">
          <div className="values-section__heading">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              {t("about.valuesHeading")}
            </span>
            <h2 className="display-heading">
              {t("about.valuesHeading")}
              <br />
              <em>{t("about.valuesEmphasis")}</em>
            </h2>
            <p>{t("about.valuesDescription")}</p>
          </div>
          <div className="values-grid">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article className="value-card" key={value.number}>
                  <div className="value-card__top">
                    <span className="value-card__number">{value.number}</span>
                    <Icon size={24} className="value-card__icon" />
                  </div>
                  <h3>{t(value.titleKey)}</h3>
                  <p>{t(value.descKey)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
