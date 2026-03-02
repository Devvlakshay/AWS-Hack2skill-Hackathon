# FitView AI — Production Guide

> **Hackathon**: AI for Bharat 2025 — Professional Track
> **Problem Statement**: 01 — AI for Retail, Commerce & Market Intelligence
> **Last Updated**: March 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Environment Setup](#3-environment-setup)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [API Reference](#5-api-reference)
6. [Database Schema & Indexes](#6-database-schema--indexes)
7. [Redis Key Patterns](#7-redis-key-patterns)
8. [AWS Services Integration](#8-aws-services-integration)
9. [AI Integration Guide](#9-ai-integration-guide)
10. [Security Checklist](#10-security-checklist)
11. [Production Deployment](#11-production-deployment)
12. [Performance Benchmarks](#12-performance-benchmarks)
13. [Monitoring & Observability](#13-monitoring--observability)
14. [Phase Completion Tracker](#14-phase-completion-tracker)

---

## 1. Project Overview

FitView AI is an AI-powered **virtual try-on platform** for the Indian retail clothing market. Customers select brand-provided models and garments, and the system generates photorealistic try-on images using generative AI.

### Key Features
- Virtual try-on: model + garment → photorealistic output
- AI chatbot style assistant (AWS Bedrock Claude 3.5)
- 3D garment viewer (React Three Fiber)
- Size & style recommendations
- Retailer analytics dashboard
- Shopping cart & wishlist
- DPDPA-compliant user data management

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│     Next.js 15 (App Router) — Bun runtime               │
│     React 19, TailwindCSS, Zustand, React Three Fiber   │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│         FastAPI (Python 3.12) — Port 8000               │
│  Auth │ Products │ Models │ TryOn │ Style │ Chat        │
│  Recommendations │ Cart │ Wishlist │ Analytics          │
└──────┬─────────────────────┬──────────────────┬─────────┘
       │                     │                  │
       ▼                     ▼                  ▼
┌──────────────┐  ┌─────────────────┐  ┌────────────────┐
│   AI LAYER   │  │   DATA LAYER    │  │  STORAGE LAYER │
│ Gemini Image │  │ MongoDB Atlas   │  │   AWS S3 +     │
│ (primary)    │  │ Redis Cache     │  │  CloudFront CDN│
│ Bedrock      │  │                 │  │                │
│ (fallback)   │  │                 │  │                │
└──────────────┘  └─────────────────┘  └────────────────┘
```

---

## 2. Tech Stack

| Component | Current (Dev) | Production Target |
|-----------|--------------|-------------------|
| Frontend Framework | Next.js 15, React 19 | Same |
| Styling | TailwindCSS 3 | Same |
| State Management | Zustand 5 | Same |
| 3D Viewer | React Three Fiber + Drei | Same |
| Backend Framework | FastAPI 0.109 | Same |
| Data Store | JSON file store | **MongoDB Atlas M10** |
| Cache | In-memory dict | **Redis 7 (ElastiCache)** |
| File Storage | Local filesystem | **AWS S3 + CloudFront** |
| AI — Try-On | Gemini Image API | Gemini → Bedrock fallback |
| AI — Chat | — | **AWS Bedrock Claude 3.5 Haiku** |
| AI — Style | Gemini Image API | Gemini → Bedrock fallback |
| Package Manager | npm | **Bun** |
| Auth | JWT + bcrypt | Same + Refresh tokens |
| Rate Limiting | — | **slowapi** |
| Task Queue | — | Celery + Redis |

---

## 3. Environment Setup

### Prerequisites

```bash
# Backend
python 3.12+
pip

# Frontend
bun 1.0+
node 20+
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in env vars
cp .env.example .env
# Edit .env with your actual values

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
bun install

# Copy and fill in env vars
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
bun dev
```

### Local Development with Docker

```bash
# From project root
docker-compose up -d    # starts MongoDB + Redis locally
# Then run backend and frontend separately
```

---

## 4. Environment Variables Reference

### Backend (`.env`)

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `JWT_SECRET_KEY` | *(none)* | **Yes** | 32+ char random secret. Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `JWT_ALGORITHM` | `HS256` | No | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | No | Access token lifetime (minutes) |
| `DEBUG` | `false` | No | Enable debug mode (never true in prod) |
| `APP_NAME` | `FitView AI` | No | Application name |
| `API_V1_PREFIX` | `/api/v1` | No | API version prefix |
| `BASE_URL` | `http://localhost:8000` | No | Backend base URL |
| `DATA_DIR` | `data` | No | JSON store directory (dev only) |
| `UPLOAD_DIR` | `uploads` | No | Local upload directory (dev only) |
| `GEMINI_API_KEY` | *(none)* | Yes (if no Bedrock) | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | No | Gemini text model |
| `GEMINI_IMAGE_MODEL` | `gemini-3.1-flash-image-preview` | No | Gemini image model |
| `MONGODB_URL` | `mongodb://localhost:27017` | **Yes (prod)** | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | `fitview_dev` | No | Database name |
| `REDIS_URL` | `redis://localhost:6379` | No | Redis connection URL |
| `AWS_REGION` | `ap-south-1` | No | AWS region |
| `AWS_ACCESS_KEY_ID` | *(none)* | Yes (for S3/Bedrock) | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | *(none)* | Yes (for S3/Bedrock) | AWS secret key |
| `AWS_S3_BUCKET` | *(none)* | Yes (prod) | S3 bucket name |
| `CLOUDFRONT_URL` | *(none)* | No | CloudFront CDN URL prefix |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | **Yes (prod)** | Comma-separated allowed CORS origins |
| `BEDROCK_REGION` | `us-east-1` | No | AWS Bedrock region |
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-5-sonnet-20241022-v2:0` | No | Bedrock image model |
| `BEDROCK_CHAT_MODEL_ID` | `anthropic.claude-3-5-haiku-20241022` | No | Bedrock chat model |
| `USE_BEDROCK` | `false` | No | Enable Bedrock as AI fallback |

### Frontend (`.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

---

## 5. API Reference

**Base URL**: `http://localhost:8000/api/v1`
**Auth**: `Authorization: Bearer <jwt_token>` on protected endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Register new user |
| `POST` | `/auth/login` | No | Login, returns access + refresh tokens |
| `GET` | `/auth/me` | Yes | Get current user profile |
| `POST` | `/auth/refresh` | No | Exchange refresh token for new access token |
| `GET` | `/auth/me/export` | Yes | DPDPA: export all personal data |
| `DELETE` | `/auth/me` | Yes | DPDPA: delete account and all data |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/products` | No | List products (filter: category, price, search, sort, page) |
| `GET` | `/products/{id}` | No | Get single product |
| `POST` | `/products` | Retailer | Create product |
| `PUT` | `/products/{id}` | Retailer | Update product |
| `DELETE` | `/products/{id}` | Retailer | Soft delete product |
| `POST` | `/products/{id}/images` | Retailer | Upload product image |

### Models

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/models` | No | List models (filter: body_type, size, skin_tone) |
| `GET` | `/models/{id}` | No | Get single model |
| `POST` | `/models` | Retailer | Create model |
| `PUT` | `/models/{id}` | Retailer | Update model |
| `DELETE` | `/models/{id}` | Retailer | Soft delete model |
| `POST` | `/models/{id}/image` | Retailer | Upload model image |

### Virtual Try-On

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/tryon` | Yes | Generate try-on (model_id + product_id) |
| `POST` | `/tryon/batch` | Yes | Batch try-on (model + multiple products) |
| `POST` | `/tryon/with-photo` | Yes | Try-on with user's own photo |
| `GET` | `/tryon/history` | Yes | Paginated try-on history |
| `GET` | `/tryon/{id}` | Yes | Get single try-on session |
| `PATCH` | `/tryon/{id}/favorite` | Yes | Toggle favorite |

### Style Variations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/style/generate` | Yes | Generate style variation (casual/formal/party/traditional) |
| `GET` | `/style/variations/{session_id}` | Yes | Get all variations for a session |

### Recommendations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/recommendations/size?product_id=X` | Yes | Size recommendation for product |
| `GET` | `/recommendations/style?limit=10` | Yes | Personalized style recommendations |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/cart` | Yes | Get user's cart with product details |
| `POST` | `/cart/items` | Yes | Add item to cart |
| `PUT` | `/cart/items/{product_id}` | Yes | Update item quantity/size |
| `DELETE` | `/cart/items/{product_id}` | Yes | Remove item from cart |
| `DELETE` | `/cart` | Yes | Clear entire cart |

### Wishlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/wishlist` | Yes | Get wishlist with product details |
| `POST` | `/wishlist` | Yes | Add product to wishlist |
| `DELETE` | `/wishlist/{product_id}` | Yes | Remove from wishlist |

### Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/analytics/dashboard` | Retailer | Dashboard summary (try-ons, conversions, top products) |
| `GET` | `/analytics/products/{id}` | Retailer | Per-product analytics |
| `GET` | `/analytics/export/csv` | Retailer | Export data as CSV |
| `GET` | `/analytics/export/report` | Retailer | Export HTML report |

### Chatbot

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/chatbot/message` | Yes | Send message, get AI response |
| `GET` | `/chatbot/history?session_id=X` | Yes | Get conversation history |
| `DELETE` | `/chatbot/session?session_id=X` | Yes | Clear session history |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Health check (MongoDB + Redis status) |

---

## 6. Database Schema & Indexes

### `users` Collection

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "hashed_password": "...",
  "name": "Priya Sharma",
  "phone": "+91 99999 99999",
  "role": "customer | retailer | admin",
  "measurements": { "bust": 92.5, "waist": 80.0, "hip": 100.0 },
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

**Indexes**: `email` (unique), `role`, `created_at`

---

### `products` Collection

```json
{
  "_id": "ObjectId",
  "retailer_id": "ObjectId",
  "name": "Royal Blue Silk Kurta",
  "description": "...",
  "category": "Kurtas",
  "subcategory": "Festive",
  "tags": ["silk", "festive", "zari"],
  "price": 4999,
  "colors": ["Royal Blue", "Maroon"],
  "material": "100% Pure Silk",
  "images": ["s3://..."],
  "sizes": [{ "size": "M", "stock": 15 }],
  "size_chart": {},
  "is_deleted": false,
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

**Indexes**: `(retailer_id, is_deleted)`, `(category, is_deleted)`, `(price, is_deleted)`, text on `(name, description, tags)`, `created_at DESC`

---

### `models` Collection

```json
{
  "_id": "ObjectId",
  "retailer_id": "ObjectId",
  "name": "Riya",
  "body_type": "curvy | slim | athletic | average | plus_size",
  "height_cm": 165,
  "measurements": { "bust": 92.5, "waist": 80.0, "hip": 100.0 },
  "skin_tone": "fair | medium | olive | brown | dark",
  "size": "S | M | L | XL | XXL",
  "image_url": "s3://...",
  "usage_count": 245,
  "is_active": true,
  "is_deleted": false,
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

**Indexes**: `(retailer_id, is_deleted)`, `body_type`, `skin_tone`, `usage_count DESC`

---

### `tryon_sessions` Collection ⭐ Critical

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "model_id": "ObjectId",
  "product_id": "ObjectId",
  "retailer_id": "ObjectId",
  "result_url": "s3://...",
  "model_name": "Riya",
  "product_name": "Royal Blue Silk Kurta",
  "model_image_url": "s3://...",
  "product_image_url": "s3://...",
  "status": "completed | pending | failed",
  "processing_time_ms": 8200,
  "is_favorite": false,
  "ai_provider": "gemini | bedrock | fallback",
  "created_at": "ISODate",
  "expires_at": "ISODate"
}
```

**Indexes**:
- `(user_id, created_at DESC)` — history pagination
- `(retailer_id, created_at DESC)` — analytics (denormalized)
- `(product_id, created_at DESC)` — product analytics
- `(user_id, is_favorite)` — favorites filter
- `expires_at` TTL (expireAfterSeconds: 0) — auto-delete after 90 days

---

### `carts` Collection

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "items": [{ "product_id": "ObjectId", "size": "M", "quantity": 2, "added_at": "ISODate" }],
  "updated_at": "ISODate"
}
```

**Indexes**: `user_id` (unique)

---

### `wishlists` Collection

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "product_id": "ObjectId",
  "tryon_image_url": "s3://...",
  "added_at": "ISODate"
}
```

**Indexes**: `(user_id, added_at DESC)`, `(user_id, product_id)` (unique)

---

### `analytics_events` Collection

```json
{
  "_id": "ObjectId",
  "event_type": "tryon_generated | product_viewed | product_favorited",
  "user_id": "ObjectId",
  "product_id": "ObjectId",
  "metadata": { "ai_provider": "gemini", "processing_time_ms": 8200 },
  "created_at": "ISODate"
}
```

**Indexes**: `(event_type, created_at DESC)`, `(user_id, created_at DESC)`, `product_id`

---

### `audit_logs` Collection

```json
{
  "_id": "ObjectId",
  "event_type": "auth.login | data.export | account.delete",
  "user_id": "ObjectId",
  "action": "string",
  "resource_type": "string",
  "resource_id": "string",
  "status": "success | failure",
  "metadata": {},
  "created_at": "ISODate"
}
```

---

## 7. Redis Key Patterns

| Key Pattern | TTL | Description |
|-------------|-----|-------------|
| `session:{session_id}` | 24h | JWT session metadata |
| `tryon:{model_id}:{product_id}` | 1h | Cached try-on result URL |
| `tryon:user:{user_id}:recent` | 30min | Last 5 try-on sessions |
| `product:{product_id}` | 6h | Cached product document |
| `products:category:{category}` | 6h | Paginated product list |
| `model:{model_id}` | 6h | Cached model document |
| `models:retailer:{retailer_id}` | 6h | All active models for retailer |
| `cart:{user_id}` | 1h | User's cart (invalidated on update) |
| `wishlist:{user_id}` | 6h | User's wishlist |
| `analytics:retailer:{id}:{date}` | 30min | Cached analytics data |
| `chat:{session_id}:history` | 24h | Chatbot conversation history (list, max 40 entries) |

---

## 8. AWS Services Integration

### S3 Bucket Structure

```
fitview-assets/
├── products/{product_id}/{image_id}.webp
├── products/{product_id}/thumbnails/{image_id}_thumb.webp
├── models/{model_id}/{image_id}.webp
├── tryon_results/{session_id}.webp
└── user_uploads/{user_id}/{upload_id}.webp
```

### CloudFront CDN

```
Origin: fitview-assets.s3.ap-south-1.amazonaws.com
CDN URL: https://cdn.fitview.ai/{path}
Cache: 7 days for images, 1 day for API responses
Compression: gzip, brotli
```

### Bedrock Model IDs & Pricing

| Model | ID | Use Case | Approximate Cost |
|-------|----|----------|-----------------|
| Claude 3.5 Sonnet | `anthropic.claude-3-5-sonnet-20241022-v2:0` | Image try-on fallback | ~$0.15–0.20/image |
| Claude 3.5 Haiku | `anthropic.claude-3-5-haiku-20241022` | Chatbot responses | ~$0.001–0.005/message |

### IAM Policy for FitView AI

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-haiku-20241022"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::fitview-assets/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::fitview-assets"
    }
  ]
}
```

---

## 9. AI Integration Guide

### AI Provider Priority Chain

```
Try-On Request
    │
    ├──▶ Gemini Image API (primary, ~8-10s)
    │       ├── Success → return result
    │       └── Failure (timeout/rate limit) ──▶
    │
    ├──▶ AWS Bedrock Claude 3.5 Vision (fallback, if USE_BEDROCK=true)
    │       ├── Success → return result, ai_provider="bedrock"
    │       └── Failure ──▶
    │
    └──▶ Composite overlay fallback (always works)
             └── ai_provider="fallback"
```

### Gemini Image Client

```python
# app/utils/ai_clients.py
client = GeminiImageClient(api_key=GEMINI_API_KEY)

# Methods:
await client.generate_tryon(model_image: bytes, garment_image: bytes) -> bytes
await client.generate_style_variation(base_image: bytes, style: str) -> bytes
await client.generate_multi_garment_tryon(model_image, garment_images) -> bytes
await client.generate_image(prompt: str) -> bytes
await client.edit_image(prompt: str, image_bytes: bytes) -> bytes

# API Key: passed as X-Goog-Api-Key header (NOT in URL)
```

### AWS Bedrock Client

```python
# app/utils/bedrock_client.py
image_client = BedrockImageClient()  # Claude 3.5 Sonnet
chat_client = BedrockChatClient()    # Claude 3.5 Haiku

await image_client.generate_tryon(model_image, garment_image) -> bytes
await image_client.generate_style_variation(base_image, style) -> bytes
await chat_client.chat(messages, system_prompt, max_tokens) -> str
```

### Chatbot System Prompt Structure

```
You are FitView AI Assistant, an AI-powered fashion stylist for FitView.

User: {name} (role: {customer|retailer})

User's cart:
- {item_name} (size {size})
...

Recent try-ons:
- {product_name}
...

Available products (sample):
- {name} ({category}, ₹{price})
...

[Capabilities, Guidelines, Tone instructions]
```

The system prompt is dynamically built per request with real-time context from:
- `store.find_one("carts", {"user_id": user_id})`
- `store.find_many("tryon_sessions", {"user_id": user_id}, limit=3)`
- `store.find_many("products", {"is_deleted": False}, limit=10)`

---

## 10. Security Checklist

### Critical (must fix before production)
- [ ] `JWT_SECRET_KEY` set via env var (no default)
- [ ] `DEBUG=false` in production
- [ ] Gemini API key in `X-Goog-Api-Key` header (not URL)

### High Priority
- [x] Rate limiting via `slowapi` (5/min login, 10/min tryon, 100/min default)
- [x] Security headers middleware (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS)
- [x] CORS origins from `settings.ALLOWED_ORIGINS` env var
- [x] Password minimum 12 chars + complexity requirements (uppercase, lowercase, digit)
- [ ] HTTPS enforcement in production (nginx/ALB)
- [x] Request size limits (upload middleware)
- [x] Generic error messages to clients (details logged server-side)

### Medium Priority
- [x] DPDPA endpoints (`GET /auth/me/export`, `DELETE /auth/me`)
- [x] Refresh token mechanism (7-day, POST `/auth/refresh`)
- [x] EXIF stripping on image upload
- [x] Audit logging (`audit_logs` collection)
- [ ] Input sanitization with `bleach` on rich text fields

### Low Priority
- [x] CORS methods restricted to specific verbs
- [x] CORS headers restricted to needed headers
- [ ] Enum comparison consistency (use `.value` not string literal)
- [x] Upload folder whitelist validation
- [ ] Image filename extension validation (belt-and-suspenders)

### Compliance
- [x] DPDPA: user data export
- [x] DPDPA: right to erasure (account deletion)
- [ ] DPDPA: data retention policy display endpoint
- [x] 90-day auto-deletion of try-on sessions (TTL index)

---

## 11. Production Deployment

### Backend Dockerfile

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Frontend Dockerfile

```dockerfile
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml (local dev)

```yaml
version: "3.9"
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]
    environment:
      MONGO_INITDB_DATABASE: fitview_dev

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --appendonly yes
    volumes: [redis_data:/data]

volumes:
  mongo_data:
  redis_data:
```

### AWS Infrastructure (Production)

| Service | Tier | Notes |
|---------|------|-------|
| ECS Fargate | 1 vCPU, 2GB RAM | Auto-scaling 1–10 tasks |
| MongoDB Atlas | M10 (3-node replica) | ap-south-1 |
| ElastiCache Redis | cache.t4g.small | Single AZ for dev, Multi-AZ prod |
| S3 + CloudFront | Standard | fitview-assets bucket |
| Secrets Manager | Standard | All env vars stored here |
| ALB | Standard | SSL termination |

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    steps:
      - uses: actions/checkout@v4
      - name: Build and push Docker image
        run: |
          docker build -t fitview-backend ./backend
          docker push $ECR_REGISTRY/fitview-backend:$GITHUB_SHA
      - name: Deploy to ECS
        run: aws ecs update-service --cluster fitview --service backend --force-new-deployment

  deploy-frontend:
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: vercel --prod --token $VERCEL_TOKEN
```

---

## 12. Performance Benchmarks

### Targets

| Metric | Target | Current (Dev) | Notes |
|--------|--------|---------------|-------|
| Try-on generation | < 10s | ~8-32s | Gemini API latency varies |
| API response (p95) | < 200ms | ~50-500ms | JSON store vs MongoDB |
| Cache hit rate | > 80% | ~40% | In-memory dict vs Redis |
| Lighthouse score | ≥ 90 | ~70 | Next.js image optimization needed |
| Concurrent users | 10,000+ | ~100 | Single-process JSON store |
| DB query (product search) | < 50ms | ~200-500ms | Needs MongoDB text index |

### Database Performance Impact

| Operation | JSON Store | MongoDB + Redis |
|-----------|-----------|-----------------|
| Product search | ~200-500ms (full scan) | ~20-50ms (indexed) |
| Dashboard summary | ~2-3s (Python loops) | ~100-200ms ($facet pipeline) |
| Model listing | ~100-200ms | ~20-30ms |
| Cart enrichment | ~200-300ms (N+1) | ~50-80ms (batch $in) |
| Try-on cache hit | ~1ms (in-memory) | ~3-5ms (Redis) |
| Try-on cache miss | N/A | ~8-10s (Gemini) |

---

## 13. Monitoring & Observability

### Health Check

```
GET /health
Response:
{
  "status": "healthy",
  "mongodb": "connected",
  "redis": "connected",
  "version": "1.0.0"
}
```

### Structured Logging Format

```json
{
  "timestamp": "2026-03-01T15:16:09Z",
  "level": "INFO",
  "service": "fitview-api",
  "endpoint": "/api/v1/tryon",
  "method": "POST",
  "user_id": "...",
  "duration_ms": 8432,
  "ai_provider": "gemini",
  "status_code": 200
}
```

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| API error rate | > 1% | > 5% |
| P99 latency | > 5s | > 15s |
| Gemini API failures | > 10%/min | > 30%/min |
| Redis memory | > 70% | > 90% |
| MongoDB connections | > 80 | > 100 |

### Recommended Tools

- **APM**: Datadog or AWS X-Ray
- **Logs**: CloudWatch Logs or Grafana Loki
- **Metrics**: Prometheus + Grafana
- **Uptime**: Pingdom or AWS Route 53 health checks
- **Error tracking**: Sentry (both backend and frontend)

---

## 14. Phase Completion Tracker

| Phase | Description | Status | Notes |
|-------|-------------|--------|-------|
| **Phase 1** | Auth & Foundation (JWT, bcrypt, user CRUD) | ✅ Complete | |
| **Phase 2** | Products & Models (CRUD, image upload, search) | ✅ Complete | |
| **Phase 3** | Virtual Try-On (Gemini, preprocessing, postprocessing) | ✅ Complete | |
| **Phase 4** | Intelligence Layer (recommendations, style, cart, wishlist) | ✅ Complete | |
| **Phase 5** | Retailer Analytics (dashboard, CSV/HTML export) | ✅ Complete | |
| **Phase 6** | Polish & Security (partial) | ⚠️ Partial | Rate limiting added; DPDPA done |
| **Phase P1** | MongoDB Atlas + Redis + AWS S3 | 🚧 In Progress | Core files created; services need migration |
| **Phase P2** | Security Hardening (23 findings) | ✅ Implemented | See security checklist |
| **Phase P3** | Amazon Bedrock + AI Chatbot | ✅ Implemented | bedrock_client.py, chatbot endpoints live |
| **Phase P4** | Frontend (React Three Fiber, ChatBot, Checkout) | ✅ Implemented | ThreeDCanvas, ChatBot, Skeleton, checkout |
| **Phase P5** | Production Deployment (Docker, CI/CD, monitoring) | 📅 Planned | Dockerfiles ready in this doc |
| **Phase P6** | Docs | ✅ Complete | This document |

---

*Generated March 2026 — FitView AI Production Team*
