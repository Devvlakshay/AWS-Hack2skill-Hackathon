# Phase 5: Retailer Analytics Dashboard

## Overview

Phase 5 implements a comprehensive analytics dashboard for retailers, providing insights into try-on activity, product performance, model usage, and category trends. Includes data export capabilities (CSV, HTML report).

## Backend

### Analytics Service

**File**: `backend/app/services/analytics_service.py`

Core functions:

- `track_event(store, event_type, user_id, product_id, metadata)` — Track analytics events (for future integration with other services).
- `get_dashboard_summary(store, retailer_id, date_from, date_to)` — Aggregate dashboard metrics by querying `tryon_sessions` for the retailer's products.
- `get_product_analytics(store, retailer_id, product_id)` — Detailed per-product analytics including model preferences and recent sessions.
- `export_analytics_csv(store, retailer_id, date_from, date_to)` — Generate downloadable CSV with per-session data.
- `export_analytics_report(store, retailer_id, date_from, date_to)` — Generate a styled HTML report suitable for printing.

### API Endpoints

**File**: `backend/app/api/v1/endpoints/analytics.py`

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/v1/analytics/dashboard`     | Dashboard summary (retailer/admin) |
| GET    | `/api/v1/analytics/products/{id}` | Product-level analytics            |
| GET    | `/api/v1/analytics/export/csv`    | Download CSV export                |
| GET    | `/api/v1/analytics/export/report` | Download HTML report               |

All endpoints require `retailer` or `admin` role. Date filtering supported via `date_from` and `date_to` query parameters (YYYY-MM-DD).

### Pydantic Models

**File**: `backend/app/models/analytics.py`

- `DashboardSummary` — Full dashboard response schema
- `ProductAnalytics` — Per-product analytics response
- `TopProduct` / `TopModel` — Ranked items by try-on count
- `AnalyticsEvent` — Event tracking schema

### Data

**File**: `backend/data/analytics_events.json` — Empty seed file for event tracking.

Dashboard analytics are computed on-the-fly from existing `tryon_sessions.json` data, so no pre-seeding is required.

## Frontend

### API Client

**File**: `frontend/src/lib/api/analytics.ts`

TypeScript functions with full type definitions:
- `getDashboard(dateFrom?, dateTo?)` — Fetch dashboard data
- `getProductAnalytics(productId)` — Fetch product-level analytics
- `exportCSV(dateFrom?, dateTo?)` — Download CSV blob
- `exportReport(dateFrom?, dateTo?)` — Download HTML report blob

### Dashboard Page

**File**: `frontend/src/app/dashboard/page.tsx`

Role-aware dashboard:
- **Retailers/Admins**: Full analytics dashboard with charts, tables, and exports
- **Customers**: Existing quick-action dashboard with account details

Retailer dashboard features:
1. **Summary Cards** — Total try-ons, products, favorites, avg processing time
2. **Date Range Filter** — Quick presets (7d, 30d, all time) + custom date inputs
3. **Try-Ons Over Time** — Line chart (Recharts)
4. **Category Distribution** — Bar chart
5. **AI Provider Usage** — Donut/pie chart
6. **Top Products Table** — Ranked by try-on count with favorites
7. **Top Models Table** — Ranked by usage
8. **Export Buttons** — CSV and HTML report downloads

### Charts Component

**File**: `frontend/src/app/dashboard/AnalyticsCharts.tsx`

Separate client component using Recharts, dynamically imported to avoid SSR issues. Dark theme styled with gray-900 backgrounds and indigo/purple color palette.

### Navigation

**File**: `frontend/src/components/Navbar.tsx`

Added "Analytics" link for retailer and admin users pointing to `/dashboard`.

## Dependencies

- **Backend**: No new dependencies (uses stdlib `csv`, `io`, `collections`)
- **Frontend**: `recharts` package required (`npm install recharts`)

## Dashboard Summary Response Shape

```json
{
  "total_tryons": 4,
  "total_products": 8,
  "total_models": 6,
  "total_favorites": 0,
  "avg_processing_time_ms": 31058.2,
  "tryons_by_date": {
    "2026-03-01": 4
  },
  "top_products": [
    { "product_id": "prod007", "name": "Navy Quilted Bomber Jacket", "tryon_count": 2, "favorite_count": 0 }
  ],
  "top_models": [
    { "model_id": "model004", "name": "Arjun", "tryon_count": 2 }
  ],
  "category_distribution": {
    "Jackets": 2,
    "Kurtas": 1,
    "Shirts": 1
  },
  "ai_provider_distribution": {
    "gemini": 4
  }
}
```
