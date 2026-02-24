"use client";

/**
 * Product detail page with image gallery, size chart, and try-on button.
 * Phase 2: Product & Model Management.
 */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProductStore } from "@/lib/store/productStore";

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

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
    return () => {
      clearCurrentProduct();
    };
  }, [productId, fetchProduct, clearCurrentProduct]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-500 gap-2">
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
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-4">
              {hasImages ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? "border-indigo-600" : "border-gray-200 hover:border-gray-300"
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
              <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
                {product.category}
                {product.subcategory ? ` / ${product.subcategory}` : ""}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-3xl font-bold text-gray-900 mt-4">{formattedPrice}</p>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Material */}
            {product.material && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-1">Material</h3>
                <p className="text-gray-600 text-sm">{product.material}</p>
              </div>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Available Colors</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                      <span className="text-sm text-gray-600">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s, i) => {
                    const inStock = s.stock > 0;
                    const isSelected = selectedSize === s.size;
                    return (
                      <button
                        key={i}
                        onClick={() => inStock && setSelectedSize(s.size)}
                        disabled={!inStock}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : inStock
                            ? "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                            : "bg-gray-100 text-gray-400 border-gray-100 line-through cursor-not-allowed"
                        }`}
                      >
                        {s.size}
                        {inStock && (
                          <span className="ml-1 text-xs opacity-60">({s.stock})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
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
                <h3 className="text-sm font-medium text-gray-900 mb-3">Size Chart</h3>
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200">
                        <th className="pb-2 font-medium">Size</th>
                        {Object.keys(Object.values(product.size_chart)[0] as Record<string, unknown> || {}).map((key) => (
                          <th key={key} className="pb-2 font-medium capitalize">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(product.size_chart).map(([sizeName, measurements]) => (
                        <tr key={sizeName} className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">{sizeName}</td>
                          {Object.values(measurements as Record<string, unknown>).map((val, i) => (
                            <td key={i} className="py-2 text-gray-600">{String(val)}</td>
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
                  alert("Virtual Try-On will be available in Phase 3. Stay tuned!");
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Try On Virtually
              </button>
              <button
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  alert("Wishlist feature will be available in Phase 4. Stay tuned!");
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
