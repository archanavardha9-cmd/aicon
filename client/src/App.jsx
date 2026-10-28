import './App.css';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import { useTranslation } from './hooks/useTranslation';

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="not-found page-shell">
      <span className="eyebrow">
        <span className="eyebrow__line" />
        {t("notFound.eyebrow")}
      </span>
      <h1 className="display-heading">
        {t("notFound.heading")}
        <br />
        <em>{t("notFound.headingEmphasis")}</em>
      </h1>
      <p>{t("notFound.description")}</p>
      <Link className="button button--dark" to="/products">
        {t("notFound.exploreCategories")}
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-frame">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
