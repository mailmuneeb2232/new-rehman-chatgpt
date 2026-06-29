import type { Metadata } from 'next';
import { ShopClient } from './_components/shop-client';

export const metadata: Metadata = {
  title: 'Shop All Products — ElectroStore',
  description: 'Browse our full catalog of electronics and tech products.',
};

export default function ShopPage() {
  return <ShopClient />;
}
