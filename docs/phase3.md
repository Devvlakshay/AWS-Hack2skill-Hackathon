# Phase 3: Core Virtual Try-On Engine

## Overview

Phase 3 implements the **core product** of FitView AI -- an AI-powered virtual try-on engine. Customers select a brand-provided model (or upload their own photo) and a garment, and the system generates a photorealistic try-on image using Google Gemini AI with full image preprocessing and postprocessing pipelines.

**Status**: COMPLETE AND TESTED

---

## AI Stack

| Component | Model / Service | Purpose |
| --- | --- | --- |
| **Virtual Try-On** | Gemini (`gemini-3.1-flash-image-preview`) | Primary try-on generation |
| **Background Removal** | rembg (U2-Net) | Garment isolation preprocessing |
| **Color Correction** | OpenCV CLAHE + bilateral filter | Postprocessing enhancement |
| **Fallback** | Pillow composite overlay | When Gemini API is unavailable |

---

## Architecture

```text
Customer Request
       |
       v
+---------------------------+
|  POST /api/v1/tryon       |  (model + product)
|  POST /api/v1/tryon/      |
|       with-photo          |  (user photo + product)
+---------------------------+
       |
       v
+---------------------------+
|  1. Cache Check           |  In-memory cache (1h TTL)
|     key: tryon:{m}:{p}    |  (skipped for user photo)
+---------------------------+
       | (miss)
       v
+---------------------------+
|  2. Fetch / Validate      |
|  Images (model/photo +    |
|  garment)                 |
+---------------------------+
       |
       v
+---------------------------+
|  3. Preprocess            |
|  - Model: 1024x1024 RGB  |
|  - Garment: rembg bg      |
|    removal, RGBA isolate  |
+---------------------------+
       |
       v
+---------------------------+
|  4. AI Generation         |
|  Priority chain:          |
|    Gemini API             |
|      -> Fallback composite|
+---------------------------+
       |
       v
+---------------------------+
|  5. Postprocess           |
|  Sharpen, contrast,       |
|  CLAHE, bilateral filter, |
|  1024x1024 PNG output     |
+---------------------------+
       |
       v
+---------------------------+
|  6. Store and Cache       |
|  Upload to uploads/       |
|  Save session to JSON     |
|  Cache result (1h TTL)    |
+---------------------------+
       |
       v
     Return result URL
```

---

## API Endpoints

### POST /api/v1/tryon -- Generate Try-On (Model)

**Auth**: Required (any authenticated user)

**Request Body**:

```json
{
  "model_id": "model001",
  "product_id": "prod001"
}
```

**Response** (201 Created):

```json
{
  "_id": "abc123hex",
  "user_id": "customer001",
  "model_id": "model001",
  "product_id": "prod001",
  "result_url": "http://localhost:8000/uploads/tryon_results/tryon_abc123.png",
  "model_name": "Ananya - Petite Elegance",
  "product_name": "Royal Blue Silk Kurta",
  "model_image_url": "http://localhost:8000/uploads/models/model001_web.webp",
  "product_image_url": "http://localhost:8000/uploads/products/prod001_web.webp",
  "status": "completed",
  "processing_time_ms": 10351,
  "is_favorite": false,
  "ai_provider": "gemini",
  "created_at": "2026-02-28T10:30:00Z",
  "expires_at": "2026-05-29T10:30:00Z"
}
```

**Error Responses**:

| Status | Detail |
| --- | --- |
| 400 | Model not found or has been deleted |
| 400 | Product not found or has been deleted |
| 400 | Model does not have an image uploaded |
| 400 | Product does not have any images uploaded |
| 500 | Try-on generation failed |

### POST /api/v1/tryon/with-photo -- Generate Try-On (User Photo)

**Auth**: Required (any authenticated user)

**Request**: Multipart form data

| Field | Type | Description |
| --- | --- | --- |
| `file` | File | User's photo (JPEG or PNG, min 512x512, max 10MB) |
| `product_id` | string | Product/garment ID |

**Response** (201 Created): Same as `/tryon` response, with `model_id: "user_upload"` and `model_name: "Your Photo"`.

**Error Responses**:

| Status | Detail |
| --- | --- |
| 400 | Invalid file type (only JPEG, PNG allowed) |
| 400 | File size exceeds 10MB |
| 400 | Image resolution below 512x512 |
| 400 | Product not found or has been deleted |
| 500 | Try-on generation failed |

### GET /api/v1/tryon/history -- Get Try-On History

**Auth**: Required

**Query Params**: `page` (int, default 1), `limit` (int, default 20, max 100)

**Response** (200):

```json
{
  "sessions": [],
  "total": 2,
  "page": 1,
  "limit": 20
}
```

### GET /api/v1/tryon/{session_id} -- Get Try-On Session

**Auth**: Required (user can only see their own sessions)

### PATCH /api/v1/tryon/{session_id}/favorite -- Toggle Favorite

**Auth**: Required

**Request**: `{"is_favorite": true}`

---

## Backend Files

### app/models/tryon.py

| Schema | Purpose |
| --- | --- |
| `TryOnRequest` | model_id + product_id input |
| `TryOnResponse` | Full session data with result_url |
| `TryOnHistoryResponse` | Paginated session list |
| `TryOnFavoriteRequest` | Toggle favorite flag |

### app/utils/image_processing.py

| Function | Libraries | Description |
| --- | --- | --- |
| `preprocess_model_image()` | Pillow, numpy | Resize to 1024x1024, RGB normalize |
| `preprocess_garment_image()` | Pillow, rembg, numpy | Resize min 512x512, background removal, RGBA |
| `postprocess_tryon_image()` | Pillow, OpenCV, numpy | Sharpen, contrast +5%, CLAHE, bilateral filter, PNG |

Graceful degradation: Falls back to Pillow-only if OpenCV or rembg not installed.

### app/utils/ai_clients.py

**GeminiImageClient** -- Image generation via Google Gemini API

- Model: `gemini-3.1-flash-image-preview` (configurable via `GEMINI_IMAGE_MODEL` env var)
- Methods:
  - `generate_image(prompt)` -- Text-to-image generation
  - `edit_image(prompt, image_bytes)` -- Image editing with text instruction
  - `generate_tryon(model_image, garment_image)` -- Virtual try-on via vision
  - `generate_style_variation(base_image, style)` -- Style variations (casual/formal/party/traditional)
- Retries: max 2 with exponential backoff
- Timeout: 60s
- REST endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

### app/services/tryon_service.py

Full pipeline orchestration with Gemini-first fallback:

```text
1. Gemini API       (primary)
2. Composite overlay (offline fallback)
```

Two entry points:
- `generate_tryon(store, model_id, product_id, user_id)` -- standard model-based try-on with caching
- `generate_tryon_with_user_photo(store, user_photo_bytes, product_id, user_id, user_photo_url)` -- user photo upload try-on

In-memory cache simulating Redis with 1h TTL.

### app/api/v1/endpoints/tryon.py

FastAPI router: POST /tryon, POST /tryon/with-photo, GET /tryon/history, GET /tryon/{id}, PATCH /tryon/{id}/favorite

---

## Frontend Files

### lib/api/tryon.ts

| Function | HTTP | Description |
| --- | --- | --- |
| `generateTryOn(data)` | POST /tryon | Generate try-on image (model-based) |
| `generateTryOnWithPhoto(file, productId)` | POST /tryon/with-photo | Generate try-on image (user photo) |
| `getTryOnHistory(page, limit)` | GET /tryon/history | Paginated history |
| `getTryOnSession(id)` | GET /tryon/{id} | Single session |
| `toggleTryOnFavorite(id, fav)` | PATCH /tryon/{id}/favorite | Toggle favorite |

### lib/store/tryonStore.ts

Zustand store: selectedModelId, selectedProductId, userPhoto, userPhotoPreview, currentResult, isGenerating, history, actions (generate, setUserPhoto, clearUserPhoto, fetchHistory, toggleFavorite).

### app/tryon/page.tsx -- Main Try-On Page

3-step flow:

1. **Select Model** -- Upload your own photo OR select from model grid with body type/skin tone/size filters
2. **Select Garment** -- Grid with search/category filters, pre-select via `?product={id}`
3. **Result Viewer** -- Before/after comparison, 3D view toggle, favorite toggle, try another

### components/ThreeDViewer.tsx -- 3D Result Viewer

- Uses Three.js (dynamically imported to avoid SSR issues)
- Renders try-on result image as a texture on a curved cylindrical surface
- User can rotate with mouse drag (OrbitControls)
- Auto-rotation enabled by default
- Scroll to zoom, drag to rotate
- Shows "3D View" label and interaction hints

### app/tryon/history/page.tsx -- History Page

Grid layout with result images, favorite toggle, processing time badges, pagination, favorites filter.

---

## Sample Images

10 model images and 10 product images are pre-generated and stored in `uploads/`.

Generated by: `python3 scripts/generate_sample_images.py`

| Type | Directory | Files | Format |
| --- | --- | --- | --- |
| Models | uploads/models/ | 30 (10 x 3 sizes) | WebP |
| Products | uploads/products/ | 30 (10 x 3 sizes) | WebP |

Each image has 3 variants: `{id}_original.webp`, `{id}_thumb.webp` (300x300), `{id}_web.webp` (1024x1024).

Seed data (data/models.json, data/products.json) is updated with `image_url` / `images[]` pointing to the web-optimized variants.

To regenerate with Gemini AI (when API quota is available):

```bash
# Set your Gemini API key
export GEMINI_API_KEY=your-key-here

# Run the generation script
cd backend
python3 scripts/generate_sample_images.py
```

---

## Integration Points

| Page | Change |
| --- | --- |
| `/products/[id]` | "Try On Virtually" button navigates to `/tryon?product={id}` |
| `/dashboard` | Customer dashboard links to `/tryon` with purple gradient card |
| Navbar | "Try-On" link added (desktop + mobile) |

---

## Environment Variables

```bash
# Required for AI image generation
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview
```

---

## Dependencies (Phase 3)

### Backend

| Package | Purpose |
| --- | --- |
| `numpy>=1.26.0` | Image array manipulation |
| `opencv-python-headless>=4.9.0` | CLAHE color correction, bilateral smoothing |
| `rembg>=2.0.55` | AI background removal (U2-Net) |
| `python-multipart` | Multipart form data (user photo upload) |

```bash
cd backend
pip install -r requirements.txt
```

### Frontend

| Package | Purpose |
| --- | --- |
| `three` | Three.js 3D rendering library |
| `@types/three` | TypeScript types for Three.js |

```bash
cd frontend
npm install three @types/three
```

---

## Graceful Degradation

| Failure | Behavior |
| --- | --- |
| Gemini API key missing | Falls to composite overlay |
| Gemini API quota exceeded | Falls to composite overlay |
| Gemini API timeout | Retries 2x, then falls to composite |
| All AI APIs down | Composite overlay (garment on model) |
| rembg not installed | Skips background removal |
| OpenCV not installed | Skips CLAHE and bilateral filter |
| Three.js not installed | 3D viewer shows error message, 2D view still works |

---

## Features Summary

### Virtual Try-On (Core)
- Select from brand-provided models OR upload your own photo
- AI-powered photorealistic try-on generation via Gemini `gemini-3.1-flash-image-preview`
- Fallback composite overlay when Gemini is unavailable
- Image preprocessing: resize, background removal (rembg), normalization
- Image postprocessing: sharpen, contrast, CLAHE, bilateral filter

### User Photo Upload
- Upload JPEG/PNG photos (min 512x512, max 10MB)
- Photos saved to `uploads/user_photos/`
- Same AI pipeline as model-based try-on
- Sessions saved with `model_name: "Your Photo"`

### 3D Result Viewer
- Three.js-powered 3D rotation viewer
- Try-on result mapped onto curved cylindrical surface
- Mouse drag to rotate, scroll to zoom
- Auto-rotation with damping
- Dynamically loaded (no SSR, lazy import)

### Result Management
- Before/after comparison view
- 3D rotation view
- Favorite toggle (saved in session)
- Try-on history with pagination
- Try another garment / start over actions

---

## How It Works (User Flow)

1. Customer logs in and clicks "Try-On" in the navbar or "Try On Virtually" on a product page
2. **Step 1**: Either uploads their own photo OR selects a fashion model (filterable by body type, skin tone, size)
3. **Step 2**: Selects a garment (filterable by category, searchable by name)
4. Clicks "Generate Try-On"
5. Backend pipeline runs (8-12 seconds):
   - Preprocesses model/user image (1024x1024, RGB)
   - Preprocesses garment image (background removal with rembg)
   - Calls Gemini API -> Fallback composite
   - Postprocesses result (sharpen, color correct, PNG)
   - Uploads and saves session
6. **Step 3**: Views result with before/after comparison or 3D rotation view
7. Can save to favorites, try another garment, or start over
8. All sessions saved in history at `/tryon/history`
