/**
 * Try-On Zustand Store for FitView AI.
 * Phase 3: Core Virtual Try-On Engine.
 */

import { create } from "zustand";
import {
  generateTryOn,
  getTryOnHistory,
  toggleTryOnFavorite,
  type TryOnSession,
  type TryOnHistoryResponse,
} from "@/lib/api/tryon";

interface TryOnState {
  // Current try-on generation
  currentResult: TryOnSession | null;
  isGenerating: boolean;
  generateError: string | null;

  // History
  history: TryOnSession[];
  historyTotal: number;
  historyPage: number;
  historyLoading: boolean;
  historyError: string | null;

  // Selection state
  selectedModelId: string | null;
  selectedProductId: string | null;

  // Actions
  setSelectedModel: (modelId: string | null) => void;
  setSelectedProduct: (productId: string | null) => void;
  generate: () => Promise<void>;
  fetchHistory: (page?: number) => Promise<void>;
  toggleFavorite: (sessionId: string, isFavorite: boolean) => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
}

export const useTryOnStore = create<TryOnState>((set, get) => ({
  currentResult: null,
  isGenerating: false,
  generateError: null,

  history: [],
  historyTotal: 0,
  historyPage: 1,
  historyLoading: false,
  historyError: null,

  selectedModelId: null,
  selectedProductId: null,

  setSelectedModel: (modelId) => set({ selectedModelId: modelId }),
  setSelectedProduct: (productId) => set({ selectedProductId: productId }),

  generate: async () => {
    const { selectedModelId, selectedProductId } = get();
    if (!selectedModelId || !selectedProductId) {
      set({ generateError: "Please select both a model and a product" });
      return;
    }

    set({ isGenerating: true, generateError: null, currentResult: null });
    try {
      const result = await generateTryOn({
        model_id: selectedModelId,
        product_id: selectedProductId,
      });
      set({ currentResult: result, isGenerating: false });
    } catch (error: any) {
      set({
        generateError: error.message || "Try-on generation failed",
        isGenerating: false,
      });
    }
  },

  fetchHistory: async (page = 1) => {
    set({ historyLoading: true, historyError: null });
    try {
      const data: TryOnHistoryResponse = await getTryOnHistory(page, 20);
      set({
        history: data.sessions,
        historyTotal: data.total,
        historyPage: data.page,
        historyLoading: false,
      });
    } catch (error: any) {
      set({
        historyError: error.message || "Failed to load history",
        historyLoading: false,
      });
    }
  },

  toggleFavorite: async (sessionId, isFavorite) => {
    try {
      const updated = await toggleTryOnFavorite(sessionId, isFavorite);
      set((state) => ({
        history: state.history.map((s) =>
          (s._id === sessionId || s.id === sessionId) ? updated : s
        ),
        currentResult:
          state.currentResult &&
          (state.currentResult._id === sessionId || state.currentResult.id === sessionId)
            ? updated
            : state.currentResult,
      }));
    } catch (error: any) {
      console.error("Failed to toggle favorite:", error);
    }
  },

  clearResult: () => set({ currentResult: null, generateError: null }),
  clearError: () => set({ generateError: null, historyError: null }),
}));
