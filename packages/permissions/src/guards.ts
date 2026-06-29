import type { Role } from './roles';
import type { Permission } from './permissions';
import { Roles } from './roles';
import { Permissions } from './permissions';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Roles.SUPER_ADMIN]: Object.values(Permissions),
  [Roles.ADMIN]: [
    Permissions.PRODUCTS_READ,
    Permissions.PRODUCTS_WRITE,
    Permissions.PRODUCTS_DELETE,
    Permissions.CATEGORIES_READ,
    Permissions.CATEGORIES_WRITE,
    Permissions.ORDERS_READ_ALL,
    Permissions.ORDERS_UPDATE_STATUS,
    Permissions.USERS_READ_ALL,
    Permissions.REVIEWS_READ,
    Permissions.REVIEWS_MODERATE,
    Permissions.ANALYTICS_READ,
    Permissions.UPLOAD_WRITE,
  ],
  [Roles.INVENTORY_ADMIN]: [
    Permissions.PRODUCTS_READ,
    Permissions.PRODUCTS_WRITE,
    Permissions.CATEGORIES_READ,
    Permissions.ORDERS_READ_ALL,
    Permissions.UPLOAD_WRITE,
  ],
  [Roles.CUSTOMER]: [
    Permissions.PRODUCTS_READ,
    Permissions.CATEGORIES_READ,
    Permissions.ORDERS_READ_OWN,
    Permissions.USERS_READ_OWN,
    Permissions.REVIEWS_READ,
    Permissions.REVIEWS_WRITE,
  ],
  [Roles.GUEST]: [Permissions.PRODUCTS_READ, Permissions.CATEGORIES_READ, Permissions.REVIEWS_READ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasRole(userRole: Role, ...requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole);
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
