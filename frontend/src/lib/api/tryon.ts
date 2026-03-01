/**
 * Try-On API functions for FitView AI.
 * Phase 3: Core Virtual Try-On Engine.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface TryOnRequest {
  model_id: string;
  product_id: string;
}

export interface TryOnSession {
  id: string;
  _id: string;
  user_id: string;
  model_id: string;
  product_id: string;
  result_url: string;
  model_name: string;
  product_name: string;
  model_image_url: string;
  product_image_url: string;
  status: "pending" | "processing" | "completed" | "failed";
  processing_time_ms: number;
  is_favorite: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface TryOnHistoryResponse {
  sessions: TryOnSession[];
  total: number;
  page: number;
  limit: number;
}

export interface BatchTryOnRequest {
  model_id: string;
  product_ids: string[];
}

export interface BatchTryOnResponse {
  batch_id: string;
  individual_results: TryOnSession[];
  combined_result: TryOnSession | null;
  total_processing_time_ms: number;
  product_count: number;
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

function getAuthHeadersNoContentType(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function generateTryOn(data: TryOnRequest): Promise<TryOnSession> {
  const res = await fetch(`${API_BASE}/tryon`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Try-on generation failed" }));
    throw new Error(error.detail || "Try-on generation failed");
  }
  return res.json();
}

export async function generateTryOnWithPhoto(
  file: File,
  productId: string
): Promise<TryOnSession> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("product_id", productId);

  const res = await fetch(`${API_BASE}/tryon/with-photo`, {
    method: "POST",
    headers: getAuthHeadersNoContentType(),
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Try-on generation failed" }));
    throw new Error(error.detail || "Try-on generation failed");
  }
  return res.json();
}

export async function getTryOnHistory(
  page: number = 1,
  limit: number = 20
): Promise<TryOnHistoryResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(`${API_BASE}/tryon/history?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch history" }));
    throw new Error(error.detail || "Failed to fetch history");
  }
  return res.json();
}

export async function getTryOnSession(sessionId: string): Promise<TryOnSession> {
  const res = await fetch(`${API_BASE}/tryon/${sessionId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch session" }));
    throw new Error(error.detail || "Failed to fetch session");
  }
  return res.json();
}

export async function generateBatchTryOn(data: BatchTryOnRequest): Promise<BatchTryOnResponse> {
  const res = await fetch(`${API_BASE}/tryon/batch`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Batch try-on generation failed" }));
    throw new Error(error.detail || "Batch try-on generation failed");
  }
  return res.json();
}

export async function toggleTryOnFavorite(
  sessionId: string,
  isFavorite: boolean
): Promise<TryOnSession> {
  const res = await fetch(`${API_BASE}/tryon/${sessionId}/favorite`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_favorite: isFavorite }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to update favorite" }));
    throw new Error(error.detail || "Failed to update favorite");
  }
  return res.json();
}
