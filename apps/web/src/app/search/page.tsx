import type { Metadata } from 'next';
import { SearchPageClient } from './_components/search-page-client';

export const metadata: Metadata = { title: 'Search — ElectroStore' };

export default function SearchPage() {
  return <SearchPageClient />;
}
