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
      <div className="min-h-screen bg-[rgb(var(--bg-primary))] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">Please log in to view your cart</h2>
          <Link
            href="/login"
            className="btn-primary px-6 py-3 rounded-lg inline-block"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--text-primary))]">Shopping Cart</h1>
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
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {error}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <svg
              className="w-16 h-16 text-[rgb(var(--text-muted))] mx-auto mb-4"
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
            <h2 className="text-xl font-semibold text-[rgb(var(--text-secondary))] mb-2">Your cart is empty</h2>
            <p className="text-[rgb(var(--text-muted))] mb-6">Browse products and add them to your cart</p>
            <Link
              href="/products"
              className="btn-accent px-6 py-3 rounded-lg inline-block"
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
                    className="glass-card p-4 flex gap-4"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link href={`/products/${item.product_id}`}>
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[rgb(var(--bg-secondary))] rounded-lg overflow-hidden">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[rgb(var(--text-muted))]">
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
                          <p className="text-[10px] text-[rgb(var(--text-muted))] mb-1">Try-on preview</p>
                          <div className="w-full h-16 bg-[rgb(var(--bg-secondary))] rounded overflow-hidden">
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
                        <h3 className="text-[rgb(var(--text-primary))] font-medium hover:text-violet-400 transition-colors truncate">
                          {item.product_name}
                        </h3>
                      </Link>
                      <p className="text-[rgb(var(--text-secondary))] text-sm mt-1">
                        Size: <span className="text-[rgb(var(--text-primary))]">{item.size}</span>
                      </p>
                      <p className="text-[rgb(var(--text-secondary))] text-sm">
                        Price: <span className="text-[rgb(var(--text-primary))]">{itemPrice}</span>
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateItem(item.product_id, { quantity: item.quantity - 1 })
                              : removeItem(item.product_id)
                          }
                          className="w-8 h-8 rounded-lg glass-input flex items-center justify-center text-[rgb(var(--text-secondary))] hover:border-violet-500/50 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-[rgb(var(--text-primary))] font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItem(item.product_id, { quantity: item.quantity + 1 })
                          }
                          className="w-8 h-8 rounded-lg glass-input flex items-center justify-center text-[rgb(var(--text-secondary))] hover:border-violet-500/50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price + Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-[rgb(var(--text-primary))] font-semibold">{itemTotal}</p>
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
              <div className="glass-card-lg p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--text-secondary))]">Items ({totalItems})</span>
                    <span className="text-[rgb(var(--text-primary))]">{formattedTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--text-secondary))]">Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="border-t border-[rgba(var(--glass-border))] pt-3 flex justify-between">
                    <span className="text-[rgb(var(--text-primary))] font-semibold">Total</span>
                    <span className="text-[rgb(var(--text-primary))] font-bold text-lg">{formattedTotal}</span>
                  </div>
                </div>

                <button
                  className="btn-accent w-full py-3 rounded-xl font-medium"
                  onClick={() => alert("Checkout functionality coming soon!")}
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/products"
                  className="block text-center text-sm text-violet-400 hover:text-violet-300 mt-4 transition-colors"
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
