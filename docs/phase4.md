# Phase 4: Intelligence Layer

## Overview

Phase 4 adds the intelligence layer to FitView AI: style variations powered by Gemini Image API, AI-driven size and style recommendations, and a full shopping cart and wishlist system.

## Features Implemented

### 4a. Style Variations (Gemini Image)

Generate style variations of try-on results in different contexts:
- **Casual**: Street setting with natural daylight
- **Formal**: Office/corporate environment
- **Party**: Evening party with warm ambient lighting
- **Traditional**: Indian cultural setting with traditional decor

**Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/style/generate` | Generate a style variation (body: `{session_id, style}`) |
| GET | `/api/v1/style/variations/{session_id}` | Get all variations for a try-on session |

**Backend files**:
- `backend/app/models/style.py` - Pydantic schemas
- `backend/app/services/style_service.py` - Style variation generation service
- `backend/app/api/v1/endpoints/style.py` - API endpoints

**Frontend files**:
- `frontend/src/lib/api/style.ts` - API client functions

### 4b. Size Recommendation

Rule-based size recommendation that considers:
- User body measurements (if provided in profile)
- Product size chart
- General sizing heuristics (M/L preferred as safe defaults)
- Available stock

**Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/recommendations/size?product_id=xxx` | Get size recommendation |
| GET | `/api/v1/recommendations/style?limit=10` | Get style recommendations |

### 4c. Style Recommendations

Content-based filtering using tag overlap scoring:
1. Analyzes user's try-on history
2. Extracts tags and categories from tried products
3. Scores untried products by tag/category overlap
4. Returns ranked recommendations

### 4d. Shopping Cart

Full shopping cart functionality with product enrichment and try-on image linking.

**Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cart` | Get user's cart |
| POST | `/api/v1/cart/items` | Add item (body: `{product_id, size, quantity}`) |
| PUT | `/api/v1/cart/items/{product_id}` | Update item |
| DELETE | `/api/v1/cart/items/{product_id}` | Remove item |
| DELETE | `/api/v1/cart` | Clear cart |

### 4e. Wishlist

Product wishlist with try-on image association.

**Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wishlist` | Get user's wishlist |
| POST | `/api/v1/wishlist` | Add item (body: `{product_id, tryon_image_url?}`) |
| DELETE | `/api/v1/wishlist/{product_id}` | Remove item |

## Frontend Pages

- **`/cart`** - Shopping cart with quantity controls, order summary, try-on image thumbnails
- **`/wishlist`** - Wishlist grid with try-on previews, add-to-cart, and try-on links
- **`/products/[id]`** - Enhanced with size recommendation widget, "You May Also Like" section, wishlist heart button, and add-to-cart button
- **Navbar** - Added cart icon with item count badge and wishlist heart icon

## Data Collections

- `carts.json` - Cart documents (one per user with items array)
- `wishlists.json` - Wishlist entries (one per user-product pair)
- `style_variations.json` - Generated style variation records

## Architecture

All new endpoints follow the existing patterns:
- FastAPI router with dependency injection (`get_current_user`, `get_store`)
- Service layer for business logic
- Pydantic schemas for request/response validation
- JsonStore for persistence (with newly added `delete_one` method)
- Zustand stores on frontend for state management
- Fetch-based API client functions matching existing patterns
