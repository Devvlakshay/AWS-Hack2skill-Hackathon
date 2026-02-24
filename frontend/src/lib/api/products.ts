/**
 * Product API functions for FitView AI.
 * Phase 2: Product & Model Management.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ProductFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  price_min?: number;
  price_max?: number;
  sort_by?: "created_at" | "price" | "name";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

interface SizeStock {
  size: string;
  stock: number;
}

interface ProductCreateData {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  price: number;
  sizes?: SizeStock[];
  colors?: string[];
  material?: string;
  images?: string[];
  size_chart?: Record<string, unknown>;
}

interface ProductUpdateData {
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  price?: number;
  sizes?: SizeStock[];
  colors?: string[];
  material?: string;
  images?: string[];
  size_chart?: Record<string, unknown>;
}

export interface Product {
  id: string;
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  price: number;
  sizes: SizeStock[];
  colors: string[];
  material: string;
  images: string[];
  size_chart: Record<string, unknown>;
  retailer_id: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  products: Product[];
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

function getAuthHeadersMultipart(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.subcategory) params.set("subcategory", filters.subcategory);
  if (filters.search) params.set("search", filters.search);
  if (filters.price_min !== undefined) params.set("price_min", String(filters.price_min));
  if (filters.price_max !== undefined) params.set("price_max", String(filters.price_max));
  if (filters.sort_by) params.set("sort_by", filters.sort_by);
  if (filters.sort_order) params.set("sort_order", filters.sort_order);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const queryString = params.toString();
  const url = `${API_BASE}/products${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch products" }));
    throw new Error(error.detail || "Failed to fetch products");
  }
  return res.json();
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch product" }));
    throw new Error(error.detail || "Failed to fetch product");
  }
  return res.json();
}

export async function createProduct(data: ProductCreateData): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to create product" }));
    throw new Error(error.detail || "Failed to create product");
  }
  return res.json();
}

export async function updateProduct(id: string, data: ProductUpdateData): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to update product" }));
    throw new Error(error.detail || "Failed to update product");
  }
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to delete product" }));
    throw new Error(error.detail || "Failed to delete product");
  }
}

export async function uploadProductImages(id: string, files: File[]): Promise<Product> {
  // Upload files one at a time (backend accepts single file per request)
  let result: Product | null = null;
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/products/${id}/images`, {
      method: "POST",
      headers: getAuthHeadersMultipart(),
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Failed to upload image" }));
      throw new Error(error.detail || "Failed to upload image");
    }
    result = await res.json();
  }
  return result as Product;
}
