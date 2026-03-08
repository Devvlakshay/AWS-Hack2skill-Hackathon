/**
 * Analytics API functions for FitView AI.
 * Phase 5: Retailer Analytics Dashboard.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface TopProduct {
  product_id: string;
  name: string;
  tryon_count: number;
  favorite_count: number;
}

export interface TopModel {
  model_id: string;
  name: string;
  tryon_count: number;
}

export interface ProductVisitStat {
  product_id: string;
  name: string;
  views: number;
  tryons: number;
  favorites: number;
  conversion_rate: number;
  popularity_score: number;
}

export interface ConversionStat {
  product_id: string;
  name: string;
  views: number;
  tryons: number;
  conversion_rate: number;
}

export interface UserEngagement {
  unique_users: number;
  avg_tryons_per_user: number;
  total_sessions: number;
}

export interface RevenuePotential {
  product_id: string;
  name: string;
  score: number;
  tryons: number;
  favorites: number;
}

export interface CartAnalyticItem {
  product_id: string;
  name: string;
  cart_adds: number;
  cart_conversion_rate: number;
}

export interface TrendingProduct {
  product_id: string;
  name: string;
  recent_score: number;
  trend: string;
}

export interface DailyActiveUsers {
  date: string;
  unique_users: number;
}

export interface DashboardData {
  total_tryons: number;
  total_products: number;
  total_models: number;
  total_favorites: number;
  avg_processing_time_ms: number;
  tryons_by_date: Record<string, number>;
  top_products: TopProduct[];
  top_models: TopModel[];
  category_distribution: Record<string, number>;
  ai_provider_distribution: Record<string, number>;
  product_visit_stats: ProductVisitStat[];
  visit_to_tryon_conversion: ConversionStat[];
  peak_hours: Record<string, number>;
  user_engagement: UserEngagement;
  revenue_potential: RevenuePotential[];
  cart_analytics: CartAnalyticItem[];
  trending_products: TrendingProduct[];
  traffic_sources: Record<string, number>;
  daily_active_users: DailyActiveUsers[];
}

export interface ProductAnalytics {
  product_id: string;
  product_name: string;
  tryon_count: number;
  favorite_count: number;
  avg_processing_time_ms: number;
  model_preferences: TopModel[];
  tryons_by_date: Record<string, number>;
  recent_tryons: Array<{
    session_id: string;
    user_id: string;
    model_name: string;
    status: string;
    is_favorite: boolean;
    created_at: string;
  }>;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function getDashboard(
  dateFrom?: string,
  dateTo?: string
): Promise<DashboardData> {
  const params = new URLSearchParams();
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);

  const url = `${API_BASE}/analytics/dashboard${params.toString() ? "?" + params.toString() : ""}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch dashboard" }));
    throw new Error(error.detail || "Failed to fetch dashboard");
  }
  return res.json();
}

export async function getProductAnalytics(productId: string): Promise<ProductAnalytics> {
  const res = await fetch(`${API_BASE}/analytics/products/${productId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch product analytics" }));
    throw new Error(error.detail || "Failed to fetch product analytics");
  }
  return res.json();
}

export async function exportCSV(dateFrom?: string, dateTo?: string): Promise<Blob> {
  const params = new URLSearchParams();
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);

  const url = `${API_BASE}/analytics/export/csv${params.toString() ? "?" + params.toString() : ""}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error("Failed to export CSV");
  }
  return res.blob();
}

export async function exportReport(dateFrom?: string, dateTo?: string): Promise<Blob> {
  const params = new URLSearchParams();
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);

  const url = `${API_BASE}/analytics/export/report${params.toString() ? "?" + params.toString() : ""}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error("Failed to export report");
  }
  return res.blob();
}

export async function trackEvent(
  eventType: string,
  productId: string,
  metadata?: Record<string, string>
): Promise<{ event_id: string; status: string }> {
  const res = await fetch(`${API_BASE}/analytics/events`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      event_type: eventType,
      product_id: productId,
      metadata: metadata || {},
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to track event");
  }
  return res.json();
}

/**
 * Fire-and-forget event tracking. Silently swallows errors
 * so it never disrupts the user experience.
 */
export function trackEventSilent(
  eventType: string,
  productId: string,
  metadata: Record<string, string> = {}
): void {
  trackEvent(eventType, productId, metadata).catch(() => {});
}
