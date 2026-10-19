import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { contactDetails } from '../data/contact';
import useCategories from '../hooks/useCategories';
import { submitContact, submitEnquiry } from '../services/api';

export default function Contact() {
  const [searchParams] = useSearchParams();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [feedback, setFeedback] = useState(null);
  const submissionRef = useRef(false);
  const idempotencyRef = useRef(null);
  const requestedProduct = searchParams.get('product') || '';
  const productId = searchParams.get('productId') ||
    (searchParams.has('category') ? requestedProduct : '');
  const legacyCategory = useMemo(
    () => categories.find((item) => item.label.toLowerCase() === requestedProduct.toLowerCase()),
    [categories, requestedProduct],
  );
  const selectedCategory = categories.some((item) => item.id === category)
    ? category
    : legacyCategory?.id || '';

  async function submitForm(event) {
    event.preventDefault();
    if (submissionRef.current) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const payload = {
      name,
      email,
      phone,
      message,
      ...(selectedCategory ? { categoryId: selectedCategory } : {}),
      ...(productId ? { productId } : {}),
    };
    const signature = JSON.stringify(payload);

    if (!idempotencyRef.current || idempotencyRef.current.signature !== signature) {
      idempotencyRef.current = {
        signature,
        key: crypto.randomUUID(),
      };
    }

    submissionRef.current = true;
    setFeedback({ status: 'submitting', message: 'Sending your enquiry…' });

    try {
      const submit = selectedCategory || productId ? submitEnquiry : submitContact;
      const result = await submit(payload, idempotencyRef.current.key);
      setFeedback({ status: 'success', message: result.data.message });
      idempotencyRef.current = null;
      form.reset();
      setCategory('');
    } catch (error) {
      setFeedback({ status: 'error', message: error.message });
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
            AICON · Contact
          </span>
          <h1>
            Let’s talk
            <br />
            <em>everyday.</em>
          </h1>
          <p>
            For product information or a question about the AICON collection,
            reach out to our team.
          </p>
        </div>
      </section>

      <section className="section section--ivory contact-section">
        <div className="page-shell contact-layout">
          <div className="contact-details">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              Get in touch
            </span>
            <h2 className="display-heading">
              Questions,
              <br />
              <em>welcome here.</em>
            </h2>
            <p>
              Contact the AICON team for current product details and help with
              your enquiry.
            </p>

            <div className="contact-details__list">
              <a href={`tel:${contactDetails.phone.replace(/\s/g, '')}`}>
                <span className="contact-details__icon"><Phone size={18} /></span>
                <span>
                  <small>Sales & Customer Care</small>
                  {contactDetails.phone}
                </span>
              </a>
              <a href={`tel:${contactDetails.phoneSecondary.replace(/\s/g, '')}`}>
                <span className="contact-details__icon"><Phone size={18} /></span>
                <span>
                  <small>Support Line</small>
                  {contactDetails.phoneSecondary}
                </span>
              </a>
              <a href={`mailto:${contactDetails.email}`}>
                <span className="contact-details__icon"><Mail size={18} /></span>
                <span>
                  <small>Primary Sales Email</small>
                  {contactDetails.email}
                </span>
              </a>
              <a href={`mailto:${contactDetails.salesEmail}`}>
                <span className="contact-details__icon"><Mail size={18} /></span>
                <span>
                  <small>Corporate / Support</small>
                  {contactDetails.salesEmail}
                </span>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactDetails.address)}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-details__icon"><MapPin size={18} /></span>
                <span>
                  <small>Corporate Headquarters</small>
                  {contactDetails.address}
                </span>
              </a>
            </div>
            <div className="contact-details__meta">
              <p><strong>Operating Hours:</strong> {contactDetails.operatingHours}</p>
              <p><strong>CIN:</strong> {contactDetails.cin}</p>
            </div>
            <Link className="inline-link" to="/products">
              Browse categories <ArrowRight size={16} />
            </Link>
          </div>

          <div className="enquiry-panel">
            <div className="enquiry-panel__heading">
              <span className="enquiry-panel__index">AICON / ENQUIRY</span>
              <h2>What can we help with?</h2>
              <p>
                Share a few details and our team can follow up using the
                contact information you provide.
              </p>
            </div>

            <div className="form-notice" role="note">
              Your enquiry is saved by the AICON website. Email notifications
              are handled by the server, with delivery status shown after submission.
            </div>

            <form className="enquiry-form" onSubmit={submitForm}>
              <div className="form-field enquiry-form__honeypot" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>
              <div className="form-row">
                <label className="form-field">
                  <span>Your name</span>
                  <input
                    autoComplete="name"
                    name="name"
                    placeholder="Name"
                    minLength="2"
                    maxLength="100"
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Email address</span>
                  <input
                    autoComplete="email"
                    name="email"
                    placeholder="you@example.com"
                    maxLength="254"
                    required
                    type="email"
                  />
                </label>
              </div>
              <label className="form-field">
                <span>Phone number <small>Optional</small></span>
                <input
                  autoComplete="tel"
                  name="phone"
                  placeholder="Phone number"
                  maxLength="40"
                  type="tel"
                />
              </label>
              <label className="form-field">
                <span>Category <small>Optional</small></span>
                <select
                  name="category"
                  value={selectedCategory}
                  onChange={(event) => setCategory(event.target.value)}
                  disabled={categoriesLoading || Boolean(categoriesError)}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories…' : 'Choose a category'}
                  </option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Your message</span>
                <textarea
                  name="message"
                  placeholder="Tell us what you’d like to know."
                  rows="5"
                  minLength="10"
                  maxLength="5000"
                  required
                />
              </label>
              {categoriesError && (
                <p className="form-feedback form-feedback--error" role="alert">
                  Categories could not be loaded. You can still send a general enquiry.
                </p>
              )}
              <button
                className="button button--dark enquiry-form__submit"
                type="submit"
                disabled={feedback?.status === 'submitting'}
              >
                {feedback?.status === 'submitting' ? 'Submitting…' : 'Send enquiry'}
                <ArrowRight size={16} />
              </button>
            </form>

            {feedback && feedback.status !== 'submitting' && (
              <div
                className={`form-feedback form-feedback--${feedback.status}`}
                role={feedback.status === 'error' ? 'alert' : 'status'}
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