"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SearchOverlay from "@/components/SearchOverlay";

export default function Navbar() {
  const { user, isAuthenticated, logout, hydrate } = useAuthStore();
  const { totalItems, fetchCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
    setProfileOpen(false);
    router.push("/");
  };

  return (
    <>
      <nav className="glass-navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-violet-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FV</span>
              </div>
              <span className="text-xl font-bold text-[rgb(var(--text-primary))]">
                FitView <span className="text-violet-500">AI</span>
              </span>
            </Link>

            {/* Desktop: Center search */}
            <div className="hidden sm:flex flex-1 max-w-md mx-8">
              <button
                onClick={() => setSearchOpen(true)}
                className="glass-input flex items-center gap-2 text-[rgb(var(--text-muted))] text-sm cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search products...
                <kbd className="ml-auto text-xs glass-card px-1.5 py-0.5 rounded">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            {/* Desktop: Right actions */}
            <div className="hidden sm:flex items-center gap-3">
              <ThemeToggle />

              {mounted && isAuthenticated ? (
                <>
                  {/* Wishlist */}
                  <Link
                    href="/wishlist"
                    className="p-2 rounded-xl text-[rgb(var(--text-secondary))] hover:text-violet-500 transition-colors"
                    title="Wishlist"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </Link>

                  {/* Cart */}
                  <Link
                    href="/cart"
                    className="relative p-2 rounded-xl text-[rgb(var(--text-secondary))] hover:text-violet-500 transition-colors"
                    title="Cart"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 glass-card px-3 py-1.5 hover:shadow-glow-violet transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-amber-400 flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                        {user?.name?.split(" ")[0]}
                      </span>
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-56 glass-card-lg p-2 space-y-1">
                        <div className="px-3 py-2 border-b border-[rgba(var(--glass-border))]">
                          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{user?.name}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{user?.email}</p>
                          <span className="inline-block mt-1 text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full capitalize">
                            {user?.role}
                          </span>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="block px-3 py-2 text-sm text-[rgb(var(--text-secondary))] hover:text-violet-500 rounded-lg transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/tryon/history"
                          onClick={() => setProfileOpen(false)}
                          className="block px-3 py-2 text-sm text-[rgb(var(--text-secondary))] hover:text-violet-500 rounded-lg transition-colors"
                        >
                          Try-On History
                        </Link>
                        {user?.role === "retailer" && (
                          <Link
                            href="/retailer"
                            onClick={() => setProfileOpen(false)}
                            className="block px-3 py-2 text-sm text-[rgb(var(--text-secondary))] hover:text-violet-500 rounded-lg transition-colors"
                          >
                            Retailer Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[rgb(var(--text-secondary))] hover:text-violet-500 font-medium text-sm transition-colors"
                  >
                    Login
                  </Link>
                  <Link href="/register" className="btn-primary text-sm py-2 px-4">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: Compact top bar */}
            <div className="flex sm:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-[rgb(var(--text-secondary))] hover:text-violet-500"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <Link
                href="/cart"
                className="relative p-2 rounded-xl text-[rgb(var(--text-secondary))] hover:text-violet-500"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
