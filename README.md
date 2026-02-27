# FitView AI

AI-powered virtual try-on platform for the Indian retail clothing market. Customers select brand-provided models and garments, and the system generates realistic try-on images using generative AI.

**Hackathon**: AI for Bharat 2025 - Professional Track
**Problem Statement**: 01 - AI for Retail, Commerce & Market Intelligence

## Current Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Foundation & Auth | COMPLETE |
| Phase 2 | Product & Model Management | COMPLETE |
| Phase 3 | Core Virtual Try-On Engine | Planned |
| Phase 4 | Intelligence Layer (Recommendations) | Planned |
| Phase 5 | Retailer Analytics Dashboard | Planned |
| Phase 6 | Polish, Security & Demo Prep | Planned |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- **No database required** — data is stored in local JSON files

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend: http://localhost:8000 | Swagger docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: http://localhost:3000

### Sample Accounts

| Email | Password | Role |
|-------|----------|------|
| `retailer@fitview.ai` | `password123` | Retailer |
| `customer@fitview.ai` | `password123` | Customer |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 15.5 |
| Frontend | React | 19 |
| Frontend | TailwindCSS | 3.4 |
| Frontend | Zustand | 5 |
| Backend | FastAPI (async) | 0.109 |
| Backend | Python | 3.11+ |
| Storage | JsonStore (in-memory + JSON files) | Custom |
| Images | Local filesystem + Pillow processing | Pillow 10.2 |
| Auth | JWT (`python-jose`) + bcrypt | HS256 |

## Project Structure

```
├── frontend/                  # Next.js application
│   └── src/
│       ├── app/               # App Router pages (13 routes)
│       │   ├── page.tsx              # Landing page
│       │   ├── login/                # Login
│       │   ├── register/             # Register
│       │   ├── dashboard/            # User dashboard (role-aware)
│       │   ├── products/             # Customer catalog + detail
│       │   └── retailer/             # Retailer dashboard, product & model CRUD
│       ├── components/        # Navbar, AuthForm, ProductCard, ModelCard, ImageUpload
│       └── lib/               # API clients, Zustand stores
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py            # Entry point — CORS, lifespan, health check, static files
│   │   ├── api/v1/            # REST endpoints (auth, products, models)
│   │   ├── services/          # Business logic (auth, product, model)
│   │   ├── models/            # Pydantic schemas (user, product, model)
│   │   ├── core/              # Config, security (JWT/bcrypt), dependency injection
│   │   └── utils/             # JsonStore, image storage/validation
│   └── data/                  # JSON data files (users, products, models)
├── docs/                      # Phase documentation
│   ├── phase1.md
│   └── phase2.md
└── CLAUDE.md                  # AI assistant project guide
```

## API Endpoints

### Auth (Phase 1)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login, returns JWT |
| GET | `/api/v1/auth/me` | Bearer JWT | Get current user profile |

### Products (Phase 2)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/products` | Retailer | Create product |
| GET | `/api/v1/products` | Public | List/search with filters & pagination |
| GET | `/api/v1/products/{id}` | Public | Get product by ID |
| PUT | `/api/v1/products/{id}` | Owner | Update product |
| DELETE | `/api/v1/products/{id}` | Owner | Soft delete |
| POST | `/api/v1/products/{id}/images` | Owner | Upload product image |

### Models (Phase 2)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/models` | Retailer | Create model |
| GET | `/api/v1/models` | Public | List with filters & pagination |
| GET | `/api/v1/models/{id}` | Public | Get model by ID |
| PUT | `/api/v1/models/{id}` | Owner | Update model |
| DELETE | `/api/v1/models/{id}` | Owner | Soft delete |
| POST | `/api/v1/models/{id}/image` | Owner | Upload model image |

## Frontend Routes

| Route | Role | Description |
|-------|------|-------------|
| `/` | All | Landing page — hero, how it works, CTA |
| `/login` | All | Login page |
| `/register` | All | Register with role selection |
| `/dashboard` | Auth | Role-aware dashboard with quick actions |
| `/products` | All | Customer catalog — search, filters, sort, pagination |
| `/products/[id]` | All | Product detail — gallery, sizes, size chart |
| `/retailer` | Retailer | Dashboard — stats, recent items, quick actions |
| `/retailer/products` | Retailer | Product list — grid/table, search, CRUD |
| `/retailer/products/new` | Retailer | Create product form |
| `/retailer/products/[id]/edit` | Retailer | Edit product form |
| `/retailer/models` | Retailer | Model list — filters, CRUD |
| `/retailer/models/new` | Retailer | Create model with measurements |
| `/retailer/models/[id]/edit` | Retailer | Edit model form |

## Data Storage

All data is stored in `backend/data/` as JSON files — no external database required.

| File | Records | Description |
|------|---------|-------------|
| `users.json` | 2+ | Pre-seeded retailer + customer accounts |
| `products.json` | 10 | Indian retail products (Kurtas, Sarees, Shirts, etc.) |
| `models.json` | 10 | Fashion models with varied body types and measurements |

The `JsonStore` class provides:
- In-memory storage with JSON file persistence
- Equality matching, range operators (`$gte`/`$lte`), text search
- Sort, pagination, count
- `asyncio.Lock` per collection for concurrent write safety

## Image Handling

- **Storage**: Local filesystem in `backend/uploads/`
- **Serving**: FastAPI `StaticFiles` mounted at `/uploads/`
- **Sizes**: 3 variants per upload — original, thumbnail (300x300), web-optimized (1024x1024 WebP)
- **Validation**: JPEG/PNG/WebP, min 512x512, max 10MB

## Environment Variables

**Backend (`backend/.env`)**:

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET_KEY` | `change-this-...` | Secret for JWT signing |
| `DATA_DIR` | `data` | JSON data files directory |
| `UPLOAD_DIR` | `uploads` | Image upload directory |
| `BASE_URL` | `http://localhost:8000` | Backend base URL |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT token expiry |

**Frontend (`frontend/.env`)**:

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |
| `NEXT_PUBLIC_APP_NAME` | `FitView AI` | App display name |

## Design

- Permanent dark theme across all pages
- Indigo primary accent, emerald secondary, red destructive
- Mobile-responsive (3 breakpoints)
- Role-based UI: retailers see management tools, customers see catalog

## Coding Conventions

- **Python**: PEP 8, type hints, async/await for all I/O
- **TypeScript**: Strict mode, named exports, `@/*` path aliases
- **API**: RESTful, versioned (`/api/v1/`), consistent error responses
- **Auth**: JWT Bearer tokens, role-based access via `require_role()` dependency
