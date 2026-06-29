export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'INVENTORY_ADMIN' | 'CUSTOMER' | 'GUEST';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  name: string;
  avatar: string | null;
}
