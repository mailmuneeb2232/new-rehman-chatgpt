'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';

interface Category {
  id: string; name: string; slug: string; image?: string;
  _count?: { products: number };
}

export function FeaturedCategories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', 'featured'],
    queryFn: () => api.get<Category[]>('/categories', { featured: true, limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="py-20 bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-2">Browse by</p>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Categories</h2>
          </div>
          <Link href="/categories" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View all →</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)
            : categories?.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-center transition-all hover:border-violet-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      {cat.image && <Image src={cat.image} alt={cat.name} fill className="object-cover" />}
                    </div>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
