"""
Recommendation Service for FitView AI.
Phase 4: Intelligence Layer.

Provides size and style recommendations using rule-based matching
and content-based filtering via tag overlap scoring.
"""

import logging
from collections import Counter
from typing import Optional

from app.models.recommendation import SizeRecommendation, StyleRecommendation
from app.utils.json_store import JsonStore

logger = logging.getLogger(__name__)

# Standard Indian size measurements (in cm) for rule-based sizing
# Maps size label to approximate body measurement ranges
SIZE_MEASUREMENTS = {
    "XS": {"chest": (76, 81), "waist": (61, 66), "hip": (84, 89)},
    "S": {"chest": (81, 89), "waist": (66, 74), "hip": (89, 97)},
    "M": {"chest": (89, 97), "waist": (74, 81), "hip": (97, 104)},
    "L": {"chest": (97, 104), "waist": (81, 89), "hip": (104, 112)},
    "XL": {"chest": (104, 112), "waist": (89, 97), "hip": (112, 119)},
    "XXL": {"chest": (112, 119), "waist": (97, 104), "hip": (119, 127)},
}


async def recommend_size(
    store: JsonStore,
    user_id: str,
    product_id: str,
) -> SizeRecommendation:
    """
    Recommend a size for a user and product combination.

    Strategy:
    1. Check user measurements if available
    2. Match against product size chart or default size chart
    3. Check try-on history for similar products
    4. Return best size with confidence score
    """
    # Get product
    product = await store.find_one("products", {"_id": product_id, "is_deleted": False})
    if not product:
        return SizeRecommendation(
            recommended_size="M",
            confidence=0.3,
            reasoning="Product not found. Defaulting to medium size.",
            all_sizes=[],
        )

    available_sizes = product.get("sizes", [])
    if not available_sizes:
        return SizeRecommendation(
            recommended_size="M",
            confidence=0.3,
            reasoning="No size information available for this product.",
            all_sizes=[],
        )

    # Get user profile for measurements
    user = await store.find_one("users", {"_id": user_id})
    user_measurements = user.get("measurements", {}) if user else {}

    # Get product size chart
    size_chart = product.get("size_chart", {})

    # Build scores for each available size
    size_scores: list[dict] = []

    for size_info in available_sizes:
        size_label = size_info.get("size", "")
        stock = size_info.get("stock", 0)

        if stock <= 0:
            continue

        score = 0.0
        reasons = []

        # Rule-based scoring from user measurements
        if user_measurements and size_label in SIZE_MEASUREMENTS:
            measurement_range = SIZE_MEASUREMENTS[size_label]
            match_count = 0
            total_checks = 0

            for measure_key in ["chest", "waist", "hip"]:
                user_val = user_measurements.get(measure_key)
                if user_val is not None:
                    total_checks += 1
                    low, high = measurement_range[measure_key]
                    if low <= user_val <= high:
                        match_count += 1
                    elif abs(user_val - low) <= 3 or abs(user_val - high) <= 3:
                        match_count += 0.5

            if total_checks > 0:
                score += (match_count / total_checks) * 0.6
                reasons.append("Based on your body measurements")

        # Size chart matching
        if size_chart and size_label in size_chart:
            score += 0.1
            reasons.append("Matches product size chart")

        # Popularity scoring - check what sizes other users tried with this product
        tryon_sessions = await store.find_many(
            "tryon_sessions", {"product_id": product_id}
        )
        if tryon_sessions:
            # Count try-ons (as a proxy for popular sizes)
            score += 0.1
            reasons.append("Popular choice for this product")

        # Default scoring for common sizes (M and L tend to be safest)
        default_preference = {"M": 0.15, "L": 0.12, "XL": 0.10, "S": 0.08, "XXL": 0.05, "XS": 0.03}
        score += default_preference.get(size_label, 0.05)

        if not reasons:
            reasons.append("General fit recommendation")

        size_scores.append({
            "size": size_label,
            "score": round(min(score, 1.0), 2),
            "stock": stock,
            "reasoning": "; ".join(reasons),
        })

    # Sort by score descending
    size_scores.sort(key=lambda x: x["score"], reverse=True)

    if not size_scores:
        # All sizes out of stock
        fallback_size = available_sizes[0].get("size", "M")
        return SizeRecommendation(
            recommended_size=fallback_size,
            confidence=0.3,
            reasoning="Limited stock availability. This is the closest available option.",
            all_sizes=[],
        )

    best = size_scores[0]
    confidence = best["score"]

    # Build reasoning string
    category = product.get("category", "this item")
    reasoning = f"We recommend size {best['size']} for {category}. {best['reasoning']}."
    if confidence >= 0.5:
        reasoning += f" ({int(confidence * 100)}% confidence)"
    else:
        reasoning += " Consider checking the size chart for best fit."

    return SizeRecommendation(
        recommended_size=best["size"],
        confidence=confidence,
        reasoning=reasoning,
        all_sizes=size_scores,
    )


async def recommend_style(
    store: JsonStore,
    user_id: str,
    limit: int = 10,
) -> StyleRecommendation:
    """
    Recommend products based on user's try-on history.

    Strategy (content-based filtering via tag overlap):
    1. Get user's try-on history
    2. Collect tags/categories from tried products
    3. Find products with overlapping tags that user hasn't tried
    4. Score by tag overlap count
    5. Return top recommendations
    """
    # Get user's try-on history
    tryon_sessions = await store.find_many(
        "tryon_sessions",
        {"user_id": user_id},
        sort_field="created_at",
        sort_order=-1,
    )

    if not tryon_sessions:
        # No history - return popular/recent products
        all_products = await store.find_many(
            "products",
            {"is_deleted": False},
            sort_field="created_at",
            sort_order=-1,
            limit=limit,
        )
        return StyleRecommendation(
            products=_format_products(all_products),
            based_on="Trending products",
            total=len(all_products),
        )

    # Collect tried product IDs and their features
    tried_product_ids = set()
    tag_counter: Counter = Counter()
    category_counter: Counter = Counter()

    for session in tryon_sessions:
        pid = session.get("product_id", "")
        tried_product_ids.add(pid)

        # Fetch product details for tags
        product = await store.find_one("products", {"_id": pid, "is_deleted": False})
        if product:
            for tag in product.get("tags", []):
                tag_counter[tag] += 1
            category_counter[product.get("category", "")] += 1

    # Get all active products
    all_products = await store.find_many("products", {"is_deleted": False})

    # Score products user hasn't tried
    scored_products: list[tuple[float, dict]] = []

    for product in all_products:
        pid = product.get("_id", "")
        if pid in tried_product_ids:
            continue

        score = 0.0

        # Tag overlap scoring
        product_tags = set(product.get("tags", []))
        for tag in product_tags:
            if tag in tag_counter:
                score += tag_counter[tag]

        # Category overlap scoring (weighted higher)
        product_category = product.get("category", "")
        if product_category in category_counter:
            score += category_counter[product_category] * 2

        if score > 0:
            scored_products.append((score, product))

    # Sort by score descending
    scored_products.sort(key=lambda x: x[0], reverse=True)

    # Take top N
    recommended = [p for _, p in scored_products[:limit]]

    # If we don't have enough recommendations, pad with recent products
    if len(recommended) < limit:
        remaining = limit - len(recommended)
        recommended_ids = {p.get("_id") for p in recommended}
        for product in all_products:
            pid = product.get("_id", "")
            if pid not in tried_product_ids and pid not in recommended_ids:
                recommended.append(product)
                if len(recommended) >= limit:
                    break

    # Build basis description
    top_tags = [tag for tag, _ in tag_counter.most_common(3)]
    top_categories = [cat for cat, _ in category_counter.most_common(2)]
    basis_parts = []
    if top_tags:
        basis_parts.append(f"your interest in {', '.join(top_tags)}")
    if top_categories:
        basis_parts.append(f"products in {', '.join(top_categories)}")
    based_on = f"Based on {' and '.join(basis_parts)}" if basis_parts else "Trending products"

    return StyleRecommendation(
        products=_format_products(recommended),
        based_on=based_on,
        total=len(recommended),
    )


def _format_products(products: list[dict]) -> list[dict]:
    """Format product dicts for the response."""
    formatted = []
    for p in products:
        formatted.append({
            "_id": p.get("_id", ""),
            "id": p.get("_id", ""),
            "name": p.get("name", ""),
            "category": p.get("category", ""),
            "price": p.get("price", 0),
            "images": p.get("images", []),
            "tags": p.get("tags", []),
            "colors": p.get("colors", []),
            "material": p.get("material", ""),
        })
    return formatted
