/**
 * Zustand store for Fashion Model state management.
 * Phase 2: Product & Model Management.
 */

import { create } from "zustand";
import {
  getModels,
  getModel,
  createModel,
  updateModel,
  deleteModel,
  uploadModelImage,
  type FashionModel,
  type ModelListResponse,
} from "@/lib/api/models";

interface ModelFilters {
  body_type?: "slim" | "average" | "curvy" | "plus_size";
  size?: "S" | "M" | "L" | "XL" | "XXL";
  skin_tone?: "fair" | "medium" | "olive" | "brown" | "dark";
  retailer_id?: string;
  page?: number;
  limit?: number;
}

interface ModelState {
  models: FashionModel[];
  currentModel: FashionModel | null;
  total: number;
  page: number;
  limit: number;
  filters: ModelFilters;
  loading: boolean;
  error: string | null;

  setFilters: (filters: ModelFilters) => void;
  fetchModels: (filters?: ModelFilters) => Promise<void>;
  fetchModel: (id: string) => Promise<void>;
  addModel: (data: Parameters<typeof createModel>[0]) => Promise<FashionModel>;
  editModel: (id: string, data: Parameters<typeof updateModel>[1]) => Promise<FashionModel>;
  removeModel: (id: string) => Promise<void>;
  uploadImage: (id: string, file: File) => Promise<FashionModel>;
  clearError: () => void;
  clearCurrentModel: () => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  models: [],
  currentModel: null,
  total: 0,
  page: 1,
  limit: 20,
  filters: {},
  loading: false,
  error: null,

  setFilters: (filters: ModelFilters) => {
    set({ filters });
  },

  fetchModels: async (filters?: ModelFilters) => {
    set({ loading: true, error: null });
    try {
      const activeFilters = filters || get().filters;
      const response: ModelListResponse = await getModels(activeFilters);
      set({
        models: response.models,
        total: response.total,
        page: response.page,
        limit: response.limit,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch models",
        loading: false,
      });
    }
  },

  fetchModel: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const model = await getModel(id);
      set({ currentModel: model, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch model",
        loading: false,
      });
    }
  },

  addModel: async (data) => {
    set({ loading: true, error: null });
    try {
      const model = await createModel(data);
      set((state) => ({
        models: [model, ...state.models],
        total: state.total + 1,
        loading: false,
      }));
      return model;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create model",
        loading: false,
      });
      throw err;
    }
  },

  editModel: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const model = await updateModel(id, data);
      set((state) => ({
        models: state.models.map((m) => (m._id === id ? model : m)),
        currentModel: state.currentModel?._id === id ? model : state.currentModel,
        loading: false,
      }));
      return model;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update model",
        loading: false,
      });
      throw err;
    }
  },

  removeModel: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteModel(id);
      set((state) => ({
        models: state.models.filter((m) => m._id !== id),
        total: state.total - 1,
        loading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete model",
        loading: false,
      });
      throw err;
    }
  },

  uploadImage: async (id, file) => {
    set({ loading: true, error: null });
    try {
      const model = await uploadModelImage(id, file);
      set((state) => ({
        models: state.models.map((m) => (m._id === id ? model : m)),
        currentModel: state.currentModel?._id === id ? model : state.currentModel,
        loading: false,
      }));
      return model;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to upload image",
        loading: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentModel: () => set({ currentModel: null }),
}));
