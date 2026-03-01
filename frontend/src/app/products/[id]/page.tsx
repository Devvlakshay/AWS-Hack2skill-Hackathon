"use client";

/**
 * Product detail page with image gallery, size chart, try-on button,
 * size recommendation, wishlist, cart, and style recommendations.
 * Phase 2 + Phase 4 enhancements.
 */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
      alert("Please select a size");
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        {error ? (
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
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
    <div className="min-h-screen bg-gray-950">
      {/* Breadcrumb */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-400 gap-2">
            <Link href="/products" className="hover:text-indigo-600 transition-colors">
              Products
            </Link>
            <span>/</span>
            {product.category && (
              <>
                <Link
                  href={`/products?category=${product.category}`}
                  className="hover:text-indigo-600 transition-colors"
                >
                  {product.category}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-white font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden mb-4 relative">
              {hasImages ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Wishlist Heart Button */}
              <button
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-900/70 flex items-center justify-center transition-colors hover:bg-gray-900/90 disabled:opacity-50"
              >
                <svg
                  className={`w-5 h-5 transition-colors ${wishlisted ? "text-red-500 fill-red-500" : "text-white"}`}
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
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? "border-indigo-600" : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category badge */}
            {product.category && (
              <span className="inline-block bg-indigo-900/40 text-indigo-400 text-xs font-medium px-3 py-1 rounded-full mb-3">
                {product.category}
                {product.subcategory ? ` / ${product.subcategory}` : ""}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-white">{product.name}</h1>
            <p className="text-3xl font-bold text-white mt-4">{formattedPrice}</p>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-white mb-2">Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Material */}
            {product.material && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-white mb-1">Material</h3>
                <p className="text-gray-300 text-sm">{product.material}</p>
              </div>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-white mb-3">Available Colors</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full border border-gray-600"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                      <span className="text-sm text-gray-300">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes with AI Recommendation */}
            {product.sizes.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">Select Size</h3>
                  {/* Size Recommendation Badge */}
                  {sizeRecLoading ? (
                    <span className="text-xs text-gray-500">Getting recommendation...</span>
                  ) : sizeRec ? (
                    <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded-full">
                      AI recommends: {sizeRec.recommended_size} ({Math.round(sizeRec.confidence * 100)}%)
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s, i) => {
                    const inStock = s.stock > 0;
                    const isSelected = selectedSize === s.size;
                    const isRecommended = sizeRec?.recommended_size === s.size;
                    return (
                      <button
                        key={i}
                        onClick={() => inStock && setSelectedSize(s.size)}
                        disabled={!inStock}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors relative ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : inStock
                            ? "bg-gray-800 text-gray-200 border-gray-700 hover:border-indigo-500"
                            : "bg-gray-800 text-gray-600 border-gray-800 line-through cursor-not-allowed"
                        }`}
                      >
                        {s.size}
                        {inStock && (
                          <span className="ml-1 text-xs opacity-60">({s.stock})</span>
                        )}
                        {isRecommended && !isSelected && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Size Recommendation Detail */}
                {sizeRec && (
                  <p className="mt-2 text-xs text-gray-400">{sizeRec.reasoning}</p>
                )}
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-white mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Size Chart */}
            {product.size_chart && Object.keys(product.size_chart).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-white mb-3">Size Chart</h3>
                <div className="bg-gray-950 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="pb-2 font-medium">Size</th>
                        {Object.keys(Object.values(product.size_chart)[0] as Record<string, unknown> || {}).map((key) => (
                          <th key={key} className="pb-2 font-medium capitalize">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(product.size_chart).map(([sizeName, measurements]) => (
                        <tr key={sizeName} className="border-b border-gray-800">
                          <td className="py-2 font-medium text-white">{sizeName}</td>
                          {Object.values(measurements as Record<string, unknown>).map((val, i) => (
                            <td key={i} className="py-2 text-gray-300">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-center flex items-center justify-center gap-2"
                onClick={() => {
                  router.push(`/tryon?product=${product._id || product.id}`);
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Try On Virtually
              </button>
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors text-center flex items-center justify-center gap-2 ${
                  addedToCart
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                }`}
              >
                {addedToCart ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className={`px-6 py-3 border rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  wishlisted
                    ? "border-red-500 text-red-400 hover:bg-red-900/20"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={wishlisted ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {styleRecs.length > 0 && (
          <div className="mt-16">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">You May Also Like</h2>
              {styleRecsBasis && (
                <p className="text-sm text-gray-400 mt-1">{styleRecsBasis}</p>
              )}
            </div>

            {styleRecsLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {styleRecs.map((rec) => {
                  const recPrice = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(rec.price);

                  return (
                    <Link
                      key={rec._id}
                      href={`/products/${rec._id}`}
                      className="group"
                    >
                      <div className="aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden mb-2">
                        {rec.images && rec.images.length > 0 ? (
                          <img
                            src={rec.images[0]}
                            alt={rec.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-white font-medium line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {rec.name}
                      </p>
                      <p className="text-sm text-gray-400">{recPrice}</p>
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
