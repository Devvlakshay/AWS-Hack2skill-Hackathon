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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-950 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-2xl shadow-xl shadow-black/20 border border-gray-800 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-gray-400">
              Sign in to your FitView AI account
            </p>
          </div>

          <AuthForm
            mode="login"
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
          />

          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary-400 hover:text-primary-300 font-semibold"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
