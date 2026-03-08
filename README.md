# FitView AI — "Try Before You Buy"

AI-powered virtual try-on platform for the Indian retail clothing market. Customers select brand-provided models (or upload their own photo), pick a garment, and receive a photorealistic AI-generated try-on image in under 10 seconds.

**Hackathon**: AI for Bharat 2025 — Professional Track  
**Problem Statement**: 01 — AI for Retail, Commerce & Market Intelligence

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, TailwindCSS 3 |
| **State Management** | Zustand 5 |
| **Animations** | Framer Motion 11 |
| **3D** | @react-three/fiber 9, @react-three/drei 10, Three.js |
| **Charts** | Recharts 2 |
| **Backend** | FastAPI, Python 3.12+, Uvicorn |
| **Database** | MongoDB Atlas (motor async driver) |
| **Cache** | Redis 7+ (redis.asyncio) |
| **Storage** | AWS S3 + CloudFront CDN |
| **AI — Try-On** | Google Gemini (gemini-2.0-flash / image generation) |
| **AI — Chat** | Amazon Bedrock Claude 3.5 (fallback) |
| **AI — Image Processing** | Pillow, OpenCV, rembg (U2-Net), NumPy |
| **Auth** | JWT + bcrypt, role-based (customer / retailer / admin) |
| **Package Manager** | bun |

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and **bun** (package manager)
- **Python** 3.12+
- **MongoDB** (Atlas or local)
- **Redis** 7+

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URL, Redis URL, Gemini API key, AWS creds, JWT secret

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
bun install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

bun --bun next dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs

### Generate AI Images (Models & Products)

```bash
cd backend
export GEMINI_API_KEY=your_key_here
python generate_current_images.py
```

Generates AI images for all 6 fashion models and 8 products using Gemini and saves them to `backend/uploads/`.

---

## Project Structure

```
FitView-AI/
├── frontend/                      # Next.js 15 app
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # Landing page
│       │   ├── login/             # Login
│       │   ├── register/          # Register
│       │   ├── products/          # Product catalog + detail
│       │   ├── tryon/             # Virtual try-on engine
│       │   │   └── history/       # Try-on history
│       │   ├── cart/              # Shopping cart
│       │   ├── checkout/          # Checkout flow
│       │   ├── wishlist/          # Saved items
│       │   ├── dashboard/         # Analytics dashboard
│       │   └── retailer/          # Retailer management
│       │       ├── products/      # CRUD products
│       │       └── models/        # CRUD fashion models
│       ├── components/            # Shared UI components
│       │   ├── Navbar.tsx         # Top navigation bar
│       │   ├── BottomTabBar.tsx   # Mobile bottom tabs
│       │   ├── ProductCard.tsx    # Product grid card
│       │   ├── ModelCard.tsx      # Fashion model card
│       │   ├── ChatBot.tsx        # AI chatbot widget
│       │   ├── SearchOverlay.tsx  # Full-screen search
│       │   ├── ImageUpload.tsx    # Photo upload component
│       │   └── AnimatedHero.tsx   # Landing page hero
│       └── lib/
│           ├── api/               # API client functions
│           └── store/             # Zustand state stores
│
├── backend/                       # FastAPI app
│   ├── app/
│   │   ├── main.py               # App entry, CORS, startup
│   │   ├── core/config.py        # Settings (Pydantic)
│   │   ├── api/v1/endpoints/     # 10 endpoint modules
│   │   ├── models/               # Pydantic request/response schemas
│   │   ├── services/             # Business logic (10 services)
│   │   └── utils/                # JSON store, AI clients, image processing
│   ├── data/                     # JSON data files (products, models, users, etc.)
│   ├── uploads/                  # Generated/uploaded images
│   └── generate_current_images.py
│
├── docs/                         # Phase docs + production guide
└── CLAUDE.md                     # Developer reference
```

---

## What We Offer

### For Customers — AI-Powered Shopping Experience

**Virtual Try-On Engine** — The core feature. Customers select a brand-curated fashion model (matched by body type, skin tone, and size) and a garment, then our AI generates a photorealistic image of that model wearing the garment in under 10 seconds. No more guessing how clothes will look.

- **Photo Upload Try-On**: Don't want to use a model? Upload your own photo and see yourself in any outfit.
- **Batch Try-On**: Select up to 5 products at once and generate try-on images for all of them in a single session — compare multiple outfits side by side.
- **Before/After Comparison**: Interactive slider view to compare the original model with the AI-generated try-on result.
- **Favourite & Save**: Tap the heart icon on any try-on result to save it to favourites (instant optimistic UI with toast feedback).
- **Add to Cart from Try-On**: Found something you like? Pick your size and add to cart directly from the try-on result — no need to navigate back to the product page.
- **Try-On History**: Browse all your past try-on sessions, re-view results, and re-favourite.

**Product Discovery**
- Full product catalog with search, category filtering, and pagination.
- Detailed product pages with image gallery, size/color selector, material info, and pricing.
- Add to cart or wishlist from any product page.

**AI-Powered Recommendations**
- **Size Recommendation**: AI suggests the right size based on body measurements and product fit data.
- **Style Recommendation**: Get outfit pairing suggestions — "this kurta goes well with these pants."
- **AI Chatbot**: A Bedrock Claude-powered shopping assistant that can answer questions about products, help with sizing, suggest outfits, and guide you through the platform.

**Shopping Flow**
- Shopping cart with quantity/size adjustments.
- Wishlist for saving products for later.
- Full checkout flow with order summary.

---

### For Retailers — Analytics & Management Dashboard

Retailers get a dedicated dashboard with full visibility into how customers interact with their products and try-on engine.

**Analytics Dashboard** (10 visualizations powered by Recharts):

| Chart / Widget | What It Shows |
|----------------|---------------|
| **Summary Cards** | Total try-ons, total products, favourites, avg processing time, total models, cart adds — at a glance |
| **Try-Ons Over Time** | Line chart tracking daily try-on volume over the selected date range |
| **Product Popularity Ranking** | Horizontal bar chart ranking products by a composite popularity score (views + try-ons + favourites) |
| **Visit-to-TryOn Conversion** | Bar chart showing what % of product page views convert into a try-on — identify which products customers want to try on most |
| **Peak Activity Hours** | Hourly bar chart showing when customers are most active — optimize marketing and inventory |
| **Engagement Funnel** | Visual funnel: Views → Try-Ons → Favourites, with conversion % between each stage |
| **Category Distribution** | Bar chart showing try-on volume broken down by product category (Kurtas, Shirts, Ethnic Wear, etc.) |
| **AI Provider Usage** | Donut chart showing which AI provider (Gemini, Bedrock, Composite) generated each try-on |
| **Trending Products** | Table with trend arrows (rising/declining/stable) based on recent activity scores |
| **Traffic Sources** | Horizontal bar chart showing where product engagement comes from (catalog, search, recommendations, etc.) |
| **Daily Active Users** | Area chart tracking unique daily users over time |
| **Cart Analytics** | Table showing cart-add counts and cart conversion rates per product |
| **Top Products Table** | Ranked table of products by try-on count and favourite count |
| **Top Models Table** | Ranked table of fashion models by try-on usage |
| **Revenue Potential Cards** | Highlights top 3 products by engagement score — "Highest Potential", "Strong Performer", "Rising Interest" |
| **User Engagement Summary** | Unique users, total sessions, and average try-ons per user |

**Date Range Filtering**: Quick presets (Last 7 days, Last 30 days, All time) or custom date range picker.

**Data Export**:
- **Export CSV**: Download all analytics data as a CSV spreadsheet for further analysis.
- **Export Report**: Download a formatted HTML report for sharing with stakeholders.

**Event Tracking**: The platform automatically tracks `product_view`, `product_tryon`, `product_favorite`, and `product_cart_add` events — all feeding into the analytics dashboard.

**Product Management**: Create, edit, and soft-delete products with image upload, size/stock management, color variants, and category tagging.

**Model Management**: Create, edit, and delete fashion models with body type, skin tone, measurements, and photo upload.

---

### Platform-Wide

| Feature | Description |
|---------|-------------|
| **Responsive Design** | Mobile-first layout with bottom tab bar on small screens, CSS Grid desktop layouts |
| **Page Transitions** | Smooth route animations with Framer Motion spring physics |
| **Toast Notifications** | All user feedback via react-hot-toast — zero `alert()` calls anywhere |
| **Role-Based Access** | Three roles — Customer, Retailer, Admin — each with scoped access to features and API endpoints |
| **Security Hardening** | Rate limiting (5/min login, 10/min try-on, 20/min uploads), CORS, HSTS, CSP, X-Frame-Options, EXIF stripping, input sanitization (bleach), audit logging |
| **DPDPA Compliance** | Indian data privacy law compliance — user data export (`GET /users/me/export`) and full account deletion (`DELETE /users/me`) |
| **Redis Caching** | Try-on results (1h), products (6h), models (6h), cart (1h), analytics (30min) — fast repeat access |
| **AI Fallback Chain** | Gemini primary → Bedrock fallback → Composite overlay final fallback — try-on never fails |

---

## Core Try-On Pipeline

```
User selects model + garment (or uploads own photo)
                    │
         1. Check Redis cache ──── hit → return cached URL
                    │ miss
         2. Fetch images from S3/local storage
                    │
         3. Preprocess
            ├── Resize & normalize (Pillow)
            ├── Remove garment background (rembg / U2-Net)
            └── Pixel manipulation (NumPy)
                    │
         4. AI Generation
            ├── Primary:  Gemini Image API (15s timeout, 2 retries)
            ├── Fallback: AWS Bedrock Claude Vision
            └── Final:    Composite overlay (Pillow)
                    │
         5. Postprocess
            ├── Sharpen & contrast (Pillow)
            ├── Color correction (OpenCV)
            └── Convert to WebP
                    │
         6. Store & Cache
            ├── Upload to S3 → CDN URL
            ├── Cache in Redis (1h TTL)
            └── Save TryOnSession to MongoDB
                    │
         7. Return result (~8–10 seconds)
```

---

## API Endpoints (46+)

| Group | Count | Key Endpoints |
|-------|-------|---------------|
| **Auth** | 6 | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh` |
| **Products** | 5 | `GET /products`, `POST /products`, `GET /products/{id}`, `PUT`, `DELETE` |
| **Models** | 5 | `GET /models`, `POST /models`, `GET /models/{id}`, `PUT`, `DELETE` |
| **Try-On** | 5 | `POST /tryon`, `GET /tryon/history`, `PATCH /tryon/{id}/favorite` |
| **Cart** | 5 | `GET /cart`, `POST /cart/items`, `PUT /cart/items/{id}`, `DELETE` |
| **Wishlist** | 3 | `GET /wishlist`, `POST /wishlist`, `DELETE /wishlist/{id}` |
| **Recommendations** | 2 | `GET /recommendations/size`, `GET /recommendations/style` |
| **Style** | 1 | `POST /style/variation` |
| **Analytics** | 3 | `GET /analytics/dashboard`, `GET /analytics/export`, `POST /analytics/events` |
| **Chatbot** | 3 | `POST /chatbot/message`, `GET /chatbot/history`, `DELETE /chatbot/session` |
| **Health** | 1 | `GET /health` |

All endpoints are prefixed with `/api/v1/`. Full reference in [CLAUDE.md](./CLAUDE.md).

---

## Sample Data

### Fashion Models (6 AI-generated)

| Name | Gender | Body Type | Skin Tone | Size |
|------|--------|-----------|-----------|------|
| Ananya | Female | Slim | Fair | S |
| Meera | Female | Average | Medium | M |
| Riya | Female | Curvy | Brown | L |
| Arjun | Male | Athletic | Medium | L |
| Vikram | Male | Average | Brown | M |
| Rohan | Male | Slim | Fair | M |

### Products (8 AI-generated images)

| Name | Category | Price |
|------|----------|-------|
| Royal Blue Silk Kurta | Kurtas | Rs 4,999 |
| Classic White Formal Shirt | Shirts | Rs 1,899 |
| Embroidered Anarkali Dress | Ethnic Wear | Rs 6,499 |
| Black Slim Fit Jeans | Jeans | Rs 2,299 |
| Red Banarasi Silk Saree | Sarees | Rs 12,999 |
| Olive Graphic Oversized T-Shirt | T-Shirts | Rs 799 |
| Navy Quilted Bomber Jacket | Jackets | Rs 3,499 |
| White Chikankari Palazzo Set | Ethnic Wear | Rs 3,299 |

---

## Environment Variables

### Backend `.env`

```env
APP_NAME=FitView AI
DEBUG=false
JWT_SECRET_KEY=<generate-a-secret>
MONGODB_URL=mongodb+srv://...
MONGODB_DB_NAME=fitview_prod
REDIS_URL=redis://localhost:6379
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=fitview-assets
CLOUDFRONT_URL=https://cdn.fitview.ai
GEMINI_API_KEY=...
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Design

- **Theme**: Warm cream editorial — light only, no dark mode
- **Typography**: DM Sans
- **Accent Color**: Gold (#B8860B)
- **Navbar**: CSS Grid 3-column layout with animated FitView logo
- **Mobile**: Bottom tab bar + responsive grids
- **Animations**: Framer Motion spring transitions, staggered list reveals

---

## License

Hackathon project — all rights reserved.
