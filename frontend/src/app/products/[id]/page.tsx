"use client";

/**
 * Product detail page with image gallery, size chart, try-on button,
 * size recommendation, wishlist, cart, and style recommendations.
 * Phase 2 + Phase 4 enhancements.
 */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useProductStore } from "@/lib/store/productStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useAuthStore } from "@/lib/store/authStore";
import {
  getSizeRecommendation,
  getStyleRecommendations,
  type SizeRecommendation,
  type RecommendedProduct,
} from "@/lib/api/recommendations";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const {
    currentProduct: product,
    loading,
    error,
    fetchProduct,
    clearCurrentProduct,
  } = useProductStore();

  const { isAuthenticated, hydrate } = useAuthStore();
  const { addItem: addToCart, loading: cartLoading } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist, fetchWishlist } = useWishlistStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "sizeguide" | "reviews">("description");

  // Size recommendation state
  const [sizeRec, setSizeRec] = useState<SizeRecommendation | null>(null);
  const [sizeRecLoading, setSizeRecLoading] = useState(false);

  // Style recommendations state
  const [styleRecs, setStyleRecs] = useState<RecommendedProduct[]>([]);
  const [styleRecsLoading, setStyleRecsLoading] = useState(false);
  const [styleRecsBasis, setStyleRecsBasis] = useState("");

  // Wishlist state
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
    return () => {
      clearCurrentProduct();
    };
  }, [productId, fetchProduct, clearCurrentProduct]);

  // Fetch recommendations and wishlist status when authenticated
  useEffect(() => {
    if (isAuthenticated && productId) {
      fetchWishlist();

      // Size recommendation
      setSizeRecLoading(true);
      getSizeRecommendation(productId)
        .then(setSizeRec)
        .catch(() => {})
        .finally(() => setSizeRecLoading(false));

      // Style recommendations
      setStyleRecsLoading(true);
      getStyleRecommendations(6)
        .then((data) => {
          setStyleRecs(data.products);
          setStyleRecsBasis(data.based_on);
        })
        .catch(() => {})
        .finally(() => setStyleRecsLoading(false));
    }
  }, [isAuthenticated, productId, fetchWishlist]);

  // Update wishlisted state when wishlist store changes
  useEffect(() => {
    if (productId) {
      setWishlisted(isInWishlist(productId));
    }
  }, [productId, isInWishlist]);

  // Auto-select recommended size
  useEffect(() => {
    if (sizeRec && !selectedSize) {
      setSelectedSize(sizeRec.recommended_size);
    }
  }, [sizeRec, selectedSize]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      await addToCart(productId, selectedSize, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      // Error handled by store
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(productId);
        setWishlisted(false);
      } else {
        await addToWishlist(productId);
        setWishlisted(true);
      }
    } catch {
      // Error handled by store
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading || !product) {
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
        {error ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#DC2626", marginBottom: "16px", fontSize: "14px" }}>{error}</p>
            <button
              onClick={() => router.back()}
              style={{
                color: "#B8860B",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Go Back
            </button>
          </div>
        ) : (
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
        )}
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(product.price);

  const images = product.images && product.images.length > 0 ? product.images : [];
  const hasImages = images.length > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAFAF8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          borderBottom: "1px solid #E8E8E4",
          background: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "12px 24px",
          }}
        >
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#6b6b6b",
            }}
          >
            <Link
              href="/products"
              style={{ color: "#6b6b6b", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#B8860B")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
            >
              Products
            </Link>
            <span style={{ color: "#C8C8C4" }}>/</span>
            {product.category && (
              <>
                <Link
                  href={`/products?category=${product.category}`}
                  style={{ color: "#6b6b6b", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#B8860B")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
                >
                  {product.category}
                </Link>
                <span style={{ color: "#C8C8C4" }}>/</span>
              </>
            )}
            <span
              style={{
                color: "#1a1a1a",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "200px",
              }}
            >
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: "64px" }}
        >
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div
              style={{
                aspectRatio: "3/4",
                background: "#F5F5F3",
                borderRadius: "16px",
                overflow: "hidden",
                marginBottom: "16px",
                position: "relative",
                border: "1px solid #E8E8E4",
              }}
            >
              {hasImages ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                  <svg className="w-20 h-20" style={{ color: "#C8C8C4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#fff",
                  border: "1px solid #E8E8E4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  opacity: wishlistLoading ? 0.5 : 1,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: wishlisted ? "#E53E3E" : "#6b6b6b" }}
                  fill={wishlisted ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    style={{
                      flexShrink: 0,
                      width: "88px",
                      height: "88px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: selectedImage === idx ? "2px solid #1a1a1a" : "2px solid #E8E8E4",
                      cursor: "pointer",
                      transition: "border-color 0.2s",
                      background: "none",
                      padding: 0,
                    }}
                  >
                    <img src={img} alt={`View ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category badge */}
            {product.category && (
              <div
                style={{
                  display: "inline-block",
                  fontSize: "10px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#B8860B",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                {product.category}
                {product.subcategory ? ` / ${product.subcategory}` : ""}
              </div>
            )}

            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "36px",
                fontWeight: 700,
                color: "#1a1a1a",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {product.name}
            </h1>

            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 700,
                color: "#1a1a1a",
                marginTop: "16px",
              }}
            >
              {formattedPrice}
            </p>

            {/* Divider */}
            <div style={{ height: "1px", background: "#E8E8E4", margin: "24px 0" }} />

            {/* Colors */}
            {(product.colors?.length ?? 0) > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#1a1a1a",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  Colours
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {product.colors?.map((color, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: "1px solid rgba(0,0,0,0.1)",
                          display: "inline-block",
                          backgroundColor: color.toLowerCase(),
                        }}
                      />
                      <span style={{ fontSize: "13px", color: "#6b6b6b" }}>{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes with AI Recommendation */}
            {(product.sizes?.length ?? 0) > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3
                    style={{
                      fontSize: "11px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "#1a1a1a",
                      fontWeight: 600,
                    }}
                  >
                    Select Size
                  </h3>
                  {sizeRecLoading ? (
                    <span style={{ fontSize: "11px", color: "#6b6b6b" }}>Getting recommendation...</span>
                  ) : sizeRec ? (
                    <span
                      style={{
                        fontSize: "11px",
                        background: "#F0FDF4",
                        color: "#15803D",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        border: "1px solid #BBF7D0",
                        fontWeight: 500,
                      }}
                    >
                      AI recommends: {sizeRec.recommended_size} ({Math.round(sizeRec.confidence * 100)}%)
                    </span>
                  ) : null}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {product.sizes.map((s, i) => {
                    const inStock = s.stock > 0;
                    const isSelected = selectedSize === s.size;
                    const isRecommended = sizeRec?.recommended_size === s.size;
                    return (
                      <button
                        key={i}
                        onClick={() => inStock && setSelectedSize(s.size)}
                        disabled={!inStock}
                        style={{
                          padding: "10px 20px",
                          minHeight: "44px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: isSelected ? 700 : 500,
                          background: isSelected ? "#1a1a1a" : "#fff",
                          color: isSelected ? "#FAFAF8" : inStock ? "#1a1a1a" : "#C8C8C4",
                          border: isSelected
                            ? "1px solid #1a1a1a"
                            : isRecommended && !isSelected
                            ? "1px solid #B8860B"
                            : "1px solid #E8E8E4",
                          cursor: inStock ? "pointer" : "not-allowed",
                          transition: "all 0.15s",
                          textDecoration: inStock ? "none" : "line-through",
                          opacity: inStock ? 1 : 0.4,
                          position: "relative",
                          fontFamily: "'DM Sans', sans-serif",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        {s.size}
                        {inStock && (
                          <span style={{ fontSize: "10px", marginLeft: "4px", opacity: 0.6 }}>
                            ({s.stock})
                          </span>
                        )}
                        {isRecommended && !isSelected && (
                          <span
                            style={{
                              position: "absolute",
                              top: "-3px",
                              right: "-3px",
                              width: "8px",
                              height: "8px",
                              background: "#B8860B",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                {sizeRec && (
                  <p style={{ marginTop: "8px", fontSize: "12px", color: "#6b6b6b", lineHeight: 1.5 }}>
                    {sizeRec.reasoning}
                  </p>
                )}
              </div>
            )}

            {/* Material */}
            {product.material && (
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", color: "#6b6b6b" }}>
                  Material: <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{product.material}</span>
                </span>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "11px",
                      padding: "4px 12px",
                      borderRadius: "4px",
                      border: "1px solid #E8E8E4",
                      color: "#6b6b6b",
                      background: "#fff",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="btn-ink"
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  fontSize: "15px",
                  fontWeight: 600,
                  minHeight: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  letterSpacing: "0.5px",
                  background: addedToCart ? "#15803D" : undefined,
                  borderColor: addedToCart ? "#15803D" : undefined,
                  opacity: cartLoading ? 0.6 : 1,
                  cursor: cartLoading ? "not-allowed" : "pointer",
                  borderRadius: "8px",
                }}
              >
                {addedToCart ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  router.push(`/tryon?product=${product._id || product.id}`);
                }}
                className="btn-outline-ink"
                style={{
                  width: "100%",
                  padding: "15px 24px",
                  fontSize: "15px",
                  fontWeight: 600,
                  minHeight: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  letterSpacing: "0.5px",
                  borderRadius: "8px",
                }}
              >
                <span style={{ color: "#B8860B", fontSize: "16px" }}>★</span>
                Try On Virtually
              </button>
            </div>

            {/* Tabs: Description, Size Guide, Reviews */}
            <div>
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #E8E8E4",
                  gap: "0",
                  marginBottom: "20px",
                }}
              >
                {(["description", "sizeguide", "reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "14px 20px",
                      minHeight: "48px",
                      fontSize: "12px",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: activeTab === tab ? "#1a1a1a" : "#6b6b6b",
                      background: "none",
                      border: "none",
                      borderBottom: activeTab === tab ? "2px solid #1a1a1a" : "2px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      marginBottom: "-1px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {tab === "sizeguide" ? "Size Guide" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === "description" && (
                <div>
                  <p style={{ fontSize: "14px", color: "#4b4b4b", lineHeight: 1.8 }}>
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === "sizeguide" && product.size_chart && Object.keys(product.size_chart).length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontSize: "11px",
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "#6b6b6b",
                            borderBottom: "1px solid #E8E8E4",
                            fontWeight: 600,
                          }}
                        >
                          Size
                        </th>
                        {Object.keys(Object.values(product.size_chart)[0] as Record<string, unknown> || {}).map((key) => (
                          <th
                            key={key}
                            style={{
                              textAlign: "left",
                              padding: "10px 12px",
                              fontSize: "11px",
                              letterSpacing: "1px",
                              textTransform: "uppercase",
                              color: "#6b6b6b",
                              borderBottom: "1px solid #E8E8E4",
                              fontWeight: 600,
                            }}
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(product.size_chart).map(([sizeName, measurements]) => (
                        <tr key={sizeName}>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              borderBottom: "1px solid #F0F0EE",
                            }}
                          >
                            {sizeName}
                          </td>
                          {Object.values(measurements as Record<string, unknown>).map((val, i) => (
                            <td
                              key={i}
                              style={{
                                padding: "10px 12px",
                                color: "#6b6b6b",
                                borderBottom: "1px solid #F0F0EE",
                              }}
                            >
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "sizeguide" && (!product.size_chart || Object.keys(product.size_chart).length === 0) && (
                <p style={{ fontSize: "14px", color: "#6b6b6b" }}>No size guide available for this product.</p>
              )}

              {activeTab === "reviews" && (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "18px",
                      color: "#1a1a1a",
                      marginBottom: "8px",
                    }}
                  >
                    No reviews yet
                  </p>
                  <p style={{ fontSize: "13px", color: "#6b6b6b" }}>
                    Be the first to share your thoughts
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {styleRecs.length > 0 && (
          <div style={{ marginTop: "80px" }}>
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <div
                style={{
                  color: "#B8860B",
                  fontSize: "11px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  marginBottom: "12px",
                }}
              >
                Curated for You
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  margin: 0,
                }}
              >
                You May Also Like
              </h2>
              {styleRecsBasis && (
                <p style={{ fontSize: "13px", color: "#6b6b6b", marginTop: "8px" }}>{styleRecsBasis}</p>
              )}
            </div>

            {styleRecsLoading ? (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                style={{ gap: "16px" }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ borderRadius: "10px", aspectRatio: "3/4" }} />
                ))}
              </div>
            ) : (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                style={{ gap: "16px" }}
              >
                {styleRecs.map((rec) => {
                  const recPrice = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(rec.price);

                  return (
                    <Link
                      key={rec._id}
                      href={`/products/${rec._id}`}
                      style={{ textDecoration: "none" }}
                      className="group"
                    >
                      <div
                        style={{
                          aspectRatio: "3/4",
                          background: "#F5F5F3",
                          borderRadius: "10px",
                          overflow: "hidden",
                          marginBottom: "10px",
                          border: "1px solid #E8E8E4",
                          transition: "transform 0.3s, box-shadow 0.3s",
                        }}
                        className="group-hover:-translate-y-1 group-hover:shadow-md"
                      >
                        {rec.images && rec.images.length > 0 ? (
                          <img
                            src={rec.images[0]}
                            alt={rec.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                            className="group-hover:scale-105"
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg className="w-8 h-8" style={{ color: "#C8C8C4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "4px",
                        }}
                      >
                        {rec.name}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#1a1a1a",
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        {recPrice}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
