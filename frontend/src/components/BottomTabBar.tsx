"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";

// ─── Icons ────────────────────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.75}
      style={{ color: active ? "#B8860B" : "#9CA3AF" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function ShopIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.75}
      style={{ color: active ? "#B8860B" : "#9CA3AF" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      style={{ color: "#FAFAF8" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

function CartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.75}
      style={{ color: active ? "#B8860B" : "#9CA3AF" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.75}
      style={{ color: active ? "#B8860B" : "#9CA3AF" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

// ─── Tab link style helper ─────────────────────────────────────
const TAB_LINK_STYLE: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "3px",
  textDecoration: "none",
  // Each tab handles its own safe-area padding via paddingBottom
  paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))",
  paddingTop: "8px",
  minHeight: "100%",
};

const TAB_LABEL_STYLE_BASE: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.02em",
  fontFamily: "'DM Sans', sans-serif",
};

// ─── Component ────────────────────────────────────────────────
export default function BottomTabBar() {
  const pathname = usePathname();
  const { totalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const profileHref = isAuthenticated ? "/dashboard" : "/login";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="sm:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #E8E8E4",
        // Base 64px tall; safe-area extends it beyond that on notched iPhones
        height: "calc(64px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        alignItems: "stretch",
        boxShadow: "0 -2px 16px rgba(0,0,0,0.06)",
        // overflow must be visible so the elevated center button can protrude upward
        overflow: "visible",
      }}
    >
      {/* Home */}
      <Link
        href="/"
        style={TAB_LINK_STYLE}
      >
        <HomeIcon active={isActive("/")} />
        <span
          style={{
            ...TAB_LABEL_STYLE_BASE,
            color: isActive("/") ? "#B8860B" : "#9CA3AF",
          }}
        >
          Home
        </span>
      </Link>

      {/* Shop */}
      <Link
        href="/products"
        style={TAB_LINK_STYLE}
      >
        <ShopIcon active={isActive("/products")} />
        <span
          style={{
            ...TAB_LABEL_STYLE_BASE,
            color: isActive("/products") ? "#B8860B" : "#9CA3AF",
          }}
        >
          Shop
        </span>
      </Link>

      {/* Try-On — elevated center button */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          // Position the circle so it sits 20px above the nav bar top edge
          justifyContent: "flex-start",
          paddingTop: "0",
          paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))",
          // Pull the entire slot upward so the circle clears the bar
          marginTop: "-20px",
          // Allow the elevated circle to render above nav
          overflow: "visible",
          position: "relative",
        }}
      >
        <Link
          href="/tryon"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              backgroundColor: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(26,26,26,0.3)",
              // White ring to separate from bar background
              border: "3px solid #FFFFFF",
              flexShrink: 0,
            }}
          >
            <SparklesIcon />
          </div>
          <span
            style={{
              ...TAB_LABEL_STYLE_BASE,
              color: isActive("/tryon") ? "#B8860B" : "#9CA3AF",
              marginTop: "2px",
            }}
          >
            Try-On
          </span>
        </Link>
      </div>

      {/* Cart */}
      <Link
        href="/cart"
        style={{
          ...TAB_LINK_STYLE,
          position: "relative",
        }}
      >
        <div style={{ position: "relative" }}>
          <CartIcon active={isActive("/cart")} />
          {totalItems > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-7px",
                backgroundColor: "#E53935",
                color: "#fff",
                fontSize: "9px",
                fontWeight: 700,
                minWidth: "16px",
                height: "16px",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
                lineHeight: 1,
                border: "2px solid #FFFFFF",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </div>
        <span
          style={{
            ...TAB_LABEL_STYLE_BASE,
            color: isActive("/cart") ? "#B8860B" : "#9CA3AF",
          }}
        >
          Cart
        </span>
      </Link>

      {/* Profile */}
      <Link
        href={profileHref}
        style={TAB_LINK_STYLE}
      >
        <ProfileIcon active={isActive("/dashboard") || isActive("/login")} />
        <span
          style={{
            ...TAB_LABEL_STYLE_BASE,
            color:
              isActive("/dashboard") || isActive("/login")
                ? "#B8860B"
                : "#9CA3AF",
          }}
        >
          Profile
        </span>
      </Link>
    </nav>
  );
}
