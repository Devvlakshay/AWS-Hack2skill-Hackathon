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
            Sign in to view your cart
          </h2>
          <p style={{ color: "#6b6b6b", fontSize: "14px", marginBottom: "24px" }}>
            Your items are waiting for you.
          </p>
          <Link href="/login" className="btn-ink" style={{ display: "inline-block", padding: "12px 32px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
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
          maxWidth: "1100px",
          margin: "0 auto",
          paddingTop: "48px",
          paddingLeft: "24px",
          paddingRight: "24px",
          // Bottom padding: 96px on mobile (BottomTabBar 64px + 32px room), 48px on sm+
          paddingBottom: "96px",
        }}
        className="sm:!pb-12"
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "48px",
            paddingBottom: "24px",
            borderBottom: "1px solid #E8E8E4",
          }}
        >
          <div>
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
              Review
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
              Your Cart
            </h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => clear()}
              style={{
                fontSize: "12px",
                color: "#DC2626",
                background: "none",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.5px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Clear Cart
            </button>
          )}
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
                width: "80px",
                height: "80px",
                margin: "0 auto 24px",
                borderRadius: "50%",
                background: "#F5F5F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg className="w-8 h-8" style={{ color: "#B8860B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 600,
                color: "#1a1a1a",
                marginBottom: "8px",
              }}
            >
              Your cart is empty
            </p>
            <p style={{ color: "#6b6b6b", fontSize: "14px", marginBottom: "32px" }}>
              Browse our collection and add pieces you love
            </p>
            <Link
              href="/products"
              className="btn-ink"
              style={{ display: "inline-block", padding: "12px 32px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 lg:grid-cols-3"
            style={{ gap: "32px", alignItems: "flex-start" }}
          >
            {/* Cart Items */}
            <div style={{ gridColumn: "span 2" }}>
              {/* Column headers */}
              <div
                className="hidden lg:grid"
                style={{
                  gridTemplateColumns: "1fr auto",
                  padding: "0 0 12px 0",
                  marginBottom: "0",
                  borderBottom: "1px solid #E8E8E4",
                  gap: "16px",
                }}
              >
                <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#6b6b6b", fontWeight: 600 }}>
                  Product
                </span>
                <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#6b6b6b", fontWeight: 600 }}>
                  Total
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {items.map((item, idx) => {
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
                      style={{
                        display: "flex",
                        gap: "20px",
                        padding: "24px 0",
                        borderBottom: idx < items.length - 1 ? "1px solid #E8E8E4" : "none",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Product Image */}
                      <Link href={`/products/${item.product_id}`} style={{ flexShrink: 0 }}>
                        <div
                          style={{
                            width: "100px",
                            height: "120px",
                            background: "#F5F5F3",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid #E8E8E4",
                          }}
                        >
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg className="w-8 h-8" style={{ color: "#C8C8C4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Try-on image thumbnail */}
                        {item.tryon_image_url && (
                          <div style={{ marginTop: "8px" }}>
                            <p style={{ fontSize: "10px", color: "#6b6b6b", marginBottom: "4px", letterSpacing: "0.5px" }}>Try-on preview</p>
                            <div style={{ width: "100px", height: "60px", background: "#F5F5F3", borderRadius: "6px", overflow: "hidden", border: "1px solid #E8E8E4" }}>
                              <img src={item.tryon_image_url} alt="Try-on" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/products/${item.product_id}`} style={{ textDecoration: "none" }}>
                          <h3
                            style={{
                              fontSize: "15px",
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
                        <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: "4px" }}>
                          Size: <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{item.size}</span>
                        </p>
                        <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: "16px" }}>
                          Unit price: <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{itemPrice}</span>
                        </p>

                        {/* Quantity Controls — 36px min touch targets */}
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <button
                            onClick={() =>
                              item.quantity > 1
                                ? updateItem(item.product_id, { quantity: item.quantity - 1 })
                                : removeItem(item.product_id)
                            }
                            style={{
                              width: "36px",
                              height: "36px",
                              border: "1px solid #E8E8E4",
                              borderRadius: "6px 0 0 6px",
                              background: "#fff",
                              cursor: "pointer",
                              fontSize: "18px",
                              color: "#1a1a1a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "'DM Sans', sans-serif",
                              transition: "background 0.15s",
                              flexShrink: 0,
                            }}
                            aria-label="Decrease quantity"
                          >
                            &minus;
                          </button>
                          <span
                            style={{
                              width: "44px",
                              height: "36px",
                              border: "1px solid #E8E8E4",
                              borderLeft: "none",
                              borderRight: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              background: "#fff",
                              userSelect: "none",
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItem(item.product_id, { quantity: item.quantity + 1 })
                            }
                            style={{
                              width: "36px",
                              height: "36px",
                              border: "1px solid #E8E8E4",
                              borderRadius: "0 6px 6px 0",
                              background: "#fff",
                              cursor: "pointer",
                              fontSize: "18px",
                              color: "#1a1a1a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "'DM Sans', sans-serif",
                              transition: "background 0.15s",
                              flexShrink: 0,
                            }}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price + Remove */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                          alignSelf: "stretch",
                          minWidth: "80px",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#1a1a1a",
                          }}
                        >
                          {itemTotal}
                        </p>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          style={{
                            fontSize: "12px",
                            color: "#DC2626",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            letterSpacing: "0.3px",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E8E8E4",
                  borderRadius: "16px",
                  padding: "28px",
                  position: "sticky",
                  top: "24px",
                }}
              >
                <h2
                  style={{
                    fontSize: "11px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "#B8860B",
                    fontWeight: 600,
                    marginBottom: "20px",
                  }}
                >
                  Order Summary
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#6b6b6b" }}>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                    <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{formattedTotal}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#6b6b6b" }}>Shipping</span>
                    <span style={{ color: "#15803D", fontWeight: 500 }}>Free</span>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #E8E8E4",
                    paddingTop: "16px",
                    marginBottom: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "0.5px" }}>Total</span>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#1a1a1a",
                    }}
                  >
                    {formattedTotal}
                  </span>
                </div>

                <button
                  className="btn-ink"
                  style={{
                    width: "100%",
                    padding: "14px 24px",
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                  onClick={() => router.push("/checkout")}
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/products"
                  style={{
                    display: "block",
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#6b6b6b",
                    marginTop: "16px",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#B8860B")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
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
