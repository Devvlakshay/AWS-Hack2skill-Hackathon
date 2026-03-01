"use client";

/**
 * Retailer Dashboard overview page.
 * Phase 2: Product & Model Management.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useProductStore } from "@/lib/store/productStore";
import { useModelStore } from "@/lib/store/modelStore";

export default function RetailerDashboard() {
  const { products, total: totalProducts, fetchProducts } = useProductStore();
  const { models, total: totalModels, fetchModels } = useModelStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([
        fetchProducts({ limit: 5 }),
        fetchModels({ limit: 5 }),
      ]);
      setLoading(false);
    }
    load();
  }, [fetchProducts, fetchModels]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-primary))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
      {/* Header */}
      <header className="glass-card-lg rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Retailer Dashboard</h1>
          <p className="text-sm text-[rgb(var(--text-muted))] mt-1">Manage your products and fashion models</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 border-l-2 border-l-violet-500">
            <p className="text-sm text-[rgb(var(--text-muted))]">Total Products</p>
            <p className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-1">{totalProducts}</p>
            <Link href="/retailer/products" className="text-sm text-violet-400 hover:text-violet-300 mt-2 inline-block">
              View all
            </Link>
          </div>

          <div className="glass-card p-6 border-l-2 border-l-violet-500">
            <p className="text-sm text-[rgb(var(--text-muted))]">Fashion Models</p>
            <p className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-1">{totalModels}</p>
            <Link href="/retailer/models" className="text-sm text-violet-400 hover:text-violet-300 mt-2 inline-block">
              View all
            </Link>
          </div>

          <div className="glass-card p-6 border-l-2 border-l-amber-500">
            <p className="text-sm text-[rgb(var(--text-muted))]">Active Models</p>
            <p className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-1">
              {models.filter((m) => m.is_active).length}
            </p>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-2">Ready for try-on</p>
          </div>

          <div className="glass-card p-6 border-l-2 border-l-amber-500">
            <p className="text-sm text-[rgb(var(--text-muted))]">Products with Images</p>
            <p className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-1">
              {products.filter((p) => p.images && p.images.length > 0).length}
            </p>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-2">Of latest {products.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Link
            href="/retailer/products/new"
            className="glass-card p-6 border-l-2 border-l-violet-500 hover:bg-violet-500/10 transition-colors group"
          >
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Add New Product</h3>
            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
              Upload a new garment to your catalog
            </p>
          </Link>

          <Link
            href="/retailer/models/new"
            className="glass-card p-6 border-l-2 border-l-amber-500 hover:bg-amber-500/10 transition-colors group"
          >
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Upload New Model</h3>
            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
              Add a fashion model for virtual try-on
            </p>
          </Link>
        </div>

        {/* Recent Products */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Recent Products</h2>
            <Link href="/retailer/products" className="text-sm text-violet-400 hover:text-violet-300">
              View all
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="text-[rgb(var(--text-muted))] text-sm">No products yet. Add your first product to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[rgb(var(--text-muted))] border-b border-[rgba(var(--glass-border))]">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Images</th>
                    <th className="pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((product) => (
                    <tr key={product._id} className="border-b border-[rgba(var(--glass-border))]/50 hover:bg-white/5 transition-colors">
                      <td className="py-3 font-medium text-[rgb(var(--text-primary))]">{product.name}</td>
                      <td className="py-3 text-[rgb(var(--text-secondary))]">{product.category}</td>
                      <td className="py-3 text-[rgb(var(--text-secondary))]">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
                      </td>
                      <td className="py-3 text-[rgb(var(--text-secondary))]">{product.images?.length || 0}</td>
                      <td className="py-3 text-[rgb(var(--text-muted))]">
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Models */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Recent Models</h2>
            <Link href="/retailer/models" className="text-sm text-violet-400 hover:text-violet-300">
              View all
            </Link>
          </div>
          {models.length === 0 ? (
            <p className="text-[rgb(var(--text-muted))] text-sm">No models yet. Upload your first model to get started.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {models.slice(0, 5).map((model) => (
                <div key={model._id} className="text-center">
                  <div className="aspect-square bg-[rgb(var(--bg-secondary))] rounded-lg overflow-hidden mb-2 border border-[rgba(var(--glass-border))]">
                    <img
                      src={model.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%234b5563' viewBox='0 0 24 24'%3E%3Cpath d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E"}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">{model.name}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{model.size} - {model.height_cm}cm</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
