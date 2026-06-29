export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stock: number;
  images: ProductImage[];
  variants: ProductVariant[];
  category: { id: string; name: string; slug: string };
  brand: string | null;
  rating: number;
  reviewCount: number;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  model3dUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price: number | null;
  stock: number;
  sku: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  primaryImage: string;
  rating: number;
  reviewCount: number;
  category: string;
  isNew: boolean;
}
