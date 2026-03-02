"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";

export default function LoginPage() {
  const { login, isLoading, error, isAuthenticated, hydrate, clearError } =
    useAuthStore();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      // Error is set in the store
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #E8E8E4",
    borderRadius: "8px",
    fontSize: "15px",
    color: "#1a1a1a",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    minHeight: "48px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#FAFAF8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Left Panel — Editorial (hidden on mobile, shown on lg+) */}
      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          background: "#1a1a1a",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(184,134,11,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(184,134,11,0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Gold accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 64,
            width: "2px",
            height: "40%",
            background: "linear-gradient(to bottom, #B8860B, transparent)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                background: "rgba(250,250,248,0.97)",
                borderRadius: 12,
                padding: "10px 18px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <img
                src="/fitview.png"
                alt="FitView AI"
                style={{ height: 44, width: "auto", objectFit: "contain", maxWidth: "140px" }}
              />
            </div>
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "48px",
              fontWeight: 700,
              color: "#FAFAF8",
              lineHeight: 1.15,
              marginBottom: "24px",
            }}
          >
            Dress with
            <br />
            <span style={{ color: "#B8860B" }}>Confidence.</span>
          </h2>
          <p
            style={{
              color: "rgba(250,250,248,0.5)",
              fontSize: "15px",
              lineHeight: 1.7,
              maxWidth: "320px",
            }}
          >
            Experience India&apos;s most intelligent virtual try-on platform. See
            every garment on models that match your style.
          </p>
          {/* Decorative line */}
          <div
            style={{
              marginTop: "48px",
              width: "48px",
              height: "1px",
              background: "#B8860B",
            }}
          />
        </div>
      </div>

      {/* Right Panel — Form (full width on mobile, fixed width on lg+) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 40px",
          background: "#FAFAF8",
          overflowY: "auto",
        }}
        className="lg:flex-none lg:w-[520px]"
      >
        <div style={{ maxWidth: "440px", width: "100%", margin: "0 auto" }}>
          {/* Logo */}
          <div style={{ marginBottom: "48px" }}>
            <div style={{ marginBottom: "20px" }}>
              <img
                src="/fitview.png"
                alt="FitView AI"
                style={{ height: 44, width: "auto", objectFit: "contain", maxWidth: "140px" }}
              />
            </div>
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
              Welcome Back
            </h1>
            <p
              style={{
                color: "#6b6b6b",
                fontSize: "15px",
                marginTop: "8px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Sign in to your FitView AI account
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            {error && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "20px",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1a1a1a",
                  marginBottom: "8px",
                  letterSpacing: "0.3px",
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#B8860B";
                  e.target.style.boxShadow = "0 0 0 3px rgba(184,134,11,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8E8E4";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1a1a1a",
                  marginBottom: "8px",
                  letterSpacing: "0.3px",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter your password"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#B8860B";
                  e.target.style.boxShadow = "0 0 0 3px rgba(184,134,11,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8E8E4";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-ink"
              style={{
                width: "100%",
                padding: "16px 24px",
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                minHeight: "52px",
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
                borderRadius: "8px",
              }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p
            style={{
              marginTop: "32px",
              textAlign: "center",
              fontSize: "14px",
              color: "#6b6b6b",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{
                color: "#1a1a1a",
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Create one
            </Link>
          </p>

          {/* Decorative bottom line */}
          <div
            style={{
              marginTop: "48px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#E8E8E4" }} />
            <span
              style={{
                color: "#B8860B",
                fontSize: "10px",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Secure Login
            </span>
            <div style={{ flex: 1, height: "1px", background: "#E8E8E4" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
