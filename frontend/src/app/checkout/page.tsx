"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";

type Step = "address" | "payment" | "confirm";
type PaymentMethod = "upi" | "card" | "cod";

const STEPS: Step[] = ["address", "payment", "confirm"];
const STEP_LABELS: Record<Step, string> = {
  address: "Delivery",
  payment: "Payment",
  confirm: "Confirm",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clear } = useCartStore();
  const { user, isAuthenticated, hydrate } = useAuthStore();

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const [step, setStep] = useState<Step>("address");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(totalPrice || 0);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setOrderPlaced(true);
    clear();
    setIsProcessing(false);
  };

  const inputStyle = {
    width: "100%",
    // 48px min height: padding 14px top+bottom + ~20px line height = 48px
    padding: "14px 16px",
    border: "1.5px solid #E8E8E4",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#1a1a1a",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box" as const,
    minHeight: "48px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "8px",
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
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
          padding: "24px",
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
            Login required
          </h2>
          <p style={{ color: "#6b6b6b", fontSize: "14px", marginBottom: "24px" }}>
            Please sign in to proceed to checkout.
          </p>
          <Link
            href="/login"
            className="btn-ink"
            style={{ display: "inline-block", padding: "12px 32px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}
          >
            Login to Checkout
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FAFAF8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #E8E8E4",
            borderRadius: "20px",
            padding: "64px 48px",
            textAlign: "center",
            maxWidth: "440px",
            width: "100%",
          }}
        >
          {/* Success icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 32px",
              borderRadius: "50%",
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg style={{ width: "36px", height: "36px", color: "#15803D" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
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
            Order Confirmed
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "32px",
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: "12px",
            }}
          >
            Order Placed!
          </h1>
          <p style={{ color: "#6b6b6b", fontSize: "15px", lineHeight: 1.7, marginBottom: "32px" }}>
            Thank you for your order. You&apos;ll receive a confirmation shortly.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="btn-ink"
            style={{
              width: "100%",
              padding: "14px 24px",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            Continue Shopping
          </button>
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
        paddingTop: "40px",
        paddingLeft: "24px",
        paddingRight: "24px",
        // 96px bottom on mobile clears BottomTabBar, overridden to 40px on sm+
        paddingBottom: "96px",
      }}
      className="sm:!pb-10"
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b6b6b",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: "16px",
              padding: 0,
            }}
          >
            <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
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
            Secure Checkout
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "36px",
              fontWeight: 700,
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            Checkout
          </h1>
        </div>

        {/* Progress Steps */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    transition: "all 0.3s",
                    background:
                      STEPS.indexOf(step) > i
                        ? "#15803D"
                        : step === s
                        ? "#1a1a1a"
                        : "#fff",
                    color:
                      STEPS.indexOf(step) > i
                        ? "#fff"
                        : step === s
                        ? "#FAFAF8"
                        : "#6b6b6b",
                    border:
                      STEPS.indexOf(step) > i
                        ? "2px solid #15803D"
                        : step === s
                        ? "2px solid #1a1a1a"
                        : "2px solid #E8E8E4",
                  }}
                >
                  {STEPS.indexOf(step) > i ? (
                    <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: step === s ? 700 : 400,
                    color: step === s ? "#1a1a1a" : "#6b6b6b",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                  className="hidden sm:inline"
                >
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    margin: "0 12px",
                    background: STEPS.indexOf(step) > i ? "#15803D" : "#E8E8E4",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ gap: "32px", alignItems: "flex-start" }}
        >
          {/* Main Form */}
          <div style={{ gridColumn: "span 2" }}>

            {/* Address Step */}
            {step === "address" && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E8E8E4",
                  borderRadius: "16px",
                  padding: "32px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#1a1a1a",
                    marginBottom: "24px",
                  }}
                >
                  Delivery Address
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {(
                    [
                      { key: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
                      { key: "phone", label: "Phone Number", type: "tel", placeholder: "+91 99999 99999" },
                      { key: "address", label: "Street Address", type: "text", placeholder: "Flat/House no., Street, Area" },
                      { key: "city", label: "City", type: "text", placeholder: "City" },
                      { key: "pincode", label: "PIN Code", type: "text", placeholder: "6-digit PIN" },
                      { key: "state", label: "State", type: "text", placeholder: "State" },
                    ] as const
                  ).map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        type={type}
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={inputStyle}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#B8860B";
                          e.target.style.boxShadow = "0 0 0 3px rgba(184,134,11,0.08)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#E8E8E4";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep("payment")}
                  disabled={!form.name || !form.phone || !form.address || !form.pincode}
                  className="btn-ink"
                  style={{
                    width: "100%",
                    padding: "14px 24px",
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    marginTop: "28px",
                    opacity: (!form.name || !form.phone || !form.address || !form.pincode) ? 0.4 : 1,
                    cursor: (!form.name || !form.phone || !form.address || !form.pincode) ? "not-allowed" : "pointer",
                  }}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E8E8E4",
                  borderRadius: "16px",
                  padding: "32px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#1a1a1a",
                    marginBottom: "24px",
                  }}
                >
                  Payment Method
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(
                    [
                      { value: "upi" as const, label: "UPI / Google Pay / PhonePe", desc: "Instant payment via UPI" },
                      { value: "card" as const, label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
                      { value: "cod" as const, label: "Cash on Delivery", desc: "Pay when you receive" },
                    ]
                  ).map((method) => (
                    <label
                      key={method.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "16px 20px",
                        borderRadius: "10px",
                        // Gold border + light gold tint for selected payment method
                        border: paymentMethod === method.value ? "2px solid #B8860B" : "1.5px solid #E8E8E4",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        background: paymentMethod === method.value ? "#FAF6EE" : "#fff",
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)}
                        style={{ accentColor: "#B8860B", width: "18px", height: "18px", flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "2px" }}>
                          {method.label}
                        </p>
                        <p style={{ fontSize: "12px", color: "#6b6b6b" }}>{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
                  <button
                    onClick={() => setStep("address")}
                    className="btn-outline-ink"
                    style={{
                      flex: 1,
                      padding: "14px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("confirm")}
                    className="btn-ink"
                    style={{
                      flex: 1,
                      padding: "14px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Step */}
            {step === "confirm" && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E8E8E4",
                  borderRadius: "16px",
                  padding: "32px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#1a1a1a",
                    marginBottom: "24px",
                  }}
                >
                  Confirm Order
                </h2>

                {/* Address summary */}
                <div
                  style={{
                    background: "#F5F5F3",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "16px",
                    border: "1px solid #E8E8E4",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "#B8860B",
                      fontWeight: 600,
                      marginBottom: "10px",
                    }}
                  >
                    Delivery Address
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "4px" }}>{form.name}</p>
                  <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: "2px" }}>{form.phone}</p>
                  <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: "2px" }}>
                    {form.address}, {form.city} — {form.pincode}
                  </p>
                  <p style={{ fontSize: "13px", color: "#6b6b6b" }}>{form.state}</p>
                </div>

                {/* Payment summary */}
                <div
                  style={{
                    background: "#F5F5F3",
                    borderRadius: "10px",
                    padding: "16px 20px",
                    marginBottom: "24px",
                    border: "1px solid #E8E8E4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "#B8860B",
                      fontWeight: 600,
                    }}
                  >
                    Payment
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
                    {paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setStep("payment")}
                    className="btn-outline-ink"
                    style={{
                      flex: 1,
                      padding: "14px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="btn-gold"
                    style={{
                      flex: 1,
                      padding: "14px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                      opacity: isProcessing ? 0.7 : 1,
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <span
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.4)",
                            borderTopColor: "#fff",
                            animation: "spin 0.8s linear infinite",
                            display: "inline-block",
                          }}
                        />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order · ${formattedTotal}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #E8E8E4",
                borderRadius: "16px",
                padding: "24px",
                position: "sticky",
                top: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "11px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#B8860B",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                Order Summary
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: "#6b6b6b",
                  display: "block",
                  marginBottom: "16px",
                  marginTop: "-12px",
                }}
              >
                {items?.length ?? 0} item{(items?.length ?? 0) !== 1 ? "s" : ""}
              </span>

              {items && items.length > 0 ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      maxHeight: "240px",
                      overflowY: "auto",
                      marginBottom: "20px",
                    }}
                  >
                    {items.map((item: any, i: number) => (
                      <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "8px",
                            background: "#F5F5F3",
                            flexShrink: 0,
                            overflow: "hidden",
                            border: "1px solid #E8E8E4",
                          }}
                        >
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              marginBottom: "3px",
                            }}
                          >
                            {item.product_name}
                          </p>
                          <p style={{ fontSize: "11px", color: "#6b6b6b", marginBottom: "3px" }}>
                            Size: {item.size} · Qty: {item.quantity}
                          </p>
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#1a1a1a",
                              fontFamily: "'Playfair Display', serif",
                            }}
                          >
                            ₹{((item.product_price || 0) * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #E8E8E4",
                      paddingTop: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#6b6b6b" }}>Subtotal</span>
                      <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{formattedTotal}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#6b6b6b" }}>Delivery</span>
                      <span style={{ color: "#15803D", fontWeight: 500 }}>Free</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: "12px",
                        borderTop: "1px solid #E8E8E4",
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>Total</span>
                      <span
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                      >
                        {formattedTotal}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: "13px", color: "#6b6b6b" }}>
                  Your cart is empty.{" "}
                  <Link
                    href="/products"
                    style={{ color: "#B8860B", textDecoration: "underline", textUnderlineOffset: "2px" }}
                  >
                    Browse products
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
