# FitView AI — PPT Content
### AI for Bharat 2025 | Professional Track | PS-01: AI for Retail

**Team**: Yash Tiwari (Lead) & Lakshya Borasi

---

## 1. Brief About the Idea

**FitView AI** — *"Try Before You Buy"*

- Virtual try-on platform for Indian retail clothing
- Select a model or upload your photo → pick garment → get photorealistic AI result in ~10 seconds
- **Problem**: 60-70% online clothing returns due to poor fit expectations
- **Solution**: AI-generated try-on images on diverse body types, skin tones & sizes

---

## 2. Why AI? How AWS? What Value?

### Why AI is Required
- Photorealistic garment draping on diverse body types — impossible with simple overlays
- Background removal (U2-Net) isolates garments cleanly
- OpenCV post-processing for studio-quality output
- AI chatbot provides personalized styling advice
- Smart size recommendations from body & product data

### AWS Services Used
- **S3** — Image storage (models, products, try-on results, uploads)
- **CloudFront CDN** — Edge-cached delivery, <50ms latency
- **Bedrock Claude 3.5 Haiku** — Fallback vision AI for try-on
- **Bedrock Qwen 3.5** — AI fashion chatbot engine
- **EC2/ECS** — Hosts FastAPI + Next.js

### AI Value to User Experience
- See garments on YOUR body type in 8-10s
- Batch try-on: multiple garments, individual + combined view
- Style variations: casual, formal, party, traditional
- Personal AI stylist aware of cart, history & preferences
- Retailer insights: conversion tracking, trending detection

```
  WITHOUT AI: Customer → Flat photo → Guesses → Orders → Wrong fit → Returns (60-70%)
  WITH AI:    Customer → AI try-on → Sees exact fit → Confident buy → Returns <20%
```

---

## 3. Features

**Customer (13)**
- Virtual Try-On (single + batch + user photo upload)
- AI generates full body from face/selfie photos
- Style variations (casual/formal/party/traditional)
- AI fashion chatbot stylist
- Size recommendations
- Product catalog with search/filters
- Cart, Wishlist, Checkout, Order placement
- Try-on history with favourites & downloads
- Before/After comparison view
- Collections (Ethnic Wear, Sarees, Shirts, etc.)

**Retailer (8)**
- Analytics dashboard (charts, KPIs, peak hours)
- Product & model management (CRUD + image upload)
- Order history & consumer try-on history
- CSV/PDF export, trending products, revenue scoring

**Platform (5)**
- JWT auth with roles (customer/retailer/admin)
- DPDPA compliance (data export + deletion)
- Rate limiting, audit logging, security headers

---

## 4. Process Flow Diagram

```
  LOGIN → SELECT MODEL (or upload photo) → SELECT GARMENT(s) → GENERATE
                                                                   │
                    ┌──────────────────┬───────────────────────────┤
                    ▼                  ▼                           ▼
              Single Try-On     Batch Try-On              User Photo Try-On
                    │                  │                           │
                    └──────────────────┼───────────────────────────┘
                                       ▼
                              VIEW RESULT(S)
                     (Before/After, Download, Favourite,
                      Add to Cart, Add All to Cart)
                                       │
                    ┌──────────────────┼──────────────┐
                    ▼                  ▼              ▼
              Try More          Cart & Checkout   AI Chat Stylist
```

### AI Pipeline (~8-10s)

```
  Request → Redis Cache? ─── HIT → Return URL (<100ms)
                │ MISS
                ▼
  Fetch from S3 → Preprocess (resize, rembg BG removal, denoise)
                ▼
  AI Generate:  Gemini Vision (primary)
                  → Bedrock Claude (fallback)
                    → Composite overlay (final fallback)
                ▼
  Postprocess (sharpen, CLAHE color, bilateral filter, WebP)
                ▼
  Upload to S3 → Cache in Redis (1h TTL) → Return CDN URL
```

---

## 5. Wireframes

*(Keep the ASCII wireframes from original — they are concise enough for slides)*

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]  Home  Collections  Try-On  About    [Cart] [👤] │
├──────────────────────────────────────────────────────────┤
│              ╔══════════════════════════╗                │
│              ║     TRY BEFORE YOU BUY  ║                │
│              ║  [Start Try-On]          ║                │
│              ╚══════════════════════════╝                │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ Kurta  │  │ Saree  │  │ Shirt  │  │ Jeans  │       │
│  │ ₹1,299 │  │ ₹2,499 │  │ ₹899   │  │ ₹1,599 │       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
└──────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────┐
│  ① Select Model ── ② Select Garment ── ③ Result         │
│  [Upload Photo] or [Brand Models with filters]           │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ Priya✓ │  │ Ananya │  │ Rahul  │  │ Arjun  │       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
└──────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────┐
│  [AI Try-On Image]  │  Result: 8,432ms                   │
│                     │  [Before/After] [♡ Favourite]       │
│                     │  [↓ Download] [Size ▼] [🛒 Cart]   │
│                     │  [Try Another] [Start Over]         │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Architecture Diagram

```
                         ┌──────────┐
                         │ BROWSER  │
                         └────┬─────┘
                              ▼
              ┌──────────────────────────┐
              │  Next.js 15 + React 19   │
              │  Tailwind + Zustand      │
              └────────────┬─────────────┘
                           ▼
┌────────────────────────────────────────────────────┐
│              FastAPI Backend                         │
│  Auth │ Products │ Try-On │ Cart │ Analytics │ Chat │
│                                                     │
│  Image Pipeline: Pillow → rembg → OpenCV → NumPy   │
│  AI Engine: Gemini (primary) → Bedrock (fallback)   │
└──────┬──────────┬──────────┬──────────┬────────────┘
       ▼          ▼          ▼          ▼
   AWS S3     Redis 7+   Gemini API  AWS Bedrock
  +CloudFront  (Cache)   (Vision)   (Claude+Qwen)
```

---

## 7. Technologies

**Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, Zustand, Framer Motion, Three.js, Recharts

**Backend**: FastAPI, Python 3.12+, Pydantic v2, httpx, slowapi

**AI/Image**: Google Gemini Vision, AWS Bedrock (Claude 3.5 Haiku + Qwen 3.5), Pillow, OpenCV, rembg (U2-Net), NumPy

**Infra**: AWS S3, CloudFront CDN, Redis 7+, JWT + bcrypt auth

**Security**: Rate limiting, CORS, HSTS, CSP, EXIF stripping, audit logging

---

## 8. Estimated Cost

| Category | Component | Monthly |
|---|---|---|
| Compute | AWS ECS (FastAPI + Next.js) | $120 |
| AI API | Nano Banana + Grok (usage-based) | $300-$600 |
| Database | Redis Cloud | $110 |
| Storage | S3 + CloudFront | $50 |
| **Total** | | **$580-$880/mo** |

**Optimization**: Redis cache saves 30-40% AI costs, WebP saves 25% storage, CloudFront saves 50% transfer

---

## 9. Snapshots

> *Add actual screenshots for these slides:*

1. **Landing Page** — Hero + featured products + "How It Works"
2. **Model Selection** — Upload photo + brand models grid with filters
3. **Garment Selection** — Multi-select with numbered badges + sticky generate bar
4. **Single Result** — AI image + Before/After + Cart + Download
5. **Batch Result** — Combined outfit + "Add All to Cart" with sizes
6. **Analytics Dashboard** — KPIs + charts + order history tabs
7. **AI Chatbot** — Styled chat with product suggestions
8. **Product Detail** — Gallery + "Try This On" button

---

## 10. Performance Benchmarks

| Metric | Value |
|---|---|
| Try-on generation | 8-10 seconds |
| Cache hit response | <100ms |
| Cache hit rate | ~25-35% |
| Product API (cached) | 45ms |
| Chatbot response | 2-4 seconds |
| BG removal (rembg) | 800-1,200ms |
| Output resolution | Up to 1024×1366 |
| Output format | WebP (40% smaller than JPEG) |
| Rate limits | 10 try-ons/min, 5 logins/min |
| Auto-cleanup | 90-day TTL on sessions |

---

## 11. Future Development

- **AR Try-On** — Real-time camera-based try-on (WebXR)
- **Multi-Language** — Hindi, Tamil, Telugu, Bengali, Marathi
- **Social Sharing** — Instagram, WhatsApp with product links
- **Voice Chatbot** — Hindi + English voice interaction
- **Payment Gateway** — Razorpay / PhonePe integration
- **Outfit Engine** — AI-curated complete outfits (top + bottom + accessories)
- **Body Measurement from Photo** — AI-extracted measurements for precise sizing
- **Seasonal Trend Analysis** — Forecasting from try-on data across India

### Enhanced Redis Caching (Future)
- Predictive pre-caching: top 20 combos nightly → near-zero latency
- Multi-tier: In-memory (30s) → Redis (1-6h) → S3 (permanent)
- Cache warming on product upload with top 5 models
- Regional Redis clusters (Mumbai, Chennai, Delhi) for <10ms hits
- Smart invalidation on product image changes

---

**FitView AI** — *Try Before You Buy*

AI for Bharat 2025 | Team: **Yash Tiwari** (Lead) & **Lakshya Borasi**
