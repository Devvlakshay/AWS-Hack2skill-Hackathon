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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Create Your Account
            </h1>
            <p className="mt-2 text-gray-600">
              Join FitView AI and start your virtual try-on journey
            </p>
          </div>

          <AuthForm
            mode="register"
            onSubmit={handleRegister}
            isLoading={isLoading}
            error={error}
          />

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
