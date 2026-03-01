"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import { useAuthStore } from "@/lib/store/authStore";

export default function RegisterPage() {
  const { register, isLoading, error, isAuthenticated, hydrate, clearError } =
    useAuthStore();
  const router = useRouter();

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

  const handleRegister = async (data: {
    name?: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    try {
      await register(
        data.name || "",
        data.email,
        data.password,
        data.role || "customer"
      );
      router.push("/dashboard");
    } catch {
      // Error is set in the store
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[rgb(var(--bg-primary))] py-12 px-4 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-[10%] right-[15%] w-[350px] h-[350px] bg-violet-600/15 rounded-full filter blur-[120px] animate-pulse" />
      <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-amber-500/10 rounded-full filter blur-[120px] animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              Create Your Account
            </h1>
            <p className="mt-2 text-[rgb(var(--text-muted))]">
              Join FitView AI and start your virtual try-on journey
            </p>
          </div>

          <AuthForm
            mode="register"
            onSubmit={handleRegister}
            isLoading={isLoading}
            error={error}
          />

          <p className="mt-6 text-center text-sm text-[rgb(var(--text-muted))]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
