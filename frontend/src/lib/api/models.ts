/**
 * Fashion Model API functions for FitView AI.
 * Phase 2: Product & Model Management.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type BodyType = "slim" | "average" | "curvy" | "plus_size" | "athletic";
type SkinTone = "fair" | "medium" | "olive" | "brown" | "dark";
type ModelSize = "S" | "M" | "L" | "XL" | "XXL";

interface ModelFilters {
  body_type?: BodyType;
  size?: ModelSize;
  skin_tone?: SkinTone;
  retailer_id?: string;
  page?: number;
  limit?: number;
}

interface Measurements {
  bust: number;
  waist: number;
  hip: number;
}

interface ModelCreateData {
  name: string;
  body_type: BodyType;
  height_cm: number;
  measurements: Measurements;
  skin_tone: SkinTone;
  size: ModelSize;
  image_url?: string;
}

interface ModelUpdateData {
  name?: string;
  body_type?: BodyType;
  height_cm?: number;
  measurements?: Measurements;
  skin_tone?: SkinTone;
  size?: ModelSize;
  image_url?: string;
}

export interface FashionModel {
  id: string;
  _id: string;
  name: string;
  gender: "male" | "female";
  body_type: BodyType;
  height_cm: number;
  measurements: Measurements;
  skin_tone: SkinTone;
  size: ModelSize;
  retailer_id: string;
  image_url: string;
  usage_count: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ModelListResponse {
  models: FashionModel[];
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

export async function getModels(filters: ModelFilters = {}): Promise<ModelListResponse> {
  const params = new URLSearchParams();
  if (filters.body_type) params.set("body_type", filters.body_type);
  if (filters.size) params.set("size", filters.size);
  if (filters.skin_tone) params.set("skin_tone", filters.skin_tone);
  if (filters.retailer_id) params.set("retailer_id", filters.retailer_id);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const queryString = params.toString();
  const url = `${API_BASE}/models${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch models" }));
    throw new Error(error.detail || "Failed to fetch models");
  }
  return res.json();
}

export async function getModel(id: string): Promise<FashionModel> {
  const res = await fetch(`${API_BASE}/models/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch model" }));
    throw new Error(error.detail || "Failed to fetch model");
  }
  return res.json();
}

export async function createModel(data: ModelCreateData): Promise<FashionModel> {
  const res = await fetch(`${API_BASE}/models`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to create model" }));
    throw new Error(error.detail || "Failed to create model");
  }
  return res.json();
}

export async function updateModel(id: string, data: ModelUpdateData): Promise<FashionModel> {
  const res = await fetch(`${API_BASE}/models/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to update model" }));
    throw new Error(error.detail || "Failed to update model");
  }
  return res.json();
}

export async function deleteModel(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/models/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to delete model" }));
    throw new Error(error.detail || "Failed to delete model");
  }
}

export async function uploadModelImage(id: string, file: File): Promise<FashionModel> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/models/${id}/image`, {
    method: "POST",
    headers: getAuthHeadersMultipart(),
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to upload image" }));
    throw new Error(error.detail || "Failed to upload image");
  }
  return res.json();
}
