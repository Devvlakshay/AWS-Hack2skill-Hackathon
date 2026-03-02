"use client";

/**
 * Wishlist page for FitView AI.
 * Phase 4: Intelligence Layer.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const { items, total, loading, error, fetchWishlist, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      await addToCart(productId, "M", 1);
      toast.success("Added to cart! Visit product page to choose a different size.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FAFAF8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #E8E8E4",
            borderRadius: "16px",
            padding: "48px",
            textAlign: "center",
            maxWidth: "360px",
            width: "100%",
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            Sign in to view your wishlist
          </h2>
          <p style={{ color: "#6b6b6b", fontSize: "14px", marginBottom: "24px" }}>
            Save your favourite pieces and come back to them anytime.
          </p>
          <Link
            href="/login"
            className="btn-ink"
            style={{ display: "inline-block", padding: "12px 32px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAFAF8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Extra bottom padding on mobile clears the 64px BottomTabBar + breathing room */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "48px",
          paddingLeft: "24px",
          paddingRight: "24px",
          // 96px on mobile, overridden to 48px on sm+ via Tailwind
          paddingBottom: "96px",
        }}
        className="sm:!pb-12"
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "48px",
            paddingBottom: "24px",
            borderBottom: "1px solid #E8E8E4",
          }}
        >
          <div
            style={{
              color: "#B8860B",
              fontSize: "11px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontWeight: 500,
              marginBottom: "8px",
            }}
          >
            Saved
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "40px",
              fontWeight: 700,
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            My Wishlist
          </h1>
          <p style={{ color: "#6b6b6b", fontSize: "14px", marginTop: "8px" }}>
            {total} {total === 1 ? "piece" : "pieces"} saved
          </p>
        </div>

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
            }}
          >
            {error}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #E8E8E4",
                borderTopColor: "#1a1a1a",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <div
            style={{
              background: "#fff",
              border: "1px solid #E8E8E4",
              borderRadius: "16px",
              padding: "96px 24px",
              textAlign: "center",
            }}
          >
            {/* Decorative heart illustration */}
            <div
              style={{
                width: "96px",
                height: "96px",
                margin: "0 auto 32px",
                borderRadius: "50%",
                background: "#F5F5F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #E8E8E4",
              }}
            >
              <svg
                style={{ width: "40px", height: "40px", color: "#B8860B" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>

            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 700,
                color: "#1a1a1a",
                marginBottom: "12px",
              }}
            >
              Your wishlist is empty
            </p>
            <p
              style={{
                color: "#6b6b6b",
                fontSize: "15px",
                lineHeight: 1.7,
                maxWidth: "360px",
                margin: "0 auto 32px",
              }}
            >
              Explore our collection and save the pieces that speak to you. Your wishlist is your personal mood board.
            </p>
            <Link
              href="/products"
              className="btn-ink"
              style={{ display: "inline-block", padding: "14px 40px", textDecoration: "none", fontSize: "14px", fontWeight: 600, letterSpacing: "0.5px" }}
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ gap: "24px" }}
          >
            {items.map((item) => {
              const formattedPrice = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(item.product_price);

              return (
                <div
                  key={item._id}
                  className="card card-hover group"
                  style={{ overflow: "hidden" }}
                >
                  {/* Image */}
                  <div style={{ position: "relative" }}>
                    <Link href={`/products/${item.product_id}`}>
                      <div
                        style={{
                          aspectRatio: "3/4",
                          background: "#F5F5F3",
                          overflow: "hidden",
                          borderRadius: "12px 12px 0 0",
                        }}
                      >
                        {item.tryon_image_url ? (
                          <img
                            src={item.tryon_image_url}
                            alt={item.product_name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.4s",
                            }}
                            className="group-hover:scale-105"
                          />
                        ) : item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.4s",
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
                            <svg className="w-10 h-10" style={{ color: "#C8C8C4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}

                        {item.tryon_image_url && (
                          <span
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              background: "rgba(26,26,26,0.82)",
                              color: "#FAFAF8",
                              fontSize: "9px",
                              letterSpacing: "2px",
                              textTransform: "uppercase",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontWeight: 600,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            Try-on
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Remove button — 36px touch target */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeItem(item.product_id);
                      }}
                      aria-label="Remove from wishlist"
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#fff",
                        border: "1px solid #E8E8E4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        transition: "all 0.2s",
                      }}
                    >
                      <svg style={{ width: "14px", height: "14px", color: "#E53E3E" }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Details */}
                  <div style={{ padding: "16px" }}>
                    {item.product_category && (
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          color: "#B8860B",
                          fontWeight: 600,
                          marginBottom: "6px",
                        }}
                      >
                        {item.product_category}
                      </div>
                    )}
                    <Link href={`/products/${item.product_id}`} style={{ textDecoration: "none" }}>
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                          marginBottom: "6px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.product_name}
                      </h3>
                    </Link>
                    <p
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        marginBottom: "14px",
                      }}
                    >
                      {formattedPrice}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button
                        onClick={() => handleAddToCart(item.product_id)}
                        disabled={addingToCart === item.product_id}
                        className="btn-ink"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          letterSpacing: "0.5px",
                          opacity: addingToCart === item.product_id ? 0.6 : 1,
                          cursor: addingToCart === item.product_id ? "not-allowed" : "pointer",
                        }}
                      >
                        {addingToCart === item.product_id ? "Adding..." : "Add to Cart"}
                      </button>
                      <Link
                        href={`/tryon?product=${item.product_id}`}
                        style={{
                          width: "100%",
                          minHeight: "36px",
                          border: "1px solid #E8E8E4",
                          borderRadius: "9999px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          color: "#6b6b6b",
                          textDecoration: "none",
                          transition: "all 0.15s",
                          background: "#fff",
                          fontSize: "12px",
                          fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                          letterSpacing: "0.3px",
                          padding: "8px 12px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#B8860B";
                          e.currentTarget.style.color = "#B8860B";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#E8E8E4";
                          e.currentTarget.style.color = "#6b6b6b";
                        }}
                      >
                        <svg style={{ width: "14px", height: "14px", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Try On
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
