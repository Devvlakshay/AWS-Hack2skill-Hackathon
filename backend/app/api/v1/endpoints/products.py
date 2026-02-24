"""
Product API endpoints for FitView AI.
Phase 2: Product & Model Management.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from app.core.deps import get_current_user, get_store
from app.models.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.services import product_service
from app.utils.json_store import JsonStore
from app.utils.storage import upload_image_multiple_sizes, validate_image

router = APIRouter(prefix="/products", tags=["products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Create a new product. Retailer only."""
    if current_user.get("role") != "retailer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only retailers can create products",
        )

    retailer_id = current_user["id"]
    product = await product_service.create_product(store, data, retailer_id)
    return product


@router.get("", response_model=ProductListResponse)
async def list_products(
    category: Optional[str] = Query(None),
    subcategory: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    price_min: Optional[float] = Query(None, ge=0),
    price_max: Optional[float] = Query(None, ge=0),
    sort_by: str = Query("created_at", regex="^(created_at|price|name)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    store: JsonStore = Depends(get_store),
):
    """List products with filters, sorting, and pagination."""
    filters = {}
    if category:
        filters["category"] = category
    if subcategory:
        filters["subcategory"] = subcategory
    if search:
        filters["search"] = search
    if price_min is not None:
        filters["price_min"] = price_min
    if price_max is not None:
        filters["price_max"] = price_max

    order = -1 if sort_order == "desc" else 1
    return await product_service.get_products(store, filters, page, limit, sort_by, order)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    store: JsonStore = Depends(get_store),
):
    """Get a single product by ID."""
    product = await product_service.get_product_by_id(store, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Update a product. Retailer owner only."""
    if current_user.get("role") != "retailer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only retailers can update products",
        )

    retailer_id = current_user["id"]
    product = await product_service.update_product(store, product_id, data, retailer_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you are not the owner",
        )
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Delete a product (soft delete). Retailer owner only."""
    if current_user.get("role") != "retailer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only retailers can delete products",
        )

    retailer_id = current_user["id"]
    deleted = await product_service.delete_product(store, product_id, retailer_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you are not the owner",
        )
    return None


@router.post("/{product_id}/images", response_model=ProductResponse)
async def upload_product_images(
    product_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Upload an image for a product. Retailer owner only."""
    if current_user.get("role") != "retailer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only retailers can upload product images",
        )

    retailer_id = current_user["id"]

    # Check product exists and belongs to retailer
    product = await product_service.get_product_by_id(store, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    if product.retailer_id != retailer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this product",
        )

    # Read and validate the image
    file_bytes = await file.read()
    try:
        validate_image(file_bytes)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Upload to Cloudinary with multiple sizes
    filename = f"{product_id}_{uuid.uuid4().hex[:8]}"
    try:
        urls = upload_image_multiple_sizes(file_bytes, "products", filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {str(e)}",
        )

    # Append the original URL to product images list
    current_images = list(product.images) if product.images else []
    current_images.append(urls["original"])

    updated = await product_service.update_product(
        store,
        product_id,
        ProductUpdate(images=current_images),
        retailer_id,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product with new image",
        )
    return updated
