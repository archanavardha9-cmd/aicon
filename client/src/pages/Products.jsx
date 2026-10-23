import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/api";
import useCategories from "../hooks/useCategories";
import { initialProducts } from "../data/products";

function ProductCard({ product }) {
  const [imageUnavailable, setImageUnavailable] = useState(!product.imagePath);
  const specs = Object.entries(product.specifications || {}).slice(0, 2);

  return (
    <article className="product-card">
      <div className="product-card__visual">
        {!imageUnavailable ? (
          <img
            src={product.imagePath}
            alt={product.name}
            loading="lazy"
            onError={() => setImageUnavailable(true)}
          />
        ) : (
          <div
            className="product-card__image-placeholder"
            role="img"
            aria-label="Product photograph not available"
          >
            <span>Product photograph not available</span>
          </div>
        )}
      </div>
      <div className="product-card__copy">
        <span className="product-card__category">
          {product.category || product.categoryId?.replace("-", " ")}
        </span>
        <h3>{product.name}</h3>
        {product.modelNumber && (
          <p className="product-card__model">Model {product.modelNumber}</p>
        )}
        <p className="product-card__description">
          {product.description ||
            "Ask the AICON team for current product details."}
        </p>

        {specs.length > 0 && (
          <div className="product-card__specs-mini">
            {specs.map(([k, v]) => (
              <span key={k} className="spec-mini-pill">
                <CheckCircle2 size={12} /> {k}: {v}
              </span>
            ))}
          </div>
        )}

        <div className="product-card__actions">
          <Link
            className="inline-link"
            to={`/products/${encodeURIComponent(product.id)}`}
          >
            Product details <ArrowUpRight size={16} />
          </Link>

          <a
            className="product-card__enquiry"
            href={`https://wa.me/917992170835?text=${encodeURIComponent(
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
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    retry,
  } = useCategories();
  const [catalogue, setCatalogue] = useState(null);
  const [loadingMoreKey, setLoadingMoreKey] = useState("");
  const [moreError, setMoreError] = useState(null);
  const selectedCategory = searchParams.get("category") || "all";
  const query = searchParams.get("q") || "";
  const requestedSort = searchParams.get("sort") || "name";
  const sort = ["name", "newest"].includes(requestedSort)
    ? requestedSort
    : "name";
  const requestKey = JSON.stringify([query, selectedCategory, sort]);
  const currentCatalogue = catalogue?.key === requestKey ? catalogue : null;
  const products = currentCatalogue?.products || [];
  const productTotal = currentCatalogue?.total || 0;
  const loading = !currentCatalogue;
  const error = currentCatalogue?.error || "";
  const loadingMore = loadingMoreKey === requestKey;
  const currentMoreError =
    moreError?.key === requestKey ? moreError.message : "";
  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const matchesCategory =
          selectedCategory === "all" || category.id === selectedCategory;
        const matchesQuery = `${category.label} ${category.terms || ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [categories, query, selectedCategory],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchProducts({
      query,
      category: selectedCategory === "all" ? "" : selectedCategory,
      sort,
      limit: 100,
      signal: controller.signal,
    })
      .then((result) => {
        let items = result.data;
        let count = result.meta.total;
        if (!items || items.length === 0) {
          items = initialProducts.filter((p) => {
            const matchesCat =
              selectedCategory === "all" || p.categoryId === selectedCategory;
            const matchesQ =
              !query ||
              `${p.name} ${p.description} ${p.modelNumber || ""}`
                .toLowerCase()
                .includes(query.toLowerCase());
            return matchesCat && matchesQ;
          });
          count = items.length;
        }
        setCatalogue({
          key: requestKey,
          products: items,
          total: count,
          error: "",
        });
      })
      .catch((requestError) => {
        if (requestError.name !== "CanceledError") {
          const items = initialProducts.filter((p) => {
            const matchesCat =
              selectedCategory === "all" || p.categoryId === selectedCategory;
            const matchesQ =
              !query ||
              `${p.name} ${p.description} ${p.modelNumber || ""}`
                .toLowerCase()
                .includes(query.toLowerCase());
            return matchesCat && matchesQ;
          });
          setCatalogue({
            key: requestKey,
            products: items,
            total: items.length,
            error: "",
          });
        }
      });

    return () => controller.abort();
  }, [query, requestKey, selectedCategory, sort]);

  function updateParam(name, value, replace = false) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(name, value);
    } else {
      nextParams.delete(name);
    }
    setSearchParams(nextParams, replace ? { replace: true } : undefined);
  }

  function clearFilters() {
    setSearchParams({});
  }

  async function loadMore() {
    if (!currentCatalogue || loadingMore) {
      return;
    }

    setLoadingMoreKey(requestKey);
    setMoreError(null);

    try {
      const result = await fetchProducts({
        query,
        category: selectedCategory === "all" ? "" : selectedCategory,
        sort,
        limit: 100,
        offset: products.length,
      });
      setCatalogue((current) =>
        current?.key === requestKey
          ? {
              ...current,
              products: [...current.products, ...result.data],
              total: result.meta.total,
            }
          : current,
      );
    } catch (requestError) {
      setMoreError({ key: requestKey, message: requestError.message });
    } finally {
      setLoadingMoreKey("");
    }
  }

  const noProductsYet = !loading && !error && productTotal === 0 && !query;
  const noMatches =
    !loading &&
    !error &&
    query &&
    products.length === 0 &&
    filteredCategories.length === 0;

  return (
    <main>
      <section className="page-intro page-intro--collection">
        <div className="page-shell page-intro__inner">
          <span className="eyebrow eyebrow--light">
            <span className="eyebrow__line" />
            The AICON collection
          </span>
          <h1>
            Good things,
            <br />
            for <em>everyday.</em>
          </h1>
          <p>
            Browse AICON categories and published products. Contact our team for
            current availability and verified specifications.
          </p>
          <a className="button button--gold" href="#collection">
            Browse collection <ArrowRight size={17} />
          </a>
          <span className="page-intro__folio" aria-hidden="true">
            01 / 07
          </span>
        </div>
      </section>

      <section className="section section--ivory collection" id="collection">
        <div className="page-shell">
          <div className="section-heading-row collection__heading">
            <div className="section-heading-row__copy">
              <span className="eyebrow">
                <span className="eyebrow__line" />
                Find your category
              </span>
              <h2 className="display-heading">
                The collection,
                <br />
                <em>at a glance.</em>
              </h2>
            </div>
            <div className="collection-controls">
              <label className="search-field">
                <Search size={18} aria-hidden="true" />
                <span className="visually-hidden">
                  Search products and categories
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    updateParam("q", event.target.value.trimStart(), true)
                  }
                  placeholder="Search the range"
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    className="search-field__clear"
                    onClick={() => updateParam("q", "", true)}
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
              </label>
              <label className="sort-field">
                <span>Sort products</span>
                <select
                  value={sort}
                  onChange={(event) => updateParam("sort", event.target.value)}
                >
                  <option value="name">Name</option>
                  <option value="newest">Newest</option>
                </select>
              </label>
            </div>
          </div>

          <div className="filter-row" aria-label="Filter categories">
            {[
              { id: "all", label: "All categories" },
              ...categories.map(({ id, label }) => ({ id, label })),
            ].map((item) => (
              <button
                className={`filter-chip${selectedCategory === item.id ? " is-active" : ""}`}
                key={item.id}
                type="button"
                aria-pressed={selectedCategory === item.id}
                onClick={() =>
                  updateParam("category", item.id === "all" ? "" : item.id)
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="collection__result-line" aria-live="polite">
            <span>
              {loading
                ? "Loading catalogue…"
                : `${productTotal} product${productTotal === 1 ? "" : "s"} · ${filteredCategories.length} categor${filteredCategories.length === 1 ? "y" : "ies"}`}
            </span>
          </div>

          {categoriesLoading && (
            <p className="api-state" role="status">
              Loading categories…
            </p>
          )}
          {categoriesError && (
            <div className="api-state api-state--error" role="alert">
              <p>{categoriesError}</p>
              <button className="inline-link" type="button" onClick={retry}>
                Try again
              </button>
            </div>
          )}
          {error && (
            <p className="api-state api-state--error" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && filteredCategories.length > 0 && (
            <>
              <h3 className="collection__subheading">Categories</h3>
              <div className="collection-grid">
                {filteredCategories.map((item) => {
                  const categoryIndex = categories.findIndex(
                    (category) => category.id === item.id,
                  );
                  return (
                    <article className="collection-card" key={item.id}>
                      <div className="collection-card__image-wrap">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.label}
                            className="collection-card__image"
                            loading="lazy"
                          />
                        )}
                        <span className="collection-card__badge">
                          {String(categoryIndex + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="collection-card__body">
                        <span className="collection-card__eyebrow">
                          AICON CATEGORY /{" "}
                          {String(categoryIndex + 1).padStart(2, "0")}
                        </span>
                        <h3>{item.label}</h3>
                        <p>
                          {item.description ||
                            (item.productCount
                              ? `${item.productCount} product${item.productCount === 1 ? "" : "s"} currently published.`
                              : "Explore engineered appliances in this category.")}
                        </p>
                        <Link
                          className="collection-card__enquiry"
                          to={`/products?category=${encodeURIComponent(item.id)}`}
                        >
                          Browse this category <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <h3 className="collection__subheading">Published products</h3>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {currentMoreError && (
                <p className="api-state api-state--error" role="alert">
                  {currentMoreError}
                </p>
              )}
              {products.length < productTotal && (
                <button
                  className="button button--dark product-list__load-more"
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading…" : "Load more products"}
                  {!loadingMore && <ArrowRight size={16} />}
                </button>
              )}
            </>
          )}

          {loading && (
            <p className="api-state" role="status">
              Loading products…
            </p>
          )}
          {noProductsYet && (
            <div className="empty-state">
              <span className="eyebrow">
                <span className="eyebrow__line" />
                Product catalogue
              </span>
              <h3>No products found for this selection.</h3>
              <p>
                Browse other categories or contact our team for model
                availability.
              </p>
              <Link className="button button--dark" to="/contact">
                Ask the AICON team <ArrowRight size={16} />
              </Link>
            </div>
          )}
          {noMatches && (
            <div className="empty-state">
              <h3>Nothing matches that search.</h3>
              <p>
                Try another product or category name, or clear your filters.
              </p>
              <button
                className="button button--dark"
                type="button"
                onClick={clearFilters}
              >
                Clear filters <ArrowRight size={16} />
              </button>
            </div>
          )}
          {!loading &&
            !error &&
            query &&
            products.length === 0 &&
            filteredCategories.length > 0 && (
              <p className="api-state">No product models match this search.</p>
            )}
        </div>
      </section>

      <section className="collection-note">
        <div className="page-shell collection-note__inner">
          <span>Need a little more information?</span>
          <Link className="inline-link inline-link--light" to="/contact">
            Speak with the AICON team <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
