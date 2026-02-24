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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Retailer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products and fashion models</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalProducts}</p>
            <Link href="/retailer/products" className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
              View all
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Fashion Models</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalModels}</p>
            <Link href="/retailer/models" className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
              View all
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Active Models</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {models.filter((m) => m.is_active).length}
            </p>
            <p className="text-xs text-gray-400 mt-2">Ready for try-on</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Products with Images</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {products.filter((p) => p.images && p.images.length > 0).length}
            </p>
            <p className="text-xs text-gray-400 mt-2">Of latest {products.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Link
            href="/retailer/products/new"
            className="bg-indigo-600 text-white rounded-xl p-6 hover:bg-indigo-700 transition-colors"
          >
            <h3 className="text-lg font-semibold">Add New Product</h3>
            <p className="text-indigo-200 text-sm mt-1">
              Upload a new garment to your catalog
            </p>
          </Link>

          <Link
            href="/retailer/models/new"
            className="bg-emerald-600 text-white rounded-xl p-6 hover:bg-emerald-700 transition-colors"
          >
            <h3 className="text-lg font-semibold">Upload New Model</h3>
            <p className="text-emerald-200 text-sm mt-1">
              Add a fashion model for virtual try-on
            </p>
          </Link>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link href="/retailer/products" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="text-gray-500 text-sm">No products yet. Add your first product to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Images</th>
                    <th className="pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((product) => (
                    <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{product.name}</td>
                      <td className="py-3 text-gray-600">{product.category}</td>
                      <td className="py-3 text-gray-600">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
                      </td>
                      <td className="py-3 text-gray-600">{product.images?.length || 0}</td>
                      <td className="py-3 text-gray-400">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Models</h2>
            <Link href="/retailer/models" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          {models.length === 0 ? (
            <p className="text-gray-500 text-sm">No models yet. Upload your first model to get started.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {models.slice(0, 5).map((model) => (
                <div key={model._id} className="text-center">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <img
                      src={model.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23e5e7eb' viewBox='0 0 24 24'%3E%3Cpath d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E"}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{model.name}</p>
                  <p className="text-xs text-gray-500">{model.size} - {model.height_cm}cm</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
