/**
 * Cart API functions for FitView AI.
 * Phase 4: Intelligence Layer.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface CartItem {
  product_id: string;
  size: string;
  quantity: number;
  added_at: string;
  product_name: string;
  product_price: number;
  product_image: string;
  tryon_image_url: string;
}

export interface CartResponse {
  items: CartItem[];
  total_items: number;
  total_price: number;
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

export async function getCart(): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch cart" }));
    throw new Error(error.detail || "Failed to fetch cart");
  }
  return res.json();
}

export async function addToCart(
  productId: string,
  size: string,
  quantity: number = 1
): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart/items`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ product_id: productId, size, quantity }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to add to cart" }));
    throw new Error(error.detail || "Failed to add to cart");
  }
  return res.json();
}

export async function updateCartItem(
  productId: string,
  data: { size?: string; quantity?: number }
): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to update cart item" }));
    throw new Error(error.detail || "Failed to update cart item");
  }
  return res.json();
}

export async function removeFromCart(productId: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to remove from cart" }));
    throw new Error(error.detail || "Failed to remove from cart");
  }
  return res.json();
}

export async function clearCart(): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to clear cart" }));
    throw new Error(error.detail || "Failed to clear cart");
  }
  return res.json();
}
