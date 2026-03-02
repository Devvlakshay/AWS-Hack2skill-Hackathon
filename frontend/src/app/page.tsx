import Link from "next/link";

// ─── Static Data ──────────────────────────────────────────────
const STATS = [
  { value: "10K+", label: "Customers" },
  { value: "500+", label: "Brands" },
  { value: "98%",  label: "Accuracy" },
  { value: "<10s", label: "Generation" },
];

const STEPS = [
  {
    num: "01",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "Choose a Model",
    desc: "Pick from brand-curated models that match your body type, skin tone, and measurements.",
  },
  {
    num: "02",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
    title: "Select Your Outfit",
    desc: "Browse 500+ Indian brands — sarees, kurtas, westernwear, festive, casual, and more.",
  },
  {
    num: "03",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "See the Magic",
    desc: "AI generates a photorealistic try-on image in under 10 seconds. Compare, save, and shop.",
  },
];

const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Ivory Embroidered Kurta",
    brand: "Fabindia",
    price: "₹2,490",
    originalPrice: "₹3,200",
    badge: "Sale",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=533&fit=crop&auto=format",
  },
  {
    id: "2",
    name: "Silk Anarkali Suit",
    brand: "BIBA",
    price: "₹4,999",
    originalPrice: null,
    badge: "New",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=533&fit=crop&auto=format",
  },
  {
    id: "3",
    name: "Floral Wrap Dress",
    brand: "W",
    price: "₹1,799",
    originalPrice: "₹2,399",
    badge: "Sale",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=533&fit=crop&auto=format",
  },
  {
    id: "4",
    name: "Bandhani Lehenga",
    brand: "Manyavar",
    price: "₹8,499",
    originalPrice: null,
    badge: "New",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=533&fit=crop&auto=format",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "Mumbai",
    avatar: "PS",
    rating: 5,
    text: "I was skeptical at first, but the AI try-on is incredibly accurate. I ordered a silk saree after seeing myself in it virtually — perfect fit, perfect colour. Saved me two return trips!",
  },
  {
    name: "Ananya Krishnan",
    city: "Bangalore",
    avatar: "AK",
    rating: 5,
    text: "Finally a platform that understands Indian clothing. The way it drapes the lehenga on the model is so realistic. My entire Diwali wardrobe was planned using FitView AI.",
  },
  {
    name: "Meera Nair",
    city: "Delhi",
    avatar: "MN",
    rating: 5,
    text: "The accuracy blew me away. I have a plus-size body and finding the right fit online was always a struggle. With FitView AI I can see exactly how a kurta will look before buying.",
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    label: "Free Returns",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: "Secure Payment",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    label: "Easy Try-On",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
      </svg>
    ),
    label: "24/7 Support",
  },
];

const BRANDS = [
  "FABINDIA", "BIBA", "W", "MANYAVAR", "MYNTRA",
  "ZARA INDIA", "H&M INDIA", "NYKAA FASHION",
  "FABINDIA", "BIBA", "W", "MANYAVAR", "MYNTRA",
  "ZARA INDIA", "H&M INDIA", "NYKAA FASHION",
];

// ─── Page ──────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ backgroundColor: "#FAFAF8", color: "#1a1a1a", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-section">
        {/* Left: text content */}
        <div className="hero-left">
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                display: "inline-block",
                border: "1px solid #B8860B",
                color: "#B8860B",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "0.35rem 0.9rem",
                borderRadius: "999px",
                backgroundColor: "rgba(184,134,11,0.06)",
              }}
            >
              AI for Bharat 2025
            </span>
          </div>

          {/* H1 */}
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.2rem, 5vw, 4.2rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            Discover Your{" "}
            <em
              style={{
                fontStyle: "italic",
                color: "#B8860B",
                display: "block",
              }}
            >
              Perfect
            </em>{" "}
            Look
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.7,
              color: "#555",
              maxWidth: "440px",
              margin: 0,
            }}
          >
            India&apos;s first AI-powered virtual try-on platform. See any outfit on a realistic model before you buy — no fitting room needed.
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "#1a1a1a",
                color: "#FAFAF8",
                fontWeight: 600,
                fontSize: "0.95rem",
                padding: "0.85rem 2rem",
                borderRadius: "999px",
                textDecoration: "none",
                letterSpacing: "0.02em",
                transition: "background 0.2s",
                border: "1.5px solid #1a1a1a",
                whiteSpace: "nowrap",
              }}
            >
              Shop Now
            </Link>
            <Link
              href="/tryon"
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "transparent",
                color: "#1a1a1a",
                fontWeight: 600,
                fontSize: "0.95rem",
                padding: "0.85rem 2rem",
                borderRadius: "999px",
                textDecoration: "none",
                letterSpacing: "0.02em",
                border: "1.5px solid #1a1a1a",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Try It Free
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "1.75rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #E8E8E4",
              flexWrap: "wrap",
            }}
          >
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#B8860B",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {value}
                </p>
                <p style={{ fontSize: "0.7rem", color: "#888", margin: "0.25rem 0 0", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: hero image — hidden on mobile */}
        <div className="hero-right">
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "440px",
              borderRadius: "24px",
              overflow: "hidden",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop&auto=format"
              alt="Fashion model wearing Indian attire"
              style={{
                width: "100%",
                aspectRatio: "4/5",
                objectFit: "cover",
                display: "block",
                borderRadius: "24px",
              }}
            />
            {/* Floating card */}
            <div
              style={{
                position: "absolute",
                bottom: "1.5rem",
                left: "1rem",
                right: "1rem",
                backgroundColor: "rgba(250, 250, 248, 0.95)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: "16px",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid rgba(255,255,255,0.7)",
              }}
            >
              <div>
                <p style={{ fontSize: "0.65rem", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                  AI Try-On Live
                </p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#1a1a1a", margin: "0.15rem 0 0" }}>
                  Silk Kurta Set
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#B8860B", margin: 0 }}>
                  ₹3,499
                </p>
                <p style={{ fontSize: "0.72rem", color: "#888", textDecoration: "line-through", margin: "0.1rem 0 0" }}>
                  ₹4,999
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Marquee ─────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid #E8E8E4",
          borderBottom: "1px solid #E8E8E4",
          padding: "1.1rem 0",
          overflow: "hidden",
          backgroundColor: "#FAFAF8",
        }}
      >
        <div className="marquee-container">
          <div
            className="marquee-content"
            style={{ gap: "0" }}
            aria-hidden="true"
          >
            {BRANDS.map((brand, i) => (
              <span
                key={`${brand}-${i}`}
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: i % 2 === 0 ? "#1a1a1a" : "#888",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  padding: "0 1.5rem",
                }}
              >
                {brand}
                <span style={{ marginLeft: "1.5rem", color: "#C8C8C4" }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section
        style={{
          padding: "5rem 1.25rem 6rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#B8860B",
              marginBottom: "1rem",
            }}
          >
            How It Works
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              fontWeight: 700,
              color: "#1a1a1a",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Three steps to your perfect style
          </h2>
        </div>

        <div className="steps-grid">
          {STEPS.map(({ num, icon, title, desc }) => (
            <div
              key={num}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E8E4",
                borderRadius: "20px",
                padding: "2.25rem 1.75rem",
                position: "relative",
                transition: "box-shadow 0.25s, transform 0.25s",
              }}
              className="step-card"
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  backgroundColor: "rgba(184,134,11,0.08)",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#B8860B",
                  marginBottom: "1.5rem",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: "#C0C0BC",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                  margin: "0 0 0.5rem",
                }}
              >
                {num}
              </p>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  marginBottom: "0.75rem",
                  marginTop: "0.35rem",
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────── */}
      <section
        style={{
          padding: "5rem 1.25rem 6rem",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "2.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#B8860B",
                  marginBottom: "0.5rem",
                }}
              >
                Handpicked
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  margin: 0,
                }}
              >
                Curated For You
              </h2>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              {["New Arrivals", "Best Sellers"].map((tab, i) => (
                <button
                  key={tab}
                  style={{
                    padding: "0.45rem 1.1rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    border: "1.5px solid",
                    borderColor: i === 0 ? "#1a1a1a" : "#E8E8E4",
                    backgroundColor: i === 0 ? "#1a1a1a" : "transparent",
                    color: i === 0 ? "#FAFAF8" : "#888",
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Cards grid: 4-col desktop, 2-col tablet, 1-col mobile */}
          <div className="products-grid">
            {FEATURED_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                href="/products"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    backgroundColor: "#FAFAF8",
                    border: "1px solid #E8E8E4",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "box-shadow 0.25s, transform 0.25s",
                  }}
                  className="product-card"
                >
                  {/* Image */}
                  <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.35s ease",
                      }}
                      className="product-img"
                    />
                    {/* Badge */}
                    <span
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        left: "0.75rem",
                        backgroundColor: product.badge === "Sale" ? "#E53935" : "#1a1a1a",
                        color: "#fff",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        padding: "0.25rem 0.65rem",
                        borderRadius: "999px",
                        textTransform: "uppercase",
                      }}
                    >
                      {product.badge}
                    </span>
                    {/* Hover overlay */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "0.75rem",
                        background: "linear-gradient(to top, rgba(26,26,26,0.7) 0%, transparent 100%)",
                        display: "flex",
                        opacity: 0,
                        transition: "opacity 0.25s",
                      }}
                      className="product-overlay"
                    >
                      <span
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "center",
                          backgroundColor: "#FAFAF8",
                          color: "#1a1a1a",
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          padding: "0.6rem 0",
                          borderRadius: "999px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Quick Add
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ padding: "0.9rem 1rem 1.1rem" }}>
                    <p style={{ fontSize: "0.68rem", color: "#B8860B", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 0.3rem" }}>
                      {product.brand}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a1a", margin: "0 0 0.45rem", lineHeight: 1.3 }}>
                      {product.name}
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "#1a1a1a",
                        }}
                      >
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span style={{ fontSize: "0.8rem", color: "#aaa", textDecoration: "line-through" }}>
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View all */}
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link
              href="/products"
              style={{
                display: "inline-block",
                border: "1.5px solid #1a1a1a",
                color: "#1a1a1a",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "0.8rem 2.2rem",
                borderRadius: "999px",
                textDecoration: "none",
                letterSpacing: "0.04em",
                transition: "all 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI Try-On Promo ───────────────────────────────────── */}
      <section
        style={{
          padding: "5rem 1.25rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div className="promo-grid">
          {/* Dark card */}
          <div
            style={{
              position: "relative",
              borderRadius: "20px",
              overflow: "hidden",
              minHeight: "360px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "2.25rem",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=700&h=500&fit=crop&auto=format"
              alt="AI Try-On feature"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(10,10,10,0.88) 40%, rgba(10,10,10,0.25) 100%)",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: "#B8860B",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                AI Powered
              </p>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)",
                  fontWeight: 700,
                  color: "#FAFAF8",
                  marginBottom: "0.6rem",
                  lineHeight: 1.2,
                  marginTop: 0,
                }}
              >
                Try Before You Buy
              </h3>
              <p style={{ fontSize: "0.88rem", color: "rgba(250,250,248,0.75)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                Experience AI virtual try-on and shop with total confidence. See every garment on a model before you commit.
              </p>
              <Link
                href="/tryon"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: "#B8860B",
                  color: "#FAFAF8",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  padding: "0.7rem 1.5rem",
                  borderRadius: "999px",
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                Start Try-On
                <span style={{ fontSize: "1rem" }}>→</span>
              </Link>
            </div>
          </div>

          {/* Cream card */}
          <div
            style={{
              position: "relative",
              borderRadius: "20px",
              overflow: "hidden",
              minHeight: "360px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "2.25rem",
              backgroundColor: "#F5F0E8",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&h=500&fit=crop&auto=format"
              alt="Indian Brands Collection"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.35,
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: "#B8860B",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                Curated Selection
              </p>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  marginBottom: "0.6rem",
                  lineHeight: 1.2,
                  marginTop: 0,
                }}
              >
                500+ Indian Brands
              </h3>
              <p style={{ fontSize: "0.88rem", color: "#555", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                From Fabindia to BIBA — India&apos;s finest fashion, all in one place. Discover sarees, kurtas, lehengas, and more.
              </p>
              <Link
                href="/products"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: "#1a1a1a",
                  color: "#FAFAF8",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  padding: "0.7rem 1.5rem",
                  borderRadius: "999px",
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                Explore Collection
                <span style={{ fontSize: "1rem" }}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Strip ────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid #E8E8E4",
          borderBottom: "1px solid #E8E8E4",
          backgroundColor: "#FFFFFF",
          padding: "1.75rem 1.25rem",
        }}
      >
        <div className="features-strip">
          {FEATURES.map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: "#1a1a1a",
              }}
            >
              <span style={{ color: "#B8860B", display: "flex", flexShrink: 0 }}>{icon}</span>
              <span style={{ fontWeight: 600, fontSize: "0.88rem", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section
        style={{
          padding: "6rem 1.25rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#B8860B",
              marginBottom: "1rem",
            }}
          >
            Customer Love
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.7rem, 3vw, 2.6rem)",
              fontWeight: 700,
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            What Our Customers Say
          </h2>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map(({ name, city, avatar, rating, text }) => (
            <div
              key={name}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E8E4",
                borderRadius: "20px",
                padding: "1.75rem",
              }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1.1rem" }}>
                {Array.from({ length: rating }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#B8860B">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#444",
                  lineHeight: 1.75,
                  marginBottom: "1.25rem",
                  fontStyle: "italic",
                  margin: "0 0 1.25rem",
                }}
              >
                &ldquo;{text}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(184,134,11,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "#B8860B",
                    flexShrink: 0,
                  }}
                >
                  {avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a1a", margin: 0 }}>{name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#888", margin: "0.1rem 0 0" }}>{city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────── */}
      <section style={{ padding: "0 1.25rem 5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: "24px",
            padding: "3.5rem 2rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#B8860B",
              marginBottom: "1rem",
            }}
          >
            Newsletter
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#FAFAF8",
              marginBottom: "0.75rem",
              marginTop: 0,
            }}
          >
            Stay in Style
          </h2>
          <p style={{ color: "rgba(250,250,248,0.6)", fontSize: "0.92rem", marginBottom: "2rem", maxWidth: "440px", margin: "0 auto 2rem" }}>
            Get the latest trends, exclusive drops, and AI try-on tips delivered to your inbox.
          </p>
          <form
            action="#"
            className="newsletter-form"
          >
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "0.85rem 1.25rem",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "#FAFAF8",
                fontSize: "0.9rem",
                outline: "none",
                width: "100%",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.85rem 1.75rem",
                borderRadius: "999px",
                backgroundColor: "#B8860B",
                color: "#FAFAF8",
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                fontFamily: "'DM Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: "#1a1a1a",
          color: "rgba(250,250,248,0.7)",
          padding: "3rem 1.25rem 2.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          <div className="footer-top">
            {/* Logo */}
            <div>
              <div
                style={{
                  background: "rgba(250,250,248,0.97)",
                  borderRadius: 12,
                  padding: "8px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <img
                  src="/fitview.png"
                  alt="FitView AI"
                  style={{ height: 44, width: "auto", objectFit: "contain" }}
                />
              </div>
            </div>

            {/* Links */}
            <nav className="footer-links">
              {[
                { label: "Products",    href: "/products" },
                { label: "Try-On",      href: "/tryon" },
                { label: "Collections", href: "/collections" },
                { label: "Login",       href: "/login" },
                { label: "Retailer",    href: "/retailer" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    color: "rgba(250,250,248,0.6)",
                    textDecoration: "none",
                    fontSize: "0.88rem",
                    fontWeight: 500,
                    transition: "color 0.2s",
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

          {/* Copyright */}
          <p style={{ fontSize: "0.78rem", color: "rgba(250,250,248,0.35)", textAlign: "center", margin: 0 }}>
            © 2025 FitView AI — AI for Bharat 2025 &nbsp;|&nbsp; Built with love for Indian Retail
          </p>
        </div>
      </footer>

      {/* ── Responsive + hover styles ─────────────────────────── */}
      <style>{`
        /* ── Hero layout ── */
        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: stretch;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.25rem;
          min-height: 88vh;
        }
        .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 5rem 3rem 5rem 0;
          gap: 1.5rem;
        }
        .hero-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 0 4rem 2rem;
        }

        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr;
            min-height: auto;
            padding: 0 1rem;
          }
          .hero-left {
            padding: 3rem 0 2.5rem;
            gap: 1.25rem;
          }
          .hero-right {
            display: none;
          }
        }

        /* ── Steps grid: 3-col desktop → 1-col mobile ── */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 860px) {
          .steps-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── Products: 4-col desktop, 2-col tablet, 1-col mobile ── */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.1rem;
        }
        @media (max-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── Promo: 2-col desktop, 1-col mobile ── */
        .promo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 640px) {
          .promo-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── Features strip: 4-col desktop, 2-col mobile ── */
        .features-strip {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          align-items: center;
          gap: 1.25rem;
          justify-items: center;
        }
        @media (max-width: 640px) {
          .features-strip {
            grid-template-columns: repeat(2, 1fr);
            justify-items: start;
          }
        }

        /* ── Testimonials: 3-col desktop, 1-col mobile ── */
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 900px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── Newsletter form: row desktop, col mobile ── */
        .newsletter-form {
          display: flex;
          flex-direction: row;
          gap: 0.75rem;
          justify-content: center;
          max-width: 480px;
          margin: 0 auto;
        }
        @media (max-width: 520px) {
          .newsletter-form {
            flex-direction: column;
            align-items: stretch;
          }
        }

        /* ── Footer top row ── */
        .footer-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .footer-links {
          display: flex;
          gap: 1.75rem;
          flex-wrap: wrap;
        }
        @media (max-width: 480px) {
          .footer-top {
            flex-direction: column;
            align-items: flex-start;
          }
          .footer-links {
            gap: 1rem 1.5rem;
          }
        }

        /* ── Product card hover effects ── */
        .step-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          transform: translateY(-3px);
        }
        .product-card:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,0.10);
          transform: translateY(-4px);
        }
        .product-card:hover .product-img {
          transform: scale(1.04);
        }
        .product-card:hover .product-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
