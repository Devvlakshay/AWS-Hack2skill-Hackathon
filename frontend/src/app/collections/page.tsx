"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useProductStore } from "@/lib/store/productStore";

const COLLECTIONS = [
  {
    slug: "Ethnic Wear",
    title: "Ethnic Wear",
    subtitle: "Traditional Indian elegance",
    gradient: "linear-gradient(135deg, #8B1A1A, #C4532C)",
  },
  {
    slug: "Shirts",
    title: "Shirts",
    subtitle: "Crisp formals & casual fits",
    gradient: "linear-gradient(135deg, #1a3a5c, #2a6496)",
  },
  {
    slug: "Sarees",
    title: "Sarees",
    subtitle: "Handwoven heritage",
    gradient: "linear-gradient(135deg, #5B2C6F, #8E44AD)",
  },
  {
    slug: "Kurtas",
    title: "Kurtas",
    subtitle: "Festive & everyday classics",
    gradient: "linear-gradient(135deg, #B8860B, #D4A843)",
  },
  {
    slug: "Jeans",
    title: "Jeans",
    subtitle: "Slim, straight & relaxed",
    gradient: "linear-gradient(135deg, #2c3e50, #4a6785)",
  },
  {
    slug: "Jackets",
    title: "Jackets",
    subtitle: "Layer up in style",
    gradient: "linear-gradient(135deg, #1a1a1a, #444)",
  },
  {
    slug: "T-Shirts",
    title: "T-Shirts",
    subtitle: "Graphic, oversized & basic",
    gradient: "linear-gradient(135deg, #2E7D32, #66BB6A)",
  },
  {
    slug: "Dresses",
    title: "Dresses",
    subtitle: "Occasion & casual wear",
    gradient: "linear-gradient(135deg, #AD1457, #E91E63)",
  },
];

export default function CollectionsPage() {
  const { products, total, loading, fetchProducts } = useProductStore();
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const loadCollection = useCallback(
    (category: string) => {
      setActiveCollection(category);
      fetchProducts({ category, page: 1, limit: 50, sort_by: "created_at", sort_order: "desc" });
    },
    [fetchProducts]
  );

  useEffect(() => {
    // Load all products initially
    fetchProducts({ page: 1, limit: 50, sort_by: "created_at", sort_order: "desc" });
  }, [fetchProducts]);

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
      {/* Hero */}
      <div
        style={{
          background: "#1a1a1a",
          padding: "80px 24px 56px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
            Explore
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px, 5vw, 52px)",
              fontWeight: 700,
              color: "#FAFAF8",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Our Collections
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
            Curated categories from India&apos;s finest retailers. Browse by style, tradition, or occasion.
          </p>
        </div>
      </div>

      {/* Collection Cards Grid */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {COLLECTIONS.map((col) => (
            <button
              key={col.slug}
              onClick={() => loadCollection(col.slug)}
              style={{
                position: "relative",
                background: col.gradient,
                borderRadius: "16px",
                padding: "40px 24px",
                border: activeCollection === col.slug ? "2px solid #B8860B" : "2px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.25s ease",
                overflow: "hidden",
                minHeight: "160px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                  borderRadius: "14px",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#fff",
                    margin: "0 0 4px",
                  }}
                >
                  {col.title}
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0 }}>
                  {col.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Products from selected collection */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 64px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 700,
                color: "#1a1a1a",
                margin: "0 0 4px",
              }}
            >
              {activeCollection || "All Products"}
            </h2>
            <p style={{ fontSize: "13px", color: "#6b6b6b", margin: 0 }}>
              <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{total}</span> item
              {total !== 1 ? "s" : ""}
            </p>
          </div>
          {activeCollection && (
            <button
              onClick={() => {
                setActiveCollection(null);
                fetchProducts({ page: 1, limit: 50, sort_by: "created_at", sort_order: "desc" });
              }}
              style={{
                padding: "8px 20px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                background: "transparent",
                color: "#B8860B",
                border: "1px solid #B8860B",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              View All
            </button>
          )}
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
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                fontWeight: 600,
                color: "#1a1a1a",
                marginBottom: "8px",
              }}
            >
              No products in this collection yet
            </p>
            <p style={{ color: "#6b6b6b", fontSize: "14px" }}>
              Check back soon or browse other collections.
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
                        <svg
                          className="w-12 h-12"
                          style={{ color: "#C8C8C4" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
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

                  <div style={{ padding: "16px" }}>
                    <h3
                      style={{
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
                        <div style={{ display: "flex", gap: "4px" }}>
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
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section
        style={{
          background: "#1a1a1a",
          padding: "56px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "26px",
            fontWeight: 700,
            color: "#FAFAF8",
            margin: "0 0 12px",
          }}
        >
          See How It Looks On You
        </h2>
        <p style={{ color: "rgba(250,250,248,0.5)", fontSize: "14px", marginBottom: "24px" }}>
          Pick any garment and try it on with our virtual fitting room.
        </p>
        <Link
          href="/tryon"
          style={{
            display: "inline-block",
            padding: "14px 36px",
            background: "#B8860B",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Try On Now
        </Link>
      </section>
    </div>
  );
}
