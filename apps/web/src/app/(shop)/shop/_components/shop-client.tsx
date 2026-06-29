'use client';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/ui/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FilterSidebar } from './filter-sidebar';
import { SortSelect } from './sort-select';
import { api } from '@/lib/api-client';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export function ShopClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const page = Number(searchParams.get('page') ?? '1');
  const sort = searchParams.get('sort') ?? 'newest';
  const categorySlug = searchParams.get('category') ?? undefined;
  const brandSlug = searchParams.get('brand') ?? undefined;
  const minPrice = searchParams.get('minPrice') ?? undefined;
  const maxPrice = searchParams.get('maxPrice') ?? undefined;
  const search = searchParams.get('q') ?? undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'list', { page, sort, categorySlug, brandSlug, minPrice, maxPrice, search }],
    queryFn: () => api.get<{ data: any[]; pagination: any }>('/products', {
      page, sort, limit: 20,
      ...(categorySlug && { category: categorySlug }),
      ...(brandSlug && { brand: brandSlug }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(search && { search }),
    }),
    staleTime: 60_000,
  });

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) { params.set(key, value); params.delete('page'); }
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Shop</h1>
          {pagination && <p className="text-sm text-zinc-500 mt-1">{pagination.total.toLocaleString()} products</p>}
        </div>
        <div className="flex items-center gap-3">
          <SortSelect value={sort} options={SORT_OPTIONS} onChange={(v) => setParam('sort', v)} />
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)} className="md:hidden">
            <SlidersHorizontal size={16} /> Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <FilterSidebar searchParams={searchParams} setParam={setParam} />
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No products found</h3>
              <p className="text-zinc-500 mt-2">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={i + 1 === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setParam('page', String(i + 1))}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-80 bg-white dark:bg-zinc-950 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold">Filters</h2>
                <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
              </div>
              <FilterSidebar searchParams={searchParams} setParam={setParam} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
