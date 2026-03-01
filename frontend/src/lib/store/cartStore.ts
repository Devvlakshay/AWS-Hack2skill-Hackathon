/**
 * Cart Zustand Store for FitView AI.
 * Phase 4: Intelligence Layer.
 */

import { create } from "zustand";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  type CartItem,
  type CartResponse,
} from "@/lib/api/cart";

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addItem: (productId: string, size: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, data: { size?: string; quantity?: number }) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const data: CartResponse = await getCart();
      set({
        items: data.items,
        totalItems: data.total_items,
        totalPrice: data.total_price,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch cart",
        loading: false,
      });
    }
  },

  addItem: async (productId, size, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const data: CartResponse = await addToCart(productId, size, quantity);
      set({
        items: data.items,
        totalItems: data.total_items,
        totalPrice: data.total_price,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to add to cart",
        loading: false,
      });
      throw error;
    }
  },

  updateItem: async (productId, updateData) => {
    set({ loading: true, error: null });
    try {
      const data: CartResponse = await updateCartItem(productId, updateData);
      set({
        items: data.items,
        totalItems: data.total_items,
        totalPrice: data.total_price,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to update cart item",
        loading: false,
      });
    }
  },

  removeItem: async (productId) => {
    set({ loading: true, error: null });
    try {
      const data: CartResponse = await removeFromCart(productId);
      set({
        items: data.items,
        totalItems: data.total_items,
        totalPrice: data.total_price,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to remove from cart",
        loading: false,
      });
    }
  },

  clear: async () => {
    set({ loading: true, error: null });
    try {
      const data: CartResponse = await clearCart();
      set({
        items: data.items,
        totalItems: data.total_items,
        totalPrice: data.total_price,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to clear cart",
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
