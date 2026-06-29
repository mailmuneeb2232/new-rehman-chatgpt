import type { Metadata } from 'next';
import { HeroSection } from './_components/hero-section';
import { FeaturedCategories } from './_components/featured-categories';
import { FeaturedProducts } from './_components/featured-products';
import { BrandStrip } from './_components/brand-strip';
import { PromoSection } from './_components/promo-section';
import { NewsletterSection } from './_components/newsletter-section';

export const metadata: Metadata = {
  title: 'ElectroStore — Premium Electronics & Tech',
  description: 'Discover the latest smartphones, laptops, audio, and more. Free shipping on orders over $99.',
  openGraph: {
    title: 'ElectroStore — Premium Electronics & Tech',
    description: 'Discover the latest smartphones, laptops, audio, and more.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <BrandStrip />
      <FeaturedCategories />
      <FeaturedProducts />
      <PromoSection />
      <NewsletterSection />
    </main>
  );
}
