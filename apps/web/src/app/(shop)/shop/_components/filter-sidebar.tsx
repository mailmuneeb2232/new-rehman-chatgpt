'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  searchParams: URLSearchParams;
  setParam: (key: string, value: string | undefined) => void;
}

export function FilterSidebar({ searchParams, setParam }: FilterSidebarProps) {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<any[]>('/categories'),
    staleTime: 10 * 60 * 1000,
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get<any[]>('/brands'),
    staleTime: 10 * 60 * 1000,
  });

  const activeCategory = searchParams.get('category');
  const activeBrand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Category</h3>
        <ul className="space-y-1">
          {categories?.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setParam('category', activeCategory === cat.slug ? undefined : cat.slug)}
                className={cn(
                  'w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors',
                  activeCategory === cat.slug
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                )}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Brand</h3>
        <ul className="space-y-1">
          {brands?.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() => setParam('brand', activeBrand === brand.slug ? undefined : brand.slug)}
                className={cn(
                  'w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors',
                  activeBrand === brand.slug
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                )}
              >
                {brand.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setParam('minPrice', e.target.value || undefined)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <span className="text-zinc-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setParam('maxPrice', e.target.value || undefined)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>
    </div>
  );
}
