import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <div data-slug={slug}>{/* Product detail page */}</div>;
}
