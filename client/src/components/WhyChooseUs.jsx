import { ArrowUpRight, Award, Cpu, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

export default function WhyChooseUs() {
  const { t } = useTranslation();
  const pillars = Array.isArray(t("whyChooseUs.pillars"))
    ? t("whyChooseUs.pillars")
    : [];

  return (
    <section className="section section--ivory why-choose-us">
      <div className="page-shell">
        <div className="section-heading-row">
          <div className="section-heading-row__copy">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              {t("whyChooseUs.eyebrow")}
            </span>
            <h2 className="display-heading">
              {t("whyChooseUs.heading")}
              <br />
              <em>{t("whyChooseUs.headingEmphasis")}</em>
            </h2>
          </div>
          <div className="section-heading-row__aside">
            <p>{t("whyChooseUs.description")}</p>
            <Link className="inline-link" to="/about">
              {t("whyChooseUs.readCompanyProfile")} <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="pillars-grid">
          {pillars.map((pillar, index) => {
            const Icon =
              index === 0
                ? Cpu
                : index === 1
                  ? Zap
                  : index === 2
                    ? ShieldCheck
                    : Award;
            return (
              <div className="pillar-card" key={pillar.title}>
                <div className="pillar-card__header">
                  <span className="pillar-card__icon-wrap">
                    <Icon size={24} />
                  </span>
                  <span className="pillar-card__index">0{index + 1}</span>
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
