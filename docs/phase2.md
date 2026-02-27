# Phase 2 — Product & Model Management

## Status: COMPLETE (Verified & Running)

---

## Overview

Phase 2 adds product catalog and fashion model management for retailers, customer-facing product browsing, and image upload with Pillow processing. All data is stored via JsonStore (in-memory + JSON files on disk). Images are stored locally in the `uploads/` directory. The entire frontend uses a permanent dark theme.

> **Note**: No MongoDB or Redis required. Data persists in `backend/data/*.json` files.

---

## How to Run

### Prerequisites

- Phase 1 running (backend on `:8000`, frontend on `:3000`)
- **No database required** — data stored in `backend/data/` JSON files

### Quick Start

```bash
# Terminal 1 — Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### Sample Data (Pre-seeded)

The backend comes pre-loaded with sample data for immediate testing:

- **2 Users**: `retailer@fitview.ai` / `customer@fitview.ai` (password: `password123`)
- **10 Products**: Kurta, Shirt, Anarkali, Jeans, Saree, T-Shirt, Bomber Jacket, Palazzo Set, Wrap Dress, Nehru Jacket (INR pricing)
- **10 Models**: Ananya, Meera, Riya, Divya, Zara, Kavya, Lakshmi, Priya, Sneha, Isha (varied body types/sizes)

---

## User Flows

### Retailer: Add a Product

1. Login as retailer (`retailer@fitview.ai` / `password123`) → lands on `/dashboard`
2. Click "Retailer Dashboard" → `/retailer`
3. Click "Manage Products" → `/retailer/products` (10 sample products pre-loaded)
4. Click "Add Product" → `/retailer/products/new`
5. Fill form: name, description, category, price, sizes, colors, tags
6. Upload product images (JPEG/PNG/WebP, min 512x512)
7. Submit → `POST /api/v1/products` saves product to `data/products.json` via JsonStore
8. Upload images → `POST /api/v1/products/{id}/images` saves to `uploads/` with 3 sizes

### Retailer: Add a Model

1. From retailer dashboard → "Manage Models" → `/retailer/models` (10 sample models pre-loaded)
2. Click "Add Model" → `/retailer/models/new`
3. Fill form: name, body type, size, height, skin tone, measurements (bust/waist/hip)
4. Upload model image
5. Submit → `POST /api/v1/models` saves model to `data/models.json` via JsonStore
6. Upload image → `POST /api/v1/models/{id}/image` saves to `uploads/`

### Retailer: Edit/Delete

1. From product/model list page, click Edit on any item
2. Edit form loads pre-populated data from `GET /api/v1/products/{id}` or `GET /api/v1/models/{id}`
3. Save → `PUT /api/v1/products/{id}` or `PUT /api/v1/models/{id}`
4. Delete → `DELETE /api/v1/products/{id}` (soft delete, sets `is_active=false`)

### Customer: Browse Products

1. Visit `/products` — catalog page with product grid (dark theme)
2. Use search bar to text-search (JsonStore text search on name+description+tags)
3. Filter by category in sidebar
4. Filter by price range (min/max)
5. Sort by: price low-high, price high-low, newest, name
6. Paginate through results
7. Click a product → `/products/[id]` detail page

### Customer: View Product Detail

1. Product detail page shows: image gallery, description, price, colors, tags
2. Select a size → shows stock availability
3. View size chart table
4. "Try On Virtually" button (placeholder — activates in Phase 3)
5. "Add to Wishlist" button (placeholder — activates in Phase 4)

---

## API Endpoints (12 new)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/products` | Retailer | Create product |
| GET | `/api/v1/products` | Public | List/search with filters & pagination |
| GET | `/api/v1/products/{id}` | Public | Get product by ID |
| PUT | `/api/v1/products/{id}` | Owner retailer | Update product |
| DELETE | `/api/v1/products/{id}` | Owner retailer | Soft delete |
| POST | `/api/v1/products/{id}/images` | Owner retailer | Upload product image |
| POST | `/api/v1/models` | Retailer | Create model |
| GET | `/api/v1/models` | Public | List with filters & pagination |
| GET | `/api/v1/models/{id}` | Public | Get model by ID |
| PUT | `/api/v1/models/{id}` | Owner retailer | Update model |
| DELETE | `/api/v1/models/{id}` | Owner retailer | Soft delete |
| POST | `/api/v1/models/{id}/image` | Owner retailer | Upload model image |

### Example API Calls

**Create Product (as retailer):**
```bash
curl -X POST http://localhost:8000/api/v1/products \
  -H "Authorization: Bearer <retailer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cotton Kurta",
    "description": "Handloom cotton kurta with block print",
    "category": "Kurtas",
    "price": 1299,
    "currency": "INR",
    "sizes": [{"size": "S", "stock": 10}, {"size": "M", "stock": 15}, {"size": "L", "stock": 12}],
    "colors": ["Blue", "White"],
    "tags": ["cotton", "handloom", "casual"],
    "material": "Cotton"
  }'
```

**Search Products:**
```bash
curl "http://localhost:8000/api/v1/products?search=cotton&category=Kurtas&min_price=500&max_price=2000&page=1&page_size=10&sort_by=price_asc"
```

**Upload Product Image:**
```bash
curl -X POST http://localhost:8000/api/v1/products/<product_id>/images \
  -H "Authorization: Bearer <retailer_token>" \
  -F "file=@/path/to/image.jpg"
```

**Create Model (as retailer):**
```bash
curl -X POST http://localhost:8000/api/v1/models \
  -H "Authorization: Bearer <retailer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya",
    "body_type": "slim",
    "height_cm": 165,
    "skin_tone": "medium",
    "gender": "female",
    "measurements": {"bust": 34, "waist": 28, "hip": 36}
  }'
```

**List Models with Filters:**
```bash
curl "http://localhost:8000/api/v1/models?body_type=slim&skin_tone=medium&gender=female&page=1&page_size=10"
```

---

## Frontend Routes (9 new)

| Route | Role | Description |
|-------|------|-------------|
| `/products` | All | Customer product catalog with search, filters, sorting, pagination |
| `/products/[id]` | All | Product detail — gallery, size selector, size chart, try-on placeholder |
| `/retailer` | Retailer | Retailer dashboard — stats, quick actions |
| `/retailer/products` | Retailer | Product list — grid/table views, search, CRUD |
| `/retailer/products/new` | Retailer | Create product form |
| `/retailer/products/[id]/edit` | Retailer | Edit product form |
| `/retailer/models` | Retailer | Model list — filters, CRUD |
| `/retailer/models/new` | Retailer | Create model form with measurements |
| `/retailer/models/[id]/edit` | Retailer | Edit model form |

---

## Backend Files

| File | Purpose |
|------|---------|
| `app/utils/json_store.py` | JsonStore class — in-memory data with JSON file persistence (replaces MongoDB + Redis) |
| `app/models/product.py` | Schemas: `ProductCreate`, `ProductUpdate`, `ProductResponse`, `ProductListResponse`, `SizeStock` |
| `app/models/model.py` | Schemas: `ModelCreate`, `ModelUpdate`, `ModelResponse`, `ModelListResponse`, `BodyType`/`SkinTone`/`ModelSize` enums, `Measurements` |
| `app/services/product_service.py` | Product CRUD, text search, filtering, pagination via JsonStore |
| `app/services/model_service.py` | Model CRUD, filtering, pagination, usage count tracking via JsonStore |
| `app/utils/storage.py` | Local image storage, validation (format/resolution/size), thumbnail & optimized generation via Pillow |
| `app/api/v1/endpoints/products.py` | Product REST endpoints (6 routes), retailer-only write access |
| `app/api/v1/endpoints/models.py` | Model REST endpoints (6 routes), retailer-only write access |
| `app/core/deps.py` | Dependency injection: `get_store()`, `get_current_user()`, `require_role()` |
| `app/core/config.py` | Settings: `DATA_DIR`, `JWT_SECRET_KEY`, `BASE_URL`, `UPLOAD_DIR` |
| `app/main.py` | Lifespan initializes JsonStore, mounts static files for `uploads/` |
| `data/products.json` | Pre-seeded with 10 Indian retail products |
| `data/models.json` | Pre-seeded with 10 fashion models (varied body types) |
| `requirements.txt` | Dependencies — no motor/redis, includes `Pillow==10.2.0` |

## Frontend Files Created

| File | Purpose |
|------|---------|
| `src/lib/api/products.ts` | Product API client (CRUD, search, image upload) |
| `src/lib/api/models.ts` | Model API client (CRUD, image upload) |
| `src/lib/store/productStore.ts` | Zustand product state management |
| `src/lib/store/modelStore.ts` | Zustand model state management |
| `src/components/ImageUpload.tsx` | Drag-and-drop image upload with preview |
| `src/components/ProductCard.tsx` | Product card for grid display |
| `src/components/ModelCard.tsx` | Model card for grid display |
| `src/app/retailer/page.tsx` | Retailer dashboard — stats, recent items, quick actions |
| `src/app/retailer/products/page.tsx` | Product list — search, filters, grid/table views, pagination |
| `src/app/retailer/products/new/page.tsx` | Create product form |
| `src/app/retailer/products/[id]/edit/page.tsx` | Edit product form |
| `src/app/retailer/models/page.tsx` | Model list — body type/skin tone/size filters, pagination |
| `src/app/retailer/models/new/page.tsx` | Create model form with measurements + image |
| `src/app/retailer/models/[id]/edit/page.tsx` | Edit model form |
| `src/app/products/page.tsx` | Customer catalog — search, category sidebar, price filter, sort, pagination |
| `src/app/products/[id]/page.tsx` | Product detail — image gallery, size selector, colors, tags, size chart |

## Frontend Files Modified

| File | Changes |
|------|---------|
| `src/app/dashboard/page.tsx` | Added role-specific quick action cards (retailer vs customer) |
| `src/components/Navbar.tsx` | Added Products link, Retailer link (retailers only), mobile hamburger menu |

---

## Image Storage

- **Storage**: Local filesystem in `uploads/` directory
- **Serving**: FastAPI `StaticFiles` mounted at `/uploads/`
- **Sizes**: 3 variants per image — original, thumbnail (300x300), web-optimized (1024x1024 WebP)
- **Validation**: Format (JPEG/PNG/WebP), min resolution (512x512), max size (10MB)

## Data Storage

- **Engine**: `JsonStore` — in-memory dict backed by JSON files in `backend/data/`
- **No Redis**: Data is already in memory, so no separate cache layer needed
- **No MongoDB**: JSON files replace document collections
- **Persistence**: Written to disk on every mutation (`insert_one`, `update_one`)
- **Text search**: JsonStore supports `$text`/`$search` operators for searching name+description+tags
- **Thread safety**: `asyncio.Lock` per collection for concurrent write protection

### Data Files

| File | Records | Description |
|------|---------|-------------|
| `data/users.json` | 2+ | Pre-seeded retailer + customer accounts |
| `data/products.json` | 10 | Indian retail products (Kurta, Shirt, Anarkali, Jeans, Saree, T-Shirt, Bomber Jacket, Palazzo Set, Wrap Dress, Nehru Jacket) |
| `data/models.json` | 10 | Fashion models with varied body types, sizes, and measurements (Ananya, Meera, Riya, Divya, Zara, Kavya, Lakshmi, Priya, Sneha, Isha) |

## Dark Mode

The entire frontend uses a permanent dark theme (no toggle):
- **Background**: `bg-gray-950` (pages), `bg-gray-900` (cards/sections)
- **Borders**: `border-gray-800`
- **Text**: `text-white` (headings), `text-gray-300` (body), `text-gray-400`/`text-gray-500` (muted)
- **Inputs**: `bg-gray-800 border-gray-700 text-white placeholder-gray-500`
- **Accents**: `indigo-600` (primary buttons), `emerald-600` (secondary), `red-400` (destructive)

## Access Control

- Only retailers can create/update/delete products and models
- Retailers can only modify their own resources (ownership check via `retailer_id`)
- Soft delete pattern (`is_active` / `is_deleted` flag)
- Public read access for browsing
