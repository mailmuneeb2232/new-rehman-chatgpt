export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
