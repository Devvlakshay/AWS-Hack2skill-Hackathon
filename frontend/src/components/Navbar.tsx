"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, isAuthenticated, logout, hydrate } = useAuthStore();
  const { totalItems, fetchCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchCart();
    }
  }, [mounted, isAuthenticated, fetchCart]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FV</span>
            </div>
            <span className="text-xl font-bold text-white">
              FitView <span className="text-primary-400">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center space-x-4">
            {mounted && isAuthenticated ? (
              <>
                <Link
                  href="/products"
                  className="text-gray-300 hover:text-primary-400 font-medium transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/tryon"
                  className="text-gray-300 hover:text-primary-400 font-medium transition-colors"
                >
                  Try-On
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-primary-400 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {user?.role === "retailer" && (
                  <Link
                    href="/retailer"
                    className="text-gray-300 hover:text-primary-400 font-medium transition-colors"
                  >
                    Retailer
                  </Link>
                )}

                {/* Wishlist Icon */}
                <Link
                  href="/wishlist"
                  className="relative text-gray-300 hover:text-primary-400 transition-colors p-1"
                  title="Wishlist"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>

                {/* Cart Icon with Badge */}
                <Link
                  href="/cart"
                  className="relative text-gray-300 hover:text-primary-400 transition-colors p-1"
                  title="Cart"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </Link>

                <div className="flex items-center space-x-3 ml-2 pl-4 border-l border-gray-700">
                  <span className="text-sm text-gray-400">
                    {user?.name}
                  </span>
                  <span className="text-xs bg-primary-900/50 text-primary-300 px-2 py-0.5 rounded-full capitalize">
                    {user?.role}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-red-400 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/products"
                  className="text-gray-300 hover:text-primary-400 font-medium transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-primary-400 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-800 py-3 space-y-2">
            <Link
              href="/products"
              className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            {mounted && isAuthenticated ? (
              <>
                <Link
                  href="/tryon"
                  className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Virtual Try-On
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/wishlist"
                  className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <Link
                  href="/cart"
                  className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg flex items-center justify-between"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
                {user?.role === "retailer" && (
                  <>
                    <Link
                      href="/retailer"
                      className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Retailer Dashboard
                    </Link>
                    <Link
                      href="/retailer/products"
                      className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Manage Products
                    </Link>
                    <Link
                      href="/retailer/models"
                      className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Manage Models
                    </Link>
                  </>
                )}
                <div className="px-3 py-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-400">{user?.name}</span>
                    <span className="ml-2 text-xs bg-primary-900/50 text-primary-300 px-2 py-0.5 rounded-full capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="text-sm text-red-400 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 bg-primary-600 text-white rounded-lg text-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
