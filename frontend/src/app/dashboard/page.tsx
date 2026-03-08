"use client";

/**
 * Dashboard Page for FitView AI.
 * Customer: stats, quick links, recent try-ons.
 * Retailer: analytics dashboard with charts.
 * Design: Luxury editorial — Playfair Display / DM Sans, cream bg, gold accent.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store/authStore";
import {
  getDashboard,
  exportCSV,
  exportReport,
  type DashboardData,
} from "@/lib/api/analytics";
import { getRetailerOrders, type Order } from "@/lib/api/orders";
import { getRetailerTryOnHistory, type TryOnSession } from "@/lib/api/tryon";

// Dynamically import Recharts components to avoid SSR issues
const AnalyticsCharts = dynamic(() => import("./AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
        border: "1px solid #E8E8E4",
        borderRadius: "16px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
        <span style={{ color: "#888888", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
          Loading charts&hellip;
        </span>
      </div>
    </div>
  ),
});

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getQuickDateRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  let from = to;
  if (preset === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    from = d.toISOString().slice(0, 10);
  } else if (preset === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    from = d.toISOString().slice(0, 10);
  } else {
    return { from: "", to: "" };
  }
  return { from, to };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Customer Dashboard ─────────────────────────────────────────────────────

function CustomerDashboard({
  user,
}: {
  user: { name: string; email: string; role: string; created_at: string };
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E8E4DC] rounded-2xl p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-[#B8860B] uppercase mb-1">
              Welcome back
            </p>
            <h1
              className="text-3xl text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {user.name}
            </h1>
            <p className="text-sm text-[#9A9A9A] mt-1">{user.email}</p>
          </div>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-center">
            Customer
          </span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          {
            href: "/products",
            label: "Browse Products",
            sub: "Explore our curated clothing collection",
            accent: "#B8860B",
          },
          {
            href: "/tryon",
            label: "Virtual Try-On",
            sub: "Try on clothes with virtual fitting",
            accent: "#1a1a1a",
          },
          {
            href: "/tryon/history",
            label: "My History",
            sub: "View your past try-ons and favourites",
            accent: "#6B6B6B",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group bg-white border border-[#E8E4DC] rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            style={{ borderTopColor: item.accent, borderTopWidth: 2 }}
          >
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-1">{item.label}</h3>
            <p className="text-xs text-[#9A9A9A] leading-relaxed">{item.sub}</p>
          </Link>
        ))}
      </div>

      {/* Account Details + Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E8E4DC] rounded-xl p-7">
          <h2
            className="text-base font-medium text-[#1a1a1a] mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Account Details
          </h2>
          <dl className="space-y-4">
            {[
              { label: "Full Name", value: user.name },
              { label: "Email", value: user.email },
              {
                label: "Member Since",
                value: new Date(user.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-xs text-[#9A9A9A] mb-0.5">{row.label}</dt>
                <dd className="text-sm font-medium text-[#1a1a1a]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white border border-[#E8E4DC] rounded-xl p-7">
          <h2
            className="text-base font-medium text-[#1a1a1a] mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            What You Can Do
          </h2>
          <ul className="space-y-3">
            {[
              "Browse the product catalog",
              "Try on garments with AI",
              "Receive personalised size recommendations",
              "Save favourites to your wishlist",
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-4 h-4 bg-[#FAF6EE] border border-[#B8860B] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-[#B8860B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm text-[#6B6B6B]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Summary Card ────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: string | number;
  accentColor: string;
}) {
  return (
    <div
      className="bg-white border border-[#E8E4DC] rounded-xl p-5"
      style={{ borderTopColor: accentColor, borderTopWidth: 2 }}
    >
      <p className="text-xs text-[#9A9A9A] mb-1.5">{label}</p>
      <p className="text-2xl font-bold" style={{ color: accentColor }}>
        {value}
      </p>
    </div>
  );
}

// ─── Retailer: Order History Tab ─────────────────────────────────────────────

function OrderHistoryTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getRetailerOrders(p, 10);
      setOrders(res.orders);
      setTotal(res.total);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(page); }, [page, fetchOrders]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p);
  const totalPages = Math.ceil(total / 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-[#E8E4DC] rounded-xl p-12 text-center">
        <p className="text-lg font-semibold text-[#1a1a1a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          No orders yet
        </p>
        <p className="text-sm text-[#9A9A9A]">Orders from customers who buy your products will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#6B6B6B]">
        <span className="font-semibold text-[#1a1a1a]">{total}</span> order{total !== 1 ? "s" : ""}
      </p>
      {orders.map((order) => (
        <div key={order._id} className="bg-white border border-[#E8E4DC] rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <p className="text-xs text-[#9A9A9A] mb-1">
                {formatDate(order.created_at)} &middot; {order.payment_method.toUpperCase()}
              </p>
              <p className="text-sm font-semibold text-[#1a1a1a]">{order.user_name}</p>
              <p className="text-xs text-[#9A9A9A]">{order.user_email}</p>
            </div>
            <div className="text-right">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1"
              >
                {order.status}
              </span>
              <p className="text-lg font-bold text-[#B8860B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {formatPrice(order.total_price)}
              </p>
            </div>
          </div>
          <div className="border-t border-[#F0EDE6] pt-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-lg bg-[#F5F5F3] border border-[#E8E8E4] overflow-hidden flex-shrink-0">
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1a1a1a] truncate">{item.product_name}</p>
                  <p className="text-xs text-[#9A9A9A]">Size: {item.size} &middot; Qty: {item.quantity}</p>
                </div>
                <p className="text-xs font-semibold text-[#1a1a1a]">{formatPrice(item.product_price * item.quantity)}</p>
              </div>
            ))}
          </div>
          {order.address && order.address.city && (
            <div className="border-t border-[#F0EDE6] pt-3 mt-2">
              <p className="text-xs text-[#9A9A9A]">
                Ship to: {order.address.name}, {order.address.address}, {order.address.city} — {order.address.pincode}
              </p>
            </div>
          )}
        </div>
      ))}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-medium border border-[#E8E4DC] rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-xs text-[#6B6B6B]">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-xs font-medium border border-[#E8E4DC] rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Retailer: Consumer Try-On History Tab ──────────────────────────────────

function ConsumerTryOnTab() {
  const [sessions, setSessions] = useState<TryOnSession[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getRetailerTryOnHistory(p, 12);
      setSessions(res.sessions);
      setTotal(res.total);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(page); }, [page, fetchSessions]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const totalPages = Math.ceil(total / 12);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white border border-[#E8E4DC] rounded-xl p-12 text-center">
        <p className="text-lg font-semibold text-[#1a1a1a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          No try-ons yet
        </p>
        <p className="text-sm text-[#9A9A9A]">Customer try-on sessions using your products will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[#6B6B6B] mb-4">
        <span className="font-semibold text-[#1a1a1a]">{total}</span> try-on session{total !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {sessions.map((session) => (
          <div key={session._id} className="bg-white border border-[#E8E4DC] rounded-xl overflow-hidden">
            <div className="aspect-[3/4] bg-[#F5F5F3] relative">
              {session.result_url && (
                <img src={session.result_url} alt={session.product_name} className="w-full h-full object-cover" />
              )}
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                {(session.processing_time_ms / 1000).toFixed(1)}s
              </span>
              {session.is_favorite && (
                <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded">
                  Fav
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-[#1a1a1a] truncate">{session.product_name}</p>
              <p className="text-[11px] text-[#9A9A9A] mt-0.5">Model: {session.model_name}</p>
              <p className="text-[11px] text-[#9A9A9A]">{formatDate(session.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 pt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-medium border border-[#E8E4DC] rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-xs text-[#6B6B6B]">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-xs font-medium border border-[#E8E4DC] rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Retailer Analytics Dashboard ────────────────────────────────────────────

type RetailerTab = "analytics" | "orders" | "tryons";

function RetailerDashboard({
  user,
}: {
  user: { name: string; email: string; role: string; created_at: string };
}) {
  const [activeTab, setActiveTab] = useState<RetailerTab>("analytics");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activePreset, setActivePreset] = useState("all");
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchData = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboard(from || undefined, to || undefined);
      setData(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load analytics";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePreset = (preset: string) => {
    setActivePreset(preset);
    const range = getQuickDateRange(preset);
    setDateFrom(range.from);
    setDateTo(range.to);
    fetchData(range.from, range.to);
  };

  const handleFilter = () => {
    setActivePreset("");
    fetchData(dateFrom, dateTo);
  };

  const handleExportCSV = async () => {
    setExporting("csv");
    try {
      const blob = await exportCSV(dateFrom || undefined, dateTo || undefined);
      downloadBlob(blob, "fitview_analytics.csv");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(null);
    }
  };

  const handleExportReport = async () => {
    setExporting("report");
    try {
      const blob = await exportReport(dateFrom || undefined, dateTo || undefined);
      downloadBlob(blob, "fitview_analytics_report.html");
    } catch {
      toast.error("Failed to export report");
    } finally {
      setExporting(null);
    }
  };

  const inputClass =
    "bg-white border border-[#D4C9B0] text-[#1a1a1a] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] transition-colors";

  const TABS: { key: RetailerTab; label: string }[] = [
    { key: "analytics", label: "Analytics" },
    { key: "orders", label: "Order History" },
    { key: "tryons", label: "Consumer Try-Ons" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-[#B8860B] uppercase mb-1">
            Retailer Portal
          </p>
          <h1
            className="text-3xl text-[#1a1a1a]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-[#9A9A9A] mt-1">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/retailer/products"
            className="text-sm text-[#B8860B] hover:text-[#9A6C00] font-medium transition-colors"
          >
            Manage Products
          </Link>
          <Link
            href="/retailer/models"
            className="text-sm text-[#B8860B] hover:text-[#9A6C00] font-medium transition-colors"
          >
            Manage Models
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white border border-[#E8E4DC] rounded-xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[#1a1a1a] text-white"
                : "text-[#6B6B6B] hover:text-[#1a1a1a] hover:bg-[#F5F5F3]"
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order History Tab */}
      {activeTab === "orders" && <OrderHistoryTab />}

      {/* Consumer Try-Ons Tab */}
      {activeTab === "tryons" && <ConsumerTryOnTab />}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <>
          {/* Date Range Filter */}
          <div className="bg-white border border-[#E8E4DC] rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {[
                  { key: "7d", label: "Last 7 days" },
                  { key: "30d", label: "Last 30 days" },
                  { key: "all", label: "All time" },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => handlePreset(p.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                      ${activePreset === p.key
                        ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                        : "bg-white text-[#6B6B6B] border-[#D4C9B0] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={inputClass}
                />
                <span className="text-[#C4BFB4] text-sm">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={inputClass}
                />
                <button
                  onClick={handleFilter}
                  className="bg-[#1a1a1a] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#2d2d2d] transition-colors"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => fetchData(dateFrom, dateTo)}
                className="mt-2 text-sm font-medium text-[#B8860B] hover:text-[#9A6C00] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <SummaryCard label="Total Try-Ons" value={data.total_tryons} accentColor="#B8860B" />
                <SummaryCard label="Total Products" value={data.total_products} accentColor="#4B7CF3" />
                <SummaryCard label="Favourites" value={data.total_favorites} accentColor="#E05C7A" />
                <SummaryCard label="Avg Processing" value={formatMs(data.avg_processing_time_ms)} accentColor="#2A9D5C" />
                <SummaryCard label="Total Models" value={data.total_models} accentColor="#E8973A" />
                <SummaryCard
                  label="Cart Adds"
                  value={(data.cart_analytics || []).reduce((sum, ca) => sum + ca.cart_adds, 0)}
                  accentColor="#9333EA"
                />
              </div>

              {/* Charts */}
              <AnalyticsCharts data={data} />

              {/* Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top Products */}
                <div className="bg-white border border-[#E8E4DC] rounded-xl p-6">
                  <h2
                    className="text-base font-medium text-[#1a1a1a] mb-4"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Top Products
                  </h2>
                  {data.top_products.length === 0 ? (
                    <p className="text-sm text-[#9A9A9A] py-4">No try-on data yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E8E4DC]">
                            {["#", "Product", "Try-Ons", "Favs"].map((h) => (
                              <th key={h} className="text-left text-xs font-medium text-[#9A9A9A] pb-2 pr-4 last:pr-0">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.top_products.map((p, i) => (
                            <tr key={p.product_id} className="border-b border-[#F0EDE6] last:border-0">
                              <td className="py-2.5 pr-4 text-xs text-[#C4BFB4]">{i + 1}</td>
                              <td className="py-2.5 pr-4 text-[#1a1a1a] font-medium truncate max-w-[160px] text-xs">
                                {p.name}
                              </td>
                              <td className="py-2.5 pr-4 text-xs font-semibold text-[#B8860B]">{p.tryon_count}</td>
                              <td className="py-2.5 text-xs text-rose-500">{p.favorite_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Top Models */}
                <div className="bg-white border border-[#E8E4DC] rounded-xl p-6">
                  <h2
                    className="text-base font-medium text-[#1a1a1a] mb-4"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Top Models
                  </h2>
                  {data.top_models.length === 0 ? (
                    <p className="text-sm text-[#9A9A9A] py-4">No try-on data yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E8E4DC]">
                            {["#", "Model", "Try-Ons"].map((h) => (
                              <th key={h} className="text-left text-xs font-medium text-[#9A9A9A] pb-2 pr-4 last:pr-0">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.top_models.map((m, i) => (
                            <tr key={m.model_id} className="border-b border-[#F0EDE6] last:border-0">
                              <td className="py-2.5 pr-4 text-xs text-[#C4BFB4]">{i + 1}</td>
                              <td className="py-2.5 pr-4 text-[#1a1a1a] font-medium text-xs">{m.name}</td>
                              <td className="py-2.5 text-xs font-semibold text-[#B8860B]">{m.tryon_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Insights — Revenue Potential + User Engagement */}
              {data.revenue_potential && data.revenue_potential.length > 0 && (
                <div className="mb-6">
                  <h2
                    className="text-lg font-medium text-[#1a1a1a] mb-4"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Product Insights
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {data.revenue_potential.map((rp, i) => (
                      <div
                        key={rp.product_id}
                        className="bg-white border border-[#E8E4DC] rounded-xl p-5"
                        style={{
                          borderTopColor: i === 0 ? "#B8860B" : i === 1 ? "#4B7CF3" : "#2A9D5C",
                          borderTopWidth: 2,
                        }}
                      >
                        <p className="text-xs text-[#9A9A9A] mb-1 tracking-wide uppercase">
                          {i === 0 ? "Highest Potential" : i === 1 ? "Strong Performer" : "Rising Interest"}
                        </p>
                        <p
                          className="text-sm font-semibold text-[#1a1a1a] mb-3 truncate"
                          title={rp.name}
                        >
                          {rp.name}
                        </p>
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-lg font-bold text-[#B8860B]">{rp.score}</span>
                            <span className="text-xs text-[#9A9A9A] ml-1">pts</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#6B6B6B]">
                            <span>{rp.tryons} try-ons</span>
                            <span className="text-[#E05C7A]">{rp.favorites} favs</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* User engagement summary row */}
                  {data.user_engagement && (
                    <div className="bg-white border border-[#E8E4DC] rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-xs text-[#9A9A9A] mb-0.5 tracking-wide uppercase">User Engagement Summary</p>
                          <p className="text-sm text-[#6B6B6B]">
                            <span className="font-semibold text-[#1a1a1a]">{data.user_engagement.unique_users}</span> unique users across{" "}
                            <span className="font-semibold text-[#1a1a1a]">{data.user_engagement.total_sessions}</span> sessions, averaging{" "}
                            <span className="font-semibold text-[#B8860B]">{data.user_engagement.avg_tryons_per_user}</span> try-ons per user.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Export */}
              <div className="bg-white border border-[#E8E4DC] rounded-xl p-6 mb-10">
                <h2
                  className="text-base font-medium text-[#1a1a1a] mb-4"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Export Data
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportCSV}
                    disabled={exporting === "csv"}
                    className="bg-white border border-[#D4C9B0] text-[#1a1a1a] text-sm font-medium px-5 py-2.5 rounded-xl hover:border-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-wait"
                  >
                    {exporting === "csv" ? "Exporting…" : "Export CSV"}
                  </button>
                  <button
                    onClick={handleExportReport}
                    disabled={exporting === "report"}
                    className="bg-[#1a1a1a] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#2d2d2d] transition-colors disabled:opacity-50 disabled:cursor-wait"
                  >
                    {exporting === "report" ? "Exporting…" : "Export Report"}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isAuthenticated, hydrate, fetchMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchMe();
  }, [isAuthenticated, router, fetchMe]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAF8]">
        <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isRetailer = user.role === "retailer" || user.role === "admin";

  return (
    /* pb-24 on mobile clears BottomTabBar; sm:pb-10 restores normal spacing */
    <div className="min-h-[calc(100vh-64px)] bg-[#FAFAF8] py-10 pb-24 sm:pb-10">
      {isRetailer ? (
        <RetailerDashboard user={user} />
      ) : (
        <CustomerDashboard user={user} />
      )}
    </div>
  );
}
