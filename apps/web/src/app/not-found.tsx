import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-9xl font-black text-zinc-200 dark:text-zinc-800">404</h1>
      <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-4 mb-2">Page Not Found</h2>
      <p className="text-zinc-500 mb-8 max-w-sm">Sorry, the page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-4">
        <Button asChild><Link href="/">Go Home</Link></Button>
        <Button asChild variant="outline"><Link href="/shop">Browse Products</Link></Button>
      </div>
    </div>
  );
}
