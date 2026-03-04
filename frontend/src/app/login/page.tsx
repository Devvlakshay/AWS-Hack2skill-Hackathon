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

          {/* OR divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "24px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#E8E8E4" }} />
            <span style={{ color: "#6b6b6b", fontSize: "13px" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#E8E8E4" }} />
          </div>

          {/* Sign in with Amazon */}
          <button
            type="button"
            onClick={() => {
              const clientId = process.env.NEXT_PUBLIC_LWA_CLIENT_ID;
              const redirectUri = `${window.location.origin}/auth/amazon/callback`;
              const scope = "profile";
              window.location.href =
                `https://www.amazon.com/ap/oa?client_id=${clientId}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
            }}
            style={{
              width: "100%",
              padding: "14px 24px",
              fontSize: "15px",
              fontWeight: 600,
              minHeight: "52px",
              borderRadius: "8px",
              border: "1.5px solid #E8E8E4",
              background: "#FFD814",
              color: "#0F1111",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontFamily: "'DM Sans', sans-serif",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F7CA00")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#FFD814")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705a.66.66 0 01-.753.077c-1.06-.878-1.25-1.284-1.828-2.12-1.748 1.784-2.986 2.317-5.249 2.317-2.68 0-4.764-1.653-4.764-4.96 0-2.583 1.4-4.34 3.392-5.2 1.726-.762 4.138-.897 5.98-1.107v-.413c0-.762.059-1.663-.389-2.32-.389-.59-1.136-.834-1.795-.834-1.22 0-2.306.626-2.572 1.921-.054.29-.267.574-.559.588l-3.134-.338c-.263-.059-.555-.271-.481-.674C5.808 1.593 8.869.5 11.622.5c1.4 0 3.228.372 4.331 1.432 1.4 1.307 1.267 3.05 1.267 4.948v4.483c0 1.348.559 1.94 1.084 2.667.185.26.226.574-.01.768-.59.494-1.64 1.413-2.217 1.929l-.067.068z" fill="#0F1111"/>
              <path d="M21.727 18.415C19.076 20.488 15.145 21.6 11.747 21.6c-4.793 0-9.11-1.773-12.375-4.724-.256-.232-.028-.548.281-.368 3.524 2.05 7.88 3.28 12.381 3.28 3.035 0 6.372-.629 9.443-1.93.463-.2.852.304.25.557z" fill="#FF9900"/>
              <path d="M22.76 17.228c-.349-.447-2.312-.212-3.193-.107-.268.033-.309-.2-.067-.368 1.564-1.098 4.129-.781 4.428-.413.298.37-.079 2.937-1.547 4.162-.226.189-.441.088-.34-.162.331-.823 1.07-2.664.719-3.112z" fill="#FF9900"/>
            </svg>
            Sign in with Amazon
          </button>

          <p
            style={{
              marginTop: "24px",
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
