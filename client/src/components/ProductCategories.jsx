import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCategories from '../hooks/useCategories';
import { useTranslation } from '../hooks/useTranslation';

export default function ProductCategories() {
  const { categories, loading, error, retry } = useCategories();
  const { t } = useTranslation();

  return (
    <section className="section section--ivory" id="categories">
      <div className="page-shell">
        <div className="section-heading-row">
          <div className="section-heading-row__copy">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              {t("productCategories.eyebrow")}
            </span>
            <h2 className="display-heading">
              {t("productCategories.heading")}
              <br />
              <em>{t("productCategories.headingEmphasis")}</em>
            </h2>
          </div>
          <div className="section-heading-row__aside">
            <p>{t("productCategories.description")}</p>
            <Link className="inline-link" to="/products">
              {t("productCategories.viewCompleteCatalogue")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="api-state" role="status">{t("productCategories.loadingCategories")}</p>
        ) : error ? (
          <div className="api-state api-state--error" role="alert">
            <p>{t("productCategories.error", { error: error.message || t("generic.readMore") })}</p>
            <button className="inline-link" type="button" onClick={retry}>{t("collection.retry")}</button>
          </div>
        ) : categories.length === 0 ? (
          <p className="api-state">{t("productCategories.noCategories")}</p>
        ) : (
          <div className="category-grid">
            {categories.map((category, index) => (
              <Link
                className="category-card"
                key={category.id}
                to={`/products?category=${category.id}`}
              >
                <div className="category-card__image-wrap">
                  {category.image ? (
                    <img
                      className="category-card__image"
                      src={category.image}
                      alt={category.label}
                      loading="lazy"
                    />
                  ) : null}
                  <span className="category-card__badge">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="category-card__meta">
                  <div>
                    <span className="category-card__number">
                      {t("productCategories.category", { number: String(index + 1).padStart(2, '0') })}
                    </span>
                    <h3>{category.label}</h3>
                    {category.description && (
                      <p className="category-card__description">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <span className="round-arrow" aria-hidden="true">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
