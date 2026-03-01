"""
Analytics API Endpoints for FitView AI.
Phase 5: Retailer Analytics Dashboard.

GET  /analytics/dashboard           - Get retailer analytics dashboard data
GET  /analytics/products/{id}       - Get analytics for a specific product
GET  /analytics/export/csv          - Export analytics as CSV
GET  /analytics/export/report       - Export analytics as HTML report
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import get_current_user, get_store
from app.services.analytics_service import (
    export_analytics_csv,
    export_analytics_report,
    get_dashboard_summary,
    get_product_analytics,
)
from app.utils.json_store import JsonStore

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
