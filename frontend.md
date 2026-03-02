# FitView AI — Frontend Reference

> Complete guide for the Next.js 15 frontend. Read this before touching any frontend file.

---

## Quick Start

```bash
cd frontend
bun --bun next dev       # http://localhost:3000
bun --bun next build     # production build check
bun --bun next start     # serve production
```

**Never use `npm` or `yarn`.** Always `bun`.

---

## Stack

| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.5.12 | Framework (App Router) |
| react | 19.0 | UI library |
| typescript | 5.7 | Type safety |
| tailwindcss | 3.4 | Utility CSS |
| zustand | 5.0 | State management |
| framer-motion | 11.0 | Animations |
| @react-three/fiber | 9.5 | 3D canvas (R3F) |
| @react-three/drei | 10.7 | R3F helpers |
| three | 0.170 | Three.js core |
| recharts | 2.15 | Analytics charts |
| react-hot-toast | 2.4 | Toast notifications |
| axios | 1.7 | HTTP client |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout (Navbar, fonts, TopBar)
│   │   ├── globals.css               # Design system (ALL styles live here)
│   │   ├── page.tsx                  # Homepage (Server Component)
│   │   ├── login/page.tsx            # Login — split screen layout
│   │   ├── register/page.tsx         # Register — split screen layout
│   │   ├── products/
│   │   │   ├── page.tsx              # Product listing with filters
│   │   │   └── [id]/page.tsx         # Product detail — gallery + buy
│   │   ├── tryon/
│   │   │   ├── page.tsx              # 3-step try-on flow
│   │   │   └── history/page.tsx      # Try-on history + favorites
│   │   ├── cart/page.tsx             # Shopping cart
│   │   ├── wishlist/page.tsx         # Saved products
│   │   ├── checkout/page.tsx         # Checkout flow (3 steps)
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Customer/Retailer dashboard
│   │   │   └── AnalyticsCharts.tsx   # Retailer charts (dynamic import)
│   │   └── retailer/                 # Retailer management pages
│   │       ├── page.tsx              # Retailer overview
│   │       ├── products/             # Product CRUD
│   │       └── models/               # Model CRUD
│   ├── components/
│   │   ├── Navbar.tsx                # Top navigation (client)
│   │   ├── BottomTabBar.tsx          # Mobile bottom nav (client)
│   │   ├── ClientProviders.tsx       # Client-only wrappers (Toaster, ChatBot)
│   │   ├── ChatBot.tsx               # AI style assistant widget (client)
│   │   ├── ProductCard.tsx           # Editorial product card (client)
│   │   ├── ModelCard.tsx             # Fashion model card (client)
│   │   ├── AuthForm.tsx              # Login/register form (client)
│   │   ├── SearchOverlay.tsx         # Search modal (client)
│   │   ├── ThreeDCanvas.tsx          # R3F 3D garment viewer (client)
│   │   ├── ThreeDViewer.tsx          # Wrapper for ThreeDCanvas (dynamic ssr:false)
│   │   ├── ParticleBackground.tsx    # R3F particle field (client, not used on homepage)
│   │   ├── ParticleBackgroundClient.tsx  # SSR-safe wrapper for ParticleBackground
│   │   ├── PageTransition.tsx        # Route transition wrapper
│   │   ├── CategoryBar.tsx           # Horizontal category scroll
│   │   ├── ImageUpload.tsx           # Drag-drop image upload
│   │   └── ui/
│   │       ├── GlassCard.tsx         # Polymorphic card wrapper
│   │       ├── Skeleton.tsx          # Loading skeleton components
│   │       ├── ErrorState.tsx        # Network/empty/rate-limit error UI
│   │       └── ThemeToggle.tsx       # Returns null (dark mode disabled)
│   └── lib/
│       ├── api.ts                    # Axios instance (base URL from env)
│       ├── three-fiber.d.ts          # R3F JSX types for React 19
│       ├── api/                      # Per-resource API functions
│       │   ├── products.ts
│       │   ├── models.ts
│       │   ├── tryon.ts
│       │   ├── cart.ts
│       │   ├── wishlist.ts
│       │   ├── analytics.ts
│       │   ├── recommendations.ts
│       │   ├── style.ts
│       │   └── chatbot.ts
│       └── store/                    # Zustand stores
│           ├── authStore.ts
│           ├── productStore.ts
│           ├── modelStore.ts
│           ├── tryonStore.ts
│           ├── cartStore.ts
│           └── wishlistStore.ts
├── public/                           # Static assets
├── tailwind.config.ts
├── next.config.ts (or .mjs)
├── tsconfig.json
└── package.json
```

---

## Design System

### Philosophy
Luxury editorial fashion aesthetic — think Vogue India meets modern tech.
Warm cream background, ink-black text, dark gold accents. Clean, spacious, typographic.

**NO** dark mode. **NO** glass morphism. **NO** violet/fuchsia gradients.

### Color Palette

```css
--cream:       #FAFAF8    /* page background */
--cream-dark:  #F0ECE3    /* section backgrounds, card hovers */
--ink:         #1a1a1a    /* primary text, buttons */
--ink-soft:    #333333    /* secondary text */
--muted:       #888888    /* tertiary text, placeholders */
--border:      #E8E8E4    /* card borders, dividers */
--gold:        #B8860B    /* accent — active states, prices, badges */
--gold-light:  #D4A820    /* hover gold */
--red:         #E53935    /* sale badges, error states */
--white:       #FFFFFF    /* card backgrounds */
```

### Typography

```css
/* Display / Headings */
font-family: 'Playfair Display', serif;
/* High-contrast serif — H1 through H4, prices, brand names */
/* Weights: 400 (body), 500, 600, 700 */
/* Styles: normal, italic (use italic for emphasis words) */

/* Body / UI */
font-family: 'DM Sans', sans-serif;
/* Clean geometric sans — nav, body, labels, buttons */
/* Weights: 300, 400, 500, 600, 700 */
```

Both fonts loaded via `next/font/google` in `layout.tsx` as CSS variables:
- `--font-playfair` → used in Tailwind as `font-playfair`
- `--font-dm-sans` → used as default `font-sans`

### Button Classes (from globals.css)

```css
.btn-ink         /* Black pill, white text — primary CTA */
.btn-outline-ink /* Transparent, black border + text — secondary */
.btn-gold        /* Gold pill, white text — special CTAs */
```

### Card Classes

```css
.card            /* White bg, border, radius 16px, subtle shadow */
.card-hover      /* card + hover lift (-4px) + deeper shadow */
```

### Other Utility Classes

```css
.nav-link              /* Link with animated underline on hover */
.badge-new             /* Black pill badge "New" */
.badge-sale            /* Red pill badge "Sale" */
.tab-active            /* 2px solid ink border-bottom */
.tab-inactive          /* Muted color, no border */
.marquee-container     /* overflow:hidden for scrolling text */
.marquee-content       /* Animates via marquee keyframe */
.skeleton              /* Shimmer loading placeholder */
.announcement-bar      /* Black bar, white text, 12px */
.input-editorial       /* Gold border on focus */
.product-card          /* Hover: img scales, .quick-add appears */
.quick-add             /* Overlay at card bottom, hidden until hover */
```

### Animations (keyframes in globals.css + tailwind.config.ts)

| Name | Description | Usage |
|------|-------------|-------|
| `marquee` | Horizontal scroll (translateX 0 → -50%) | Brand bar, announcement |
| `fadeUp` | Fade + rise (opacity 0→1, translateY 30px→0) | Page load stagger |
| `float` | Gentle bob (translateY 0 → -8px) | Hero floating card |
| `shimmer` | Gradient sweep | Skeleton loaders |

---

## Zustand Stores

### authStore (`src/lib/store/authStore.ts`)
```typescript
state: {
  user: User | null          // { id, name, email, role }
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
actions: {
  login(email, password)     // POST /auth/login, saves JWT to localStorage
  register(name, email, password, role)
  logout()                   // clears token + user
  hydrate()                  // rehydrate from localStorage on mount
  clearError()
}
```
**Critical**: Pydantic v2 errors return `detail` as array — store already handles this.

### productStore (`src/lib/store/productStore.ts`)
```typescript
state: {
  products: Product[]
  product: Product | null    // current detail page product
  isLoading: boolean
  error: string | null
  pagination: { page, limit, total, pages }
  filters: { category, search, min_price, max_price, sort_by, sort_order }
}
actions: {
  fetchProducts(params?)
  fetchProduct(id)
  createProduct(data)        // retailer
  updateProduct(id, data)    // retailer
  deleteProduct(id)          // retailer
  setFilters(filters)
}
```

### modelStore (`src/lib/store/modelStore.ts`)
```typescript
state: {
  models: FashionModel[]
  selectedModel: FashionModel | null
  isLoading: boolean
}
actions: {
  fetchModels(filters?)
  selectModel(model)
  createModel(data)          // retailer
  updateModel(id, data)
  deleteModel(id)
}
```

### tryonStore (`src/lib/store/tryonStore.ts`)
```typescript
state: {
  sessions: TryOnSession[]
  currentSession: TryOnSession | null
  isGenerating: boolean
  error: string | null
  history: TryOnSession[]
  pagination: PaginationMeta
}
actions: {
  generate(model_id, product_id)   // core AI call ~8-10s
  fetchHistory(page?)
  toggleFavorite(session_id)
  clearCurrent()
}
```

### cartStore (`src/lib/store/cartStore.ts`)
```typescript
state: {
  items: CartItem[]          // { product, quantity, size, color }
  totalItems: number
  totalPrice: number
  isLoading: boolean
}
actions: {
  fetchCart()
  addItem(product_id, quantity, size?, color?)
  updateItem(item_id, quantity, size?)
  removeItem(item_id)
  clear()
}
```

### wishlistStore (`src/lib/store/wishlistStore.ts`)
```typescript
state: {
  items: WishlistItem[]
  isLoading: boolean
}
actions: {
  fetchWishlist()
  addItem(product_id)
  removeItem(product_id)
  isInWishlist(product_id) → boolean
}
```

---

## API Layer (`src/lib/api.ts`)

Axios instance, base URL from env:
```typescript
baseURL: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1`
```

Request interceptor: attaches `Authorization: Bearer {token}` from localStorage.
Response interceptor: on 401, redirects to `/login`.

### API Function Files

| File | Functions |
|------|-----------|
| `api/products.ts` | getProducts, getProduct, createProduct, updateProduct, deleteProduct |
| `api/models.ts` | getModels, getModel, createModel, updateModel, deleteModel |
| `api/tryon.ts` | generateTryOn, getTryOnHistory, getTryOnSession, toggleFavorite |
| `api/cart.ts` | getCart, addToCart, updateCartItem, removeCartItem, clearCart |
| `api/wishlist.ts` | getWishlist, addToWishlist, removeFromWishlist |
| `api/analytics.ts` | getDashboard, trackEvent, exportData |
| `api/recommendations.ts` | getSizeRecommendation, getStyleRecommendations |
| `api/style.ts` | generateStyleVariation |
| `api/chatbot.ts` | sendMessage, getHistory, clearSession |

---

## Pages Reference

### `/` — Homepage (Server Component)
- Announcement marquee bar (built into layout.tsx)
- Split hero: editorial model image + headline + stats
- Indian brand marquee (Fabindia, BIBA, W, Manyavar, etc.)
- How It Works (3 steps)
- Featured Products (static, links to /products)
- AI Try-On promo banner (2-col dark/cream)
- Features strip
- Testimonials (Indian customers)
- Newsletter section
- Dark footer

### `/products` — Product Listing
- Dark editorial header with search
- Sidebar: categories, price range, sort
- Grid: 4-col desktop / 2-col mobile
- Skeleton loading cards
- Uses `useProductStore`

### `/products/[id]` — Product Detail
- 2-col: image gallery + product info
- Size selector pills (gold border = AI recommended)
- Color swatches
- `.btn-ink` Add to Cart, `.btn-outline-ink` Try On
- Description / Size Guide / Reviews tabs
- Style recommendations at bottom

### `/tryon` — Virtual Try-On
- 3-step progress indicator
- Step 1: ModelCard grid with select
- Step 2: ProductCard grid with select
- Step 3: Result (before/after toggle, 3D viewer, download)
- "Generating your look…" editorial loading state
- Uses `useTryonStore`, `useModelStore`, `useProductStore`

### `/tryon/history` — Try-On Archive
- Grid of past sessions
- Favorite toggle (rose heart)
- Empty state with editorial copy

### `/cart` — Shopping Cart
- Table-style layout with dividers
- Quantity stepper
- Sticky order summary sidebar
- `.btn-ink` Proceed to Checkout

### `/checkout` — Checkout
- 3-step stepper: Delivery → Payment → Confirm
- Address form with gold focus
- Payment radio cards
- `.btn-gold` Place Order
- Order success screen

### `/wishlist` — Wishlist
- Product grid
- Add to Cart + Try On per card
- Empty state with heart icon

### `/dashboard` — Dashboard
- Customer: stats + quick links + recent history
- Retailer: same + AnalyticsCharts (dynamic import)

### `/login` + `/register` — Auth Pages
- Split screen: dark editorial left panel, clean form right
- Gold focus inputs
- Role selector on register (customer / retailer)

### `/retailer/*` — Retailer Management
- `/retailer` — Overview + quick stats
- `/retailer/products` — Product list with CRUD
- `/retailer/products/new` — Create product form
- `/retailer/products/[id]/edit` — Edit product
- `/retailer/models` — Model list with CRUD
- `/retailer/models/new` — Upload model
- `/retailer/models/[id]/edit` — Edit model

---

## Components Reference

### `Navbar.tsx`
- Scroll-aware: adds blur + border after 60px scroll
- Logo: black square "FV" + Playfair "FitView" + italic gold "AI"
- Nav links: Products, Try-On, Collections, About (with `.nav-link` underline)
- Right: search icon (inline dropdown), wishlist heart, cart badge, auth menu
- Auth menu: user initial avatar → dropdown (Dashboard, History, Retailer Panel, Logout)
- Mobile: logo + cart + hamburger menu

### `BottomTabBar.tsx`
- `sm:hidden` — mobile only
- Tabs: Home, Shop, Try-On (elevated black circle), Cart, Profile
- Active color: `#B8860B` (gold)
- Cart badge: `#E53935` (red)

### `ProductCard.tsx`
- Props: `id, _id, name, price, original_price?, images[], category?, sizes[], colors?, rating?, retailer_name?`
- `useState(hovered)` drives all hover effects
- Hover: image scales 1.05, quick-add overlay appears
- Heart wishlist button: top-right, hidden until hover
- Sale badge (red), New badge (black), Try On gold pill link
- `react-hot-toast` for cart/wishlist feedback

### `ModelCard.tsx`
- Props: `model, onSelect?, selected?, showActions?, onDelete?`
- Portrait 3/4 aspect ratio
- Gold border + checkmark when selected
- Body type + skin tone gold pills
- Measurements grid (Bust / Waist / Hip)
- "Select Model" button: black default, gold when selected

### `ChatBot.tsx`
- Floating action button bottom-right
- Full-screen mobile, 400px desktop panel
- Quick replies on first load
- Session stored in `localStorage`
- Streams messages from `/api/v1/chatbot/message`
- Auth-gated (shows login prompt if not authenticated)

### `ThreeDCanvas.tsx`
- R3F v9.5 canvas
- `GarmentMesh`: cylindrical garment with texture, auto-rotates
- `PresentationControls` (drei v10): snap=true, no config prop
- `OrbitControls`, `Environment preset="studio"`, `ContactShadows`
- Loaded via `ThreeDViewer.tsx` with `dynamic(() => ..., { ssr: false })`

### `ClientProviders.tsx`
- `"use client"` wrapper
- Contains: `<Toaster>` (react-hot-toast) + dynamic ChatBot (ssr:false)
- Imported in layout.tsx — this pattern needed because ssr:false can't be in Server Components

### `SearchOverlay.tsx`
- Modal with white panel, gold focus input
- Trending search terms
- Routes to `/products?search=...`

---

## 3D Viewer Notes

```
R3F version: @react-three/fiber@9.5.0 (React 19 compatible)
drei version: @react-three/drei@10.7.7

Breaking changes from v8→v9:
- PresentationControls: snap is boolean (not {mass,tension} object)
- PresentationControls: config prop removed
- bufferAttribute syntax unchanged

TypeScript:
- src/lib/three-fiber.d.ts extends React JSX.IntrinsicElements with ThreeElements
- Required because React 19 changed JSX namespace
```

---

## Important Rules

### Never Do This
```typescript
// ❌ alert() anywhere
alert("Error!");

// ❌ ssr: false in a Server Component
// app/page.tsx (Server Component)
const X = dynamic(() => import("./X"), { ssr: false }); // BREAKS BUILD

// ❌ aioredis (backend)
import aioredis  # ModuleNotFoundError on Python 3.12

// ❌ old design tokens
className="glass-card text-gradient-primary bg-violet-600"

// ❌ dark mode classes
className="dark:bg-gray-900"
```

### Always Do This
```typescript
// ✅ react-hot-toast
import toast from "react-hot-toast";
toast.error("Something went wrong");
toast.success("Added to cart!");

// ✅ dynamic with ssr:false only in "use client" files
// components/MyClientWrapper.tsx
"use client";
const Heavy = dynamic(() => import("./Heavy"), { ssr: false });

// ✅ handle Pydantic v2 array errors
const detail = error.response?.data?.detail;
const msg = Array.isArray(detail)
  ? detail.map((e: any) => e.msg).join("; ")
  : detail || "Something went wrong";

// ✅ new design tokens
style={{ background: "var(--white)", color: "var(--ink)", border: "1px solid var(--border)" }}
className="card card-hover btn-ink"
```

---

## Build & Debug

```bash
# Clean build
rm -rf .next && bun --bun next build

# Type check only
bun --bun tsc --noEmit

# Common issues:
# 500 after layout change → rm -rf .next
# "ssr: false in Server Component" → move dynamic() into "use client" file
# "ReactCurrentOwner" → upgrade @react-three/fiber (must be v9+)
# "Objects not valid React child" → Pydantic detail is array, not string
```

---

## Environment

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Hackathon Context

- **Event**: AI for Bharat 2025 (AWS Hack2Skill)
- **Track**: Professional
- **Problem**: 01 — AI for Retail, Commerce & Market Intelligence
- **USP**: AI virtual try-on for Indian clothing (sarees, kurtas, westernwear)
- **Target users**: Indian urban shoppers + fashion retailers
- **Demo flow**: Register → Browse products → Select model → Generate try-on → Add to cart → Checkout
