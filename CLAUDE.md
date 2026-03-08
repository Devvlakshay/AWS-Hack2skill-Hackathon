# FitView AI — Claude Code Guide

## Project Overview

**FitView AI** is an AI-powered virtual try-on platform for the Indian retail clothing market.
Customers select brand-provided models, pick a garment, and receive a photorealistic AI-generated
try-on image in under 10 seconds.

**Hackathon**: AI for Bharat 2025 — Professional Track
**Problem Statement**: 01 — AI for Retail, Commerce & Market Intelligence
**Brand tagline**: "Try Before You Buy"

---

## Repository Layout

```
AWS-Hack2skill-Hackathon/
├── frontend/          ← Next.js 15 app (this session's working dir)
├── backend/           ← FastAPI Python app
├── docs/              ← Production guide
├── CLAUDE.md          ← This file (loaded into every session)
├── frontend.md        ← Frontend deep-dive reference
├── design.md
└── requirements.md
```

---

## Tech Stack (Current Actual)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15.5, React 19, TailwindCSS 3, TypeScript 5.7 |
| State | Zustand 5 |
| Animations | Framer Motion 11 |
| 3D | @react-three/fiber 9.5, @react-three/drei 10.7, Three.js 0.170 |
| Charts | Recharts 2 |
| Toasts | react-hot-toast 2.4 |
| Package manager | **bun** (always use `bun`, never npm/yarn) |
| Backend | FastAPI + uvicorn, Python 3.12+ |
| Database | MongoDB Atlas (motor async driver) |
| Cache | Redis 7+ (redis.asyncio — NOT aioredis) |
| Storage | AWS S3 + CloudFront CDN |
| AI — Try-On | Google Gemini (gemini-2.0-flash / image models) |
| AI — Chat | Amazon Bedrock Claude 3.5 (optional fallback) |
| AI — Image | Pillow, OpenCV (cv2), rembg (U2-Net), numpy |
| Auth | JWT (python-jose) + bcrypt (passlib), role-based |

---

## Running the Project

```bash
# Frontend (from /frontend)
bun --bun next dev          # dev server → http://localhost:3000
bun --bun next build        # production build
bun --bun next start        # serve production build

# Backend (from /backend)
uvicorn app.main:app --reload --port 8000   # → http://localhost:8000
```

---

## Key Conventions

### General
- **Package manager**: Always `bun`. Never `npm install` or `yarn`.
- **Never commit** `.env` files or API keys.
- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- All AI API calls must have graceful fallbacks (Nano Banana / Gemini down → composite image).

### Frontend
- TypeScript throughout — no `any` unless absolutely necessary and commented.
- `"use client"` required for anything using hooks, event handlers, or browser APIs.
- `dynamic(() => import(...), { ssr: false })` must live inside a `"use client"` wrapper, never in a Server Component.
- Use `react-hot-toast` for ALL user feedback — zero `alert()` / `window.alert()` calls.
- Zustand stores are in `src/lib/store/`. API functions in `src/lib/api/`.
- API base URL comes from `process.env.NEXT_PUBLIC_API_URL` (fallback `http://localhost:8000`).

### Backend
- Async everywhere — `motor` for MongoDB, `redis.asyncio` for Redis, `httpx` for external APIs.
- `aioredis` is NOT used (removed, incompatible with Python 3.12). Use `redis.asyncio`.
- PEP 8, type hints on all functions.
- Pydantic v2 validation errors return `detail` as **array** `[{type, loc, msg, input}]` — not a string.
- JWT `verify_token()` checks `payload.get("type") == "access"` — refresh tokens rejected.
- `datetime.now(timezone.utc)` — never `datetime.utcnow()` (deprecated).

---

## User Roles

| Role | Capabilities |
|------|-------------|
| `customer` | Browse products, try-on, cart, wishlist, purchase |
| `retailer` | All of customer + upload models/products, analytics dashboard |
| `admin` | Full access |

---

## API Endpoints (All 46+)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register (returns JWT) |
| POST | `/api/v1/auth/login` | Login (returns JWT) |
| GET | `/api/v1/auth/me` | Current user profile |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/users/me/export` | DPDPA data export |
| DELETE | `/api/v1/users/me` | Account deletion |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List/search/filter (paginated) |
| POST | `/api/v1/products` | Create product (retailer) |
| GET | `/api/v1/products/{id}` | Product detail |
| PUT | `/api/v1/products/{id}` | Update product (retailer) |
| DELETE | `/api/v1/products/{id}` | Soft-delete product |

### Models (Fashion Models)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/models` | List models (filterable) |
| POST | `/api/v1/models` | Upload model (retailer) |
| GET | `/api/v1/models/{id}` | Model detail |
| PUT | `/api/v1/models/{id}` | Update model |
| DELETE | `/api/v1/models/{id}` | Delete model |

### Try-On
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tryon` | Generate try-on image |
| GET | `/api/v1/tryon/history` | User's try-on history |
| GET | `/api/v1/tryon/{id}` | Single session detail |
| PATCH | `/api/v1/tryon/{id}/favorite` | Toggle favorite |
| POST | `/api/v1/tryon/style-variation` | Gemini style variation |

### Cart & Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cart` | Get cart |
| POST | `/api/v1/cart/items` | Add item |
| PUT | `/api/v1/cart/items/{id}` | Update qty/size |
| DELETE | `/api/v1/cart/items/{id}` | Remove item |
| DELETE | `/api/v1/cart` | Clear cart |
| GET | `/api/v1/wishlist` | Get wishlist |
| POST | `/api/v1/wishlist` | Add to wishlist |
| DELETE | `/api/v1/wishlist/{product_id}` | Remove from wishlist |

### Recommendations & Style
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/recommendations/size` | Size recommendation |
| GET | `/api/v1/recommendations/style` | Style recommendations |
| POST | `/api/v1/style/variation` | Generate style variation |

### Analytics (Retailer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/dashboard` | Dashboard data |
| GET | `/api/v1/analytics/export` | Export CSV/PDF |
| POST | `/api/v1/analytics/events` | Track event |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chatbot/message` | Send message, get response |
| GET | `/api/v1/chatbot/history` | Conversation history |
| DELETE | `/api/v1/chatbot/session` | Clear session |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health (MongoDB + Redis status) |

---

## MongoDB Collections & Indexes

```
users:            email (unique), role, created_at
products:         (retailer_id, is_deleted), category, price
                  text index: name + description + tags
models:           (retailer_id, is_deleted), body_type, skin_tone
tryon_sessions:   (user_id, created_at DESC), (retailer_id, created_at DESC)
                  TTL index: expires_at (90-day auto-deletion)
carts:            user_id (unique)
wishlists:        (user_id, product_id) unique
analytics_events: (event_type, created_at DESC), (user_id, created_at DESC)
chat_sessions:    user_id (unique), updated_at
audit_logs:       (user_id, created_at DESC), (action, created_at DESC)
```

---

## Redis Key Patterns & TTLs

```
session:{session_id}                  24h
tryon:{model_id}:{product_id}         1h
product:{product_id}                  6h
products:category:{category}          6h
model:{model_id}                      6h
models:retailer:{retailer_id}         6h
cart:{user_id}                        1h
wishlist:{user_id}                    6h
analytics:retailer:{id}:{date}        30min
chat:{user_id}:history                24h   (list, max 20 messages)
```

---

## AI Pipeline (Core Try-On)

```
User selects model + garment
        ↓
1. CHECK REDIS CACHE  →  hit: return cached URL immediately
        ↓ miss
2. FETCH IMAGES  from S3/Cloudinary (model 1024×1024, garment 512×512+)
        ↓
3. PREPROCESS
   • Pillow: resize, normalize RGB
   • rembg (U2-Net): remove garment background
   • numpy: pixel array manipulation
        ↓
4. AI GENERATION
   • Primary:  Gemini Image API (httpx async, 15s timeout, 2 retries)
   • Fallback: AWS Bedrock Claude Vision
   • Final:    Composite overlay (Pillow)
        ↓
5. POSTPROCESS
   • Pillow: sharpen, contrast
   • OpenCV: color correction, artifact removal, boundary smooth
   • Convert to WebP
        ↓
6. STORE & CACHE
   • Upload to S3, get CDN URL
   • Cache in Redis (1h TTL)
   • Save TryOnSession to MongoDB
        ↓
7. RETURN CDN URL  (~8–10 seconds total)
```

---

## Environment Variables

### Backend `.env`
```env
# App
APP_NAME=FitView AI
DEBUG=false
API_V1_PREFIX=/api/v1
BASE_URL=http://localhost:8000

# Auth
JWT_SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_urlsafe(32))">
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MongoDB Atlas
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/fitview?retryWrites=true
MONGODB_DB_NAME=fitview_prod

# Redis
REDIS_URL=redis://localhost:6379

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=fitview-assets
CLOUDFRONT_URL=https://cdn.fitview.ai

# AI
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview
USE_BEDROCK=false
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_CHAT_MODEL_ID=anthropic.claude-3-5-haiku-20241022

# Security
ALLOWED_ORIGINS=http://localhost:3000
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Known Bugs Fixed (Do Not Re-Introduce)

1. **aioredis on Python 3.12** — use `redis.asyncio` (from `redis` package), not `aioredis`.
2. **Pydantic v2 detail array** — `error.response.data.detail` is an array, extract `.msg` from each item.
3. **`datetime.utcnow()`** — always use `datetime.now(timezone.utc)` instead.
4. **JWT type check** — `verify_token()` must reject refresh tokens used as access tokens.
5. **`ssr: false` in Server Components** — always wrap `dynamic(..., {ssr:false})` in a `"use client"` file.
6. **R3F v8 + React 19** — project uses @react-three/fiber **v9.5+** which supports React 19.
7. **PresentationControls drei v10** — `snap` is `boolean`, `config` prop removed.
8. **Stale `.next` cache** — if getting 500 after layout changes: `rm -rf .next` then restart.
9. **Checkout missing hydrate** — `CheckoutPage` must call `hydrate()` in `useEffect` — fixed.
10. **`clear?.()` in checkout** — `clear` is always defined in cartStore; use `clear()` not `clear?.()`.
11. **cartStore.updateItem** — must `throw error` after setting error state (matches `addItem` behavior).
12. **wishlist handleAddToCart** — must show `toast.error(...)` in catch (was silently swallowing errors).
13. **toggleFavorite state divergence** — optimistic update + revert-on-failure pattern; do not use simple fire-and-forget.

---

## Frontend Architecture Notes

- **Navbar layout (desktop)**: CSS Grid 3-col `1fr auto 1fr` — LEFT: nav links | CENTER: animated FV logo | RIGHT: icons + auth
- **Logo animation**: framer-motion spring entrance (`[0.34, 1.56, 0.64, 1]` cubic bezier), wiggle on hover, gold ring shimmer
- **Logo file**: `/public/fitview.png` — white background PNG; wrap in cream pill on dark surfaces
- **Mobile Navbar**: logo LEFT, cart+hamburger RIGHT; mobile menu slides down with staggered link animations
- **BottomTabBar**: shown on mobile only (`flex md:hidden`), height `calc(64px + env(safe-area-inset-bottom, 0px))`
- **Auth guard pattern**: pages call `hydrate()` in `useEffect`, show sign-in card (not hard redirect) when `!isAuthenticated` until hydration resolves
- **Toast**: all user feedback via `react-hot-toast` — zero `alert()` calls

---

## Security Hardening Done

- Rate limiting: `/auth/login` 5/min, `/tryon` 10/min, `/uploads` 20/min
- JWT secret: required env var (no default)
- Debug: defaults to `false`
- Password: min 12 chars + complexity
- CORS: loaded from `ALLOWED_ORIGINS` env var
- Security headers: HSTS, X-Frame-Options, CSP, X-Content-Type-Options
- EXIF stripping on uploaded images
- Audit logging (`audit_logs` collection)
- Input sanitization (bleach)
- DPDPA compliance: data export + account deletion endpoints

---

## Important Notes

- Frontend uses **bun** exclusively — `bun --bun next dev/build/start`
- No dark mode — design is warm cream editorial (light only)
- No `alert()` anywhere — use `react-hot-toast`
- No `ParticleBackground` on production pages (replaced with editorial layout)
- `ThemeToggle` returns `null` — intentionally disabled
- `ThemeProvider` removed from layout — no longer needed
