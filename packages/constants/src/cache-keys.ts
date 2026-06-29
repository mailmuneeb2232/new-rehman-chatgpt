export const CACHE_KEYS = {
  products: {
    list: (params: string) => `products:list:${params}`,
    detail: (slug: string) => `products:detail:${slug}`,
    featured: () => 'products:featured',
    related: (id: string) => `products:related:${id}`,
  },
  categories: {
    all: () => 'categories:all',
    detail: (slug: string) => `categories:detail:${slug}`,
  },
  cart: {
    user: (userId: string) => `cart:user:${userId}`,
  },
  user: {
    detail: (id: string) => `user:detail:${id}`,
  },
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400,
} as const;
