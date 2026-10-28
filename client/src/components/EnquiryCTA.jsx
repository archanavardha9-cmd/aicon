import { ArrowRight, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { contactDetails } from "../data/contact";
import { useTranslation } from "../hooks/useTranslation";

export default function EnquiryCTA() {
  const { t } = useTranslation();

  return (
    <section className="closing-cta">
      <div className="closing-cta__inner page-shell">
        <div>
          <span className="eyebrow eyebrow--light">
            <span className="eyebrow__line" />
            {t("enquiryCTA.eyebrow")}
          </span>
          <h2>
            Looking for Product Guidance
            <br />
            or Retail Availability?
          </h2>
          <div className="closing-cta__contact-chips">
            <a
              href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}
              className="cta-chip"
            >
              <Phone size={14} />
              <span>{contactDetails.phone}</span>
            </a>
            <a href={`mailto:${contactDetails.email}`} className="cta-chip">
              <Mail size={14} />
              <span>{contactDetails.email}</span>
            </a>
          </div>
        </div>
        <div className="closing-cta__aside">
          <p>
            Whether you need detailed technical specifications, bulk distributor
            pricing, or model availability in your region, our team is ready to
            assist.
          </p>
          <div className="closing-cta__actions">
            <Link className="button button--gold" to="/contact">
              Send an Enquiry <ArrowRight size={17} />
            </Link>
            <Link className="button button--secondary-light" to="/products">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
