import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { LenisProvider } from '@/providers/lenis-provider';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://electronicstore.com'),
  title: {
    default: 'Electronic Store — Premium Electronics',
    template: '%s | Electronic Store',
  },
  description:
    'Discover the finest electronics curated for those who demand perfection. Premium laptops, smartphones, audio, and accessories.',
  keywords: ['electronics', 'premium', 'luxury', 'laptops', 'smartphones', 'audio'],
  authors: [{ name: 'Electronic Store' }],
  creator: 'Electronic Store',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://electronicstore.com',
    siteName: 'Electronic Store',
    title: 'Electronic Store — Premium Electronics',
    description: 'Discover the finest electronics curated for those who demand perfection.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Electronic Store — Premium Electronics',
    description: 'Discover the finest electronics curated for those who demand perfection.',
    creator: '@electronicstore',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <LenisProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </LenisProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
