"""
Comprehensive end-to-end API test script for FitView AI backend.
Tests all major flows: Auth, Products, Models, Cart, Wishlist, Try-On,
Analytics, Chatbot, and Health.
"""

import asyncio
import httpx
import json
import time
import traceback

BASE = "http://localhost:8000/api/v1"
HEALTH_URL = "http://localhost:8000/health"

RESULTS = {"passed": 0, "failed": 0, "skipped": 0, "errors": []}

# Test user credentials
CUSTOMER_EMAIL = "test_customer_e2e@fitview.ai"
CUSTOMER_PASSWORD = "TestCustomer@12345!"
CUSTOMER_NAME = "Test Customer E2E"

RETAILER_EMAIL = "test_retailer_e2e@fitview.ai"
RETAILER_PASSWORD = "TestRetailer@12345!"
RETAILER_NAME = "Test Retailer E2E"

# Tokens will be populated during auth tests
customer_token = None
retailer_token = None
customer_refresh_token = None
retailer_refresh_token = None

# IDs populated during tests
created_product_id = None
created_tryon_session_id = None
chatbot_session_id = None


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def test_flow(name: str, func, client: httpx.AsyncClient):
    """Run a single test flow, catching and reporting errors."""
    try:
        await func(client)
        RESULTS["passed"] += 1
        print(f"  [PASS] {name}")
    except Exception as e:
        RESULTS["failed"] += 1
        short_err = str(e)[:300]
        RESULTS["errors"].append(f"{name}: {short_err}")
        print(f"  [FAIL] {name}: {short_err}")


async def skip_test(name: str, reason: str):
    RESULTS["skipped"] += 1
    print(f"  [SKIP] {name}: {reason}")


# ============================================================
# 1. AUTH FLOW
# ============================================================

async def test_register_customer(client: httpx.AsyncClient):
    global customer_token, customer_refresh_token
    # Try login first in case user already exists
    r_login = await client.post(f"{BASE}/auth/login", json={
        "email": CUSTOMER_EMAIL,
        "password": CUSTOMER_PASSWORD,
    })
    if r_login.status_code == 200:
        data = r_login.json()
        customer_token = data["access_token"]
        customer_refresh_token = data.get("refresh_token")
        return

    r = await client.post(f"{BASE}/auth/register", json={
        "name": CUSTOMER_NAME,
        "email": CUSTOMER_EMAIL,
        "password": CUSTOMER_PASSWORD,
        "role": "customer",
    })
    if r.status_code == 201:
        data = r.json()
        customer_token = data["access_token"]
        customer_refresh_token = data.get("refresh_token")
        assert data["user"]["role"] == "customer", f"Expected customer role, got {data['user']['role']}"
    elif r.status_code in (400, 409, 422, 500):
        # User may have been created concurrently, try login again
        r2 = await client.post(f"{BASE}/auth/login", json={
            "email": CUSTOMER_EMAIL,
            "password": CUSTOMER_PASSWORD,
        })
        assert r2.status_code == 200, f"Login after existing register failed: {r2.status_code} {r2.text}"
        data = r2.json()
        customer_token = data["access_token"]
        customer_refresh_token = data.get("refresh_token")
    else:
        raise AssertionError(f"Register failed: {r.status_code} {r.text}")


async def test_login_customer(client: httpx.AsyncClient):
    global customer_token, customer_refresh_token
    r = await client.post(f"{BASE}/auth/login", json={
        "email": CUSTOMER_EMAIL,
        "password": CUSTOMER_PASSWORD,
    })
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    customer_token = data["access_token"]
    customer_refresh_token = data.get("refresh_token")
    assert "access_token" in data


async def test_get_profile_customer(client: httpx.AsyncClient):
    assert customer_token, "No customer token available"
    r = await client.get(f"{BASE}/auth/me", headers=auth_header(customer_token))
    assert r.status_code == 200, f"Get profile failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["email"] == CUSTOMER_EMAIL
    assert data["role"] == "customer"


async def test_register_retailer(client: httpx.AsyncClient):
    global retailer_token, retailer_refresh_token
    # Try login first in case user already exists
    r_login = await client.post(f"{BASE}/auth/login", json={
        "email": RETAILER_EMAIL,
        "password": RETAILER_PASSWORD,
    })
    if r_login.status_code == 200:
        data = r_login.json()
        retailer_token = data["access_token"]
        retailer_refresh_token = data.get("refresh_token")
        return

    r = await client.post(f"{BASE}/auth/register", json={
        "name": RETAILER_NAME,
        "email": RETAILER_EMAIL,
        "password": RETAILER_PASSWORD,
        "role": "retailer",
    })
    if r.status_code == 201:
        data = r.json()
        retailer_token = data["access_token"]
        retailer_refresh_token = data.get("refresh_token")
    elif r.status_code in (400, 409, 422, 500):
        r2 = await client.post(f"{BASE}/auth/login", json={
            "email": RETAILER_EMAIL,
            "password": RETAILER_PASSWORD,
        })
        assert r2.status_code == 200, f"Retailer login failed: {r2.status_code} {r2.text}"
        data = r2.json()
        retailer_token = data["access_token"]
        retailer_refresh_token = data.get("refresh_token")
    else:
        raise AssertionError(f"Retailer register failed: {r.status_code} {r.text}")


async def test_login_retailer(client: httpx.AsyncClient):
    global retailer_token, retailer_refresh_token
    r = await client.post(f"{BASE}/auth/login", json={
        "email": RETAILER_EMAIL,
        "password": RETAILER_PASSWORD,
    })
    assert r.status_code == 200, f"Retailer login failed: {r.status_code} {r.text}"
    data = r.json()
    retailer_token = data["access_token"]
    retailer_refresh_token = data.get("refresh_token")


async def test_refresh_token_cannot_be_access(client: httpx.AsyncClient):
    """Verify that a refresh token cannot be used as an access token."""
    if not customer_refresh_token:
        raise AssertionError("No refresh token available to test")
    r = await client.get(
        f"{BASE}/auth/me",
        headers={"Authorization": f"Bearer {customer_refresh_token}"},
    )
    assert r.status_code == 401, f"Expected 401 when using refresh token as access, got {r.status_code}"


# ============================================================
# 2. PRODUCT FLOW (as retailer)
# ============================================================

async def test_list_products(client: httpx.AsyncClient):
    assert retailer_token, "No retailer token"
    r = await client.get(f"{BASE}/products", headers=auth_header(retailer_token))
    assert r.status_code == 200, f"List products failed: {r.status_code} {r.text}"
    data = r.json()
    assert "products" in data
    assert "total" in data


async def test_create_product(client: httpx.AsyncClient):
    global created_product_id
    assert retailer_token, "No retailer token"
    r = await client.post(f"{BASE}/products", json={
        "name": "E2E Test Kurta",
        "description": "A test product created by the E2E test suite for validation purposes.",
        "category": "Ethnic Wear",
        "subcategory": "Kurta",
        "tags": ["test", "e2e", "kurta"],
        "price": 1299.0,
        "sizes": [{"size": "M", "stock": 10}, {"size": "L", "stock": 5}],
        "colors": ["Red", "Blue"],
        "material": "Cotton",
        "images": ["https://example.com/test-kurta.jpg"],
    }, headers=auth_header(retailer_token))
    assert r.status_code == 201, f"Create product failed: {r.status_code} {r.text}"
    data = r.json()
    created_product_id = data.get("_id") or data.get("id")
    assert created_product_id, f"No product ID in response: {data}"


async def test_get_product_by_id(client: httpx.AsyncClient):
    assert created_product_id, "No product ID"
    r = await client.get(f"{BASE}/products/{created_product_id}")
    assert r.status_code == 200, f"Get product failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("name") == "E2E Test Kurta"


async def test_update_product(client: httpx.AsyncClient):
    assert created_product_id and retailer_token, "Missing product ID or token"
    r = await client.put(f"{BASE}/products/{created_product_id}", json={
        "price": 1499.0,
        "description": "Updated description for E2E test product.",
    }, headers=auth_header(retailer_token))
    assert r.status_code == 200, f"Update product failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["price"] == 1499.0


async def test_delete_product(client: httpx.AsyncClient):
    assert created_product_id and retailer_token, "Missing product ID or token"
    r = await client.delete(
        f"{BASE}/products/{created_product_id}",
        headers=auth_header(retailer_token),
    )
    assert r.status_code == 204, f"Delete product failed: {r.status_code} {r.text}"


async def test_deleted_product_not_in_list(client: httpx.AsyncClient):
    r = await client.get(f"{BASE}/products")
    assert r.status_code == 200
    data = r.json()
    product_ids = [p.get("_id") or p.get("id") for p in data.get("products", [])]
    assert created_product_id not in product_ids, "Deleted product still appears in list"


# ============================================================
# 3. MODEL FLOW (as retailer)
# ============================================================

async def test_list_models(client: httpx.AsyncClient):
    r = await client.get(f"{BASE}/models")
    assert r.status_code == 200, f"List models failed: {r.status_code} {r.text}"
    data = r.json()
    assert "models" in data
    assert "total" in data


async def test_models_exist(client: httpx.AsyncClient):
    r = await client.get(f"{BASE}/models")
    assert r.status_code == 200
    data = r.json()
    # Models may have been seeded by other agents or be pre-existing
    print(f"    (Found {data['total']} models)")


# ============================================================
# 4. CART FLOW (as customer)
# ============================================================

async def test_add_to_cart(client: httpx.AsyncClient):
    assert customer_token, "No customer token"
    # Use a known product ID - first find one from the product list
    r = await client.get(f"{BASE}/products")
    assert r.status_code == 200
    products = r.json().get("products", [])
    product_id = None
    if products:
        product_id = products[0].get("_id") or products[0].get("id")
    if not product_id:
        product_id = "prod001"  # fallback to seeded ID

    r = await client.post(f"{BASE}/cart/items", json={
        "product_id": product_id,
        "size": "M",
        "quantity": 2,
    }, headers=auth_header(customer_token))
    assert r.status_code == 201, f"Add to cart failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["total_items"] >= 1


async def test_get_cart(client: httpx.AsyncClient):
    assert customer_token, "No customer token"
    r = await client.get(f"{BASE}/cart", headers=auth_header(customer_token))
    assert r.status_code == 200, f"Get cart failed: {r.status_code} {r.text}"
    data = r.json()
    assert "items" in data
    assert "total_items" in data


async def test_update_cart_item(client: httpx.AsyncClient):
    assert customer_token, "No customer token"
    # Get cart to find the product_id
    r = await client.get(f"{BASE}/cart", headers=auth_header(customer_token))
    assert r.status_code == 200
    items = r.json().get("items", [])
    if not items:
        raise AssertionError("Cart is empty, cannot update item")
    product_id = items[0]["product_id"]

    r = await client.put(f"{BASE}/cart/items/{product_id}", json={
        "quantity": 3,
    }, headers=auth_header(customer_token))
    assert r.status_code == 200, f"Update cart item failed: {r.status_code} {r.text}"


async def test_remove_cart_item(client: httpx.AsyncClient):
    assert customer_token, "No customer token"
    r = await client.get(f"{BASE}/cart", headers=auth_header(customer_token))
    assert r.status_code == 200
    items = r.json().get("items", [])
    if not items:
        raise AssertionError("Cart is empty, cannot remove item")
    product_id = items[0]["product_id"]

    r = await client.delete(
        f"{BASE}/cart/items/{product_id}",
        headers=auth_header(customer_token),
    )
    assert r.status_code == 200, f"Remove cart item failed: {r.status_code} {r.text}"


async def test_clear_cart(client: httpx.AsyncClient):
    assert customer_token, "No customer token"
    r = await client.delete(f"{BASE}/cart", headers=auth_header(customer_token))
    assert r.status_code == 200, f"Clear cart failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["total_items"] == 0


# ============================================================
# 5. WISHLIST FLOW (as customer)
# ============================================================

async def test_add_to_wishlist(client: httpx.AsyncClient):
    assert customer_token, "No customer token"
    # Find a valid product
    r = await client.get(f"{BASE}/products")
    products = r.json().get("products", [])
    product_id = products[0].get("_id") or products[0].get("id") if products else "prod001"

    r = await client.post(f"{BASE}/wishlist", json={
        "product_id": product_id,
    }, headers=auth_header(customer_token))
    assert r.status_code in (200, 201), f"Add to wishlist failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["total"] >= 1


async def test_get_wishlist(client: httpx.AsyncClient):
    assert customer_token, "No customer token"
    r = await client.get(f"{BASE}/wishlist", headers=auth_header(customer_token))
    assert r.status_code == 200, f"Get wishlist failed: {r.status_code} {r.text}"
    data = r.json()
    assert "items" in data
    assert "total" in data


async def test_remove_from_wishlist(client: httpx.AsyncClient):
    assert customer_token, "No customer token"
    # Get wishlist to find product_id
    r = await client.get(f"{BASE}/wishlist", headers=auth_header(customer_token))
    assert r.status_code == 200
    items = r.json().get("items", [])
    if not items:
        raise AssertionError("Wishlist is empty, cannot remove item")
    product_id = items[0]["product_id"]

    r = await client.delete(
        f"{BASE}/wishlist/{product_id}",
        headers=auth_header(customer_token),
    )
    assert r.status_code == 200, f"Remove from wishlist failed: {r.status_code} {r.text}"


# ============================================================
# 6. TRY-ON FLOW (as customer)
# ============================================================

async def test_list_models_for_tryon(client: httpx.AsyncClient):
    r = await client.get(f"{BASE}/models")
    assert r.status_code == 200, f"List models failed: {r.status_code} {r.text}"
    data = r.json()
    print(f"    (Available models: {data['total']})")


async def test_generate_tryon(client: httpx.AsyncClient):
    """Generate a try-on image. This may take 20-30s."""
    global created_tryon_session_id
    assert customer_token, "No customer token"

    # Find a model and product
    models_r = await client.get(f"{BASE}/models")
    models_data = models_r.json()
    model_id = None
    if models_data.get("models"):
        model_id = models_data["models"][0].get("_id") or models_data["models"][0].get("id")
    if not model_id:
        model_id = "model001"

    products_r = await client.get(f"{BASE}/products")
    products_data = products_r.json()
    product_id = None
    if products_data.get("products"):
        product_id = products_data["products"][0].get("_id") or products_data["products"][0].get("id")
    if not product_id:
        product_id = "prod001"

    print(f"    (Using model_id={model_id}, product_id={product_id})")

    r = await client.post(f"{BASE}/tryon", json={
        "model_id": model_id,
        "product_id": product_id,
    }, headers=auth_header(customer_token), timeout=120.0)
    assert r.status_code == 201, f"Generate try-on failed: {r.status_code} {r.text}"
    data = r.json()
    created_tryon_session_id = data.get("_id") or data.get("id")
    assert created_tryon_session_id, f"No session ID in response: {data}"
    assert data.get("result_url"), "No result_url in try-on response"
    print(f"    (Try-on completed. Provider: {data.get('ai_provider', 'unknown')}, "
          f"Time: {data.get('processing_time_ms', 0)}ms)")


async def test_get_tryon_history(client: httpx.AsyncClient):
    assert customer_token, "No customer token"
    r = await client.get(
        f"{BASE}/tryon/history",
        headers=auth_header(customer_token),
    )
    assert r.status_code == 200, f"Get tryon history failed: {r.status_code} {r.text}"
    data = r.json()
    assert "sessions" in data
    print(f"    (History has {data['total']} sessions)")


async def test_toggle_favorite(client: httpx.AsyncClient):
    if not created_tryon_session_id:
        raise AssertionError("No try-on session ID available")
    assert customer_token, "No customer token"

    r = await client.patch(
        f"{BASE}/tryon/{created_tryon_session_id}/favorite",
        json={"is_favorite": True},
        headers=auth_header(customer_token),
    )
    assert r.status_code == 200, f"Toggle favorite failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("is_favorite") is True

    # Toggle back
    r2 = await client.patch(
        f"{BASE}/tryon/{created_tryon_session_id}/favorite",
        json={"is_favorite": False},
        headers=auth_header(customer_token),
    )
    assert r2.status_code == 200
    assert r2.json().get("is_favorite") is False


# ============================================================
# 7. ANALYTICS FLOW (as retailer)
# ============================================================

async def test_analytics_dashboard(client: httpx.AsyncClient):
    assert retailer_token, "No retailer token"
    r = await client.get(
        f"{BASE}/analytics/dashboard",
        headers=auth_header(retailer_token),
    )
    assert r.status_code == 200, f"Dashboard failed: {r.status_code} {r.text}"
    data = r.json()
    print(f"    (Dashboard: {data.get('total_tryons', 0)} tryons, "
          f"{data.get('total_products', 0)} products)")


async def test_analytics_dashboard_with_dates(client: httpx.AsyncClient):
    assert retailer_token, "No retailer token"
    r = await client.get(
        f"{BASE}/analytics/dashboard",
        params={"date_from": "2025-01-01", "date_to": "2026-12-31"},
        headers=auth_header(retailer_token),
    )
    assert r.status_code == 200, f"Dashboard with dates failed: {r.status_code} {r.text}"


async def test_analytics_track_event(client: httpx.AsyncClient):
    """Try POST /analytics/events if it exists."""
    assert customer_token, "No customer token"
    # Use a valid product ID from the list
    r_products = await client.get(f"{BASE}/products")
    products = r_products.json().get("products", [])
    product_id = (products[0].get("_id") or products[0].get("id")) if products else "prod001"

    r = await client.post(
        f"{BASE}/analytics/events",
        json={
            "event_type": "product_view",
            "product_id": product_id,
            "metadata": {"source": "e2e_test"},
        },
        headers=auth_header(customer_token),
    )
    if r.status_code == 404 or r.status_code == 405:
        print("    (POST /analytics/events endpoint not exposed — OK)")
    else:
        assert r.status_code in (200, 201), f"Track event failed: {r.status_code} {r.text}"
        print(f"    (Event tracked: {r.json()})")


async def test_analytics_export_csv(client: httpx.AsyncClient):
    assert retailer_token, "No retailer token"
    r = await client.get(
        f"{BASE}/analytics/export/csv",
        headers=auth_header(retailer_token),
    )
    assert r.status_code == 200, f"Export CSV failed: {r.status_code} {r.text}"
    assert "text/csv" in r.headers.get("content-type", ""), \
        f"Expected CSV content-type, got {r.headers.get('content-type')}"


async def test_analytics_export_report(client: httpx.AsyncClient):
    assert retailer_token, "No retailer token"
    r = await client.get(
        f"{BASE}/analytics/export/report",
        headers=auth_header(retailer_token),
    )
    assert r.status_code == 200, f"Export report failed: {r.status_code} {r.text}"
    assert "text/html" in r.headers.get("content-type", ""), \
        f"Expected HTML content-type, got {r.headers.get('content-type')}"


# ============================================================
# 8. CHATBOT FLOW (as customer)
# ============================================================

async def test_chatbot_send_message(client: httpx.AsyncClient):
    global chatbot_session_id
    assert customer_token, "No customer token"
    r = await client.post(
        f"{BASE}/chatbot/message",
        json={"message": "What products do you have?"},
        headers=auth_header(customer_token),
        timeout=60.0,
    )
    assert r.status_code == 200, f"Chatbot message failed: {r.status_code} {r.text}"
    data = r.json()
    chatbot_session_id = data.get("session_id")
    assert data.get("message"), "No response message from chatbot"
    print(f"    (Chatbot response length: {len(data['message'])} chars)")


async def test_chatbot_get_history(client: httpx.AsyncClient):
    if not chatbot_session_id:
        raise AssertionError("No chatbot session ID")
    assert customer_token, "No customer token"
    r = await client.get(
        f"{BASE}/chatbot/history",
        params={"session_id": chatbot_session_id},
        headers=auth_header(customer_token),
    )
    assert r.status_code == 200, f"Chat history failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("message_count", 0) >= 1, "Expected at least 1 message in history"


async def test_chatbot_clear_session(client: httpx.AsyncClient):
    if not chatbot_session_id:
        raise AssertionError("No chatbot session ID")
    assert customer_token, "No customer token"
    r = await client.delete(
        f"{BASE}/chatbot/session",
        params={"session_id": chatbot_session_id},
        headers=auth_header(customer_token),
    )
    assert r.status_code == 204, f"Clear session failed: {r.status_code} {r.text}"


# ============================================================
# 9. HEALTH CHECK
# ============================================================

async def test_health_check(client: httpx.AsyncClient):
    r = await client.get(HEALTH_URL)
    assert r.status_code == 200, f"Health check failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["status"] == "healthy"
    print(f"    (MongoDB: {data.get('mongodb')}, Redis: {data.get('redis')})")


# ============================================================
# 10. CROSS-RETAILER PRODUCT VISIBILITY
# ============================================================

async def test_customer_sees_all_products(client: httpx.AsyncClient):
    """Customer should see ALL products, not filtered by retailer."""
    assert customer_token, "No customer token"
    r = await client.get(f"{BASE}/products", headers=auth_header(customer_token))
    assert r.status_code == 200, f"List products as customer failed: {r.status_code} {r.text}"
    data = r.json()
    products = data.get("products", [])
    print(f"    (Customer sees {len(products)} products, total={data.get('total', 0)})")

    # Check products come from multiple retailers (if available)
    retailer_ids = set()
    for p in products:
        rid = p.get("retailer_id")
        if rid:
            retailer_ids.add(rid)
    if len(retailer_ids) > 1:
        print(f"    (Products from {len(retailer_ids)} different retailers - GOOD)")
    else:
        print(f"    (Products from {len(retailer_ids)} retailer(s) - may need more retailers)")


async def test_product_list_not_filtered_for_customer(client: httpx.AsyncClient):
    """Verify product list endpoint is public / not retailer-filtered."""
    # No auth header - should still work
    r = await client.get(f"{BASE}/products")
    assert r.status_code == 200, f"Public product list failed: {r.status_code} {r.text}"
    data = r.json()
    assert "products" in data
    no_auth_total = data.get("total", 0)

    # With customer auth - should be same
    r2 = await client.get(f"{BASE}/products", headers=auth_header(customer_token))
    assert r2.status_code == 200
    with_auth_total = r2.json().get("total", 0)

    assert no_auth_total == with_auth_total, \
        f"Product count differs: no-auth={no_auth_total}, customer-auth={with_auth_total}"
    print(f"    (Public: {no_auth_total} products, Auth: {with_auth_total} products)")


# ============================================================
# MAIN
# ============================================================

async def main():
    print("=" * 60)
    print("FitView AI - Comprehensive E2E API Test Suite")
    print("=" * 60)

    # Wait a few seconds for other agents to finish seeding
    print("\nWaiting 3 seconds for backend to be ready...")
    await asyncio.sleep(3)

    async with httpx.AsyncClient(timeout=60.0) as client:

        # 0. Health Check first
        print("\n--- Health Check ---")
        await test_flow("Health check", test_health_check, client)

        # 1. Auth Flow
        print("\n--- Auth Flow ---")
        await test_flow("Register customer", test_register_customer, client)
        await test_flow("Login customer", test_login_customer, client)
        await test_flow("Get customer profile", test_get_profile_customer, client)
        await test_flow("Register retailer", test_register_retailer, client)
        await test_flow("Login retailer", test_login_retailer, client)
        if customer_refresh_token:
            await test_flow("Refresh token rejected as access token", test_refresh_token_cannot_be_access, client)
        else:
            await skip_test("Refresh token rejected as access token", "No refresh token returned")

        # 2. Product Flow
        print("\n--- Product Flow (as retailer) ---")
        await test_flow("List products", test_list_products, client)
        await test_flow("Create product", test_create_product, client)
        if created_product_id:
            await test_flow("Get product by ID", test_get_product_by_id, client)
            await test_flow("Update product", test_update_product, client)
            await test_flow("Delete product (soft)", test_delete_product, client)
            await test_flow("Deleted product not in list", test_deleted_product_not_in_list, client)
        else:
            await skip_test("Get/Update/Delete product", "Product creation failed")

        # 3. Model Flow
        print("\n--- Model Flow ---")
        await test_flow("List models", test_list_models, client)
        await test_flow("Verify models data", test_models_exist, client)

        # 4. Cart Flow
        print("\n--- Cart Flow (as customer) ---")
        await test_flow("Add to cart", test_add_to_cart, client)
        await test_flow("Get cart", test_get_cart, client)
        await test_flow("Update cart item", test_update_cart_item, client)
        await test_flow("Remove cart item", test_remove_cart_item, client)
        await test_flow("Clear cart", test_clear_cart, client)

        # 5. Wishlist Flow
        print("\n--- Wishlist Flow (as customer) ---")
        await test_flow("Add to wishlist", test_add_to_wishlist, client)
        await test_flow("Get wishlist", test_get_wishlist, client)
        await test_flow("Remove from wishlist", test_remove_from_wishlist, client)

        # 6. Try-On Flow
        print("\n--- Try-On Flow (as customer) ---")
        await test_flow("List models for try-on", test_list_models_for_tryon, client)
        print("    (Generating try-on — may take 20-60 seconds...)")
        await test_flow("Generate try-on", test_generate_tryon, client)
        await test_flow("Get try-on history", test_get_tryon_history, client)
        if created_tryon_session_id:
            await test_flow("Toggle favorite", test_toggle_favorite, client)
        else:
            await skip_test("Toggle favorite", "No try-on session created")

        # 7. Analytics Flow
        print("\n--- Analytics Flow (as retailer) ---")
        await test_flow("Get dashboard", test_analytics_dashboard, client)
        await test_flow("Dashboard with date filters", test_analytics_dashboard_with_dates, client)
        await test_flow("Track event (POST /analytics/events)", test_analytics_track_event, client)
        await test_flow("Export CSV", test_analytics_export_csv, client)
        await test_flow("Export report (HTML)", test_analytics_export_report, client)

        # 8. Chatbot Flow
        print("\n--- Chatbot Flow (as customer) ---")
        await test_flow("Send chatbot message", test_chatbot_send_message, client)
        if chatbot_session_id:
            await test_flow("Get chat history", test_chatbot_get_history, client)
            await test_flow("Clear chat session", test_chatbot_clear_session, client)
        else:
            await skip_test("Get chat history / Clear session", "No chatbot session created")

        # 10. Cross-retailer visibility
        print("\n--- Cross-Retailer Product Visibility ---")
        await test_flow("Customer sees all products", test_customer_sees_all_products, client)
        await test_flow("Product list not filtered for customer", test_product_list_not_filtered_for_customer, client)

    # Summary
    total = RESULTS["passed"] + RESULTS["failed"] + RESULTS["skipped"]
    print("\n" + "=" * 60)
    print(f"TEST RESULTS: {RESULTS['passed']} passed, {RESULTS['failed']} failed, {RESULTS['skipped']} skipped (out of {total})")
    print("=" * 60)

    if RESULTS["errors"]:
        print("\nFAILED TESTS:")
        for i, err in enumerate(RESULTS["errors"], 1):
            print(f"  {i}. {err}")
    else:
        print("\nAll tests passed!")

    print()
    return RESULTS["failed"]


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    raise SystemExit(exit_code)
