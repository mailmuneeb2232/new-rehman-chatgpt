export const Roles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  INVENTORY_ADMIN: 'INVENTORY_ADMIN',
  CUSTOMER: 'CUSTOMER',
  GUEST: 'GUEST',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
