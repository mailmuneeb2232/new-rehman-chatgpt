'use client';
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-zinc-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-violet-600/20 text-violet-300 border-violet-600/30">
              <Zap size={12} className="mr-1" />
              Free shipping on orders over $99
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
              The Future of
              <span className="block bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Electronics
              </span>
              is Here.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-2xl">
              Discover the latest smartphones, laptops, audio gear, and smart home devices.
              Premium tech, curated for you.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button asChild size="xl" variant="gradient">
                <Link href="/shop">
                  Shop Now <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                <Link href="/deals">View Deals</Link>
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-8">
              {[['50K+', 'Products'], ['4.9★', 'Rating'], ['2M+', 'Customers'], ['Free', 'Returns']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white">{val}</p>
                  <p className="text-sm text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
