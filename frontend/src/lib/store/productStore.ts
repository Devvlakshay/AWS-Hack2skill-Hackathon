/**
 * Zustand store for Product state management.
 * Phase 2: Product & Model Management.
 */

import { create } from "zustand";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  type Product,
  type ProductListResponse,
} from "@/lib/api/products";

interface ProductFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  price_min?: number;
  price_max?: number;
  sort_by?: "created_at" | "price" | "name";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  total: number;
  page: number;
  limit: number;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;

  setFilters: (filters: ProductFilters) => void;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  addProduct: (data: Parameters<typeof createProduct>[0]) => Promise<Product>;
  editProduct: (id: string, data: Parameters<typeof updateProduct>[1]) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
  uploadImages: (id: string, files: File[]) => Promise<Product>;
  clearError: () => void;
  clearCurrentProduct: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  total: 0,
  page: 1,
  limit: 20,
  filters: {},
  loading: false,
  error: null,

  setFilters: (filters: ProductFilters) => {
    set({ filters });
  },

  fetchProducts: async (filters?: ProductFilters) => {
    set({ loading: true, error: null });
    try {
      const activeFilters = filters || get().filters;
      const response: ProductListResponse = await getProducts(activeFilters);
      set({
        products: response.products,
        total: response.total,
        page: response.page,
        limit: response.limit,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch products",
        loading: false,
      });
    }
  },

  fetchProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const product = await getProduct(id);
      set({ currentProduct: product, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch product",
        loading: false,
      });
    }
  },

  addProduct: async (data) => {
    set({ loading: true, error: null });
    try {
      const product = await createProduct(data);
      set((state) => ({
        products: [product, ...state.products],
        total: state.total + 1,
        loading: false,
      }));
      return product;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create product",
        loading: false,
      });
      throw err;
    }
  },

  editProduct: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const product = await updateProduct(id, data);
      set((state) => ({
        products: state.products.map((p) => (p._id === id ? product : p)),
        currentProduct: state.currentProduct?._id === id ? product : state.currentProduct,
        loading: false,
      }));
      return product;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update product",
        loading: false,
      });
      throw err;
    }
  },

  removeProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
        total: state.total - 1,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete product",
        loading: false,
      });
      throw err;
    }
  },

  uploadImages: async (id, files) => {
    set({ loading: true, error: null });
    try {
      const product = await uploadProductImages(id, files);
      set((state) => ({
        products: state.products.map((p) => (p._id === id ? product : p)),
        currentProduct: state.currentProduct?._id === id ? product : state.currentProduct,
        loading: false,
      }));
      return product;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to upload images",
        loading: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentProduct: () => set({ currentProduct: null }),
}));
