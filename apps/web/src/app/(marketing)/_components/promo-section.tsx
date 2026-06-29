import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function PromoSection() {
  return (
    <section className="py-20 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 to-indigo-950 p-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.4),transparent_70%)]" />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-300 mb-3">Limited Time</p>
              <h3 className="text-3xl font-black text-white mb-4">Up to 40% off<br />on Audio Gear</h3>
              <p className="text-zinc-400 mb-8">Premium headphones, speakers, and earbuds.</p>
              <Button asChild variant="gradient">
                <Link href="/categories/audio">Shop Audio <ArrowRight size={16} /></Link>
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-10 border border-zinc-700">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)]" />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">New Arrivals</p>
              <h3 className="text-3xl font-black text-white mb-4">Latest Laptops<br />&amp; Ultrabooks</h3>
              <p className="text-zinc-500 mb-8">Thin, light, and blazing fast. Work from anywhere.</p>
              <Button asChild variant="outline" className="border-zinc-600 text-white hover:bg-zinc-700">
                <Link href="/categories/laptops">Explore <ArrowRight size={16} /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
