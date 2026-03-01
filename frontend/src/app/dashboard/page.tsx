"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
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
    <div className="h-64 flex items-center justify-center text-gray-500">
      Loading charts...
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
    // "all" — no date range
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

// ---------- Customer Dashboard ----------
function CustomerDashboard({ user }: { user: { name: string; email: string; role: string; created_at: string } }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user.name}
            </h1>
            <p className="mt-1 text-gray-400">{user.email}</p>
          </div>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-green-900/40 text-green-400 self-start">
            Customer
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/products"
          className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl p-6 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm"
        >
          <h3 className="font-semibold text-lg">Browse Products</h3>
          <p className="text-indigo-300 text-sm mt-1">
            Explore our curated clothing collection
          </p>
        </Link>
        <Link
          href="/tryon"
          className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6 hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm"
        >
          <h3 className="font-semibold text-lg">Virtual Try-On</h3>
          <p className="text-purple-300 text-sm mt-1">
            Try on clothes with AI-powered virtual fitting
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Account Details</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-gray-400">Full Name</dt>
              <dd className="text-white font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-400">Email</dt>
              <dd className="text-white font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-400">Member Since</dt>
              <dd className="text-white font-medium">
                {new Date(user.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>
        <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Available Features</h2>
          <ul className="space-y-3">
            {["Browse product catalog", "Virtual try-on with AI", "Get size recommendations", "Save favorites and wishlist"].map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 bg-primary-900/50 text-primary-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  &#10003;
                </span>
                <span className="text-gray-300">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------- Retailer Analytics Dashboard ----------
function RetailerDashboard({ user }: { user: { name: string; email: string; role: string; created_at: string } }) {
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      alert("Failed to export CSV");
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
      alert("Failed to export report");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/retailer/products"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Manage Products
          </Link>
          <Link
            href="/retailer/models"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Manage Models
          </Link>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePreset("7d")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePreset === "7d"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => handlePreset("30d")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePreset === "30d"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Last 30 days
            </button>
            <button
              onClick={() => handlePreset("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePreset === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              All time
            </button>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-gray-500 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleFilter}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-400">Loading analytics...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => fetchData(dateFrom, dateTo)}
            className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
          >
            Retry
          </button>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              label="Total Try-Ons"
              value={data.total_tryons}
              color="indigo"
            />
            <SummaryCard
              label="Total Products"
              value={data.total_products}
              color="blue"
            />
            <SummaryCard
              label="Favorites"
              value={data.total_favorites}
              color="pink"
            />
            <SummaryCard
              label="Avg Processing"
              value={formatMs(data.avg_processing_time_ms)}
              color="emerald"
            />
          </div>

          {/* Charts */}
          <AnalyticsCharts data={data} />

          {/* Top Products Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Top Products</h2>
              {data.top_products.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No try-on data yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-800">
                        <th className="text-left py-2 pr-4">#</th>
                        <th className="text-left py-2 pr-4">Product</th>
                        <th className="text-center py-2 pr-4">Try-Ons</th>
                        <th className="text-center py-2">Favs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.top_products.map((p, i) => (
                        <tr key={p.product_id} className="border-b border-gray-800/50">
                          <td className="py-2.5 pr-4 text-gray-500">{i + 1}</td>
                          <td className="py-2.5 pr-4 text-white font-medium truncate max-w-[200px]">
                            {p.name}
                          </td>
                          <td className="py-2.5 pr-4 text-center text-indigo-400 font-semibold">
                            {p.tryon_count}
                          </td>
                          <td className="py-2.5 text-center text-pink-400">
                            {p.favorite_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top Models Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Top Models</h2>
              {data.top_models.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No try-on data yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-800">
                        <th className="text-left py-2 pr-4">#</th>
                        <th className="text-left py-2 pr-4">Model</th>
                        <th className="text-center py-2">Try-Ons</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.top_models.map((m, i) => (
                        <tr key={m.model_id} className="border-b border-gray-800/50">
                          <td className="py-2.5 pr-4 text-gray-500">{i + 1}</td>
                          <td className="py-2.5 pr-4 text-white font-medium">
                            {m.name}
                          </td>
                          <td className="py-2.5 text-center text-indigo-400 font-semibold">
                            {m.tryon_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Export Buttons */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Export Data</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportCSV}
                disabled={exporting === "csv"}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-wait text-white rounded-lg text-sm font-medium transition-colors"
              >
                {exporting === "csv" ? "Exporting..." : "Export CSV"}
              </button>
              <button
                onClick={handleExportReport}
                disabled={exporting === "report"}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-wait text-white rounded-lg text-sm font-medium transition-colors"
              >
                {exporting === "report" ? "Exporting..." : "Export Report"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Summary Card ----------
function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "indigo" | "blue" | "pink" | "emerald";
}) {
  const colorMap = {
    indigo: "from-indigo-600/20 to-indigo-900/10 border-indigo-800/50",
    blue: "from-blue-600/20 to-blue-900/10 border-blue-800/50",
    pink: "from-pink-600/20 to-pink-900/10 border-pink-800/50",
    emerald: "from-emerald-600/20 to-emerald-900/10 border-emerald-800/50",
  };
  const valueColorMap = {
    indigo: "text-indigo-400",
    blue: "text-blue-400",
    pink: "text-pink-400",
    emerald: "text-emerald-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5`}
    >
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColorMap[color]}`}>{value}</p>
    </div>
  );
}

// ---------- Main Page ----------
export default function DashboardPage() {
  const { user, isAuthenticated, hydrate, fetchMe } = useAuthStore();
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
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const isRetailer = user.role === "retailer" || user.role === "admin";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-950 py-10">
      {isRetailer ? (
        <RetailerDashboard user={user} />
      ) : (
        <CustomerDashboard user={user} />
      )}
    </div>
  );
}
