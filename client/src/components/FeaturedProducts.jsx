import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { initialProducts } from "../data/products";

const FEATURED_IDS = [
  "aicon-4k-uhd-smart-led-tv-55",
  "aicon-inverter-split-ac-15t",
  "aicon-semi-auto-twin-tub-8kg",
  "aicon-sun-heater-14",
  "aicon-electric-kettle-1.5l",
  "aicon-smart-mixer-grinder-750w",
];

function getCuratedFeatured() {
  return FEATURED_IDS.map((id) =>
    initialProducts.find((p) => p.id === id),
  ).filter(Boolean);
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState(getCuratedFeatured);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts({ limit: 6, sort: "name", signal: controller.signal })
      .then((res) => {
        if (res?.data?.length) {
          setProducts(res.data.slice(0, 6));
        }
      })
      .catch(() => {
        // Fallback to initialProducts
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="section section--light featured">
      <div className="page-shell">
        <div className="section-heading-row">
          <div className="section-heading-row__copy">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              Featured Appliances
            </span>
            <h2 className="display-heading">
              Flagship Innovation,
              <br />
              <em>Built to Endure.</em>
            </h2>
          </div>
          <div className="section-heading-row__aside">
            <p>
              Each AICON appliance is engineered for practical performance,
              superior energy efficiency, and everyday dependability.
            </p>
            <Link className="inline-link" to="/products">
              Explore full catalogue <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="featured-product-grid">
          {products.map((product) => {
            const specEntries = Object.entries(
              product.specifications || {},
            ).slice(0, 3);
            return (
              <article className="featured-product-card" key={product.id}>
                <div className="featured-product-card__visual">
                  <img
                    src={product.imagePath}
                    alt={product.name}
                    loading="lazy"
                  />
                  {product.modelNumber && (
                    <span className="featured-product-card__model-tag">
                      {product.modelNumber}
                    </span>
                  )}
                </div>

                <div className="featured-product-card__body">
                  <span className="featured-product-card__category">
                    {product.category || product.categoryId?.replace("-", " ")}
                  </span>
                  <h3>{product.name}</h3>
                  <p className="featured-product-card__desc">
                    {product.description}
                  </p>

                  {specEntries.length > 0 && (
                    <ul className="featured-product-card__specs">
                      {specEntries.map(([key, val]) => (
                        <li key={key}>
                          <CheckCircle2 size={13} className="spec-check-icon" />
                          <span>
                            <strong>{key}:</strong> {val}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="featured-product-card__actions">
                    <Link
                      className="button button--secondary"
                      to={`/products/${encodeURIComponent(product.id)}`}
                    >
                      Specifications <ArrowUpRight size={15} />
                    </Link>
                    <a
                      className="button button--gold"
                      href={`https://wa.me/919264988032?text=${encodeURIComponent(
                        `Hello AICON Team,

I would like to enquire about the ${product.name}.

Could you please share more details about its features, specifications, and pricing?

Thank you.`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Enquire <ArrowRight size={15} />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
