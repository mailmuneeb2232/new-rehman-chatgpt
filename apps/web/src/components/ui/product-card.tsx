'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from './badge';
import { Button } from './button';
import { Rating } from './rating';
import { cn, formatPrice, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  brand?: { name: string };
  isNew?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const { items: wishlistItems, toggleItem } = useWishlistStore();
  const isWishlisted = wishlistItems.some((i) => i.productId === product.id);
  const discount = calculateDiscount(product.price, product.comparePrice ?? 0);

  return (
    <motion.article
      className={cn(
        'group relative flex flex-col rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-shadow hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900',
        className,
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Link href={`/products/${product.slug}`} tabIndex={-1}>
          <Image
            src={product.images[0] ?? '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
          {product.isNew && <Badge variant="new">New</Badge>}
          {product.stock === 0 && <Badge variant="secondary">Out of Stock</Badge>}
        </div>

        {/* Hover Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <button
            onClick={() => toggleItem(product.id)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800',
              isWishlisted ? 'text-red-500' : 'text-zinc-600 hover:text-red-500',
            )}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800"
            aria-label="Quick view"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4 gap-2">
        {product.brand && (
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{product.brand.name}</p>
        )}
        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:text-zinc-600 dark:text-zinc-100">
          {product.name}
        </Link>
        <Rating value={product.rating} size={14} showCount count={product.reviewCount} />

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-zinc-900 dark:text-white">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-zinc-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
          <Button
            size="icon"
            variant="default"
            disabled={product.stock === 0}
            onClick={() => addToCart({ productId: product.id, quantity: 1, product })}
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
