"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import { useAuthStore } from "@/lib/store/authStore";

export default function LoginPage() {
  const { login, isLoading, error, isAuthenticated, hydrate, clearError } =
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

  const handleLogin = async (data: {
    email: string;
    password: string;
  }) => {
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch {
      // Error is set in the store
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[rgb(var(--bg-primary))] py-12 px-4 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-violet-600/15 rounded-full filter blur-[120px] animate-pulse" />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-amber-500/10 rounded-full filter blur-[120px] animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Welcome Back</h1>
            <p className="mt-2 text-[rgb(var(--text-muted))]">
              Sign in to your FitView AI account
            </p>
          </div>

          <AuthForm
            mode="login"
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
          />

          <p className="mt-6 text-center text-sm text-[rgb(var(--text-muted))]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
