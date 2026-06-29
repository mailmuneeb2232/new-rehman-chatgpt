import type { Metadata } from 'next';
import { CartClient } from './_components/cart-client';

export const metadata: Metadata = { title: 'Shopping Cart — ElectroStore' };

export default function CartPage() {
  return <CartClient />;
}
