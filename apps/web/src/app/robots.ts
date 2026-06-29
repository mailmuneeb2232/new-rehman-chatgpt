import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://electrostore.com';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/account/', '/checkout/', '/admin/', '/api/'] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
