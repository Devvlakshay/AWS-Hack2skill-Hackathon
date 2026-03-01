"use client";

/**
 * Product list page with table, search, filters, and add button.
 * Phase 2: Product & Model Management.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useProductStore } from "@/lib/store/productStore";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = [
  "All",
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

export default function ProductListPage() {
  const {
    products,
    total,
    page,
    limit,
    loading,
    error,
    fetchProducts,
    removeProduct,
    clearError,
  } = useProductStore();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"created_at" | "price" | "name">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const loadProducts = useCallback(() => {
    const filters: Record<string, unknown> = {
      page: currentPage,
      limit: 20,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    if (category !== "All") filters.category = category;
    if (search.trim()) filters.search = search.trim();
    fetchProducts(filters as Parameters<typeof fetchProducts>[0]);
  }, [currentPage, sortBy, sortOrder, category, search, fetchProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await removeProduct(id);
    } catch {
      // error is in store
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
      <header className="glass-card-lg rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Products</h1>
            <p className="text-sm text-[rgb(var(--text-muted))] mt-1">{total} products in catalog</p>
          </div>
          <Link
            href="/retailer/products/new"
            className="btn-primary px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
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

        {/* Filters Bar */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2 text-sm"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-[rgb(var(--text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
              className="glass-input px-3 py-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("_") as ["created_at" | "price" | "name", "asc" | "desc"];
                setSortBy(field);
                setSortOrder(order);
                setCurrentPage(1);
              }}
              className="glass-input px-3 py-2 text-sm"
            >
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="name_desc">Name: Z-A</option>
            </select>

            {/* View Toggle */}
            <div className="flex border border-[rgba(var(--glass-border))] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm transition-colors ${viewMode === "grid" ? "bg-violet-600 text-white" : "bg-white/5 text-[rgb(var(--text-secondary))] hover:bg-white/10"}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 text-sm transition-colors ${viewMode === "table" ? "bg-violet-600 text-white" : "bg-white/5 text-[rgb(var(--text-secondary))] hover:bg-white/10"}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-[rgb(var(--text-muted))] mb-4">No products found.</p>
            <Link
              href="/retailer/products/new"
              className="btn-primary px-4 py-2 rounded-lg text-sm"
            >
              Add your first product
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showActions
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[rgb(var(--text-muted))] bg-white/5 border-b border-[rgba(var(--glass-border))]">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Sizes</th>
                    <th className="px-4 py-3 font-medium">Images</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-[rgba(var(--glass-border))]/50 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[rgb(var(--bg-secondary))] rounded-lg overflow-hidden flex-shrink-0 border border-[rgba(var(--glass-border))]">
                            {product.images?.[0] && (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--text-primary))]">{product.name}</p>
                            <p className="text-xs text-[rgb(var(--text-muted))] truncate max-w-[200px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{product.category}</td>
                      <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{product.sizes?.length || 0}</td>
                      <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{product.images?.length || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/retailer/products/${product._id}/edit`}
                            className="text-violet-400 hover:text-violet-300 text-xs font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-[rgba(var(--glass-border))] rounded-lg text-[rgb(var(--text-secondary))] disabled:opacity-50 hover:bg-white/5 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[rgb(var(--text-muted))]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-[rgba(var(--glass-border))] rounded-lg text-[rgb(var(--text-secondary))] disabled:opacity-50 hover:bg-white/5 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
