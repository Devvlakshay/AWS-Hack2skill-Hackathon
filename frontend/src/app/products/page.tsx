"use client";

/**
 * Customer-facing product catalog page.
 * Phase 2: Product & Model Management.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useProductStore } from "@/lib/store/productStore";

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
];

export default function ProductCatalogPage() {
  const {
    products,
    total,
    limit,
    loading,
    error,
    fetchProducts,
    clearError,
  } = useProductStore();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"created_at" | "price" | "name">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadProducts = useCallback(() => {
    const filters: Record<string, unknown> = {
      page: currentPage,
      limit: 12,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    if (category !== "All") filters.category = category;
    if (search.trim()) filters.search = search.trim();
    if (priceMin) filters.price_min = parseFloat(priceMin);
    if (priceMax) filters.price_max = parseFloat(priceMax);
    fetchProducts(filters as Parameters<typeof fetchProducts>[0]);
  }, [currentPage, sortBy, sortOrder, category, search, priceMin, priceMax, fetchProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const totalPages = Math.ceil(total / (limit || 12));

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Explore Our Collection</h1>
          <p className="mt-2 text-indigo-200 text-lg">
            Browse through curated clothing from top Indian retailers
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for shirts, kurtas, dresses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-white bg-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-300 text-sm">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-5 sticky top-20">
              <h3 className="font-semibold text-white mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-200 mb-2">Category</h4>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setCurrentPage(1); }}
                      className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        category === cat
                          ? "bg-indigo-900/40 text-indigo-400 font-medium"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-200 mb-2">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    onBlur={() => { setCurrentPage(1); }}
                    className="w-full px-2 py-1.5 border border-gray-700 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    onBlur={() => { setCurrentPage(1); }}
                    className="w-full px-2 py-1.5 border border-gray-700 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={() => { setPriceMin(""); setPriceMax(""); setCurrentPage(1); }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 mt-2"
                >
                  Clear price filter
                </button>
              </div>

              {/* Sort */}
              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-2">Sort By</h4>
                <select
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("_") as ["created_at" | "price" | "name", "asc" | "desc"];
                    setSortBy(field);
                    setSortOrder(order);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-700 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="created_at_desc">Newest First</option>
                  <option value="created_at_asc">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A-Z</option>
                  <option value="name_desc">Name: Z-A</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">
                {total} product{total !== 1 ? "s" : ""} found
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-400 text-lg">No products found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const imageUrl = product.images?.[0] || null;
                  return (
                    <Link
                      key={product._id}
                      href={`/products/${product._id}`}
                      className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      {/* Image */}
                      <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {product.category && (
                          <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {product.category}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-4">
                        <h3 className="font-semibold text-white text-sm truncate group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{product.description}</p>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-white">{formattedPrice(product.price)}</span>
                          {product.colors.length > 0 && (
                            <div className="flex gap-1">
                              {product.colors.slice(0, 3).map((color, i) => (
                                <span
                                  key={i}
                                  className="w-4 h-4 rounded-full border border-gray-700"
                                  style={{ backgroundColor: color.toLowerCase() }}
                                  title={color}
                                />
                              ))}
                              {product.colors.length > 3 && (
                                <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {product.sizes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.sizes.map((s, i) => (
                              <span
                                key={i}
                                className={`text-xs px-1.5 py-0.5 rounded border ${
                                  s.stock > 0
                                    ? "border-gray-700 text-gray-300"
                                    : "border-red-900 text-red-500 line-through"
                                }`}
                              >
                                {s.size}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-800 text-gray-200"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 text-sm rounded-lg ${
                        currentPage === pageNum
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-700 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-800 text-gray-200"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
