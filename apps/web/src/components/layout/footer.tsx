import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Deals & Offers', href: '/deals' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Best Sellers', href: '/best-sellers' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Track Order', href: '/track' },
    { label: 'Returns', href: '/returns' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-zinc-900 dark:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
                <span className="text-white dark:text-zinc-900 text-sm">E</span>
              </span>
              ElectroStore
            </Link>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-[200px]">
              The premium destination for the latest tech and electronics.
            </p>
          </div>

          {/* Link Groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">{group}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} ElectroStore. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="text-xs text-zinc-400 hover:text-zinc-600">Sitemap</Link>
            <Link href="/privacy" className="text-xs text-zinc-400 hover:text-zinc-600">Privacy</Link>
            <Link href="/terms" className="text-xs text-zinc-400 hover:text-zinc-600">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
