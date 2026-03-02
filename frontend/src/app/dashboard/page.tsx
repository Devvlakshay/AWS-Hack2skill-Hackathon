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
            sub: "Try on clothes with AI-powered fitting",
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

// ─── Retailer Analytics Dashboard ────────────────────────────────────────────

function RetailerDashboard({
  user,
}: {
  user: { name: string; email: string; role: string; created_at: string };
}) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-[#B8860B] uppercase mb-1">
            Retailer Portal
          </p>
          <h1
            className="text-3xl text-[#1a1a1a]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Analytics Dashboard
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard label="Total Try-Ons" value={data.total_tryons} accentColor="#B8860B" />
            <SummaryCard label="Total Products" value={data.total_products} accentColor="#4B7CF3" />
            <SummaryCard label="Favourites" value={data.total_favorites} accentColor="#E05C7A" />
            <SummaryCard label="Avg Processing" value={formatMs(data.avg_processing_time_ms)} accentColor="#2A9D5C" />
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
