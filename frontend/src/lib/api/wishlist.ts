/**
 * Wishlist API functions for FitView AI.
 * Phase 4: Intelligence Layer.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface WishlistItem {
  id: string;
  _id: string;
  user_id: string;
  product_id: string;
  tryon_image_url: string;
  added_at: string;
  product_name: string;
  product_price: number;
  product_image: string;
  product_category: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
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

export async function getWishlist(): Promise<WishlistResponse> {
  const res = await fetch(`${API_BASE}/wishlist`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch wishlist" }));
    throw new Error(error.detail || "Failed to fetch wishlist");
  }
  return res.json();
}

export async function addToWishlist(
  productId: string,
  tryonImageUrl?: string
): Promise<WishlistResponse> {
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      product_id: productId,
      tryon_image_url: tryonImageUrl || null,
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to add to wishlist" }));
    throw new Error(error.detail || "Failed to add to wishlist");
  }
  return res.json();
}

export async function removeFromWishlist(productId: string): Promise<WishlistResponse> {
  const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to remove from wishlist" }));
    throw new Error(error.detail || "Failed to remove from wishlist");
  }
  return res.json();
}
