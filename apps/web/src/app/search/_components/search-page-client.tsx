'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ui/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { useDebounce } from '@/hooks/use-debounce';

export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false });
    }
  }, [debouncedQuery, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => api.get<any>('/search', { q: debouncedQuery }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-6 text-center">Search</h1>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, categories..."
          leftIcon={<Search size={18} />}
          rightIcon={query ? <button onClick={() => setQuery('')} aria-label="Clear"><X size={16} /></button> : undefined}
          className="h-12 text-base"
          autoFocus
        />
      </div>

      {debouncedQuery.length >= 2 && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
            </div>
          ) : data?.products?.length > 0 ? (
            <>
              <p className="text-sm text-zinc-500 mb-6">{data.products.length} results for "{debouncedQuery}"</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {data.products.map((product: any) => <ProductCard key={product.id} product={product} />)}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No results found</h3>
              <p className="text-zinc-500 mt-2">Try a different search term.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
