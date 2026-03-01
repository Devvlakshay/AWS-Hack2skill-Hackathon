/**
 * Wishlist Zustand Store for FitView AI.
 * Phase 4: Intelligence Layer.
 */

import { create } from "zustand";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  type WishlistItem,
  type WishlistResponse,
} from "@/lib/api/wishlist";

interface WishlistState {
  items: WishlistItem[];
  total: number;
  loading: boolean;
  error: string | null;

  fetchWishlist: () => Promise<void>;
  addItem: (productId: string, tryonImageUrl?: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearError: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  error: null,

  fetchWishlist: async () => {
    set({ loading: true, error: null });
    try {
      const data: WishlistResponse = await getWishlist();
      set({
        items: data.items,
        total: data.total,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch wishlist",
        loading: false,
      });
    }
  },

  addItem: async (productId, tryonImageUrl) => {
    set({ loading: true, error: null });
    try {
      const data: WishlistResponse = await addToWishlist(productId, tryonImageUrl);
      set({
        items: data.items,
        total: data.total,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to add to wishlist",
        loading: false,
      });
      throw error;
    }
  },

  removeItem: async (productId) => {
    set({ loading: true, error: null });
    try {
      const data: WishlistResponse = await removeFromWishlist(productId);
      set({
        items: data.items,
        total: data.total,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to remove from wishlist",
        loading: false,
      });
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.product_id === productId);
  },

  clearError: () => set({ error: null }),
}));
