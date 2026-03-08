/**
 * Orders API functions for FitView AI.
 */

import { handleUnauthorized } from "../api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  size: string;
  quantity: number;
  retailer_id: string;
}

export interface Order {
  _id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: OrderItem[];
  address: Record<string, string>;
  payment_method: string;
  total_price: number;
  status: string;
  created_at: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
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

export async function placeOrder(data: {
  items: { product_id: string; product_name: string; product_price: number; product_image: string; size: string; quantity: number }[];
  address: Record<string, string>;
  payment_method: string;
  total_price: number;
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 401) { handleUnauthorized(); return null as never; }
    const error = await res.json().catch(() => ({ detail: "Failed to place order" }));
    throw new Error(error.detail || "Failed to place order");
  }
  return res.json();
}

export async function getUserOrders(page = 1, limit = 20): Promise<OrderListResponse> {
  const res = await fetch(`${API_BASE}/orders?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) { handleUnauthorized(); return null as never; }
    const error = await res.json().catch(() => ({ detail: "Failed to fetch orders" }));
    throw new Error(error.detail || "Failed to fetch orders");
  }
  return res.json();
}

export async function getRetailerOrders(page = 1, limit = 20): Promise<OrderListResponse> {
  const res = await fetch(`${API_BASE}/orders/retailer?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) { handleUnauthorized(); return null as never; }
    const error = await res.json().catch(() => ({ detail: "Failed to fetch retailer orders" }));
    throw new Error(error.detail || "Failed to fetch retailer orders");
  }
  return res.json();
}
