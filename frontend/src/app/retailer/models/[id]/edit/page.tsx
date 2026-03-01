"use client";

/**
 * Edit Model form page.
 * Phase 2: Product & Model Management.
 */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useModelStore } from "@/lib/store/modelStore";
import ImageUpload from "@/components/ImageUpload";

const BODY_TYPES = [
  { value: "slim", label: "Slim" },
  { value: "average", label: "Average" },
  { value: "curvy", label: "Curvy" },
  { value: "plus_size", label: "Plus Size" },
];

const SKIN_TONES = [
  { value: "fair", label: "Fair" },
  { value: "medium", label: "Medium" },
  { value: "olive", label: "Olive" },
  { value: "brown", label: "Brown" },
  { value: "dark", label: "Dark" },
];

const MODEL_SIZES = ["S", "M", "L", "XL", "XXL"];

export default function EditModelPage() {
  const params = useParams();
  const router = useRouter();
  const modelId = params.id as string;

  const {
    currentModel,
    loading,
    error,
    fetchModel,
    editModel,
    uploadImage,
    clearError,
    clearCurrentModel,
  } = useModelStore();

  const [name, setName] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [size, setSize] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (modelId) {
      fetchModel(modelId);
    }
    return () => {
      clearCurrentModel();
    };
  }, [modelId, fetchModel, clearCurrentModel]);

  useEffect(() => {
    if (currentModel && !loaded) {
      setName(currentModel.name || "");
      setBodyType(currentModel.body_type || "");
      setHeightCm(currentModel.height_cm?.toString() || "");
      setBust(currentModel.measurements?.bust?.toString() || "");
      setWaist(currentModel.measurements?.waist?.toString() || "");
      setHip(currentModel.measurements?.hip?.toString() || "");
      setSkinTone(currentModel.skin_tone || "");
      setSize(currentModel.size || "");
      setLoaded(true);
    }
  }, [currentModel, loaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    clearError();

    try {
      await editModel(modelId, {
        name,
        body_type: bodyType as "slim" | "average" | "curvy" | "plus_size",
        height_cm: parseFloat(heightCm),
        measurements: {
          bust: parseFloat(bust),
          waist: parseFloat(waist),
          hip: parseFloat(hip),
        },
        skin_tone: skinTone as "fair" | "medium" | "olive" | "brown" | "dark",
        size: size as "S" | "M" | "L" | "XL" | "XXL",
      });

      if (imageFiles.length > 0) {
        await uploadImage(modelId, imageFiles[0]);
      }

      router.push("/retailer/models");
    } catch {
      // error is in store
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !loaded) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-primary))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
      <header className="glass-card-lg rounded-none border-x-0 border-t-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] mb-2 inline-flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Edit Model</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="glass-card-lg p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Model Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Model Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Body Type *</label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    required
                    className="glass-input w-full px-3 py-2 text-sm"
                  >
                    <option value="">Select body type</option>
                    {BODY_TYPES.map((bt) => (
                      <option key={bt.value} value={bt.value}>{bt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Size *</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    required
                    className="glass-input w-full px-3 py-2 text-sm"
                  >
                    <option value="">Select size</option>
                    {MODEL_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Height (cm) *</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    min="101"
                    max="249"
                    step="0.1"
                    required
                    className="glass-input w-full px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Skin Tone *</label>
                  <select
                    value={skinTone}
                    onChange={(e) => setSkinTone(e.target.value)}
                    required
                    className="glass-input w-full px-3 py-2 text-sm"
                  >
                    <option value="">Select skin tone</option>
                    {SKIN_TONES.map((st) => (
                      <option key={st.value} value={st.value}>{st.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="glass-card-lg p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Body Measurements (cm)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Bust *</label>
                <input
                  type="number"
                  value={bust}
                  onChange={(e) => setBust(e.target.value)}
                  min="1"
                  step="0.1"
                  required
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Waist *</label>
                <input
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  min="1"
                  step="0.1"
                  required
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Hip *</label>
                <input
                  type="number"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  min="1"
                  step="0.1"
                  required
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="glass-card-lg p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Model Image</h2>
            <ImageUpload
              onFilesSelected={setImageFiles}
              multiple={false}
              maxFiles={1}
              existingImages={currentModel?.image_url ? [currentModel.image_url] : []}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || loading}
              className="btn-accent flex-1 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary px-6 py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
