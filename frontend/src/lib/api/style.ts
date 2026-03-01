/**
 * Style Variation API functions for FitView AI.
 * Phase 4: Intelligence Layer.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface StyleVariation {
  id: string;
  _id: string;
  session_id: string;
  user_id: string;
  style: string;
  image_url: string;
  original_image_url: string;
  created_at: string;
}

export interface StyleVariationListResponse {
  variations: StyleVariation[];
  session_id: string;
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

export async function generateStyleVariation(
  sessionId: string,
  style: string
): Promise<StyleVariation> {
  const res = await fetch(`${API_BASE}/style/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ session_id: sessionId, style }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Style variation generation failed" }));
    throw new Error(error.detail || "Style variation generation failed");
  }
  return res.json();
}

export async function getStyleVariations(
  sessionId: string
): Promise<StyleVariationListResponse> {
  const res = await fetch(`${API_BASE}/style/variations/${sessionId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch style variations" }));
    throw new Error(error.detail || "Failed to fetch style variations");
  }
  return res.json();
}
