"use client";

import Link from "next/link";

const TEAM = [
  { name: "Lakshya", role: "Full-Stack Developer & AI Engineer" },
];

const TECH_STACK = [
  { label: "Frontend", items: "Next.js 15, React 19, TailwindCSS, Framer Motion" },
  { label: "Backend", items: "FastAPI, Python 3.12, JWT Auth" },
  { label: "AI Engine", items: "Proprietary Vision Models, Cloud Inference" },
  { label: "Cloud", items: "AWS S3, CloudFront CDN, EC2" },
  { label: "Database", items: "JSON Data Store, Redis Cache" },
];

const FEATURES = [
  {
    title: "AI Virtual Try-On",
    description:
      "Upload your photo or use a brand model. Our engine generates photorealistic try-on images in under 10 seconds.",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: "Multi-Garment Outfits",
    description:
      "Combine tops, bottoms, and jackets into one cohesive outfit and see how the full look comes together on your body.",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    title: "Style Variations",
    description:
      "See your outfit in different settings — casual streetwear, formal office, festive party, or traditional Indian occasions.",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    title: "Retailer Dashboard",
    description:
      "Retailers upload products and models, track try-on analytics, view conversion rates, and manage their catalog — all in one place.",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAFAF8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Hero */}
      <div
        style={{
          background: "#1a1a1a",
          padding: "80px 24px 64px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(184,134,11,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(184,134,11,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "720px", margin: "0 auto" }}>
          <div
            style={{
              color: "#B8860B",
              fontSize: "11px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            About Us
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 700,
              color: "#FAFAF8",
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Reimagining How India
            <br />
            <span style={{ color: "#B8860B" }}>Shops for Clothes</span>
          </h1>
          <p
            style={{
              color: "rgba(250,250,248,0.6)",
              fontSize: "17px",
              marginTop: "20px",
              lineHeight: 1.7,
            }}
          >
            FitView AI is a virtual try-on platform built for the Indian retail market.
            Customers pick a model, choose a garment, and see a photorealistic try-on image — all
            before buying.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "#B8860B",
                fontSize: "11px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              Our Mission
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 700,
                color: "#1a1a1a",
                margin: "0 0 16px",
                lineHeight: 1.3,
              }}
            >
              Try Before You Buy
            </h2>
            <p style={{ color: "#6b6b6b", fontSize: "15px", lineHeight: 1.8 }}>
              Online clothing returns in India exceed 30%, largely because customers can&apos;t visualize
              how a garment looks on them. FitView AI solves this by letting shoppers virtually try
              on any garment using AI — reducing returns, boosting confidence, and helping retailers
              sell smarter.
            </p>
          </div>
          <div
            style={{
              background: "#fff",
              border: "1px solid #E8E8E4",
              borderRadius: "16px",
              padding: "32px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {[
                { stat: "< 10s", label: "Try-on generation time" },
                { stat: "30%+", label: "Return rate reduction" },
                { stat: "6+", label: "Fashion models available" },
                { stat: "46+", label: "API endpoints" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#B8860B",
                      minWidth: "72px",
                    }}
                  >
                    {item.stat}
                  </span>
                  <span style={{ fontSize: "14px", color: "#6b6b6b" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "#fff", borderTop: "1px solid #E8E8E4", borderBottom: "1px solid #E8E8E4" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "64px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                color: "#B8860B",
                fontSize: "11px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              Platform Features
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
              What Makes FitView Different
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "#FAFAF8",
                  border: "1px solid #E8E8E4",
                  borderRadius: "12px",
                  padding: "28px 24px",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: "rgba(184,134,11,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#B8860B",
                    marginBottom: "16px",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    marginBottom: "8px",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "13px", color: "#6b6b6b", lineHeight: 1.7 }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Pipeline */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              color: "#B8860B",
              fontSize: "11px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            How It Works
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
            The Try-On Pipeline
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {[
            { step: "01", title: "Choose", desc: "Select a brand model or upload your own photo — even a face selfie works." },
            { step: "02", title: "Pick Garments", desc: "Browse the catalog and pick one or more garments to try on." },
            { step: "03", title: "Smart Generation", desc: "Our virtual try-on engine generates a photorealistic image with your face and the selected clothes." },
            { step: "04", title: "Review & Buy", desc: "See the result, explore style variations, add to cart, and purchase with confidence." },
          ].map((s, i) => (
            <div
              key={s.step}
              style={{
                display: "flex",
                gap: "24px",
                alignItems: "flex-start",
                padding: "24px 0",
                borderBottom: i < 3 ? "1px solid #E8E8E4" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#B8860B",
                  opacity: 0.5,
                  minWidth: "48px",
                  lineHeight: 1,
                }}
              >
                {s.step}
              </span>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 6px" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#6b6b6b", lineHeight: 1.7, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ background: "#1a1a1a" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div
              style={{
                color: "#B8860B",
                fontSize: "11px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              Built With
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "32px",
                fontWeight: 700,
                color: "#FAFAF8",
                margin: 0,
              }}
            >
              Technology Stack
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {TECH_STACK.map((t) => (
              <div
                key={t.label}
                style={{
                  background: "rgba(250,250,248,0.04)",
                  border: "1px solid rgba(184,134,11,0.2)",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#B8860B",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  {t.label}
                </div>
                <p style={{ fontSize: "13px", color: "rgba(250,250,248,0.7)", lineHeight: 1.6, margin: 0 }}>
                  {t.items}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              color: "#B8860B",
              fontSize: "11px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            The Team
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
            Built for AI for Bharat 2025
          </h2>
          <p style={{ color: "#6b6b6b", fontSize: "15px", marginTop: "12px" }}>
            Professional Track &mdash; Problem Statement 01: AI for Retail, Commerce &amp; Market Intelligence
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
          {TEAM.map((member) => (
            <div
              key={member.name}
              style={{
                background: "#fff",
                border: "1px solid #E8E8E4",
                borderRadius: "12px",
                padding: "32px 40px",
                textAlign: "center",
                minWidth: "200px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #B8860B, #D4A843)",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "24px",
                  fontWeight: 700,
                }}
              >
                {member.name[0]}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 4px" }}>
                {member.name}
              </h3>
              <p style={{ fontSize: "13px", color: "#B8860B", margin: 0 }}>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            fontWeight: 700,
            color: "#FAFAF8",
            margin: "0 0 16px",
          }}
        >
          Ready to Try Before You Buy?
        </h2>
        <p style={{ color: "rgba(250,250,248,0.6)", fontSize: "15px", marginBottom: "28px" }}>
          Explore our collection and experience virtual try-on.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/products"
            style={{
              padding: "14px 32px",
              background: "#B8860B",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif",
              transition: "background 0.2s",
            }}
          >
            Browse Collection
          </Link>
          <Link
            href="/tryon"
            style={{
              padding: "14px 32px",
              background: "transparent",
              color: "#FAFAF8",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif",
              border: "1px solid rgba(250,250,248,0.3)",
              transition: "border-color 0.2s",
            }}
          >
            Try On Now
          </Link>
        </div>
      </section>
    </div>
  );
}
