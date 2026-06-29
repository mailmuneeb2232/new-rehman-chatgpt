'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rating } from '@/components/ui/rating';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { cn, formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductDetailClientProps {
  product: any;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});

  const addToCart = useCartStore((s) => s.addItem);
  const { items: wishlistItems, toggleItem } = useWishlistStore();
  const isWishlisted = wishlistItems.some((i) => i.productId === product.id);
  const discount = calculateDiscount(product.price, product.comparePrice ?? 0);

  const handleAddToCart = () => {
    addToCart({ productId: product.id, quantity, product });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <Image
                  src={product.images?.[selectedImage] ?? '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>

            {product.images?.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((i) => Math.max(0, i - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md dark:bg-zinc-800/80"
                  disabled={selectedImage === 0}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setSelectedImage((i) => Math.min(product.images.length - 1, i + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md dark:bg-zinc-800/80"
                  disabled={selectedImage === product.images.length - 1}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-colors',
                    i === selectedImage ? 'border-zinc-900 dark:border-white' : 'border-zinc-200 dark:border-zinc-700',
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              {product.brand && <p className="text-sm font-semibold text-violet-600 mb-1">{product.brand.name}</p>}
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-tight">{product.name}</h1>
            </div>
            <button onClick={() => toggleItem(product.id)} aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
              <Heart size={22} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-zinc-400'} />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Rating value={product.rating ?? 0} size={16} />
            <span className="text-sm text-zinc-500">{product.reviewCount ?? 0} reviews</span>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-4xl font-black text-zinc-900 dark:text-white">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-zinc-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
            {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
          </div>

          {product.stock === 0 ? (
            <Badge variant="destructive" className="mt-4 w-fit">Out of Stock</Badge>
          ) : product.stock <= 5 ? (
            <p className="mt-4 text-sm font-medium text-amber-600">Only {product.stock} left in stock!</p>
          ) : (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400">✓ In Stock</p>
          )}

          {/* Quantity */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="flex h-11 w-14 items-center justify-center text-sm font-semibold border-x border-zinc-300 dark:border-zinc-700">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="flex h-11 w-11 items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} /> Add to Cart
            </Button>
          </div>

          {/* Attributes */}
          {product.attributes?.length > 0 && (
            <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Specifications</h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                {product.attributes.map((attr: any) => (
                  <div key={attr.id} className="flex flex-col">
                    <dt className="text-xs text-zinc-500">{attr.name}</dt>
                    <dd className="text-sm font-medium text-zinc-900 dark:text-white">{attr.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Description</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
