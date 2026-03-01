# FitView AI - Project Guide

## Project Overview

FitView AI is an AI-powered virtual try-on platform for the Indian retail clothing market. Customers select brand-provided models and garments, and the system generates realistic try-on images using generative AI (Nano Banana + Gemini Image).

**Hackathon**: AI for Bharat 2025 - Professional Track
**Problem Statement**: 01 - AI for Retail, Commerce & Market Intelligence

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS, Zustand
- **Backend**: FastAPI (Python 3.11+), async
- **Database**: MongoDB Atlas (NoSQL)
- **Cache**: Redis 7+ (sessions, try-on results, product catalog, analytics)
- **Storage**: AWS S3 / Cloudinary (images + CDN)
- **AI**: Nano Banana (Google) for virtual try-on, Gemini Image for style variations
- **Auth**: JWT + bcrypt, role-based (Customer, Retailer, Admin)

## Python Libraries (Backend)

| Library | Purpose |
|---------|---------|   
| `fastapi` + `uvicorn` | Web framework + ASGI server |
| `motor` | Async MongoDB driver |
| `aioredis` | Async Redis client |
| `python-jose` | JWT token generation/validation |
| `passlib` + `bcrypt` | Password hashing |
| `pydantic` | Data validation, schemas, settings |
| `httpx` | Async HTTP client for AI API calls |
| `Pillow` | Image resize, format conversion, enhancement |
| `OpenCV` (`cv2`) | Advanced image processing, color correction |
| `rembg` | AI-powered background removal (U2-Net model) |
| `numpy` | Image array manipulation for preprocessing |
| `scikit-learn` | Collaborative/content-based filtering for recommendations |
| `pandas` | Analytics aggregation, time-series analysis |
| `boto3` | AWS S3 uploads |
| `cloudinary` | Cloudinary SDK (alternative to S3) |
| `reportlab` / `weasyprint` | PDF report generation |
| `celery` | Background task processing (heavy jobs) |

## Project Structure (Target)

```text
├── frontend/                 # Next.js 14 application
│   ├── app/                  # App Router pages
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Utilities, API client, stores (Zustand)
│   └── public/               # Static assets
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── api/v1/           # API route handlers
│   │   ├── services/         # Business logic
│   │   │   ├── auth_service.py          # JWT, bcrypt, sessions
│   │   │   ├── product_service.py       # CRUD, search, caching
│   │   │   ├── model_service.py         # Model image management
│   │   │   ├── tryon_service.py         # ★ CORE AI: preprocess → Nano Banana → postprocess
│   │   │   ├── style_service.py         # ★ AI: Gemini Image style variations
│   │   │   ├── recommendation_service.py# ★ AI: size/style recommendations
│   │   │   └── analytics_service.py     # Data aggregation, forecasting
│   │   ├── models/           # Pydantic schemas + MongoDB document models
│   │   ├── core/             # Config, security, dependencies
│   │   │   ├── config.py     # Pydantic Settings (.env loading)
│   │   │   ├── security.py   # JWT helpers, password hashing
│   │   │   └── deps.py       # Dependency injection (get_db, get_current_user)
│   │   └── utils/
│   │       ├── image_processing.py  # ★ Pillow/OpenCV/rembg preprocessing
│   │       ├── ai_clients.py        # ★ httpx clients for Nano Banana & Gemini APIs
│   │       ├── cache.py             # Redis helpers
│   │       └── storage.py           # S3/Cloudinary upload helpers
│   ├── tests/
│   └── requirements.txt
├── design.md
├── requirements.md
└── CLAUDE.md
```

## Coding Conventions

- **Python**: Follow PEP 8, use type hints, async/await for I/O
- **JavaScript/TypeScript**: Use TypeScript throughout frontend, prefer named exports
- **API**: RESTful, versioned (`/api/v1/`), consistent error responses
- **Commits**: Conventional commits (feat:, fix:, chore:, docs:)
- **Environment**: Use `.env` files for secrets, never commit them

---

## Implementation Phases

### Phase 1: Foundation & Project Setup (Days 1-3)

**Goal**: Get both frontend and backend running with basic auth.

**No AI in this phase** — pure infrastructure.

**Python/FastAPI work**:

- FastAPI app with async setup, CORS middleware, health check endpoint
- MongoDB connection using `motor` (async driver)
- Redis connection using `aioredis`
- User model with Pydantic schemas (registration, login, response)
- Auth endpoints: `POST /register`, `POST /login`, `GET /me`
- JWT token generation with `python-jose`, password hashing with `passlib` + `bcrypt`
- Role-based access control middleware (Customer, Retailer, Admin)
- Environment config via Pydantic `BaseSettings` loading from `.env`

**Frontend work**:

- Initialize Next.js 14 with App Router, TailwindCSS, TypeScript
- Build pages: Landing, Login, Register
- Set up Zustand store for auth state
- API client utility with JWT token handling

**Deliverables**: Working auth flow end-to-end, both servers running.

---

### Phase 2: Product & Model Management (Days 4-7)

**Goal**: Retailers can upload models and manage product catalog.

**Light AI** — image validation with Pillow, but no generative AI yet.

**Python/FastAPI work**:

- Product Service: CRUD endpoints with MongoDB queries
  - MongoDB text indexes on `name`, `description`, `tags` for search
  - Category-based filtering, pagination, sorting
- Model Service: CRUD for brand-provided model images + metadata
  - Metadata: body type, measurements, skin tone, height
- Image upload pipeline:
  - `boto3` for S3 uploads OR `cloudinary` SDK
  - Generate multiple resolutions (original, thumbnail, web-optimized) using `Pillow`
- Image validation using `Pillow`: check format, resolution (min 1024x1024), quality
- Size chart management per product
- Redis caching: product catalog (6h TTL), model data (6h TTL)

**Frontend work**:

- Retailer dashboard layout
- Product management page (add/edit/delete products, upload images)
- Model upload page (upload model images with metadata form)

**Deliverables**: Retailer can sign in, upload models, add/edit/delete products.

---

### Phase 3: Core Virtual Try-On Engine (Days 8-14) — HEAVY AI PHASE ✅ COMPLETE

**Goal**: Working end-to-end try-on generation flow. This is the **core product**.

**Status**: IMPLEMENTED. All backend services, API endpoints, and frontend pages are complete.

**Python AI Pipeline** (`tryon_service.py` + `image_processing.py` + `ai_clients.py`):

```text
Step 1: IMAGE PREPROCESSING (Python + Pillow + OpenCV + rembg)
├── Resize model image to 1024x1024 using Pillow
├── Resize garment image to minimum 512x512
├── Normalize pixel values to RGB format using numpy
├── Background removal on garment using rembg (U2-Net AI model)
└── Image segmentation for clean garment isolation

Step 2: AI GENERATION (Nano Banana API via httpx)
├── Build API request with preprocessed model + garment images
├── Send async POST request using httpx client
├── Nano Banana generates photorealistic try-on (~8-10 sec)
├── Handle timeouts (15s), retries (max 2), and error fallbacks
└── Receive generated try-on image in response

Step 3: POST-PROCESSING (Python + Pillow + OpenCV)
├── Quality enhancement: sharpening, contrast adjustment via Pillow
├── Color correction to match original garment colors using OpenCV
├── Artifact removal / boundary smoothing using OpenCV
├── Final resize and WebP format optimization
└── Upload result to S3/Cloudinary using boto3/cloudinary SDK

Step 4: CACHING & STORAGE
├── Cache result in Redis: key tryon:{model_id}:{product_id} (1h TTL)
├── Save TryOn Session document in MongoDB (user_id, model_id, product_id, result_url, timestamp)
└── Return CDN URL to frontend
```

**Python code structure for this phase**:

```python
# utils/image_processing.py
async def preprocess_model_image(image_bytes) -> np.ndarray:
    """Resize to 1024x1024, normalize RGB"""

async def preprocess_garment_image(image_bytes) -> np.ndarray:
    """Resize, remove background with rembg, normalize"""

async def postprocess_tryon_image(image_bytes) -> bytes:
    """Enhance quality, correct colors, remove artifacts, convert to WebP"""

# utils/ai_clients.py
class NanoBananaClient:
    """Async httpx client for Nano Banana virtual try-on API"""
    async def generate_tryon(self, model_image, garment_image) -> bytes

# services/tryon_service.py
class TryOnService:
    async def generate(self, model_id, product_id, user_id) -> TryOnResult:
        # 1. Check Redis cache first
        # 2. Fetch model + product images from S3
        # 3. Preprocess both images
        # 4. Call Nano Banana API
        # 5. Postprocess result
        # 6. Upload to S3, save to MongoDB, cache in Redis
        # 7. Return result URL
```

**Frontend work**:

- Customer-facing model selection UI (browse, filter by body type/size/skin tone)
- Product browsing UI (categories, search, filters, sorting)
- Try-on result viewer: zoom/pan controls, before/after comparison
- Loading states with progress indicators for the 8-10s generation wait
- Try-on history page: past results, mark favorites

**Deliverables**: Customer selects model + garment → gets AI-generated try-on image. ✅

**Phase 3 Implementation Summary (Completed)**:
- **Backend**: `models/tryon.py` (schemas), `utils/image_processing.py` (Pillow/OpenCV/rembg preprocessing & postprocessing), `utils/ai_clients.py` (NanoBananaClient async httpx), `services/tryon_service.py` (full pipeline with cache, fallback composite), `api/v1/endpoints/tryon.py` (POST /tryon, GET /tryon/history, GET /tryon/{id}, PATCH /tryon/{id}/favorite)
- **Frontend**: `lib/api/tryon.ts` (API functions), `lib/store/tryonStore.ts` (Zustand store), `app/tryon/page.tsx` (3-step try-on flow: model select → garment select → result viewer with before/after), `app/tryon/history/page.tsx` (history with favorites & pagination)
- **Integration**: Product detail "Try On Virtually" button links to /tryon?product={id}, Dashboard links to try-on, Navbar includes Try-On link
- **AI Fallback**: When Nano Banana API is unavailable, creates composite overlay image as graceful degradation

---

### Phase 4: Intelligence Layer (Days 15-20) — AI ENHANCEMENT PHASE

**Goal**: Style variations, size/style recommendations, cart/wishlist.

**4a. Gemini Image Integration** (`style_service.py` + `ai_clients.py`):

```python
# utils/ai_clients.py
class GeminiImageClient:
    """Async httpx client for Gemini Image style generation API"""

    # Prompt engineering for different contexts
    STYLE_PROMPTS = {
        "casual":  "Show this outfit in a casual street setting, natural lighting...",
        "formal":  "Show this outfit in a formal office environment...",
        "party":   "Show this outfit in an evening party setting, warm lighting..."
    }

    async def generate_style_variation(self, base_image, style: str) -> bytes
    async def generate_color_variation(self, garment_image, target_color) -> bytes
```

**4b. Size Recommendation** (`recommendation_service.py` + `scikit-learn`):

```python
# Collaborative filtering approach
# Input: user body measurements + product size chart + historical feedback from similar users
# Method: users with similar measurements who bought this product chose size X
# Output: recommended size + confidence score (e.g., "M — 87% confidence")

class SizeRecommendationEngine:
    async def recommend(self, user_id, product_id) -> SizeRecommendation:
        # 1. Get user measurements from MongoDB
        # 2. Get product size chart
        # 3. Find similar users (by measurements) who bought this product
        # 4. Apply collaborative filtering (scikit-learn NearestNeighbors)
        # 5. Return size + confidence score
```

**4c. Style Recommendation** (`recommendation_service.py` + `scikit-learn`):

```python
# Content-based + collaborative filtering
# Uses product attributes (color, category, tags, material) as feature vectors

class StyleRecommendationEngine:
    async def recommend(self, user_id, limit=10) -> list[Product]:
        # 1. Get user's try-on history from MongoDB
        # 2. Build feature vectors from tried products (TF-IDF on tags/categories)
        # 3. Find similar products using cosine similarity (scikit-learn)
        # 4. Also apply collaborative: "users who tried X also liked Y"
        # 5. Merge and rank results
        # 6. Cache in Redis (1h TTL)
```

**Frontend work**:

- Style variation carousel (casual/formal/party toggle)
- Size recommendation widget on product page
- "You may also like" / "Complete the look" sections
- Shopping cart (with try-on images for tried items)
- Wishlist functionality
- Side-by-side garment comparison

**Deliverables**: AI-powered recommendations, style variations, functional cart/wishlist.

---

### Phase 5: Retailer Analytics Dashboard (Days 21-25) — DATA PROCESSING PHASE

**Goal**: Full analytics with real-time tracking and export.

**Python/FastAPI work** (`analytics_service.py` + `pandas`):

```python
class AnalyticsService:
    # Event tracking — buffer in memory, batch write to MongoDB
    event_buffer: list = []  # in-memory buffer

    async def track_event(self, event_type, user_id, product_id, metadata):
        self.event_buffer.append(event)
        if len(self.event_buffer) >= 100:
            await self.flush_events()

    # Runs every 5 minutes via BackgroundTasks or Celery
    async def flush_events(self):
        # Aggregate events by retailer/product/date using pandas
        # Upsert aggregated data into MongoDB Analytics collection
        # Invalidate Redis analytics cache

    async def get_dashboard_data(self, retailer_id, date_range) -> DashboardData:
        # Check Redis cache first (30min TTL)
        # Query MongoDB Analytics collection
        # Return: try-on counts, conversion rates, popular products,
        #         model preferences, size distribution

    async def get_demand_forecast(self, retailer_id, product_id) -> Forecast:
        # Simple time-series analysis using pandas
        # Based on try-on patterns over time

    async def export_csv(self, retailer_id, date_range) -> bytes:
        # Generate CSV using Python csv module

    async def export_pdf(self, retailer_id, date_range) -> bytes:
        # Generate PDF report using reportlab or weasyprint
```

**Frontend work**:

- Dashboard UI with charts (Recharts or Chart.js)
- Try-on counts, conversion funnels, popular products
- Model preference analytics per category
- Size distribution charts
- Date range filtering, period-over-period comparison
- Export buttons (CSV, PDF)

**Deliverables**: Retailer sees comprehensive dashboard with actionable insights.

---

### Phase 6: Polish, Security & Demo Prep (Days 26-30)

**Goal**: Production-ready quality, performance, and demo.

**Python work**:

- Rate limiting middleware: 10 try-ons/min, 5 logins/min per IP
- Input validation and sanitization across all endpoints
- Graceful degradation: fallback responses when Nano Banana / Gemini APIs are down
- TTL index on `tryon_sessions.expires_at` for auto-deletion after 90 days
- DPDPA compliance endpoints: `GET /api/v1/users/me/export`, `DELETE /api/v1/users/me`
- Demo data seeding script (sample retailers, products, models, try-on results)

**Frontend work**:

- Mobile-responsive polish (< 640px, 640-1024px, > 1024px breakpoints)
- Performance: lazy loading, code splitting, image optimization (WebP via Next.js Image)
- Hindi language support (i18n with `next-intl` or similar)
- Onboarding tutorial for first-time users

**Both**:

- End-to-end testing of critical flows
- Documentation and demo preparation

**Deliverables**: Polished, secure, demo-ready application.

---

## AI Touchpoints Summary

The project has **3 distinct AI integration points**:

| AI Component | Phase | Python Libraries | Purpose |
|--------------|-------|------------------|---------|
| **Nano Banana** (Google) | Phase 3 | `httpx`, `Pillow`, `OpenCV`, `rembg`, `numpy` | Core virtual try-on generation |
| **Gemini Image** | Phase 4 | `httpx`, `Pillow` | Style/context variations (casual, formal, party) |
| **ML Recommendations** | Phase 4 | `scikit-learn`, `numpy`, `pandas` | Size & style suggestions via collaborative/content filtering |

Supporting AI utilities:

- `rembg` — uses U2-Net deep learning model for background removal (preprocessing step)
- `OpenCV` — color correction, artifact removal, boundary smoothing (postprocessing step)

---

## Key API Endpoints (Reference)

| Method | Endpoint | Service | Description |
|--------|----------|---------|-------------|
| POST | /api/v1/auth/register | Auth | User registration |
| POST | /api/v1/auth/login | Auth | Login, returns JWT |
| GET | /api/v1/products | Product | List/search products |
| POST | /api/v1/products | Product | Create product (retailer) |
| GET | /api/v1/models | Model | List models with filters |
| POST | /api/v1/models | Model | Upload model (retailer) |
| POST | /api/v1/tryon | TryOn | Generate try-on image |
| GET | /api/v1/tryon/history | TryOn | User's try-on history |
| POST | /api/v1/tryon/style-variation | TryOn | Generate style variation |
| GET | /api/v1/recommendations/size | Recommendation | Size recommendation |
| GET | /api/v1/recommendations/style | Recommendation | Style recommendation |
| GET | /api/v1/analytics/dashboard | Analytics | Retailer dashboard data |
| GET | /api/v1/analytics/export | Analytics | Export reports |

## MongoDB Collections

- **users**: indexes on `email` (unique), `role`, `created_at`
- **models**: indexes on `retailer_id`, `body_type`, `is_active`
- **products**: indexes on `retailer_id`, `category`, text index on `name`+`description`+`tags`
- **tryon_sessions**: indexes on `user_id`, `product_id`, `created_at`; TTL on `expires_at` (90 days)
- **analytics**: indexes on `date`+`retailer_id`, `date`+`product_id`

## Redis Key Patterns

- `session:{session_id}` — 24h TTL
- `tryon:{model_id}:{product_id}` — 1h TTL
- `product:{product_id}` — 6h TTL
- `analytics:retailer:{retailer_id}:{date}` — 30min TTL

## Important Notes

- Never commit `.env` files or API keys
- All AI generation (Nano Banana, Gemini Image) depends on external APIs — always handle failures gracefully
- Images must be preprocessed to 1024x1024 before sending to Nano Banana
- Use async throughout the backend — `motor` for MongoDB, `aioredis` for Redis, `httpx` for external API calls
- Mobile-first responsive design with 3 breakpoints
