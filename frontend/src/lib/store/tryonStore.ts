/**
 * Try-On Zustand Store for FitView AI.
 * Phase 3: Core Virtual Try-On Engine.
 */

import { create } from "zustand";
import toast from "react-hot-toast";
import {
  generateTryOn,
  generateTryOnWithPhoto,
  generateBatchTryOn,
  getTryOnHistory,
  toggleTryOnFavorite,
  type TryOnSession,
  type TryOnHistoryResponse,
  type BatchTryOnResponse,
} from "@/lib/api/tryon";

interface TryOnState {
  // Current try-on generation
  currentResult: TryOnSession | null;
  isGenerating: boolean;
  generateError: string | null;

  // Batch / multi-select
  selectedProductIds: string[];
  batchResults: BatchTryOnResponse | null;

  // History
  history: TryOnSession[];
  historyTotal: number;
  historyPage: number;
  historyLoading: boolean;
  historyError: string | null;

  // Selection state
  selectedModelId: string | null;
  selectedProductId: string | null;

  // User photo upload
  userPhoto: File | null;
  userPhotoPreview: string | null;

  // Actions
  setSelectedModel: (modelId: string | null) => void;
  setSelectedProduct: (productId: string | null) => void;
  toggleProductSelection: (productId: string) => void;
  clearProductSelection: () => void;
  setUserPhoto: (file: File | null) => void;
  clearUserPhoto: () => void;
  generate: () => Promise<void>;
  generateBatch: () => Promise<void>;
  fetchHistory: (page?: number) => Promise<void>;
  toggleFavorite: (sessionId: string, isFavorite: boolean) => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
}

export const useTryOnStore = create<TryOnState>((set, get) => ({
  currentResult: null,
  isGenerating: false,
  generateError: null,

  selectedProductIds: [],
  batchResults: null,

  history: [],
  historyTotal: 0,
  historyPage: 1,
  historyLoading: false,
  historyError: null,

  selectedModelId: null,
  selectedProductId: null,

  userPhoto: null,
  userPhotoPreview: null,

  setSelectedModel: (modelId) => set({ selectedModelId: modelId }),
  setSelectedProduct: (productId) => set({ selectedProductId: productId }),

  toggleProductSelection: (productId) => {
    const { selectedProductIds } = get();
    if (selectedProductIds.includes(productId)) {
      set({
        selectedProductIds: selectedProductIds.filter((id) => id !== productId),
        selectedProductId: selectedProductIds.length === 2 ? selectedProductIds.find((id) => id !== productId) || null : null,
      });
    } else {
      if (selectedProductIds.length >= 5) return; // max 5
      const next = [...selectedProductIds, productId];
      set({
        selectedProductIds: next,
        selectedProductId: next.length === 1 ? productId : get().selectedProductId,
      });
    }
  },

  clearProductSelection: () => set({ selectedProductIds: [], selectedProductId: null, batchResults: null }),

  setUserPhoto: (file) => {
    // Revoke previous preview URL to avoid memory leaks
    const prevPreview = get().userPhotoPreview;
    if (prevPreview) {
      URL.revokeObjectURL(prevPreview);
    }

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      set({
        userPhoto: file,
        userPhotoPreview: previewUrl,
        selectedModelId: "user_upload",
      });
    } else {
      set({
        userPhoto: null,
        userPhotoPreview: null,
      });
    }
  },

  clearUserPhoto: () => {
    const prevPreview = get().userPhotoPreview;
    if (prevPreview) {
      URL.revokeObjectURL(prevPreview);
    }
    set({
      userPhoto: null,
      userPhotoPreview: null,
      selectedModelId: null,
    });
  },

  generate: async () => {
    const { selectedModelId, selectedProductId, userPhoto } = get();

    if (!selectedProductId) {
      set({ generateError: "Please select a product" });
      return;
    }

    // If user uploaded a photo, use the photo endpoint
    if (userPhoto && selectedModelId === "user_upload") {
      set({ isGenerating: true, generateError: null, currentResult: null });
      try {
        const result = await generateTryOnWithPhoto(userPhoto, selectedProductId);
        set({ currentResult: result, isGenerating: false });
      } catch (error: any) {
        set({
          generateError: error.message || "Try-on generation failed",
          isGenerating: false,
        });
      }
      return;
    }

    // Standard model-based try-on
    if (!selectedModelId) {
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

  generateBatch: async () => {
    const { selectedModelId, selectedProductIds, userPhoto } = get();

    if (!selectedModelId) {
      set({ generateError: "Please select a model" });
      return;
    }
    if (selectedProductIds.length === 0) {
      set({ generateError: "Please select at least one product" });
      return;
    }

    // Single product: use existing single flow
    if (selectedProductIds.length === 1) {
      set({ selectedProductId: selectedProductIds[0] });
      await get().generate();
      return;
    }

    // User photo upload: generate for each product, show combined result
    if (userPhoto && selectedModelId === "user_upload") {
      set({ isGenerating: true, generateError: null, currentResult: null, batchResults: null });
      try {
        const results: TryOnSession[] = [];
        for (const productId of selectedProductIds) {
          const result = await generateTryOnWithPhoto(userPhoto, productId);
          results.push(result);
        }
        const totalTime = results.reduce((sum, r) => sum + (r.processing_time_ms || 0), 0);
        // Use the last result as the combined view (single combined image)
        const combinedResult = results.length > 0 ? results[results.length - 1] : null;
        set({
          batchResults: {
            batch_id: `batch_${Date.now()}`,
            individual_results: [],
            combined_result: combinedResult,
            total_processing_time_ms: totalTime,
            product_count: results.length,
          },
          isGenerating: false,
        });
      } catch (error: any) {
        set({
          generateError: error.message || "Try-on generation failed",
          isGenerating: false,
        });
      }
      return;
    }

    set({ isGenerating: true, generateError: null, currentResult: null, batchResults: null });
    try {
      const result = await generateBatchTryOn({
        model_id: selectedModelId,
        product_ids: selectedProductIds,
      });
      set({ batchResults: result, isGenerating: false });
    } catch (error: any) {
      set({
        generateError: error.message || "Batch try-on generation failed",
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
    const matchId = (s: TryOnSession) => s._id === sessionId || s.id === sessionId;

    const updateFav = (s: TryOnSession, fav: boolean): TryOnSession => ({ ...s, is_favorite: fav });

    const updateBatch = (batch: BatchTryOnResponse | null, fav: boolean): BatchTryOnResponse | null => {
      if (!batch) return null;
      return {
        ...batch,
        combined_result: batch.combined_result && matchId(batch.combined_result)
          ? updateFav(batch.combined_result, fav) : batch.combined_result,
        individual_results: batch.individual_results.map((s) =>
          matchId(s) ? updateFav(s, fav) : s
        ),
      };
    };

    // Optimistic update
    set((state) => ({
      history: state.history.map((s) => matchId(s) ? updateFav(s, isFavorite) : s),
      currentResult: state.currentResult && matchId(state.currentResult)
        ? updateFav(state.currentResult, isFavorite) : state.currentResult,
      batchResults: updateBatch(state.batchResults, isFavorite),
    }));

    try {
      const updated = await toggleTryOnFavorite(sessionId, isFavorite);
      set((state) => ({
        history: state.history.map((s) => matchId(s) ? updated : s),
        currentResult: state.currentResult && matchId(state.currentResult)
          ? updated : state.currentResult,
        batchResults: state.batchResults ? {
          ...state.batchResults,
          combined_result: state.batchResults.combined_result && matchId(state.batchResults.combined_result)
            ? updated : state.batchResults.combined_result,
          individual_results: state.batchResults.individual_results.map((s) =>
            matchId(s) ? updated : s
          ),
        } : null,
      }));
      toast.success(isFavorite ? "Saved to Favourites" : "Removed from Favourites");
    } catch (error: any) {
      // Revert on failure
      set((state) => ({
        history: state.history.map((s) => matchId(s) ? updateFav(s, !isFavorite) : s),
        currentResult: state.currentResult && matchId(state.currentResult)
          ? updateFav(state.currentResult, !isFavorite) : state.currentResult,
        batchResults: updateBatch(state.batchResults, !isFavorite),
      }));
      toast.error(error.message || "Failed to update favourite");
    }
  },

  clearResult: () => set({ currentResult: null, batchResults: null, generateError: null }),
  clearError: () => set({ generateError: null, historyError: null }),
}));
