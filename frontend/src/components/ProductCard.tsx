"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";

// ─── Types ────────────────────────────────────────────────────

interface SizeStock {
  size: string;
  stock: number;
}

interface ProductCardProps {
  product: {
    id?: string;
    _id?: string;
    name: string;
    price: number;
    original_price?: number;
    images: string[];
    category?: string;
    tags?: string[];
    sizes?: SizeStock[];
    colors?: string[];
    rating?: number;
    retailer_name?: string;
    description?: string;
  };
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width="12" height="12" viewBox="0 0 24 24" fill="#B8860B">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {half && (
        <svg key="h" width="12" height="12" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half-gold">
              <stop offset="50%" stopColor="#B8860B" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#half-gold)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width="12" height="12" viewBox="0 0 24 24" fill="#D1D5DB">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ fontSize: "0.7rem", color: "#888", marginLeft: "3px" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export default function ProductCard({
  product,
  showActions = false,
  onDelete,
}: ProductCardProps) {
  const productId = product._id || product.id || "";
  const imageUrl = product.images?.[0] || "";
  const hasDiscount = !!product.original_price && product.original_price > product.price;
  const badge = hasDiscount ? "Sale" : null;

  const [hovered, setHovered] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const wishlisted = isInWishlist(productId);

  const firstAvailableSize = product.sizes?.find((s) => s.stock > 0)?.size;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!firstAvailableSize) {
      toast.error("Please select a size first");
      return;
    }

    setCartLoading(true);
    try {
      await addToCart(productId, firstAvailableSize, 1);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Please log in to add items to cart");
    } finally {
      setCartLoading(false);
    }
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(productId);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(productId);
        toast.success("Saved to wishlist");
      }
    } catch {
      toast.error("Please log in to use wishlist");
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E8E4",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        width: "100%",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.1)" : "0 2px 16px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        cursor: "pointer",
      }}
    >
      {/* ── Image area ───────────────────────────────────────── */}
      <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", backgroundColor: "#F5F0E8" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F5F0E8",
            }}
          >
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#C8C8C4" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Sale / New badge */}
        {badge && (
          <span
            style={{
              position: "absolute",
              top: "0.7rem",
              left: "0.7rem",
              backgroundColor: badge === "Sale" ? "#E53935" : "#1a1a1a",
              color: "#FFFFFF",
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0.22rem 0.6rem",
              borderRadius: "999px",
            }}
          >
            {badge}
          </span>
        )}

        {/* Wishlist heart — shown on hover */}
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute",
            top: "0.6rem",
            right: "0.6rem",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.92)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: hovered || wishlisted ? 1 : 0,
            transition: "opacity 0.2s, transform 0.15s",
            transform: wishlisted ? "scale(1.1)" : "scale(1)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={wishlisted ? "#E53935" : "none"}
            stroke={wishlisted ? "#E53935" : "#1a1a1a"}
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Quick add overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "2rem 0.75rem 0.85rem",
            background: "linear-gradient(to top, rgba(26,26,26,0.75) 0%, rgba(26,26,26,0.3) 60%, transparent 100%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        >
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              backgroundColor: "#FAFAF8",
              color: "#1a1a1a",
              fontWeight: 700,
              fontSize: "0.82rem",
              padding: "0.85rem 0",
              minHeight: "44px",
              borderRadius: "999px",
              border: "none",
              cursor: cartLoading ? "not-allowed" : "pointer",
              letterSpacing: "0.04em",
              opacity: cartLoading ? 0.6 : 1,
              transition: "opacity 0.15s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {cartLoading ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* ── Details ──────────────────────────────────────────── */}
      <div style={{ padding: "1rem 1.1rem 1.25rem" }}>

        {/* Brand / retailer */}
        {product.retailer_name && (
          <p
            style={{
              fontSize: "0.68rem",
              color: "#B8860B",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 0.25rem",
            }}
          >
            {product.retailer_name}
          </p>
        )}

        {/* Name */}
        <p
          style={{
            fontWeight: 600,
            fontSize: "0.92rem",
            color: "#1a1a1a",
            margin: "0 0 0.4rem",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </p>

        {/* Rating */}
        {product.rating !== undefined && product.rating > 0 && (
          <div style={{ marginBottom: "0.5rem" }}>
            <StarRating rating={product.rating} />
          </div>
        )}

        {/* Price row */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "0.6rem",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#1a1a1a",
            }}
          >
            {formatINR(product.price)}
          </span>
          {hasDiscount && product.original_price && (
            <>
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "#aaa",
                  textDecoration: "line-through",
                }}
              >
                {formatINR(product.original_price)}
              </span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#E53935" }}>
                {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
              </span>
            </>
          )}
        </div>

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "0.6rem" }}>
            {product.colors.slice(0, 5).map((color, i) => (
              <span
                key={i}
                title={color}
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: color.toLowerCase(),
                  border: "1.5px solid rgba(0,0,0,0.12)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            ))}
            {product.colors.length > 5 && (
              <span style={{ fontSize: "0.7rem", color: "#888" }}>
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Try On pill link */}
        <div style={{ marginTop: "0.5rem" }}>
          <Link
            href={`/tryon?product=${productId}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              border: "1px solid #B8860B",
              color: "#B8860B",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0.45rem 0.9rem",
              minHeight: "32px",
              borderRadius: "999px",
              textDecoration: "none",
              backgroundColor: "rgba(184,134,11,0.06)",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Try On
          </Link>
        </div>

        {/* Retailer actions: edit / delete */}
        {showActions && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.75rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid #E8E8E4",
            }}
          >
            <Link
              href={`/retailer/products/${productId}/edit`}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "0.82rem",
                fontWeight: 600,
                padding: "0.45rem 0",
                borderRadius: "8px",
                border: "1.5px solid #1a1a1a",
                color: "#1a1a1a",
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              Edit
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete?.(productId);
              }}
              style={{
                flex: 1,
                fontSize: "0.82rem",
                fontWeight: 600,
                padding: "0.45rem 0",
                borderRadius: "8px",
                border: "1.5px solid #E53935",
                color: "#E53935",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
