"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import toast from "react-hot-toast";

export default function AmazonCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithAmazon } = useAuthStore();
  const exchangedRef = useRef(false);

  useEffect(() => {
    if (exchangedRef.current) return;
    const code = searchParams.get("code");
    if (!code) {
      toast.error("No authorization code received from Amazon");
      router.replace("/login");
      return;
    }
    exchangedRef.current = true;

    const redirectUri = `${window.location.origin}/auth/amazon/callback`;
    loginWithAmazon(code, redirectUri)
      .then(() => {
        toast.success("Signed in with Amazon!");
        router.replace("/dashboard");
      })
      .catch(() => {
        toast.error("Amazon sign-in failed. Please try again.");
        router.replace("/login");
      });
  }, [searchParams, loginWithAmazon, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAFAF8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #E8E8E4",
            borderTopColor: "#B8860B",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 20px",
          }}
        />
        <p style={{ color: "#6b6b6b", fontSize: "15px" }}>
          Signing in with Amazon...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
