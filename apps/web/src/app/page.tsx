import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Electronic Store — Premium Electronics',
};

export default function HomePage() {
  return (
    <main>
      <section aria-label="Hero">
        {/* HeroScene (3D) and HeroCopy rendered here */}
      </section>
      <section aria-label="Featured Categories">
        {/* FeaturedCategories component */}
      </section>
      <section aria-label="Featured Products">
        {/* FeaturedProducts component */}
      </section>
      <section aria-label="Brand Story">
        {/* BrandStory scroll animation */}
      </section>
      <section aria-label="Testimonials">
        {/* Testimonials carousel */}
      </section>
      <section aria-label="Newsletter">
        {/* NewsletterSignup */}
      </section>
    </main>
  );
}
