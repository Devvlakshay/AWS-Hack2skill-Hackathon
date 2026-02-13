# FitView AI - System Design

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │   Mobile     │  │   Tablet     │          │
│  │  (Next.js)   │  │   Browser    │  │   Browser    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CDN / LOAD BALANCER                         │
│                     (Nginx / CloudFront)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FastAPI Backend (Python)                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │   Auth     │  │  Product   │  │  Try-On    │         │  │
│  │  │  Service   │  │  Service   │  │  Service   │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │ Analytics  │  │   Model    │  │Recommend.  │         │  │
│  │  │  Service   │  │  Service   │  │  Service   │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AI/ML LAYER                               │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │   Nano Banana    │         │   Grok Imagine   │             │
│  │  (Virtual Try-On)│         │ (Style Generation)│             │
│  └──────────────────┘         └──────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   MongoDB    │  │     Redis    │  │  AWS S3 /    │          │
│  │    Atlas     │  │    Cache     │  │  Cloudinary  │          │
│  │  (Primary)   │  │  (Session)   │  │  (Images)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Layers Explained

#### 1. Client Layer
- **Next.js Web Application**: Server-side rendered React application
  - Mobile-first responsive design (< 640px, 640-1024px, > 1024px breakpoints)
  - App Router for file-based routing
  - Dynamic imports for code splitting
  - Image optimization with Next.js Image component

#### 2. Application Layer
**FastAPI Backend Services:**

**Auth Service:**
- User registration and login (email/phone + password)
- JWT token generation and validation
- Role-based access control (Customer, Retailer, Admin)
- Session management via Redis

**Product Service:**
- Product CRUD operations for retailers
- Category-based browsing and filtering
- Full-text search on product names/descriptions
- Size chart management
- Stock level tracking

**Try-On Service:**
- Orchestrates virtual try-on generation workflow
- Image preprocessing (resize, normalize, background removal)
- Nano Banana API integration for AI generation
- Post-processing (quality enhancement, artifact removal)
- Result caching to avoid duplicate generation

**Model Service:**
- Brand-provided model image management
- Model metadata (body type, measurements, skin tone)
- Model popularity tracking
- Filtering and recommendation

**Analytics Service:**
- Real-time event tracking (try-ons, cart adds, purchases)
- Batch aggregation every 5 minutes
- Conversion funnel analysis
- Retailer dashboard data generation
- Export functionality (CSV, PDF reports)

**Recommendation Service:**
- Size recommendations using collaborative filtering
- Style recommendations using content-based filtering
- Personalized product suggestions based on try-on history

#### 3. AI/ML Layer

**Nano Banana (Google):**
- Core virtual try-on engine
- Input: Model image (1024x1024) + Garment image
- Output: Photorealistic try-on image
- Processing time: ~8-10 seconds
- Maintains garment details, lighting, and pose

**Grok Imagine:**
- Generates style variations (casual, formal, party contexts)
- Color variation generation
- Background enhancement
- Prompt engineering for photorealistic outputs

#### 4. Data Layer

**MongoDB Atlas (Primary Database):**
- Document-based NoSQL database
- Collections: Users, Models, Products, TryOn Sessions, Analytics
- Replica set for high availability
- Automatic backups and point-in-time recovery
- Sharding strategy: by retailer_id for products, user_id for sessions

**Redis (Cache & Sessions):**
- Session storage (24h TTL)
- Try-on result caching (1h TTL)
- Product catalog caching (6h TTL)
- Analytics caching (30min TTL)
- Pub/Sub for real-time updates

**AWS S3 / Cloudinary (Object Storage):**
- Model images with multiple resolutions
- Product images with thumbnails
- Generated try-on images
- CDN integration for fast delivery
- Automatic image optimization (WebP, compression)

### Technology Stack Rationale

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend Framework | Next.js 14 | SSR for SEO, React ecosystem, App Router, excellent performance |
| UI Library | React 18 | Component-based architecture, large community, hooks |
| Styling | TailwindCSS | Utility-first, rapid development, consistent design system |
| State Management | Zustand | Lightweight, simple API, no boilerplate |
| Backend Framework | FastAPI | High performance async, automatic OpenAPI docs, Python ML integration |
| Language | Python 3.11+ | Rich AI/ML libraries, easy integration with Nano Banana/Grok |
| Database | MongoDB Atlas | Flexible schema, horizontal scalability, managed service |
| Cache | Redis 7+ | In-memory speed, pub/sub support, session management |
| Object Storage | AWS S3/Cloudinary | Scalable, CDN integration, image transformation APIs |
| Authentication | JWT | Stateless, scalable, standard-based |
| AI Try-On | Nano Banana | State-of-the-art garment transfer, realistic results |
| AI Enhancement | Grok Imagine | Style variations, high-quality image generation |

### Data Flow Architecture

**Try-On Generation Flow:**
```
Customer → Select Model → Select Product → Request Try-On
    ↓
Frontend → POST /api/v1/tryon
    ↓
Backend → Check Redis Cache (cache key: tryon:{model_id}:{product_id})
    ↓ (Cache Miss)
Backend → Fetch Model Image + Product Image from S3
    ↓
Backend → Preprocess Images (resize, normalize)
    ↓
Backend → Call Nano Banana API
    ↓
Nano Banana → Generate Try-On Image (~8-10 sec)
    ↓
Backend → Post-process (quality enhancement, artifact removal)
    ↓
Backend → Upload Result to S3
    ↓
Backend → Save to MongoDB (TryOn Session record)
    ↓
Backend → Cache Result in Redis (1h TTL)
    ↓
Backend → Return Result URL to Frontend
    ↓
Frontend → Display Try-On Image (with zoom/pan controls)
```

**Analytics Aggregation Flow:**
```
User Events (try-on, cart add, purchase)
    ↓
Backend → Buffer Events (in-memory queue)
    ↓ (Every 5 minutes or 100 events)
Backend → Aggregate Events by retailer/product/date
    ↓
Backend → Update MongoDB Analytics Collection
    ↓
Backend → Invalidate Analytics Cache
    ↓
Retailer Dashboard → Fetch Fresh Analytics
```

### Scalability Design

**Horizontal Scaling:**
- Multiple FastAPI instances behind load balancer
- Stateless backend (session in Redis)
- Database sharding by retailer_id and user_id
- CDN for static assets and images

**Caching Strategy:**
- Multi-layer caching (memory → Redis → Database)
- Cache-aside pattern for reads
- Write-through for critical data
- TTL-based expiration

**Performance Optimizations:**
- Database indexing on frequently queried fields
- Connection pooling (MongoDB, Redis)
- Async I/O throughout the stack
- Background job processing (Celery for heavy tasks)
- Image lazy loading and responsive images

## Core Features

### 1. Virtual Try-On System
- **Input**: Brand-provided model image + product garment image
- **AI Processing**: Nano Banana generates realistic try-on images
- **Output**: High-quality image showing model wearing the garment
- **Performance**: Sub-10 second generation, cached results
- **Enhancement**: Grok Imagine for style variations (casual, formal, party)

### 2. Model Selection System
- Retailers upload 4-5 diverse models (body types, skin tones)
- Customers browse and select preferred model
- Filtering by body type, size, style preference
- Privacy-focused: No customer photos required

### 3. Intelligence Layer
- **Size Recommendations**: Based on measurements and collaborative filtering
- **Style Recommendations**: Personalized product suggestions
- **Try-On History**: Save and compare previous try-ons
- **Shopping Cart Integration**: Add products with try-on images

### 4. Retailer Analytics Dashboard
- Try-on count per product
- Try-on to purchase conversion rates
- Popular model preferences
- Size distribution analytics
- Demand forecasting

## Key User Flows

### Customer Journey
1. Browse products → Select product
2. Choose brand-provided model (matches body type)
3. Generate try-on image (AI processing)
4. View result, try style variations
5. Add to cart or try more products

### Retailer Journey
1. Upload 4-5 diverse models with metadata
2. Add product catalog with images
3. Monitor analytics dashboard
4. View conversion metrics and insights
5. Adjust inventory based on demand forecasts

## Data Model (Simplified)

### Key Collections
1. **Users**: Auth, profile, body measurements, preferences
2. **Models**: Brand-provided model images with metadata (body type, size, etc.)
3. **Products**: Catalog with images, pricing, sizes, categories
4. **TryOn Sessions**: Generated results, user feedback, conversion tracking
5. **Analytics**: Aggregated metrics per retailer/product

### Caching Strategy
- Redis for session management (24h TTL)
- Try-on results cached (1h TTL) to avoid regeneration
- Product catalog cached (6h TTL)
- Analytics cached (30min TTL)

## AI/ML Pipeline

### Virtual Try-On (Nano Banana)
1. **Preprocessing**: Resize images (1024x1024), normalize, background segmentation
2. **Generation**: Nano Banana API call with model + garment images
3. **Postprocessing**: Quality enhancement, color correction, artifact removal
4. **Storage**: Upload to S3/Cloudinary, save to database
5. **Performance**: ~8-10 seconds per generation, results cached

### Style Variations (Grok Imagine)
- Generate context-based variations (casual, formal, party settings)
- Prompt engineering for photorealistic results
- Quality validation before serving to users

## Security & Privacy

### Authentication
- JWT-based auth with bcrypt password hashing
- Role-based access control (Customer, Retailer, Admin)
- Rate limiting (10 try-ons/min, 5 login attempts/min)

### Data Protection
- TLS 1.3 for all communications
- MongoDB Atlas encryption at rest
- S3 server-side encryption
- Try-on images auto-deleted after 90 days
- GDPR-compliant user data deletion

## Implementation Plan

### 8-Week Development Timeline

**Week 1-2: Foundation**
- Next.js + FastAPI setup
- MongoDB Atlas + Redis configuration
- JWT authentication
- Basic UI components

**Week 3-4: Core Try-On**
- Nano Banana integration
- Image preprocessing pipeline
- Try-on viewer UI
- Result caching

**Week 5: Product & Model Management**
- Product catalog CRUD
- Model upload system
- Browse/search interfaces
- Shopping cart

**Week 6: Intelligence Layer**
- Grok Imagine for style variations
- Size recommendations
- Style recommendations
- Try-on history

**Week 7: Analytics**
- Retailer dashboard
- Conversion metrics
- Demand forecasting
- Export reports

**Week 8: Polish**
- Performance optimization
- UI/UX refinement
- Demo preparation
- Documentation

## Performance Targets

- Try-on generation: < 10 seconds
- API response time: < 200ms (p95)
- Cache hit rate: > 80%
- Image load time: < 2 seconds
- Support 10,000+ daily active users

---

**Prepared For**: AI for Bharat Hackathon 2025 - Professional Track
**Problem Statement**: 01 - AI for Retail, Commerce & Market Intelligence
