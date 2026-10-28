import { useMemo, useRef, useState } from "react";
import { ArrowRight, MapPin, Mail, Phone } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { contactDetails } from "../data/contact";
import useCategories from "../hooks/useCategories";
import { submitContact, submitEnquiry } from "../services/api";
import { useTranslation } from "../hooks/useTranslation";

export default function Contact() {
  const [searchParams] = useSearchParams();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [feedback, setFeedback] = useState(null);
  const submissionRef = useRef(false);
  const idempotencyRef = useRef(null);
  const requestedProduct = searchParams.get("product") || "";
  const productId =
    searchParams.get("productId") ||
    (searchParams.has("category") ? requestedProduct : "");
  const legacyCategory = useMemo(
    () =>
      categories.find(
        (item) => item.label.toLowerCase() === requestedProduct.toLowerCase(),
      ),
    [categories, requestedProduct],
  );
  const selectedCategory = categories.some((item) => item.id === category)
    ? category
    : legacyCategory?.id || "";
  const { t } = useTranslation();

  async function submitForm(event) {
    event.preventDefault();
    if (submissionRef.current) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const payload = {
      name,
      email,
      phone,
      message,
      ...(selectedCategory ? { categoryId: selectedCategory } : {}),
      ...(productId ? { productId } : {}),
    };
    const signature = JSON.stringify(payload);

    if (
      !idempotencyRef.current ||
      idempotencyRef.current.signature !== signature
    ) {
      idempotencyRef.current = {
        signature,
        key: crypto.randomUUID(),
      };
    }

    submissionRef.current = true;
    setFeedback({ status: "submitting", message: t("contact.submitting") });

    try {
      const submit =
        selectedCategory || productId ? submitEnquiry : submitContact;
      const result = await submit(payload, idempotencyRef.current.key);
      setFeedback({
        status: "success",
        message:
          result?.data?.message ||
          result?.message ||
          t("contact.successMessage"),
      });
      idempotencyRef.current = null;
      form.reset();
      setCategory("");
    } catch (error) {
      setFeedback({ status: "error", message: error.message });
    } finally {
      submissionRef.current = false;
    }
  }

  return (
    <main>
      <section className="page-intro page-intro--contact">
        <div className="page-shell page-intro__inner">
          <span className="eyebrow eyebrow--light">
            <span className="eyebrow__line" />
            {t("pageIntro.contact.eyebrow")}
          </span>
          <h1>
            {t("pageIntro.contact.heading")}
            <br />
            <em>{t("pageIntro.contact.headingEmphasis")}</em>
          </h1>
          <p>{t("pageIntro.contact.description")}</p>
        </div>
      </section>

      <section className="section section--ivory contact-section">
        <div className="page-shell contact-layout">
          <div className="contact-details">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              {t("contact.eyebrow")}
            </span>
            <h2 className="display-heading">
              {t("contact.heading")}
              <br />
              <em>{t("contact.headingEmphasis")}</em>
            </h2>
            <p>{t("contact.description")}</p>

            <div className="contact-details__list">
              <a href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}>
                <span className="contact-details__icon">
                  <Phone size={18} />
                </span>
                <span>
                  <small>{t("contact.salesCustomerCare")}</small>
                  {contactDetails.phone}
                </span>
              </a>
              <a
                href={`tel:${contactDetails.phoneSecondary.replace(/\s/g, "")}`}
              >
                <span className="contact-details__icon">
                  <Phone size={18} />
                </span>
                <span>
                  <small>{t("contact.supportLine")}</small>
                  {contactDetails.phoneSecondary}
                </span>
              </a>
              <a href={`mailto:${contactDetails.email}`}>
                <span className="contact-details__icon">
                  <Mail size={18} />
                </span>
                <span>
                  <small>{t("contact.primarySalesEmail")}</small>
                  {contactDetails.email}
                </span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactDetails.address)}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-details__icon">
                  <MapPin size={18} />
                </span>
                <span>
                  <small>{t("contact.corporateHeadquarters")}</small>
                  {contactDetails.address}
                </span>
              </a>
            </div>
            <div className="contact-details__meta">
              <p>
                <strong>{t("contact.cin")}:</strong> {contactDetails.cin}
              </p>
            </div>
            <Link className="inline-link" to="/products">
              {t("contact.browseProducts")} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="enquiry-panel">
            <div className="enquiry-panel__heading">
              <span className="enquiry-panel__index">{t("contact.enquiryIndex")}</span>
              <h2>{t("contact.enquiryHeading")}</h2>
              <p>{t("contact.enquiryDescription")}</p>
            </div>

            <div className="form-notice" role="note">
              {t("contact.formNotice")}
            </div>

            <form className="enquiry-form" onSubmit={submitForm}>
              <div
                className="form-field enquiry-form__honeypot"
                aria-hidden="true"
              >
                <label htmlFor="contact-website">{t("contact.websiteLabel")}</label>
                <input
                  id="contact-website"
                  name="website"
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>
              <div className="form-row">
                <label className="form-field">
                  <span>{t("contact.nameLabel")}</span>
                  <input
                    autoComplete="name"
                    name="name"
                    placeholder={t("contact.namePlaceholder")}
                    minLength="2"
                    maxLength="100"
                    required
                  />
                </label>
                <label className="form-field">
                  <span>{t("contact.emailLabel")}</span>
                  <input
                    autoComplete="email"
                    name="email"
                    placeholder={t("contact.emailPlaceholder")}
                    maxLength="254"
                    required
                    type="email"
                  />
                </label>
              </div>
              <label className="form-field">
                <span>
                  {t("contact.phoneLabel")} <small>{t("contact.phoneOptional")}</small>
                </span>
                <input
                  autoComplete="tel"
                  name="phone"
                  placeholder={t("contact.phonePlaceholder")}
                  maxLength="40"
                  type="tel"
                />
              </label>
              <label className="form-field">
                <span>
                  {t("contact.categoryLabel")} <small>{t("contact.categoryOptional")}</small>
                </span>
                <select
                  name="category"
                  value={selectedCategory}
                  onChange={(event) => setCategory(event.target.value)}
                  disabled={categoriesLoading || Boolean(categoriesError)}
                >
                  <option value="">
                    {categoriesLoading
                      ? t("collection.loadingCategories")
                      : t("contact.chooseCategory")}
                  </option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>{t("contact.messageLabel")}</span>
                <textarea
                  name="message"
                  placeholder={t("contact.messagePlaceholder")}
                  rows="5"
                  minLength="10"
                  maxLength="5000"
                  required
                />
              </label>
              {categoriesError && (
                <p className="form-feedback form-feedback--error" role="alert">
                  {t("contact.errorMessage")}
                </p>
              )}
              <button
                className="button button--dark enquiry-form__submit"
                type="submit"
                disabled={feedback?.status === "submitting"}
              >
                {feedback?.status === "submitting"
                  ? t("contact.submittingButton")
                  : t("contact.submitButton")}
                <ArrowRight size={16} />
              </button>
            </form>

            {feedback && feedback.status !== "submitting" && (
              <div
                className={`form-feedback form-feedback--${feedback.status}`}
                role={feedback.status === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {feedback.message}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
