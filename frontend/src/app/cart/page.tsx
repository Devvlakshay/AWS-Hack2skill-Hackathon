"use client";

/**
 * Shopping Cart page for FitView AI.
 * Phase 4: Intelligence Layer.
 */

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const {
    items,
    totalItems,
    totalPrice,
    loading,
    error,
    fetchCart,
    updateItem,
    removeItem,
    clear,
  } = useCartStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(totalPrice);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Please log in to view your cart</h2>
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Shopping Cart</h1>
          {items.length > 0 && (
            <button
              onClick={() => clear()}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear Cart
            </button>
          )}
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-400 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Browse products and add them to your cart</p>
            <Link
              href="/products"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const itemPrice = new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(item.product_price);

                const itemTotal = new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(item.product_price * item.quantity);

                return (
                  <div
                    key={`${item.product_id}-${item.size}`}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link href={`/products/${item.product_id}`}>
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-800 rounded-lg overflow-hidden">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </Link>
                      {/* Try-on image thumbnail */}
                      {item.tryon_image_url && (
                        <div className="mt-2 w-24 sm:w-28">
                          <p className="text-[10px] text-gray-500 mb-1">Try-on preview</p>
                          <div className="w-full h-16 bg-gray-800 rounded overflow-hidden">
                            <img
                              src={item.tryon_image_url}
                              alt="Try-on"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product_id}`}>
                        <h3 className="text-white font-medium hover:text-indigo-400 transition-colors truncate">
                          {item.product_name}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-sm mt-1">
                        Size: <span className="text-gray-300">{item.size}</span>
                      </p>
                      <p className="text-gray-400 text-sm">
                        Price: <span className="text-gray-300">{itemPrice}</span>
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateItem(item.product_id, { quantity: item.quantity - 1 })
                              : removeItem(item.product_id)
                          }
                          className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:border-indigo-500 flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="text-white font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItem(item.product_id, { quantity: item.quantity + 1 })
                          }
                          className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:border-indigo-500 flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price + Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-white font-semibold">{itemTotal}</p>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Items ({totalItems})</span>
                    <span className="text-gray-300">{formattedTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="border-t border-gray-800 pt-3 flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white font-bold text-lg">{formattedTotal}</span>
                  </div>
                </div>

                <button
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  onClick={() => alert("Checkout functionality coming soon!")}
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/products"
                  className="block text-center text-sm text-indigo-400 hover:text-indigo-300 mt-4 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
