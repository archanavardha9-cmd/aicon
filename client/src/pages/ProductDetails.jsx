import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { fetchProduct } from "../services/api";

import { initialProducts } from "../data/products";
import { useTranslation } from "../hooks/useTranslation";

function formatLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

export default function ProductDetails() {
  const { productId } = useParams();
  const { t } = useTranslation();

  const fallbackProduct = useMemo(
    () => initialProducts.find((p) => p.id === productId),
    [productId],
  );

  const [result, setResult] = useState(() => {
    const fallback = initialProducts.find((p) => p.id === productId);
    return fallback ? { productId, product: fallback, error: "" } : null;
  });

  const [failedImageId, setFailedImageId] = useState(null);
  const imageError = failedImageId === productId;
  const handleImageError = () => setFailedImageId(productId);

  useEffect(() => {
    const controller = new AbortController();

    fetchProduct(productId, { signal: controller.signal })
      .then((response) => {
        const productData =
          response?.data &&
          typeof response.data === "object" &&
          (response.data.id || response.data.name)
            ? response.data
            : response &&
                typeof response === "object" &&
                (response.id || response.name)
              ? response
              : null;

        if (productData) {
          setResult({ productId, product: productData, error: "" });
        } else if (fallbackProduct) {
          setResult({ productId, product: fallbackProduct, error: "" });
        } else {
          setResult({
            productId,
            product: null,
            error: t("productDetails.notFound"),
          });
        }
      })
      .catch((requestError) => {
        if (requestError.name !== "CanceledError") {
          if (fallbackProduct) {
            setResult({ productId, product: fallbackProduct, error: "" });
          } else {
            setResult({
              productId,
              product: null,
              error: requestError.message || t("productDetails.notAvailable"),
            });
          }
        }
      });

    return () => controller.abort();
  }, [productId, fallbackProduct, t]);

  const currentResult = result?.productId === productId ? result : null;
  const product = currentResult?.product || fallbackProduct || null;
  const loading = !product && !currentResult?.error;
  const error = !product ? currentResult?.error || "" : "";

  const specifications = product?.specifications
    ? Object.entries(product.specifications).filter(
        ([, value]) => value !== null && value !== "",
      )
    : [];

  return (
    <main>
      <section className="section section--ivory product-detail">
        <div className="page-shell">
          <Link className="inline-link product-detail__back" to="/products">
            <ArrowLeft size={16} /> {t("productDetails.backToCatalogue")}
          </Link>
          {loading ? (
            <p className="api-state" role="status">
              {t("productDetails.loading")}
            </p>
          ) : error ? (
            <div className="empty-state" role="alert">
              <span className="eyebrow">
                <span className="eyebrow__line" />
                Product details
              </span>
              <h1 className="display-heading">
                <em>{t("productDetails.notAvailableHeading")}</em>
              </h1>
              <p>{error}</p>
              <Link className="button button--dark" to="/products">
                {t("productDetails.browseCategories")} <ArrowRight size={16} />
              </Link>
            </div>
          ) : product ? (
            <article className="product-detail__layout">
              <div className="product-detail__visual" key={productId}>
                {product.imagePath && !imageError ? (
                  <img
                    src={product.imagePath}
                    alt={product.name}
                    onError={handleImageError}
                  />
                ) : (
                  <div
                    className="product-card__image-placeholder"
                    role="img"
                    aria-label="Product photograph not available"
                  >
                    <span>{t("productCard.productNotAvailable")}</span>
                  </div>
                )}
              </div>
              <div className="product-detail__copy">
                <span className="eyebrow">
                  <span className="eyebrow__line" />
                  {product.category || product.categoryId?.replace(/-/g, " ")}
                </span>
                <h1 className="display-heading">{product.name}</h1>
                {product.modelNumber && (
                  <p className="product-card__model">
                    {t("productCard.model")} {product.modelNumber}
                  </p>
                )}
                <p>
                  {product.description ||
                    t("productCard.askDetails")}
                </p>
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
                <a
                  className="button button--dark"
                  href={`https://wa.me/919264988032?text=${encodeURIComponent(
                    t("productDetails.enquireWhatsApp", { productName: product.name }),
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("productDetails.enquireAbout")} <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
