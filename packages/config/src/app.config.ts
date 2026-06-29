export const appConfig = {
  name: 'Electronic Store',
  tagline: 'Premium Electronics',
  description: 'Discover the finest electronics curated for those who demand perfection.',
  supportEmail: 'support@electronicstore.com',
  pagination: {
    defaultPageSize: 24,
    maxPageSize: 100,
    pageSizeOptions: [12, 24, 48, 96],
  },
  upload: {
    maxFileSizeBytes: 10 * 1024 * 1024,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    allowedModelTypes: ['model/gltf-binary', 'model/gltf+json'],
  },
  auth: {
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    sessionDurationDays: 7,
  },
  shipping: {
    freeShippingThresholdCents: 10000,
    standardShippingCents: 999,
    expressShippingCents: 1999,
  },
  tax: {
    defaultRatePercent: 8.5,
  },
} as const;
