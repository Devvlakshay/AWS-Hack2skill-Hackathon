"use client";

/**
 * Edit Product form page.
 * Phase 2: Product & Model Management.
 */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProductStore } from "@/lib/store/productStore";
import ImageUpload from "@/components/ImageUpload";

const CATEGORIES = [
  "Shirts",
  "T-Shirts",
  "Trousers",
  "Jeans",
  "Dresses",
  "Sarees",
  "Kurtas",
  "Jackets",
  "Ethnic Wear",
  "Activewear",
  "Other",
];

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const {
    currentProduct,
    loading,
    error,
    fetchProduct,
    editProduct,
    uploadImages,
    clearError,
    clearCurrentProduct,
  } = useProductStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [material, setMaterial] = useState("");
  const [tags, setTags] = useState("");
  const [colors, setColors] = useState("");
  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
    return () => {
      clearCurrentProduct();
    };
  }, [productId, fetchProduct, clearCurrentProduct]);

  useEffect(() => {
    if (currentProduct && !loaded) {
      setName(currentProduct.name || "");
      setDescription(currentProduct.description || "");
      setCategory(currentProduct.category || "");
      setSubcategory(currentProduct.subcategory || "");
      setPrice(currentProduct.price?.toString() || "");
      setMaterial(currentProduct.material || "");
      setTags(currentProduct.tags?.join(", ") || "");
      setColors(currentProduct.colors?.join(", ") || "");
      setSizes(currentProduct.sizes || []);
      setLoaded(true);
    }
  }, [currentProduct, loaded]);

  const toggleSize = (size: string) => {
    setSizes((prev) => {
      const existing = prev.find((s) => s.size === size);
      if (existing) return prev.filter((s) => s.size !== size);
      return [...prev, { size, stock: 10 }];
    });
  };

  const updateStock = (size: string, stock: number) => {
    setSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, stock: Math.max(0, stock) } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    clearError();

    try {
      await editProduct(productId, {
        name,
        description,
        category,
        subcategory: subcategory || undefined,
        price: parseFloat(price),
        material: material || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        colors: colors ? colors.split(",").map((c) => c.trim()).filter(Boolean) : [],
        sizes,
      });

      if (imageFiles.length > 0) {
        await uploadImages(productId, imageFiles);
      }

      router.push("/retailer/products");
    } catch {
      // error is in store
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !loaded) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-primary))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
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
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Edit Product</h1>
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
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="glass-input w-full px-3 py-2 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="glass-input w-full px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="glass-input w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="1"
                    step="0.01"
                    required
                    className="glass-input w-full px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Material</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="glass-input w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Colors (comma-separated)</label>
                <input
                  type="text"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="glass-card-lg p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Sizes & Stock</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {AVAILABLE_SIZES.map((size) => {
                const isSelected = sizes.some((s) => s.size === size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      isSelected
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white/5 text-[rgb(var(--text-secondary))] border-[rgba(var(--glass-border))] hover:border-violet-500/50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {sizes.length > 0 && (
              <div className="space-y-2">
                {sizes.map((s) => (
                  <div key={s.size} className="flex items-center gap-4">
                    <span className="w-16 text-sm font-medium text-[rgb(var(--text-secondary))]">{s.size}</span>
                    <label className="text-xs text-[rgb(var(--text-muted))]">Stock:</label>
                    <input
                      type="number"
                      value={s.stock}
                      onChange={(e) => updateStock(s.size, parseInt(e.target.value) || 0)}
                      min="0"
                      className="glass-input w-24 px-2 py-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="glass-card-lg p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Product Images</h2>
            <ImageUpload
              onFilesSelected={setImageFiles}
              multiple
              maxFiles={10}
              existingImages={currentProduct?.images || []}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || loading}
              className="btn-primary flex-1 py-3 rounded-lg font-medium disabled:opacity-50"
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
