'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ui/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import Link from 'next/link';

export function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get<{ data: any[] }>('/products', { featured: true, limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.data ?? [];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-2">Hand-picked</p>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Featured Products</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View all →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
            : products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
