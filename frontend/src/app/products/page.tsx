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
    <div
      style={{
        minHeight: "100vh",
        background: "#FAFAF8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          background: "#1a1a1a",
          padding: "64px 24px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(184,134,11,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(184,134,11,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              color: "#B8860B",
              fontSize: "11px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            Curated for You
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "48px",
              fontWeight: 700,
              color: "#FAFAF8",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Our Collection
          </h1>
          <p
            style={{
              color: "rgba(250,250,248,0.5)",
              fontSize: "16px",
              marginTop: "12px",
              maxWidth: "480px",
              margin: "12px auto 0",
            }}
          >
            Browse through curated clothing from top Indian retailers
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            style={{ marginTop: "32px", maxWidth: "480px", margin: "32px auto 0" }}
          >
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search shirts, kurtas, dresses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 50px 14px 20px",
                  background: "rgba(250,250,248,0.06)",
                  border: "1px solid rgba(184,134,11,0.3)",
                  borderRadius: "8px",
                  color: "#FAFAF8",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#B8860B";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(184,134,11,0.3)";
                }}
              />
              <button
                type="submit"
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#B8860B",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              style={{
                background: "none",
                border: "none",
                color: "#DC2626",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
          {/* Sidebar Filters */}
          <aside
            style={{
              width: "260px",
              flexShrink: 0,
              position: "sticky",
              top: "80px",
            }}
            className="hidden lg:block"
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #E8E8E4",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "11px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#B8860B",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                Filters
              </h3>

              {/* Category Filter */}
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    marginBottom: "10px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Category
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setCurrentPage(1); }}
                      style={{
                        textAlign: "left",
                        padding: "10px 14px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: category === cat ? 600 : 400,
                        background: category === cat ? "#1a1a1a" : "transparent",
                        color: category === cat ? "#FAFAF8" : "#6b6b6b",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "'DM Sans', sans-serif",
                        minHeight: "40px",
                        width: "100%",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    marginBottom: "10px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Price Range
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#6b6b6b", display: "block", marginBottom: "4px" }}>Min (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      onBlur={() => { setCurrentPage(1); }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #E8E8E4",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#1a1a1a",
                        background: "#fff",
                        outline: "none",
                        fontFamily: "'DM Sans', sans-serif",
                        boxSizing: "border-box",
                        minHeight: "40px",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#6b6b6b", display: "block", marginBottom: "4px" }}>Max (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      onBlur={() => { setCurrentPage(1); }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #E8E8E4",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#1a1a1a",
                        background: "#fff",
                        outline: "none",
                        fontFamily: "'DM Sans', sans-serif",
                        boxSizing: "border-box",
                        minHeight: "40px",
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => { setPriceMin(""); setPriceMax(""); setCurrentPage(1); }}
                  style={{
                    marginTop: "8px",
                    fontSize: "11px",
                    color: "#B8860B",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Clear price filter
                </button>
              </div>

              {/* Sort */}
              <div>
                <h4
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    marginBottom: "10px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Sort By
                </h4>
                <select
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("_") as ["created_at" | "price" | "name", "asc" | "desc"];
                    setSortBy(field);
                    setSortOrder(order);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #E8E8E4",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#1a1a1a",
                    background: "#fff",
                    outline: "none",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
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
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Mobile filters bar */}
            <div
              className="flex lg:hidden overflow-x-auto pb-3 gap-2 mb-4"
              style={{ scrollbarWidth: "none" }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setCurrentPage(1); }}
                  style={{
                    flexShrink: 0,
                    padding: "10px 18px",
                    minHeight: "44px",
                    borderRadius: "22px",
                    fontSize: "13px",
                    fontWeight: category === cat ? 600 : 400,
                    background: category === cat ? "#1a1a1a" : "#fff",
                    color: category === cat ? "#FAFAF8" : "#6b6b6b",
                    border: category === cat ? "1px solid #1a1a1a" : "1px solid #E8E8E4",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <p style={{ fontSize: "13px", color: "#6b6b6b" }}>
                <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{total}</span>{" "}
                product{total !== 1 ? "s" : ""} found
              </p>
            </div>

            {loading ? (
              <div
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                style={{ gap: "20px" }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ borderRadius: "12px", aspectRatio: "3/4" }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E8E8E4",
                  borderRadius: "16px",
                  padding: "80px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    margin: "0 auto 24px",
                    borderRadius: "50%",
                    background: "#F5F5F3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg className="w-8 h-8" style={{ color: "#B8860B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    marginBottom: "8px",
                  }}
                >
                  No products found
                </p>
                <p style={{ color: "#6b6b6b", fontSize: "14px" }}>
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                style={{ gap: "20px" }}
              >
                {products.map((product) => {
                  const imageUrl = product.images?.[0] || null;
                  return (
                    <Link
                      key={product._id}
                      href={`/products/${product._id}`}
                      style={{ textDecoration: "none" }}
                      className="card card-hover group"
                    >
                      {/* Image */}
                      <div
                        style={{
                          aspectRatio: "3/4",
                          background: "#F5F5F3",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "12px 12px 0 0",
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.4s ease",
                            }}
                            className="group-hover:scale-105"
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg className="w-12 h-12" style={{ color: "#C8C8C4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {product.category && (
                          <span
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              background: "rgba(26,26,26,0.75)",
                              backdropFilter: "blur(4px)",
                              color: "#FAFAF8",
                              fontSize: "10px",
                              letterSpacing: "1px",
                              textTransform: "uppercase",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontWeight: 500,
                            }}
                          >
                            {product.category}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ padding: "16px" }}>
                        <h3
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#1a1a1a",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {product.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#6b6b6b",
                            marginTop: "4px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.5,
                          }}
                        >
                          {product.description}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "12px",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Playfair Display', serif",
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#1a1a1a",
                            }}
                          >
                            {formattedPrice(product.price)}
                          </span>
                          {(product.colors?.length ?? 0) > 0 && (
                            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                              {product.colors.slice(0, 3).map((color, i) => (
                                <span
                                  key={i}
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    borderRadius: "50%",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    backgroundColor: color.toLowerCase(),
                                    display: "inline-block",
                                  }}
                                  title={color}
                                />
                              ))}
                              {product.colors.length > 3 && (
                                <span style={{ fontSize: "10px", color: "#6b6b6b" }}>
                                  +{product.colors.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {(product.sizes?.length ?? 0) > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                              marginTop: "10px",
                            }}
                          >
                            {product.sizes.map((s, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 7px",
                                  borderRadius: "4px",
                                  border: s.stock > 0 ? "1px solid #E8E8E4" : "1px solid #FECACA",
                                  color: s.stock > 0 ? "#6b6b6b" : "#FECACA",
                                  textDecoration: s.stock > 0 ? "none" : "line-through",
                                  background: "#fff",
                                }}
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "48px",
                }}
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-outline-ink"
                  style={{
                    padding: "10px 24px",
                    fontSize: "13px",
                    minHeight: "44px",
                    opacity: currentPage === 1 ? 0.4 : 1,
                  }}
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
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: currentPage === pageNum ? 700 : 400,
                        background: currentPage === pageNum ? "#1a1a1a" : "#fff",
                        color: currentPage === pageNum ? "#FAFAF8" : "#6b6b6b",
                        border: currentPage === pageNum ? "1px solid #1a1a1a" : "1px solid #E8E8E4",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-outline-ink"
                  style={{
                    padding: "10px 24px",
                    fontSize: "13px",
                    minHeight: "44px",
                    opacity: currentPage === totalPages ? 0.4 : 1,
                  }}
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
