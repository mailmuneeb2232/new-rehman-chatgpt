'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Heart, Search, Menu, X, Sun, Moon, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Deals', href: '/deals' },
  { label: 'Categories', href: '/categories' },
  { label: 'Brands', href: '/brands' },
  { label: 'Blog', href: '/blog' },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user } = useAuthStore();

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/90 shadow-sm backdrop-blur-md dark:bg-zinc-950/90'
          : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-zinc-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
            <span className="text-white dark:text-zinc-900 text-sm">E</span>
          </span>
          ElectroStore
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-6" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-white',
                  pathname.startsWith(link.href)
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-500 dark:text-zinc-400',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/search" className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Search">
            <Search size={18} className="text-zinc-600 dark:text-zinc-400" />
          </Link>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-zinc-400" /> : <Moon size={18} className="text-zinc-600" />}
          </button>

          <Link href="/wishlist" className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Wishlist">
            <Heart size={18} className="text-zinc-600 dark:text-zinc-400" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">{wishlistItems.length}</span>
            )}
          </Link>

          <Link href="/cart" className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Cart">
            <ShoppingCart size={18} className="text-zinc-600 dark:text-zinc-400" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-[10px] text-white dark:text-zinc-900">{cartCount}</span>
            )}
          </Link>

          {user ? (
            <Link href="/account" className="h-9 w-9 flex items-center justify-center rounded-full bg-zinc-900 dark:bg-white" aria-label="Account">
              <User size={16} className="text-white dark:text-zinc-900" />
            </Link>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          )}

          <button
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          >
            <ul className="px-4 py-4 flex flex-col gap-1" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
