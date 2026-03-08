"""
Analytics Service for FitView AI retailer dashboard.
Phase 5: Data aggregation, export, and event tracking.
Phase 6: Enhanced analytics — product visits, popularity scoring, engagement.
"""

import csv
import io
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.utils.json_store import JsonStore


def calculate_product_popularity_score(
    product_id: str,
    views: int,
    tryons: int,
    favorites: int,
    has_recent_activity: bool = False,
) -> float:
    """
    Weighted scoring algorithm for product popularity.

    - Views: 1 point each
    - Try-ons: 5 points each
    - Favorites: 10 points each
    - Recency bonus: +20% if activity in last 7 days
    """
    base_score = (views * 1) + (tryons * 5) + (favorites * 10)
    if has_recent_activity:
        base_score = base_score * 1.2
    return round(base_score, 1)


async def track_event(
    store: JsonStore,
    event_type: str,
    user_id: str,
    product_id: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> str:
    """Track an analytics event. Called from other services."""
    doc = {
        "event_type": event_type,
        "user_id": user_id,
        "product_id": product_id,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return await store.insert_one("analytics_events", doc)


async def _get_retailer_product_ids(store: JsonStore, retailer_id: str) -> list[str]:
    """Get all product IDs belonging to a retailer."""
    products = await store.find_many("products", {"retailer_id": retailer_id})
    return [p["_id"] for p in products]


async def _get_retailer_products_map(store: JsonStore, retailer_id: str) -> dict[str, dict]:
    """Get a mapping of product_id -> product for a retailer."""
    products = await store.find_many("products", {"retailer_id": retailer_id})
    return {p["_id"]: p for p in products}


async def _get_retailer_models_map(store: JsonStore, retailer_id: str) -> dict[str, dict]:
    """Get a mapping of model_id -> model for a retailer."""
    models = await store.find_many("models", {"retailer_id": retailer_id})
    return {m["_id"]: m for m in models}


def _filter_sessions_by_date(
    sessions: list[dict],
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> list[dict]:
    """Filter sessions by date range using ISO string comparison."""
    filtered = sessions
    if date_from:
        filtered = [s for s in filtered if s.get("created_at", "") >= date_from]
    if date_to:
        # date_to should be inclusive of the full day
        date_to_end = date_to + "T23:59:59" if "T" not in date_to else date_to
        filtered = [s for s in filtered if s.get("created_at", "") <= date_to_end]
    return filtered


async def get_dashboard_summary(
    store: JsonStore,
    retailer_id: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> dict:
    """Get dashboard summary for a retailer."""
    products_map = await _get_retailer_products_map(store, retailer_id)
    models_map = await _get_retailer_models_map(store, retailer_id)
    product_ids = set(products_map.keys())

    if not product_ids:
        return {
            "total_tryons": 0,
            "total_products": 0,
            "total_models": len(models_map),
            "total_favorites": 0,
            "avg_processing_time_ms": 0.0,
            "tryons_by_date": {},
            "top_products": [],
            "top_models": [],
            "category_distribution": {},
            "ai_provider_distribution": {},
            "product_visit_stats": [],
            "visit_to_tryon_conversion": [],
            "peak_hours": {f"{h:02d}": 0 for h in range(24)},
            "user_engagement": {"unique_users": 0, "avg_tryons_per_user": 0.0, "total_sessions": 0},
            "revenue_potential": [],
            "cart_analytics": [],
            "trending_products": [],
            "traffic_sources": {"catalog": 0, "search": 0, "homepage": 0, "recommendation": 0, "tryon_page": 0, "other": 0},
            "daily_active_users": [],
        }

    # Get all tryon sessions - we filter in Python since JsonStore doesn't support $in
    all_sessions = await store.find_many("tryon_sessions", {})
    retailer_sessions = [s for s in all_sessions if s.get("product_id") in product_ids]

    # Apply date filtering
    retailer_sessions = _filter_sessions_by_date(retailer_sessions, date_from, date_to)

    total_tryons = len(retailer_sessions)
    total_favorites = sum(1 for s in retailer_sessions if s.get("is_favorite"))

    # Average processing time
    processing_times = [s.get("processing_time_ms", 0) for s in retailer_sessions if s.get("processing_time_ms")]
    avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0.0

    # Try-ons by date (YYYY-MM-DD)
    tryons_by_date: dict[str, int] = defaultdict(int)
    for s in retailer_sessions:
        date_str = s.get("created_at", "")[:10]  # YYYY-MM-DD
        if date_str:
            tryons_by_date[date_str] += 1

    # Top products
    product_counter: Counter = Counter()
    product_fav_counter: Counter = Counter()
    for s in retailer_sessions:
        pid = s.get("product_id")
        if pid:
            product_counter[pid] += 1
            if s.get("is_favorite"):
                product_fav_counter[pid] += 1

    top_products = []
    for pid, count in product_counter.most_common(5):
        product = products_map.get(pid, {})
        top_products.append({
            "product_id": pid,
            "name": product.get("name", "Unknown"),
            "tryon_count": count,
            "favorite_count": product_fav_counter.get(pid, 0),
        })

    # Top models
    model_counter: Counter = Counter()
    for s in retailer_sessions:
        mid = s.get("model_id")
        if mid:
            model_counter[mid] += 1

    top_models = []
    for mid, count in model_counter.most_common(5):
        model = models_map.get(mid, {})
        top_models.append({
            "model_id": mid,
            "name": model.get("name", "Unknown"),
            "tryon_count": count,
        })

    # Category distribution
    category_dist: dict[str, int] = defaultdict(int)
    for s in retailer_sessions:
        pid = s.get("product_id")
        product = products_map.get(pid, {})
        category = product.get("category", "Unknown")
        category_dist[category] += 1

    # AI provider distribution
    ai_dist: dict[str, int] = defaultdict(int)
    for s in retailer_sessions:
        provider = s.get("ai_provider", "unknown")
        ai_dist[provider] += 1

    # ── Enhanced Analytics: Product Visit Stats ──────────────────────
    all_events = await store.find_many("analytics_events", {})
    # Filter events for this retailer's products
    retailer_events = [e for e in all_events if e.get("product_id") in product_ids]

    # Count views, tryons, and favorites per product from events
    event_views: Counter = Counter()
    event_tryons: Counter = Counter()
    event_favorites: Counter = Counter()
    for e in retailer_events:
        pid = e.get("product_id")
        etype = e.get("event_type")
        if etype == "product_view":
            event_views[pid] += 1
        elif etype == "product_tryon":
            event_tryons[pid] += 1
        elif etype == "product_favorite":
            event_favorites[pid] += 1

    # Also factor in actual tryon_sessions data for tryon/favorite counts
    for pid in product_ids:
        session_tryons = product_counter.get(pid, 0)
        session_favs = product_fav_counter.get(pid, 0)
        # Merge: use the max of event-tracked vs session-tracked
        if session_tryons > event_tryons.get(pid, 0):
            event_tryons[pid] = session_tryons
        if session_favs > event_favorites.get(pid, 0):
            event_favorites[pid] = session_favs

    # Determine recency (activity in last 7 days)
    now = datetime.now(timezone.utc)
    seven_days_ago = (now - timedelta(days=7)).isoformat()
    recent_product_ids: set[str] = set()
    for e in retailer_events:
        if e.get("created_at", "") >= seven_days_ago:
            pid = e.get("product_id")
            if pid:
                recent_product_ids.add(pid)
    for s in retailer_sessions:
        if s.get("created_at", "") >= seven_days_ago:
            pid = s.get("product_id")
            if pid:
                recent_product_ids.add(pid)

    # Build product_visit_stats (top 10 by popularity score)
    product_scores: list[dict] = []
    for pid in product_ids:
        views = event_views.get(pid, 0)
        tryons = event_tryons.get(pid, 0)
        favorites = event_favorites.get(pid, 0)
        has_recent = pid in recent_product_ids
        score = calculate_product_popularity_score(pid, views, tryons, favorites, has_recent)
        conversion_rate = round((tryons / views * 100), 1) if views > 0 else 0.0
        product = products_map.get(pid, {})
        product_scores.append({
            "product_id": pid,
            "name": product.get("name", "Unknown"),
            "views": views,
            "tryons": tryons,
            "favorites": favorites,
            "conversion_rate": conversion_rate,
            "popularity_score": score,
        })
    product_scores.sort(key=lambda x: x["popularity_score"], reverse=True)
    product_visit_stats = product_scores[:10]

    # ── Visit-to-TryOn Conversion per product ──────────────────────
    visit_to_tryon_conversion = [
        {
            "product_id": ps["product_id"],
            "name": ps["name"],
            "views": ps["views"],
            "tryons": ps["tryons"],
            "conversion_rate": ps["conversion_rate"],
        }
        for ps in product_scores
        if ps["views"] > 0
    ]

    # ── Peak Hours Analysis ────────────────────────────────────────
    peak_hours: dict[str, int] = defaultdict(int)
    for e in retailer_events:
        created = e.get("created_at", "")
        if "T" in created:
            try:
                hour = created.split("T")[1][:2]
                peak_hours[hour] += 1
            except (IndexError, ValueError):
                pass
    for s in retailer_sessions:
        created = s.get("created_at", "")
        if "T" in created:
            try:
                hour = created.split("T")[1][:2]
                peak_hours[hour] += 1
            except (IndexError, ValueError):
                pass
    # Ensure all 24 hours are represented
    for h in range(24):
        key = f"{h:02d}"
        if key not in peak_hours:
            peak_hours[key] = 0
    peak_hours_sorted = dict(sorted(peak_hours.items()))

    # ── User Engagement ────────────────────────────────────────────
    unique_tryon_users: set[str] = set()
    user_tryon_counts: Counter = Counter()
    for s in retailer_sessions:
        uid = s.get("user_id")
        if uid:
            unique_tryon_users.add(uid)
            user_tryon_counts[uid] += 1

    total_unique = len(unique_tryon_users)
    avg_tryons_per_user = round(
        sum(user_tryon_counts.values()) / total_unique, 1
    ) if total_unique > 0 else 0.0
    user_engagement = {
        "unique_users": total_unique,
        "avg_tryons_per_user": avg_tryons_per_user,
        "total_sessions": total_tryons,
    }

    # ── Revenue Potential ──────────────────────────────────────────
    # Products with high try-on + high favorite = high purchase intent
    revenue_potential = sorted(
        [
            {
                "product_id": ps["product_id"],
                "name": ps["name"],
                "score": ps["popularity_score"],
                "tryons": ps["tryons"],
                "favorites": ps["favorites"],
            }
            for ps in product_scores
            if ps["tryons"] > 0 or ps["favorites"] > 0
        ],
        key=lambda x: x["score"],
        reverse=True,
    )[:5]

    # ── Cart Analytics ───────────────────────────────────────────
    event_cart_adds: Counter = Counter()
    for e in retailer_events:
        if e.get("event_type") == "product_cart_add":
            pid = e.get("product_id")
            if pid:
                event_cart_adds[pid] += 1

    cart_analytics = []
    for pid in product_ids:
        cart_adds = event_cart_adds.get(pid, 0)
        views = event_views.get(pid, 0)
        cart_conversion_rate = round((cart_adds / views * 100), 1) if views > 0 else 0.0
        product = products_map.get(pid, {})
        if cart_adds > 0:
            cart_analytics.append({
                "product_id": pid,
                "name": product.get("name", "Unknown"),
                "cart_adds": cart_adds,
                "cart_conversion_rate": cart_conversion_rate,
            })
    cart_analytics.sort(key=lambda x: x["cart_adds"], reverse=True)

    # ── Trending Products ─────────────────────────────────────
    fourteen_days_ago = (now - timedelta(days=14)).isoformat()
    recent_events: list[dict] = []
    previous_events: list[dict] = []
    for e in retailer_events:
        created = e.get("created_at", "")
        if created >= seven_days_ago:
            recent_events.append(e)
        elif created >= fourteen_days_ago:
            previous_events.append(e)

    # Count per product for recent window
    recent_views: Counter = Counter()
    recent_tryons_c: Counter = Counter()
    recent_favorites_c: Counter = Counter()
    recent_cart_adds_c: Counter = Counter()
    for e in recent_events:
        pid = e.get("product_id")
        etype = e.get("event_type")
        if etype == "product_view":
            recent_views[pid] += 1
        elif etype == "product_tryon":
            recent_tryons_c[pid] += 1
        elif etype == "product_favorite":
            recent_favorites_c[pid] += 1
        elif etype == "product_cart_add":
            recent_cart_adds_c[pid] += 1

    # Count per product for previous window
    prev_total: Counter = Counter()
    for e in previous_events:
        pid = e.get("product_id")
        if pid:
            prev_total[pid] += 1

    recent_total: Counter = Counter()
    for e in recent_events:
        pid = e.get("product_id")
        if pid:
            recent_total[pid] += 1

    trending_products = []
    for pid in product_ids:
        rv = recent_views.get(pid, 0)
        rt = recent_tryons_c.get(pid, 0)
        rf = recent_favorites_c.get(pid, 0)
        rc = recent_cart_adds_c.get(pid, 0)
        recent_score = (rv * 1) + (rt * 5) + (rf * 10) + (rc * 3)
        if recent_score == 0:
            continue
        recent_count = recent_total.get(pid, 0)
        prev_count = prev_total.get(pid, 0)
        if recent_count > prev_count:
            trend = "rising"
        elif recent_count == prev_count:
            trend = "stable"
        else:
            trend = "declining"
        product = products_map.get(pid, {})
        trending_products.append({
            "product_id": pid,
            "name": product.get("name", "Unknown"),
            "recent_score": round(recent_score, 1),
            "trend": trend,
        })
    trending_products.sort(key=lambda x: x["recent_score"], reverse=True)
    trending_products = trending_products[:10]

    # ── Traffic Source Analysis ────────────────────────────────
    known_sources = {"catalog", "search", "homepage", "recommendation", "tryon_page"}
    traffic_sources: dict[str, int] = {s: 0 for s in known_sources}
    traffic_sources["other"] = 0
    for e in retailer_events:
        source = (e.get("metadata") or {}).get("source", "other")
        if source in known_sources:
            traffic_sources[source] += 1
        else:
            traffic_sources["other"] += 1

    # ── Daily Active Users ────────────────────────────────────
    daily_users: dict[str, set] = defaultdict(set)
    for e in retailer_events:
        date_str = e.get("created_at", "")[:10]
        uid = e.get("user_id")
        if date_str and uid:
            daily_users[date_str].add(uid)
    for s in retailer_sessions:
        date_str = s.get("created_at", "")[:10]
        uid = s.get("user_id")
        if date_str and uid:
            daily_users[date_str].add(uid)

    daily_active_users = sorted(
        [{"date": d, "unique_users": len(users)} for d, users in daily_users.items()],
        key=lambda x: x["date"],
    )

    return {
        "total_tryons": total_tryons,
        "total_products": len(products_map),
        "total_models": len(models_map),
        "total_favorites": total_favorites,
        "avg_processing_time_ms": round(avg_processing_time, 1),
        "tryons_by_date": dict(sorted(tryons_by_date.items())),
        "top_products": top_products,
        "top_models": top_models,
        "category_distribution": dict(category_dist),
        "ai_provider_distribution": dict(ai_dist),
        "product_visit_stats": product_visit_stats,
        "visit_to_tryon_conversion": visit_to_tryon_conversion,
        "peak_hours": peak_hours_sorted,
        "user_engagement": user_engagement,
        "revenue_potential": revenue_potential,
        "cart_analytics": cart_analytics,
        "trending_products": trending_products,
        "traffic_sources": traffic_sources,
        "daily_active_users": daily_active_users,
    }


async def get_product_analytics(
    store: JsonStore,
    retailer_id: str,
    product_id: str,
) -> Optional[dict]:
    """Get detailed analytics for a specific product."""
    product = await store.find_one("products", {"_id": product_id})
    if not product or product.get("retailer_id") != retailer_id:
        return None

    models_map = await _get_retailer_models_map(store, retailer_id)

    all_sessions = await store.find_many("tryon_sessions", {})
    product_sessions = [s for s in all_sessions if s.get("product_id") == product_id]

    tryon_count = len(product_sessions)
    favorite_count = sum(1 for s in product_sessions if s.get("is_favorite"))

    processing_times = [s.get("processing_time_ms", 0) for s in product_sessions if s.get("processing_time_ms")]
    avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0.0

    # Model preferences
    model_counter: Counter = Counter()
    for s in product_sessions:
        mid = s.get("model_id")
        if mid:
            model_counter[mid] += 1

    model_preferences = []
    for mid, count in model_counter.most_common(5):
        model = models_map.get(mid, {})
        model_preferences.append({
            "model_id": mid,
            "name": model.get("name", "Unknown"),
            "tryon_count": count,
        })

    # Try-ons by date
    tryons_by_date: dict[str, int] = defaultdict(int)
    for s in product_sessions:
        date_str = s.get("created_at", "")[:10]
        if date_str:
            tryons_by_date[date_str] += 1

    # Recent try-ons (last 10)
    sorted_sessions = sorted(product_sessions, key=lambda x: x.get("created_at", ""), reverse=True)
    recent_tryons = [
        {
            "session_id": s.get("_id"),
            "user_id": s.get("user_id"),
            "model_name": s.get("model_name", ""),
            "status": s.get("status", ""),
            "is_favorite": s.get("is_favorite", False),
            "created_at": s.get("created_at", ""),
        }
        for s in sorted_sessions[:10]
    ]

    return {
        "product_id": product_id,
        "product_name": product.get("name", "Unknown"),
        "tryon_count": tryon_count,
        "favorite_count": favorite_count,
        "avg_processing_time_ms": round(avg_processing_time, 1),
        "model_preferences": model_preferences,
        "tryons_by_date": dict(sorted(tryons_by_date.items())),
        "recent_tryons": recent_tryons,
    }


async def export_analytics_csv(
    store: JsonStore,
    retailer_id: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> bytes:
    """Export analytics data as CSV bytes."""
    products_map = await _get_retailer_products_map(store, retailer_id)
    models_map = await _get_retailer_models_map(store, retailer_id)
    product_ids = set(products_map.keys())

    all_sessions = await store.find_many("tryon_sessions", {})
    retailer_sessions = [s for s in all_sessions if s.get("product_id") in product_ids]
    retailer_sessions = _filter_sessions_by_date(retailer_sessions, date_from, date_to)

    # Sort by date
    retailer_sessions.sort(key=lambda x: x.get("created_at", ""))

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Date",
        "Session ID",
        "Product",
        "Category",
        "Model",
        "AI Provider",
        "Processing Time (ms)",
        "Favorite",
        "Status",
    ])

    for s in retailer_sessions:
        product = products_map.get(s.get("product_id", ""), {})
        model = models_map.get(s.get("model_id", ""), {})
        writer.writerow([
            s.get("created_at", "")[:10],
            s.get("_id", ""),
            product.get("name", s.get("product_name", "")),
            product.get("category", ""),
            model.get("name", s.get("model_name", "")),
            s.get("ai_provider", ""),
            s.get("processing_time_ms", 0),
            "Yes" if s.get("is_favorite") else "No",
            s.get("status", ""),
        ])

    return output.getvalue().encode("utf-8")


async def export_analytics_report(
    store: JsonStore,
    retailer_id: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> str:
    """Export analytics as an HTML report."""
    summary = await get_dashboard_summary(store, retailer_id, date_from, date_to)

    date_range_text = "All Time"
    if date_from and date_to:
        date_range_text = f"{date_from} to {date_to}"
    elif date_from:
        date_range_text = f"From {date_from}"
    elif date_to:
        date_range_text = f"Until {date_to}"

    # Build top products rows
    product_rows = ""
    for i, p in enumerate(summary["top_products"], 1):
        product_rows += f"""
        <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">{i}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">{p['name']}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">{p['tryon_count']}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">{p['favorite_count']}</td>
        </tr>"""

    model_rows = ""
    for i, m in enumerate(summary["top_models"], 1):
        model_rows += f"""
        <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">{i}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">{m['name']}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">{m['tryon_count']}</td>
        </tr>"""

    category_rows = ""
    for cat, count in summary["category_distribution"].items():
        category_rows += f"""
        <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">{cat}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">{count}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FitView AI - Analytics Report</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f9fafb; color: #111827; }}
        .container {{ max-width: 800px; margin: 0 auto; }}
        h1 {{ color: #4f46e5; margin-bottom: 4px; }}
        .subtitle {{ color: #6b7280; margin-bottom: 24px; }}
        .card {{ background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
        .stats-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }}
        .stat {{ text-align: center; }}
        .stat-value {{ font-size: 28px; font-weight: 700; color: #4f46e5; }}
        .stat-label {{ font-size: 13px; color: #6b7280; margin-top: 4px; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th {{ padding: 8px 12px; text-align: left; background: #f3f4f6; font-weight: 600; font-size: 13px; color: #374151; }}
        h2 {{ font-size: 18px; margin-bottom: 12px; color: #1f2937; }}
        .footer {{ text-align: center; color: #9ca3af; font-size: 12px; margin-top: 32px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>FitView AI Analytics Report</h1>
        <p class="subtitle">Period: {date_range_text} | Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</p>

        <div class="card">
            <h2>Summary</h2>
            <div class="stats-grid">
                <div class="stat">
                    <div class="stat-value">{summary['total_tryons']}</div>
                    <div class="stat-label">Total Try-Ons</div>
                </div>
                <div class="stat">
                    <div class="stat-value">{summary['total_products']}</div>
                    <div class="stat-label">Total Products</div>
                </div>
                <div class="stat">
                    <div class="stat-value">{summary['total_favorites']}</div>
                    <div class="stat-label">Favorites</div>
                </div>
                <div class="stat">
                    <div class="stat-value">{summary['avg_processing_time_ms']:.0f}ms</div>
                    <div class="stat-label">Avg Processing Time</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Top Products</h2>
            <table>
                <thead><tr><th>#</th><th>Product</th><th style="text-align:center;">Try-Ons</th><th style="text-align:center;">Favorites</th></tr></thead>
                <tbody>{product_rows if product_rows else '<tr><td colspan="4" style="padding:12px;text-align:center;color:#9ca3af;">No data available</td></tr>'}</tbody>
            </table>
        </div>

        <div class="card">
            <h2>Top Models</h2>
            <table>
                <thead><tr><th>#</th><th>Model</th><th style="text-align:center;">Try-Ons</th></tr></thead>
                <tbody>{model_rows if model_rows else '<tr><td colspan="3" style="padding:12px;text-align:center;color:#9ca3af;">No data available</td></tr>'}</tbody>
            </table>
        </div>

        <div class="card">
            <h2>Category Distribution</h2>
            <table>
                <thead><tr><th>Category</th><th style="text-align:center;">Try-Ons</th></tr></thead>
                <tbody>{category_rows if category_rows else '<tr><td colspan="2" style="padding:12px;text-align:center;color:#9ca3af;">No data available</td></tr>'}</tbody>
            </table>
        </div>

        <p class="footer">FitView AI - AI for Bharat 2025 | Powered by Nano Banana &amp; Gemini Image</p>
    </div>
</body>
</html>"""

    return html
