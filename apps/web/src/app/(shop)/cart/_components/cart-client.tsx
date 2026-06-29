'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/lib/utils';

export function CartClient() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal >= 99 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-24">
        <ShoppingBag size={64} className="text-zinc-300 mb-6" />
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Your cart is empty</h1>
        <p className="text-zinc-500 mb-8">Add some products to get started.</p>
        <Button asChild><Link href="/shop">Continue Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <Image src={item.product.images?.[0] ?? '/placeholder.jpg'} alt={item.product.name} fill className="object-contain p-2" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    {item.product.brand && <p className="text-xs text-zinc-500">{item.product.brand.name}</p>}
                    <Link href={`/products/${item.product.slug}`} className="font-semibold text-zinc-900 dark:text-white hover:underline">{item.product.name}</Link>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-zinc-400 hover:text-red-500" aria-label="Remove item">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Decrease"><Minus size={14} /></button>
                    <span className="flex h-8 w-10 items-center justify-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-black text-lg text-zinc-900 dark:text-white mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Shipping</span><span className="font-medium">{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</span></div>
              {shipping > 0 && <p className="text-xs text-zinc-400">Free shipping on orders over $99</p>}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-black text-xl">{formatPrice(total)}</span>
              </div>
            </div>
            <Button asChild className="w-full mt-6" size="lg">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full mt-2" size="sm">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
