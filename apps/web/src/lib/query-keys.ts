export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.products.details(), slug] as const,
    featured: () => [...queryKeys.products.all, 'featured'] as const,
    related: (productId: string) => [...queryKeys.products.all, 'related', productId] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    detail: (slug: string) => [...queryKeys.categories.all, slug] as const,
  },
  cart: {
    all: ['cart'] as const,
    detail: () => [...queryKeys.cart.all, 'detail'] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.orders.all, id] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
  wishlist: {
    all: ['wishlist'] as const,
    detail: () => [...queryKeys.wishlist.all, 'detail'] as const,
  },
} as const;
