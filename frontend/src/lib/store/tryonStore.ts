/**
 * Try-On Zustand Store for FitView AI.
 * Phase 3: Core Virtual Try-On Engine.
 */

import { create } from "zustand";
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
    const { selectedModelId, selectedProductIds } = get();

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

  clearResult: () => set({ currentResult: null, batchResults: null, generateError: null }),
  clearError: () => set({ generateError: null, historyError: null }),
}));
