import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCategories from '../hooks/useCategories';

export default function ProductCategories() {
  const { categories, loading, error, retry } = useCategories();

  return (
    <section className="section section--ivory" id="categories">
      <div className="page-shell">
        <div className="section-heading-row">
          <div className="section-heading-row__copy">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              Product Portfolio
            </span>
            <h2 className="display-heading">
              Comprehensive Range,
              <br />
              <em>Tailored for Home Comfort.</em>
            </h2>
          </div>
          <div className="section-heading-row__aside">
            <p>
              Explore six core appliance categories engineered with durability,
              efficient power consumption, and modern styling.
            </p>
            <Link className="inline-link" to="/products">
              View complete catalogue <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="api-state" role="status">Loading AICON categories…</p>
        ) : error ? (
          <div className="api-state api-state--error" role="alert">
            <p>{error}</p>
            <button className="inline-link" type="button" onClick={retry}>Try again</button>
          </div>
        ) : categories.length === 0 ? (
          <p className="api-state">No categories are currently available.</p>
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
                      CATEGORY {String(index + 1).padStart(2, '0')}
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
