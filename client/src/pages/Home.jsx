import EnquiryCTA from '../components/EnquiryCTA';
import FeaturedProducts from '../components/FeaturedProducts';
import Hero from '../components/Hero';
import ProductCategories from '../components/ProductCategories';
import WhyChooseUs from '../components/WhyChooseUs';

export default function Home() {
  return (
    <main>
      <Hero />
      <ProductCategories />
      <FeaturedProducts />
      <WhyChooseUs />
      <EnquiryCTA />
    </main>
  );
}