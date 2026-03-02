"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, isAuthenticated, logout, hydrate } = useAuthStore();
  const { totalItems, fetchCart } = useCartStore();
  const router = useRouter();

  const [mounted, setMounted]           = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [profileOpen, setProfileOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoHovered, setLogoHovered]   = useState(false);

  const profileRef    = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Hydrate auth + cart on mount */
  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchCart();
    }
  }, [mounted, isAuthenticated, fetchCart]);

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close profile dropdown on outside click */
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileOpen]);

  /* Focus search input when opened */
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const closeMobile = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const firstName   = user?.name?.split(" ")[0] ?? "";

  const navScrolledStyle: React.CSSProperties = scrolled
    ? {
        borderBottom: "1px solid #E8E8E4",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(250, 250, 248, 0.95)",
      }
    : {
        backgroundColor: "rgba(250, 250, 248, 0.98)",
      };

  return (
    <>
      {/* ── Main nav ─────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={navScrolledStyle}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop: three-column grid — Left | Center | Right */}
          <div className="hidden md:grid h-32" style={{ gridTemplateColumns: "1fr auto 1fr" }}>

            {/* LEFT — Nav links */}
            <div className="flex items-center gap-6">
              <Link href="/products"    className="nav-link">Products</Link>
              <Link href="/tryon"       className="nav-link">Try-On</Link>
              <Link href="/collections" className="nav-link">Collections</Link>
              <Link href="/about"       className="nav-link">About</Link>
            </div>

            {/* CENTER — Animated FV Logo */}
            <div className="flex items-center justify-center">
              <Link href="/" aria-label="FitView AI Home">
                <motion.div
                  initial={{ opacity: 0, scale: 0.75, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
                  onHoverStart={() => setLogoHovered(true)}
                  onHoverEnd={() => setLogoHovered(false)}
                  style={{ position: "relative", display: "inline-flex" }}
                >
                  <motion.img
                    src="/fitview.png"
                    alt="FitView AI"
                    animate={logoHovered
                      ? { scale: 1.08, rotate: [0, -3, 3, 0] }
                      : { scale: 1, rotate: 0 }
                    }
                    transition={logoHovered
                      ? { duration: 0.45, ease: "easeInOut" }
                      : { duration: 0.3, ease: "easeOut" }
                    }
                    style={{
                      height: 96,
                      width: "auto",
                      objectFit: "contain",
                      maxWidth: 260,
                      display: "block",
                    }}
                  />
                  {/* Gold shimmer ring on hover */}
                  <motion.div
                    animate={logoHovered
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.85 }
                    }
                    transition={{ duration: 0.25 }}
                    style={{
                      position: "absolute",
                      inset: -6,
                      borderRadius: 12,
                      border: "1.5px solid rgba(184,134,11,0.35)",
                      pointerEvents: "none",
                    }}
                  />
                </motion.div>
              </Link>
            </div>

            {/* RIGHT — Icons + Auth */}
            <div className="flex items-center justify-end gap-2">

              {/* Search */}
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="p-2 rounded-full transition-colors duration-200 hover:bg-[#F0ECE3]"
                aria-label="Search"
                style={{ color: "var(--ink-soft)" }}
              >
                {searchOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 rounded-full transition-colors duration-200 hover:bg-[#F0ECE3]"
                aria-label="Wishlist"
                style={{ color: "var(--ink-soft)" }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-full transition-colors duration-200 hover:bg-[#F0ECE3]"
                aria-label="Cart"
                style={{ color: "var(--ink-soft)" }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {mounted && totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--ink)" }}
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {mounted && isAuthenticated ? (
                <div className="relative ml-1" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 hover:shadow-sm"
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--white)",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: "var(--ink)" }}
                    >
                      {userInitial}
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                      {firstName}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      style={{ color: "var(--muted)" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile dropdown */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border overflow-hidden z-50"
                        style={{
                          backgroundColor: "var(--white)",
                          borderColor: "var(--border)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                        }}
                      >
                        {/* User info header */}
                        <div
                          className="px-4 py-3"
                          style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--cream)" }}
                        >
                          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{user?.name}</p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{user?.email}</p>
                          <span
                            className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "rgba(184, 134, 11, 0.12)", color: "var(--gold)" }}
                          >
                            {user?.role}
                          </span>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5 space-y-0.5" role="menu">
                          <Link href="/dashboard" onClick={() => setProfileOpen(false)}
                            role="menuitem"
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors duration-150 hover:bg-[#F0ECE3]"
                            style={{ color: "var(--ink-soft)" }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                            Dashboard
                          </Link>
                          <Link href="/tryon/history" onClick={() => setProfileOpen(false)}
                            role="menuitem"
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors duration-150 hover:bg-[#F0ECE3]"
                            style={{ color: "var(--ink-soft)" }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Try-On History
                          </Link>
                          {user?.role === "retailer" && (
                            <Link href="/retailer" onClick={() => setProfileOpen(false)}
                              role="menuitem"
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors duration-150 hover:bg-[#F0ECE3]"
                              style={{ color: "var(--ink-soft)" }}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              Retailer Panel
                            </Link>
                          )}
                          <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                          <button
                            onClick={handleLogout}
                            role="menuitem"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors duration-150 hover:bg-red-50"
                            style={{ color: "var(--red)" }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                mounted && (
                  <div className="flex items-center gap-2 ml-1">
                    <Link href="/login" className="text-sm font-medium transition-colors duration-200 nav-link">
                      Login
                    </Link>
                    <Link href="/register" className="btn-ink text-sm py-2 px-5">
                      Get Started
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Mobile: logo left + cart + hamburger */}
          <div className="flex md:hidden items-center justify-between h-24">
            {/* Mobile logo — left */}
            <Link href="/" aria-label="FitView AI Home">
              <motion.img
                src="/fitview.png"
                alt="FitView AI"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ height: 64, width: "auto", objectFit: "contain", maxWidth: 180 }}
              />
            </Link>

            {/* Mobile right actions */}
            <div className="flex items-center gap-1">
              {/* Cart mobile */}
              <Link
                href="/cart"
                className="relative p-2 rounded-full transition-colors duration-200 hover:bg-[#F0ECE3]"
                aria-label="Cart"
                style={{ color: "var(--ink-soft)" }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {mounted && totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--ink)" }}
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-2 rounded-full transition-colors duration-200 hover:bg-[#F0ECE3]"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                style={{ color: "var(--ink-soft)" }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileMenuOpen ? (
                    <motion.svg
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </motion.svg>
                  ) : (
                    <motion.svg
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* ── Inline search bar ──────────────────────────────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="border-t overflow-hidden"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--white)" }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: "var(--muted)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, brands, categories..."
                    className="flex-1 bg-transparent text-sm outline-none border-none"
                    style={{ color: "var(--ink)", fontFamily: "'DM Sans', sans-serif" }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }
                    }}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} className="text-sm transition-colors duration-150" style={{ color: "var(--muted)" }}>
                      Clear
                    </button>
                  )}
                  <button type="submit" className="btn-ink text-xs py-1.5 px-4">
                    Search
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile slide-down menu ───────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden border-t overflow-hidden"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--white)" }}
            >
              {/* Mobile search */}
              <div className="px-4 pt-4 pb-2">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)" }}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: "var(--muted)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 bg-transparent text-sm outline-none border-none"
                    style={{ color: "var(--ink)", fontFamily: "'DM Sans', sans-serif" }}
                  />
                </form>
              </div>

              {/* Mobile nav links */}
              <nav className="px-4 py-2 space-y-1">
                {[
                  { href: "/products",    label: "Products" },
                  { href: "/tryon",       label: "Try-On" },
                  { href: "/collections", label: "Collections" },
                  { href: "/about",       label: "About" },
                  { href: "/wishlist",    label: "Wishlist" },
                ].map(({ href, label }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={href}
                      onClick={closeMobile}
                      className="block px-3 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150 hover:bg-[#F0ECE3]"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile auth */}
              <div className="px-4 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                {mounted && isAuthenticated ? (
                  <div className="space-y-1">
                    <div
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ backgroundColor: "var(--cream)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: "var(--ink)" }}
                      >
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{user?.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{user?.email}</p>
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={closeMobile}
                      className="block px-3 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150 hover:bg-[#F0ECE3]"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      Dashboard
                    </Link>
                    <Link href="/tryon/history" onClick={closeMobile}
                      className="block px-3 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150 hover:bg-[#F0ECE3]"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      Try-On History
                    </Link>
                    {user?.role === "retailer" && (
                      <Link href="/retailer" onClick={closeMobile}
                        className="block px-3 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150 hover:bg-[#F0ECE3]"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        Retailer Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150 hover:bg-red-50"
                      style={{ color: "var(--red)" }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={closeMobile} className="btn-outline-ink w-full text-center py-2.5">
                      Login
                    </Link>
                    <Link href="/register" onClick={closeMobile} className="btn-ink w-full text-center py-2.5">
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
