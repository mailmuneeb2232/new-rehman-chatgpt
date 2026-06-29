'use client';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export function BrandStrip() {
  const { data: brands } = useQuery({
    queryKey: ['brands', 'featured'],
    queryFn: () => api.get<any[]>('/brands', { featured: true, limit: 8 }),
    staleTime: 10 * 60 * 1000,
  });

  if (!brands?.length) return null;

  return (
    <section className="border-y border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-8">Trusted Brands</p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.slug}`} className="opacity-40 grayscale transition hover:opacity-100 hover:grayscale-0">
              {brand.logo ? (
                <Image src={brand.logo} alt={brand.name} width={80} height={40} className="object-contain h-8 w-auto" />
              ) : (
                <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
