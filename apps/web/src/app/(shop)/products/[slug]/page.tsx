import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './_components/product-detail-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} — ElectroStore`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: [{ url: product.images?.[0] ?? '' }],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
