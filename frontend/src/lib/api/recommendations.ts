/**
 * Recommendations API functions for FitView AI.
 * Phase 4: Intelligence Layer.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface SizeRecommendation {
  recommended_size: string;
  confidence: number;
  reasoning: string;
  all_sizes: Array<{
    size: string;
    score: number;
    stock: number;
    reasoning: string;
  }>;
}

export interface RecommendedProduct {
  _id: string;
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  tags: string[];
  colors: string[];
  material: string;
}

export interface StyleRecommendation {
  products: RecommendedProduct[];
  based_on: string;
  total: number;
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

export async function getSizeRecommendation(
  productId: string
): Promise<SizeRecommendation> {
  const res = await fetch(`${API_BASE}/recommendations/size?product_id=${productId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to get size recommendation" }));
    throw new Error(error.detail || "Failed to get size recommendation");
  }
  return res.json();
}

export async function getStyleRecommendations(
  limit: number = 10
): Promise<StyleRecommendation> {
  const res = await fetch(`${API_BASE}/recommendations/style?limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to get style recommendations" }));
    throw new Error(error.detail || "Failed to get style recommendations");
  }
  return res.json();
}
