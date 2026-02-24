"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";

export default function DashboardPage() {
  const { user, isAuthenticated, hydrate, fetchMe, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchMe();
  }, [isAuthenticated, router, fetchMe]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const roleConfig: Record<string, { label: string; color: string; features: string[] }> = {
    customer: {
      label: "Customer",
      color: "bg-green-100 text-green-700",
      features: [
        "Browse product catalog",
        "Virtual try-on with AI",
        "Get size recommendations",
        "Save favorites and wishlist",
      ],
    },
    retailer: {
      label: "Retailer",
      color: "bg-blue-100 text-blue-700",
      features: [
        "Upload product catalog",
        "Manage brand models",
        "View analytics dashboard",
        "Track try-on metrics",
      ],
    },
    admin: {
      label: "Admin",
      color: "bg-purple-100 text-purple-700",
      features: [
        "Manage all users",
        "Platform-wide analytics",
        "System configuration",
        "Content moderation",
      ],
    },
  };

  const config = roleConfig[user.role] || roleConfig.customer;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name}
              </h1>
              <p className="mt-1 text-gray-500">{user.email}</p>
            </div>
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${config.color} self-start`}
            >
              {config.label}
            </span>
          </div>
        </div>

        {/* Role-specific Quick Actions */}
        {user.role === "retailer" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Link
              href="/retailer"
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-sm"
            >
              <h3 className="font-semibold text-lg">Retailer Dashboard</h3>
              <p className="text-indigo-200 text-sm mt-1">Overview of your products and models</p>
            </Link>
            <Link
              href="/retailer/products"
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
            >
              <h3 className="font-semibold text-lg">Manage Products</h3>
              <p className="text-blue-200 text-sm mt-1">Add, edit, and manage your catalog</p>
            </Link>
            <Link
              href="/retailer/models"
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-6 hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm"
            >
              <h3 className="font-semibold text-lg">Manage Models</h3>
              <p className="text-emerald-200 text-sm mt-1">Upload and manage fashion models</p>
            </Link>
          </div>
        )}

        {user.role === "customer" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link
              href="/products"
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-sm"
            >
              <h3 className="font-semibold text-lg">Browse Products</h3>
              <p className="text-indigo-200 text-sm mt-1">Explore our curated clothing collection</p>
            </Link>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-lg">Virtual Try-On</h3>
              <p className="text-gray-500 text-sm mt-1">Coming soon in Phase 3</p>
            </div>
          </div>
        )}

        {/* User Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Account Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Full Name</dt>
                <dd className="text-gray-900 font-medium">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-gray-900 font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Role</dt>
                <dd className="text-gray-900 font-medium capitalize">
                  {user.role}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Member Since</dt>
                <dd className="text-gray-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Features Available */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Available Features
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Features available for your role. More coming in future updates.
            </p>
            <ul className="space-y-3">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    &#10003;
                  </span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
