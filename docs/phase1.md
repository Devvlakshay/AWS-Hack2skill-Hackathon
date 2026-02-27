# Phase 1 — Foundation & Project Setup

## Status: COMPLETE (Verified & Running)

---

## Overview

Phase 1 establishes the core infrastructure — FastAPI backend with auth, local JSON file storage (no external database required), and a Next.js frontend with login/register flow in dark mode.

> **Note**: MongoDB and Redis have been replaced with a custom `JsonStore` — an in-memory data store backed by JSON files on disk. This means **zero external dependencies** (no MongoDB, no Redis) are needed to run the app.

---

## How to Run

### Prerequisites

- Python 3.11+
- Node.js 18+
- **No database required** — data is stored in local JSON files (`backend/data/`)

### Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with a secure JWT secret (optional — defaults work for development)

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend available at: `http://localhost:8000`
Swagger docs at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start dev server
npm run dev
```

Frontend available at: `http://localhost:3000`

### Sample Accounts (Pre-seeded)

| Email | Password | Role |
|-------|----------|------|
| `retailer@fitview.ai` | `password123` | Retailer |
| `customer@fitview.ai` | `password123` | Customer |

### Environment Variables

**Backend (`backend/.env`)**:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATA_DIR` | No | `data` | Directory for JSON data files |
| `JWT_SECRET_KEY` | Yes | `change-this-to-a-real-secret-key` | Secret for JWT signing. Generate: `openssl rand -hex 32` |
| `JWT_ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `30` | Token expiry in minutes |
| `BASE_URL` | No | `http://localhost:8000` | Backend base URL |
| `UPLOAD_DIR` | No | `uploads` | Local image upload directory |
| `DEBUG` | No | `true` | Debug mode |

**Frontend (`frontend/.env`)**:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8000` | Backend API URL |
| `NEXT_PUBLIC_APP_NAME` | No | `FitView AI` | App display name |

---

## User Flow

### Registration
1. User visits `http://localhost:3000/register`
2. Fills name, email, password, selects role (Customer / Retailer)
3. Frontend calls `POST /api/v1/auth/register`
4. Backend hashes password (bcrypt), saves to `data/users.json` via JsonStore, returns JWT token
5. Frontend stores token in localStorage, redirects to `/dashboard`

### Login
1. User visits `http://localhost:3000/login` (or use pre-seeded accounts above)
2. Enters email + password
3. Frontend calls `POST /api/v1/auth/login`
4. Backend verifies password against JsonStore, returns JWT token with `sub` (email) + `role`
5. Frontend stores token, redirects to `/dashboard`

### Dashboard (Protected)
1. Dashboard page checks auth state from Zustand store
2. If not authenticated → redirects to `/login`
3. Calls `GET /api/v1/auth/me` with Bearer token to fetch user profile
4. Shows role-specific content (Customer vs Retailer)

### Logout
1. User clicks Logout in Navbar
2. Zustand store clears token + user from state and localStorage
3. Redirects to `/`

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check — returns `{"status": "healthy"}` |
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login, returns JWT token |
| GET | `/api/v1/auth/me` | Bearer JWT | Get current user profile |

### Example API Calls

**Register:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@test.com", "password": "pass123", "role": "customer"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@test.com", "password": "pass123"}'
```

**Get Profile:**
```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <token_from_login>"
```

---

## Backend Files

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI entry point — CORS, lifespan (JsonStore init), health check, static files, v1 router |
| `app/core/config.py` | Pydantic `BaseSettings` loading from `.env` (DATA_DIR, JWT, uploads, AI API keys) |
| `app/core/security.py` | JWT creation/verification (`python-jose`), password hash/verify (`passlib` + `bcrypt`) |
| `app/core/deps.py` | Dependency injection: `get_store()`, `get_current_user()`, `require_role()` |
| `app/models/user.py` | Schemas: `UserCreate`, `UserLogin`, `UserResponse`, `UserInDB`, `TokenResponse`, `UserRole` enum |
| `app/services/auth_service.py` | `register_user()`, `login_user()`, `get_user_by_email()` |
| `app/utils/json_store.py` | JsonStore class — in-memory data with JSON file persistence, replaces MongoDB + Redis |
| `app/api/v1/router.py` | Main v1 router including all endpoint routers |
| `app/api/v1/endpoints/auth.py` | `POST /register`, `POST /login`, `GET /me` |
| `data/users.json` | Pre-seeded user accounts (retailer + customer) |
| `requirements.txt` | All Python dependencies (no motor/redis) |
| `.env.example` | Template for all env vars (no secrets) |

## Frontend Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — Inter font, metadata, Navbar, content wrapper |
| `src/app/page.tsx` | Landing page — hero, "How It Works" grid, CTA |
| `src/app/login/page.tsx` | Login page with AuthForm, redirects to dashboard |
| `src/app/register/page.tsx` | Register page — name, email, password, role selector |
| `src/app/dashboard/page.tsx` | Protected dashboard — user info, role-based features |
| `src/components/Navbar.tsx` | Sticky navbar — auth-aware nav, mobile hamburger menu |
| `src/components/AuthForm.tsx` | Reusable login/register form with validation |
| `src/lib/api.ts` | Axios instance — base URL, JWT interceptor, 401 auto-redirect |
| `src/lib/store/authStore.ts` | Zustand store — login, register, logout, fetchMe, localStorage persistence |

---

## Architecture Notes

- **Async throughout** — JsonStore uses `asyncio.Lock` per collection for thread safety, httpx for HTTP
- **No external databases** — JsonStore keeps data in-memory for fast reads, persists to JSON files on disk
- **Data loaded on startup** — `store.load()` reads all `*.json` files from `data/` directory into memory
- **UUID4 hex strings** for document IDs (replaces MongoDB ObjectId)
- **JWT tokens** contain `sub` (email) and `role`
- **CORS** configured with explicit `localhost:3000` origin for credential support
- **Frontend** persists auth in localStorage, rehydrates on load — dark mode by default
- **Axios interceptor** attaches Bearer token, handles 401 redirect
- **Role-based access** via `require_role()` dependency in `deps.py`

## Data Storage

Data is stored in `backend/data/` as JSON files:

| File | Contents |
|------|----------|
| `users.json` | User accounts (pre-seeded with 2 sample users) |
| `products.json` | Product catalog (pre-seeded with 10 products) |
| `models.json` | Fashion models (pre-seeded with 10 models) |

The `JsonStore` class supports:
- Equality matching, range operators (`$gte`/`$lte`), text search (`$text`/`$search`)
- Sort, pagination (skip/limit), count
- `$set` for updates, `$inc` for incrementing numeric fields
- `asyncio.Lock` per collection for concurrent write safety

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 15.5.12 |
| Frontend | React | 19 |
| Frontend | TailwindCSS | 3.4 |
| Frontend | Zustand | 5 |
| Backend | FastAPI | 0.109 |
| Backend | Python | 3.11+ |
| Storage | JsonStore (JSON files) | In-memory + disk |
| Auth | JWT (python-jose) + bcrypt | HS256 |
