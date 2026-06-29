export const Permissions = {
  PRODUCTS_READ: 'products:read',
  PRODUCTS_WRITE: 'products:write',
  PRODUCTS_DELETE: 'products:delete',
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_WRITE: 'categories:write',
  ORDERS_READ_OWN: 'orders:read:own',
  ORDERS_READ_ALL: 'orders:read:all',
  ORDERS_WRITE: 'orders:write',
  ORDERS_UPDATE_STATUS: 'orders:update:status',
  USERS_READ_OWN: 'users:read:own',
  USERS_READ_ALL: 'users:read:all',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  REVIEWS_READ: 'reviews:read',
  REVIEWS_WRITE: 'reviews:write',
  REVIEWS_MODERATE: 'reviews:moderate',
  ANALYTICS_READ: 'analytics:read',
  UPLOAD_WRITE: 'upload:write',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
