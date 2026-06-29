import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-2 text-4xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
