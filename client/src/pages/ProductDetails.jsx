import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fetchProduct } from '../services/api';

import { initialProducts } from '../data/products';

function formatLabel(value) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (character) => character.toUpperCase());
}

export default function ProductDetails() {
  const { productId } = useParams();
  const [result, setResult] = useState(() => {
    const fallback = initialProducts.find((p) => p.id === productId);
    return fallback ? { productId, product: fallback, error: '' } : null;
  });
  const currentResult = result?.productId === productId ? result : null;
  const product = currentResult?.product || null;
  const loading = !currentResult;
  const error = currentResult?.error || '';

  useEffect(() => {
    const controller = new AbortController();

    fetchProduct(productId, { signal: controller.signal })
      .then((response) => setResult({ productId, product: response.data, error: '' }))
      .catch((requestError) => {
        if (requestError.name !== 'CanceledError') {
          const fallback = initialProducts.find((p) => p.id === productId);
          if (fallback) {
            setResult({ productId, product: fallback, error: '' });
          } else {
            setResult({ productId, product: null, error: requestError.message });
          }
        }
      });

    return () => controller.abort();
  }, [productId]);

  const specifications = product?.specifications
    ? Object.entries(product.specifications).filter(([, value]) => value !== null && value !== '')
    : [];

  return (
    <main>
      <section className="section section--ivory product-detail">
        <div className="page-shell">
          <Link className="inline-link product-detail__back" to="/products">
            <ArrowLeft size={16} /> Back to catalogue
          </Link>
          {loading ? (
            <p className="api-state" role="status">Loading product details…</p>
          ) : error ? (
            <div className="empty-state" role="alert">
              <span className="eyebrow">
                <span className="eyebrow__line" />
                Product details
              </span>
              <h1 className="display-heading">This product is not <em>available.</em></h1>
              <p>{error}</p>
              <Link className="button button--dark" to="/products">
                Browse categories <ArrowRight size={16} />
              </Link>
            </div>
          ) : product ? (
            <article className="product-detail__layout">
              <div className="product-detail__visual">
                {product.imagePath ? (
                  <img src={product.imagePath} alt={product.name} />
                ) : (
                  <div className="product-card__image-placeholder" role="img" aria-label="Product photograph not available">
                    <span>Product photograph not available</span>
                  </div>
                )}
              </div>
              <div className="product-detail__copy">
                <span className="eyebrow">
                  <span className="eyebrow__line" />
                  {product.category}
                </span>
                <h1 className="display-heading">{product.name}</h1>
                {product.modelNumber && <p className="product-card__model">Model {product.modelNumber}</p>}
                <p>{product.description || 'Contact the AICON team for current product information.'}</p>
                {specifications.length > 0 && (
                  <dl className="product-specifications">
                    {specifications.map(([name, value]) => (
                      <div key={name}>
                        <dt>{formatLabel(name)}</dt>
                        <dd>{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <Link
                  className="button button--dark"
                  to={`/contact?category=${encodeURIComponent(product.categoryId)}&product=${encodeURIComponent(product.id)}`}
                >
                  Enquire about this product <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}