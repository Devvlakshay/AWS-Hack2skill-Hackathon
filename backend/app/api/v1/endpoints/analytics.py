"""
Analytics API Endpoints for FitView AI.
Phase 5: Retailer Analytics Dashboard.
Phase 6: Enhanced analytics — product visit tracking, events.

GET  /analytics/dashboard           - Get retailer analytics dashboard data
GET  /analytics/products/{id}       - Get analytics for a specific product
GET  /analytics/export/csv          - Export analytics as CSV
GET  /analytics/export/report       - Export analytics as HTML report
POST /analytics/events              - Track an analytics event (product_view, etc.)
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, Field

from app.core.deps import get_current_user, get_store
from app.services.analytics_service import (
    export_analytics_csv,
    export_analytics_report,
    get_dashboard_summary,
    get_product_analytics,
    track_event,
)
from app.utils.json_store import JsonStore


class TrackEventRequest(BaseModel):
    """Request body for tracking an analytics event."""
    event_type: str = Field(..., description="Event type: product_view, product_tryon, product_favorite")
    product_id: str = Field(..., description="Product ID")
    metadata: Optional[dict] = Field(default=None, description="Extra metadata, e.g. {source: 'catalog'}")

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _get_retailer_id(current_user: dict) -> str:
    """Extract retailer ID, enforcing retailer or admin role."""
    role = current_user.get("role", "customer")
    if role not in ("retailer", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only retailers and admins can view analytics.",
        )
    return current_user["_id"]


@router.get("/dashboard")
async def dashboard(
    date_from: str = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get retailer analytics dashboard data."""
    retailer_id = _get_retailer_id(current_user)
    return await get_dashboard_summary(store, retailer_id, date_from, date_to)


@router.get("/products/{product_id}")
async def product_analytics(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get analytics for a specific product."""
    retailer_id = _get_retailer_id(current_user)
    result = await get_product_analytics(store, retailer_id, product_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or does not belong to you.",
        )
    return result


@router.get("/export/csv")
async def export_csv(
    date_from: str = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Export analytics as a CSV file download."""
    retailer_id = _get_retailer_id(current_user)
    csv_bytes = await export_analytics_csv(store, retailer_id, date_from, date_to)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=fitview_analytics.csv"},
    )


@router.get("/export/report")
async def export_report(
    date_from: str = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Export analytics as an HTML report."""
    retailer_id = _get_retailer_id(current_user)
    html = await export_analytics_report(store, retailer_id, date_from, date_to)
    return Response(
        content=html,
        media_type="text/html",
        headers={"Content-Disposition": "attachment; filename=fitview_analytics_report.html"},
    )


@router.post("/events", status_code=status.HTTP_201_CREATED)
async def track_analytics_event(
    body: TrackEventRequest,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """
    Track an analytics event (product_view, product_tryon, product_favorite).

    Any authenticated user can trigger product_view events.
    This endpoint is called by the frontend when a user views a product page.
    """
    allowed_types = {"product_view", "product_tryon", "product_favorite", "product_cart_add"}
    if body.event_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid event_type. Must be one of: {', '.join(sorted(allowed_types))}",
        )

    event_id = await track_event(
        store=store,
        event_type=body.event_type,
        user_id=current_user["_id"],
        product_id=body.product_id,
        metadata=body.metadata,
    )
    return {"event_id": event_id, "status": "tracked"}
