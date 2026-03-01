"use client";

/**
 * Wishlist page for FitView AI.
 * Phase 4: Intelligence Layer.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
      alert("Added to cart with size M. Visit the product page to choose a different size.");
    } catch {
      // Error handled by store
    } finally {
      setAddingToCart(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Please log in to view your wishlist</h2>
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Wishlist</h1>
          <p className="text-gray-400 mt-1">
            {total} {total === 1 ? "item" : "items"} saved
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
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
            <h2 className="text-xl font-semibold text-gray-400 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save your favorite products here</p>
            <Link
              href="/products"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const formattedPrice = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(item.product_price);

              return (
                <div
                  key={item._id}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group"
                >
                  {/* Image */}
                  <Link href={`/products/${item.product_id}`}>
                    <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                      {item.tryon_image_url ? (
                        <img
                          src={item.tryon_image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {item.tryon_image_url && (
                        <span className="absolute top-2 left-2 bg-indigo-600/80 text-white text-xs px-2 py-1 rounded-full">
                          Try-on
                        </span>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem(item.product_id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-900/80 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="p-4">
                    {item.product_category && (
                      <span className="text-xs text-indigo-400 font-medium">{item.product_category}</span>
                    )}
                    <Link href={`/products/${item.product_id}`}>
                      <h3 className="text-white font-medium mt-1 hover:text-indigo-400 transition-colors line-clamp-1">
                        {item.product_name}
                      </h3>
                    </Link>
                    <p className="text-white font-semibold mt-2">{formattedPrice}</p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToCart(item.product_id)}
                        disabled={addingToCart === item.product_id}
                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {addingToCart === item.product_id ? "Adding..." : "Add to Cart"}
                      </button>
                      <Link
                        href={`/tryon?product=${item.product_id}`}
                        className="px-3 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
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
