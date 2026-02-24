"use client";

/**
 * Model list page for retailers.
 * Phase 2: Product & Model Management.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useModelStore } from "@/lib/store/modelStore";
import ModelCard from "@/components/ModelCard";

const BODY_TYPES = [
  { value: "", label: "All Body Types" },
  { value: "slim", label: "Slim" },
  { value: "average", label: "Average" },
  { value: "curvy", label: "Curvy" },
  { value: "plus_size", label: "Plus Size" },
];

const SKIN_TONES = [
  { value: "", label: "All Skin Tones" },
  { value: "fair", label: "Fair" },
  { value: "medium", label: "Medium" },
  { value: "olive", label: "Olive" },
  { value: "brown", label: "Brown" },
  { value: "dark", label: "Dark" },
];

const SIZES = [
  { value: "", label: "All Sizes" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];

export default function ModelListPage() {
  const {
    models,
    total,
    limit,
    loading,
    error,
    fetchModels,
    removeModel,
    clearError,
  } = useModelStore();

  const [bodyType, setBodyType] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [size, setSize] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadModels = useCallback(() => {
    const filters: Record<string, unknown> = {
      page: currentPage,
      limit: 20,
    };
    if (bodyType) filters.body_type = bodyType;
    if (skinTone) filters.skin_tone = skinTone;
    if (size) filters.size = size;
    fetchModels(filters as Parameters<typeof fetchModels>[0]);
  }, [currentPage, bodyType, skinTone, size, fetchModels]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this model?")) return;
    try {
      await removeModel(id);
    } catch {
      // error is in store
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Fashion Models</h1>
            <p className="text-sm text-gray-400 mt-1">{total} models uploaded</p>
          </div>
          <Link
            href="/retailer/models/new"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Model
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-300 text-sm">Dismiss</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={bodyType}
              onChange={(e) => { setBodyType(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {BODY_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>{bt.label}</option>
              ))}
            </select>

            <select
              value={skinTone}
              onChange={(e) => { setSkinTone(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SKIN_TONES.map((st) => (
                <option key={st.value} value={st.value}>{st.label}</option>
              ))}
            </select>

            <select
              value={size}
              onChange={(e) => { setSize(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : models.length === 0 ? (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-12 text-center">
            <p className="text-gray-400 mb-4">No models found.</p>
            <Link
              href="/retailer/models/new"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700"
            >
              Upload your first model
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {models.map((model) => (
              <ModelCard
                key={model._id}
                model={model}
                showActions
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-800"
            >
              Previous
            </button>
            <span className="text-sm text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
