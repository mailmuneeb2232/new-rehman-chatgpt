export const appConfig = {
  name: 'Electronic Store',
  tagline: 'Premium Electronics',
  description: 'Discover the finest electronics curated for those who demand perfection.',
  url: process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://electronicstore.com',
  apiUrl: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1',
  social: {
    twitter: 'https://twitter.com/electronicstore',
    instagram: 'https://instagram.com/electronicstore',
    youtube: 'https://youtube.com/electronicstore',
  },
  support: {
    email: 'support@electronicstore.com',
    phone: '+1 (800) 000-0000',
    hours: 'Mon–Fri, 9am–6pm EST',
  },
  pagination: {
    defaultPageSize: 24,
    pageSizeOptions: [12, 24, 48, 96],
  },
} as const;
