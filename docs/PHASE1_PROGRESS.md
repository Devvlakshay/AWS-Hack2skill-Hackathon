# Phase 1 - Foundation & Project Setup - Progress

## Status: COMPLETE (Audited and Verified)

**Last audit**: 2026-02-24

---

## Audit Summary

### Issues Found and Fixed

| # | Severity | File | Issue | Fix Applied |
|---|----------|------|-------|-------------|
| 1 | **CRITICAL** | `backend/app/core/deps.py` | No `require_role` dependency for role-based access control. Phase 1 spec requires RBAC middleware but none existed. | Added `require_role(allowed_roles)` dependency factory that returns a FastAPI dependency checking the user's role against allowed roles. Returns 403 if unauthorized. |
| 2 | **HIGH** | `backend/app/main.py` | `allow_origins=["*"]` with `allow_credentials=True` is invalid per CORS spec. Browsers will reject credentialed requests with wildcard origins. | Changed to explicit origins: `["http://localhost:3000", "http://127.0.0.1:3000"]`. |
| 3 | **HIGH** | `backend/requirements.txt` | `passlib==1.7.4` + `bcrypt==4.1.2` incompatibility. passlib 1.7.4 uses `bcrypt.__about__` which was removed in bcrypt 4.1+. | Pinned `bcrypt==4.0.1` for compatibility. |
| 4 | **HIGH** | `backend/requirements.txt` | `email-validator` package missing. Pydantic's `EmailStr` requires it, causing an ImportError at runtime. | Added `email-validator==2.1.0` to requirements. |
| 5 | **MEDIUM** | `backend/app/models/user.py` | `datetime.utcnow()` used as default factory. This is deprecated in Python 3.12+ and returns naive datetime. | Replaced with `datetime.now(timezone.utc)` via a `_utc_now()` helper function. |
| 6 | **MEDIUM** | `backend/app/services/auth_service.py` | `datetime.utcnow()` used for `created_at` and `updated_at` fields. Same deprecation issue. | Replaced with `datetime.now(timezone.utc)`. |
| 7 | **MEDIUM** | `backend/app/services/auth_service.py` | JWT token payload only included `sub` (email). Role not included in token. | Added `role` to JWT payload in both `register_user` and `login_user` for better authorization support. |
| 8 | **LOW** | `backend/requirements.txt` | `pydantic[dotenv]` extra does not exist in Pydantic v2. The `dotenv` extra was a v1 feature. | Changed to plain `pydantic==2.5.3`. |
| 9 | **LOW** | `backend/app/core/deps.py` | `get_redis()` raised HTTPException when Redis was unavailable, but Redis should be non-critical. | Changed to return `None` instead of raising, matching the service layer's `Optional[Redis]` pattern. |
| 10 | **LOW** | `backend/.env.example` | Missing `BASE_URL` and `UPLOAD_DIR` variables that `config.py` defines. | Added both to `.env.example`. |

### Components Verified Working (No Changes Needed)

| Component | Status | Notes |
|-----------|--------|-------|
| FastAPI app setup | OK | Proper lifespan context manager, health check endpoint |
| MongoDB connection (motor) | OK | Async driver correctly initialized in lifespan |
| Redis connection (aioredis) | OK | Non-critical failure handling, graceful degradation |
| User model (Pydantic schemas) | OK | UserCreate, UserLogin, UserResponse, UserInDB, TokenResponse all correct |
| Auth endpoints | OK | POST /register, POST /login, GET /me all functional |
| JWT token generation | OK | python-jose with HS256, configurable expiry |
| Password hashing | OK | passlib + bcrypt, proper verify/hash functions |
| MongoDB index creation | OK | Unique email index, role index, created_at index |
| Redis cache helpers | OK | JSON serialization, TTL support, error handling |
| Frontend Next.js setup | OK | App Router, TailwindCSS, TypeScript, path aliases |
| Frontend Landing page | OK | Hero section, features grid, CTA |
| Frontend Login page | OK | AuthForm component, redirect on success, error display |
| Frontend Register page | OK | Name, email, password, role fields, redirect on success |
| Frontend Dashboard page | OK | Protected route, role-based feature display, user info |
| Zustand auth store | OK | login, register, logout, fetchMe, hydrate, localStorage persistence |
| API client (Axios) | OK | JWT interceptor, 401 auto-redirect, base URL config |
| Navbar component | OK | Auth-aware, mounted check prevents hydration mismatch |
| AuthForm component | OK | Reusable for login/register, validation, error display |

---

## What Was Created

### Backend (`backend/`)

| File | Purpose |
|------|---------|
| `requirements.txt` | Python dependencies: FastAPI, uvicorn, motor, redis, python-jose, passlib, pydantic-settings, httpx, email-validator, etc. |
| `.env.example` | Template with all required environment variables (no real secrets) |
| `.gitignore` | Ignores __pycache__, .env, venv/, *.pyc |
| `app/__init__.py` | Package init |
| `app/main.py` | FastAPI application entry point. Configures CORS, includes v1 router, manages MongoDB/Redis lifecycle via lifespan context, provides `/health` endpoint. |
| `app/core/__init__.py` | Package init |
| `app/core/config.py` | Pydantic BaseSettings class loading config from `.env`. Includes MongoDB, Redis, JWT, Cloudinary, and AI API settings. |
| `app/core/security.py` | JWT token creation/verification using python-jose. Password hashing/verification using passlib with bcrypt. |
| `app/core/deps.py` | FastAPI dependency injection: `get_db()`, `get_redis()`, `get_current_user()`, and `require_role()` for RBAC. |
| `app/models/__init__.py` | Package init |
| `app/models/user.py` | Pydantic schemas: `UserCreate`, `UserLogin`, `UserResponse`, `UserInDB`, `TokenResponse`, `UserRole` enum. |
| `app/services/__init__.py` | Package init |
| `app/services/auth_service.py` | Business logic: `register_user()`, `login_user()`, `get_user_by_email()`, `create_indexes()`. |
| `app/utils/__init__.py` | Package init |
| `app/utils/cache.py` | Redis helper functions: `cache_get`, `cache_set`, `cache_delete`, `cache_exists`. |
| `app/api/__init__.py` | Package init |
| `app/api/v1/__init__.py` | Package init |
| `app/api/v1/router.py` | Main v1 API router that includes all endpoint routers. |
| `app/api/v1/endpoints/__init__.py` | Package init |
| `app/api/v1/endpoints/auth.py` | Auth endpoints: `POST /register`, `POST /login`, `GET /me`. |

### Frontend (`frontend/`)

| File | Purpose |
|------|---------|
| `package.json` | Next.js 14 project with React 18, TailwindCSS, Zustand, Axios |
| `tsconfig.json` | TypeScript configuration with path aliases (@/*) |
| `next.config.js` | Next.js configuration |
| `postcss.config.js` | PostCSS with TailwindCSS and Autoprefixer |
| `tailwind.config.ts` | TailwindCSS config with custom primary (indigo) + accent (violet) color scheme |
| `.gitignore` | Ignores node_modules, .next, build artifacts, env files |
| `src/app/globals.css` | Global styles with Tailwind directives |
| `src/app/layout.tsx` | Root layout with Inter font, metadata, Navbar, and main content wrapper |
| `src/app/page.tsx` | Landing page with hero section, 3-step feature grid, and CTA section |
| `src/app/login/page.tsx` | Login page with AuthForm component, redirects to dashboard on success |
| `src/app/register/page.tsx` | Register page with AuthForm (name, email, password, role selector) |
| `src/app/dashboard/page.tsx` | Protected dashboard showing user info, role-based features |
| `src/components/Navbar.tsx` | Sticky navbar with auth-aware navigation |
| `src/components/AuthForm.tsx` | Reusable form component for login and register modes |
| `src/lib/api.ts` | Axios instance with JWT interceptor and 401 auto-redirect |
| `src/lib/store/authStore.ts` | Zustand auth store with localStorage persistence |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and receive JWT |
| GET | `/api/v1/auth/me` | Get current authenticated user |

## How to Run

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
# Edit .env with your actual MongoDB and Redis connection strings

# Run the server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`.
API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Environment Variables Needed

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URL` | Yes | MongoDB connection string (e.g., `mongodb://localhost:27017` or Atlas URL) |
| `DATABASE_NAME` | Yes | MongoDB database name (default: `fitview_ai`) |
| `REDIS_URL` | No | Redis connection string (default: `redis://localhost:6379`). App works without Redis. |
| `JWT_SECRET_KEY` | Yes | Secret key for JWT signing. Generate with `openssl rand -hex 32` |
| `JWT_ALGORITHM` | No | Default: `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default: `30` |
| `BASE_URL` | No | Default: `http://localhost:8000` |
| `UPLOAD_DIR` | No | Default: `uploads` |
| `DEBUG` | No | Default: `true` |

Cloudinary and AI API keys are not needed for Phase 1.

## Architecture Notes

- Backend uses async/await throughout (Motor for MongoDB, aioredis for Redis, httpx for HTTP calls)
- Redis connection failure is non-critical - the app starts and runs without Redis
- MongoDB indexes are created automatically on startup (email unique, role, created_at)
- JWT tokens include email as the subject claim (`sub`) and user role (`role`)
- Role-based access control via `require_role()` dependency in `deps.py`
- Frontend persists auth state in localStorage and rehydrates on page load
- Axios interceptor automatically attaches Bearer token and handles 401 responses
- All frontend pages use client-side rendering where auth state is needed
- CORS configured with explicit frontend origins (localhost:3000) for credential support

## Phase 1 Verification: CONFIRMED COMPLETE
