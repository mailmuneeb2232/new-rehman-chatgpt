import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  productIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      addToWishlist: (productId) =>
        set((state) => ({ productIds: [...new Set([...state.productIds, productId])] })),
      removeFromWishlist: (productId) =>
        set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) })),
      isInWishlist: (productId) => get().productIds.includes(productId),
    }),
    { name: 'wishlist-store' },
  ),
);
