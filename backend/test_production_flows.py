"""
Comprehensive production test script for FitView AI platform.
Tests auth, products, models, analytics, cart, and cross-retailer flows
using the two known retailer accounts (Pawan Kumar and Saurabh Sharma).
"""

import asyncio
import httpx
import sys

BASE = "http://127.0.0.1:8000/api/v1"
HEALTH_URL = "http://127.0.0.1:8000/health"

# Known retailer credentials
PAWAN_EMAIL = "pawan@fitview.ai"
PAWAN_PASSWORD = "Pawan@FitView1"
PAWAN_RETAILER_ID = "68a4788e56a547f9bccd4df2586f689c"

SAURABH_EMAIL = "saurabh@fitview.ai"
SAURABH_PASSWORD = "Saurabh@FitView1"
SAURABH_RETAILER_ID = "9ab2d12cf608448e985502942cfe32a0"

# Test customer
CUSTOMER_EMAIL = "test_flow@fitview.ai"
CUSTOMER_PASSWORD = "TestFlow@12345"
CUSTOMER_NAME = "Test Flow User"

# Tokens
pawan_token = None
saurabh_token = None
customer_token = None

# Results tracking
RESULTS = {"passed": 0, "failed": 0, "errors": []}


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def record_pass(name: str):
    RESULTS["passed"] += 1
    print(f"  [PASS] {name}")


def record_fail(name: str, reason: str):
    RESULTS["failed"] += 1
    short = reason[:300]
    RESULTS["errors"].append(f"{name}: {short}")
    print(f"  [FAIL] {name}: {short}")


# ============================================================
# 1. AUTH FLOW
# ============================================================

async def test_auth_flow(client: httpx.AsyncClient):
    global pawan_token, saurabh_token, customer_token
    print("\n--- 1. Auth Flow ---")

    # 1a. Login as Pawan
    r = await client.post(f"{BASE}/auth/login", json={
        "email": PAWAN_EMAIL, "password": PAWAN_PASSWORD,
    })
    if r.status_code == 200:
        data = r.json()
        pawan_token = data["access_token"]
        user = data["user"]
        if user["role"] == "retailer":
            record_pass("Login Pawan -> role is retailer")
        else:
            record_fail("Login Pawan -> role is retailer", f"Got role={user['role']}")
    else:
        record_fail("Login Pawan", f"HTTP {r.status_code}: {r.text[:200]}")

    # 1b. Login as Saurabh
    r = await client.post(f"{BASE}/auth/login", json={
        "email": SAURABH_EMAIL, "password": SAURABH_PASSWORD,
    })
    if r.status_code == 200:
        data = r.json()
        saurabh_token = data["access_token"]
        user = data["user"]
        if user["role"] == "retailer":
            record_pass("Login Saurabh -> role is retailer")
        else:
            record_fail("Login Saurabh -> role is retailer", f"Got role={user['role']}")
    else:
        record_fail("Login Saurabh", f"HTTP {r.status_code}: {r.text[:200]}")

    # 1c. Login with wrong password -> 401
    r = await client.post(f"{BASE}/auth/login", json={
        "email": PAWAN_EMAIL, "password": "WrongPassword123!",
    })
    if r.status_code == 401:
        record_pass("Login with wrong password -> 401")
    else:
        record_fail("Login with wrong password -> 401", f"Got HTTP {r.status_code}")

    # 1d. GET /auth/me with Pawan's token -> verify name
    if pawan_token:
        r = await client.get(f"{BASE}/auth/me", headers=auth_header(pawan_token))
        if r.status_code == 200:
            data = r.json()
            if data.get("name") == "Pawan Kumar":
                record_pass("GET /auth/me -> name is 'Pawan Kumar'")
            else:
                record_fail("GET /auth/me -> name check", f"Got name='{data.get('name')}'")
        else:
            record_fail("GET /auth/me", f"HTTP {r.status_code}")
    else:
        record_fail("GET /auth/me", "No Pawan token available")


# ============================================================
# 2. PRODUCTS FLOW
# ============================================================

async def test_products_flow(client: httpx.AsyncClient):
    print("\n--- 2. Products Flow ---")

    # 2a. GET /products -> verify returns products (use limit=100 to get all)
    r = await client.get(f"{BASE}/products", params={"limit": 100})
    if r.status_code != 200:
        record_fail("GET /products", f"HTTP {r.status_code}")
        return
    data = r.json()
    products = data.get("products", [])
    total = data.get("total", 0)

    if total > 0:
        record_pass(f"GET /products -> total={total}")
    else:
        record_fail("GET /products -> has products", f"total={total}")

    # 2b. Verify products from BOTH retailers exist
    retailer_ids = set()
    for p in products:
        rid = p.get("retailer_id")
        if rid:
            retailer_ids.add(rid)

    has_pawan = PAWAN_RETAILER_ID in retailer_ids
    has_saurabh = SAURABH_RETAILER_ID in retailer_ids
    if has_pawan and has_saurabh:
        record_pass("Products from BOTH retailers exist")
    else:
        record_fail("Products from BOTH retailers", f"Pawan={has_pawan}, Saurabh={has_saurabh}")

    # 2c. GET /products/{id} -> verify retailer_id matches
    # Prefer products with standard sizes (S/M/L) for cart tests later
    pawan_product = None
    saurabh_product = None
    for p in products:
        pid = p.get("_id") or p.get("id")
        rid = p.get("retailer_id")
        sizes = [s.get("size") for s in p.get("sizes", [])]
        has_standard_size = any(s in sizes for s in ("S", "M", "L", "XL"))
        if rid == PAWAN_RETAILER_ID:
            if pawan_product is None or (has_standard_size and not pawan_product):
                pawan_product = pid
        if rid == SAURABH_RETAILER_ID:
            if saurabh_product is None or (has_standard_size and not saurabh_product):
                saurabh_product = pid

    if pawan_product:
        r = await client.get(f"{BASE}/products/{pawan_product}")
        if r.status_code == 200:
            pd = r.json()
            if pd.get("retailer_id") == PAWAN_RETAILER_ID:
                record_pass(f"GET /products/{pawan_product} -> retailer_id matches Pawan")
            else:
                record_fail("Product retailer_id check", f"Got {pd.get('retailer_id')}")
        else:
            record_fail(f"GET /products/{pawan_product}", f"HTTP {r.status_code}")
    else:
        record_fail("Find Pawan product", "No product found for Pawan")

    # 2d. Verify new products (prod_new_001 through prod_new_010) exist
    product_ids = {(p.get("_id") or p.get("id")) for p in products}
    new_product_ids = {f"prod_new_{i:03d}" for i in range(1, 11)}
    found = new_product_ids & product_ids
    missing = new_product_ids - product_ids
    if len(missing) == 0:
        record_pass(f"All 10 new products (prod_new_001..010) exist")
    else:
        record_fail("New products exist", f"Missing: {sorted(missing)}")

    # Store for cart tests later
    return pawan_product, saurabh_product


# ============================================================
# 3. MODELS FLOW
# ============================================================

async def test_models_flow(client: httpx.AsyncClient):
    print("\n--- 3. Models Flow ---")

    r = await client.get(f"{BASE}/models")
    if r.status_code != 200:
        record_fail("GET /models", f"HTTP {r.status_code}")
        return
    data = r.json()
    models = data.get("models", [])
    total = data.get("total", 0)

    if total > 0:
        record_pass(f"GET /models -> total={total}")
    else:
        record_fail("GET /models -> has models", f"total={total}")

    # 3b. Verify model_com_001 through model_com_010 exist
    model_ids = {(m.get("_id") or m.get("id")) for m in models}
    com_model_ids = {f"model_com_{i:03d}" for i in range(1, 11)}
    found = com_model_ids & model_ids
    missing = com_model_ids - model_ids
    if len(missing) == 0:
        record_pass(f"All 10 com models (model_com_001..010) exist")
    else:
        record_fail("Com models exist", f"Missing: {sorted(missing)}")

    # 3c. Verify models have proper gender, body_type, skin_tone fields
    models_with_fields = 0
    models_missing_fields = []
    for m in models:
        mid = m.get("_id") or m.get("id")
        has_gender = m.get("gender") is not None
        has_body = m.get("body_type") is not None
        has_skin = m.get("skin_tone") is not None
        if has_gender and has_body and has_skin:
            models_with_fields += 1
        else:
            missing_list = []
            if not has_gender:
                missing_list.append("gender")
            if not has_body:
                missing_list.append("body_type")
            if not has_skin:
                missing_list.append("skin_tone")
            models_missing_fields.append(f"{mid}({','.join(missing_list)})")

    if models_missing_fields:
        record_fail(
            "Models have gender/body_type/skin_tone",
            f"{len(models_missing_fields)} models missing fields: {models_missing_fields[:5]}"
        )
    else:
        record_pass(f"All {models_with_fields} models have gender, body_type, skin_tone")


# ============================================================
# 4. ANALYTICS FLOW (Pawan)
# ============================================================

async def test_analytics_pawan(client: httpx.AsyncClient):
    print("\n--- 4. Analytics Flow (Pawan - retailer) ---")
    if not pawan_token:
        record_fail("Analytics Pawan", "No Pawan token")
        return

    # 4a. GET dashboard -> verify all expected fields
    r = await client.get(f"{BASE}/analytics/dashboard", headers=auth_header(pawan_token))
    if r.status_code != 200:
        record_fail("GET /analytics/dashboard (Pawan)", f"HTTP {r.status_code}: {r.text[:200]}")
        return

    data = r.json()

    # Check base fields
    base_fields = [
        "total_tryons", "total_products", "total_models", "total_favorites",
        "product_visit_stats", "visit_to_tryon_conversion", "peak_hours",
        "user_engagement", "revenue_potential",
    ]
    missing_base = [f for f in base_fields if f not in data]
    if missing_base:
        record_fail("Dashboard base fields", f"Missing: {missing_base}")
    else:
        record_pass("Dashboard has all base fields")

    # Check new fields
    new_fields = ["cart_analytics", "trending_products", "traffic_sources", "daily_active_users"]
    missing_new = [f for f in new_fields if f not in data]
    if missing_new:
        record_fail("Dashboard new fields", f"Missing: {missing_new}")
    else:
        record_pass("Dashboard has all NEW fields (cart_analytics, trending_products, traffic_sources, daily_active_users)")

    # Verify total_products matches Pawan's actual product count
    print(f"    (Pawan dashboard: {data.get('total_products')} products, {data.get('total_tryons')} tryons, {data.get('total_models')} models)")

    # 4b. POST /analytics/events -> track product_view
    pawan_products_r = await client.get(f"{BASE}/products", params={"limit": 100})
    all_products = pawan_products_r.json().get("products", [])
    pawan_product_id = None
    for p in all_products:
        if p.get("retailer_id") == PAWAN_RETAILER_ID:
            pawan_product_id = p.get("_id") or p.get("id")
            break

    if pawan_product_id:
        r = await client.post(f"{BASE}/analytics/events", json={
            "event_type": "product_view",
            "product_id": pawan_product_id,
            "metadata": {"source": "test_script"},
        }, headers=auth_header(pawan_token))
        if r.status_code == 201:
            record_pass("POST /analytics/events -> product_view tracked")
        else:
            record_fail("POST /analytics/events (product_view)", f"HTTP {r.status_code}: {r.text[:200]}")

        # 4c. POST /analytics/events -> track product_cart_add
        r = await client.post(f"{BASE}/analytics/events", json={
            "event_type": "product_cart_add",
            "product_id": pawan_product_id,
            "metadata": {"source": "test_script"},
        }, headers=auth_header(pawan_token))
        if r.status_code == 201:
            record_pass("POST /analytics/events -> product_cart_add tracked")
        else:
            record_fail("POST /analytics/events (product_cart_add)", f"HTTP {r.status_code}: {r.text[:200]}")
    else:
        record_fail("Track events", "No Pawan product found for event tracking")

    # 4d. Verify dashboard shows Pawan's products only (not Saurabh's)
    # Re-fetch dashboard to check product_visit_stats product IDs
    r2 = await client.get(f"{BASE}/analytics/dashboard", headers=auth_header(pawan_token))
    if r2.status_code == 200:
        d2 = r2.json()
        # The total_products should only include Pawan's products
        # Count Pawan's non-deleted products
        pawan_product_count = sum(
            1 for p in all_products
            if p.get("retailer_id") == PAWAN_RETAILER_ID and not p.get("is_deleted")
        )
        if d2.get("total_products") == pawan_product_count:
            record_pass(f"Dashboard total_products={pawan_product_count} matches Pawan's product count")
        else:
            record_fail(
                "Dashboard shows only Pawan's products",
                f"Dashboard total_products={d2.get('total_products')}, expected={pawan_product_count}"
            )


# ============================================================
# 5. ANALYTICS FLOW (Saurabh)
# ============================================================

async def test_analytics_saurabh(client: httpx.AsyncClient):
    print("\n--- 5. Analytics Flow (Saurabh - retailer) ---")
    if not saurabh_token:
        record_fail("Analytics Saurabh", "No Saurabh token")
        return

    r = await client.get(f"{BASE}/analytics/dashboard", headers=auth_header(saurabh_token))
    if r.status_code != 200:
        record_fail("GET /analytics/dashboard (Saurabh)", f"HTTP {r.status_code}: {r.text[:200]}")
        return

    data = r.json()
    print(f"    (Saurabh dashboard: {data.get('total_products')} products, {data.get('total_tryons')} tryons)")

    # Count Saurabh's non-deleted products from the full list
    r_products = await client.get(f"{BASE}/products", params={"limit": 100})
    all_products = r_products.json().get("products", [])
    saurabh_product_count = sum(
        1 for p in all_products
        if p.get("retailer_id") == SAURABH_RETAILER_ID and not p.get("is_deleted")
    )

    if data.get("total_products") == saurabh_product_count:
        record_pass(f"Saurabh dashboard total_products={saurabh_product_count} matches actual count")
    else:
        record_fail(
            "Saurabh dashboard product count",
            f"Dashboard={data.get('total_products')}, expected={saurabh_product_count}"
        )

    # Verify shows only Saurabh's products (not Pawan's)
    # Check that total_products doesn't include Pawan's count
    pawan_product_count = sum(
        1 for p in all_products
        if p.get("retailer_id") == PAWAN_RETAILER_ID and not p.get("is_deleted")
    )
    total_all = pawan_product_count + saurabh_product_count
    if data.get("total_products") != total_all and data.get("total_products") == saurabh_product_count:
        record_pass("Saurabh dashboard shows only Saurabh's products (not Pawan's)")
    elif data.get("total_products") == total_all:
        record_fail("Saurabh dashboard isolation", "Dashboard shows ALL products, not just Saurabh's")
    else:
        record_pass("Saurabh dashboard shows only Saurabh's products")


# ============================================================
# 6. CART FLOW
# ============================================================

async def test_cart_flow(client: httpx.AsyncClient, pawan_product: str, saurabh_product: str):
    global customer_token
    print("\n--- 6. Cart Flow ---")

    # 6a. Login or register test customer
    r = await client.post(f"{BASE}/auth/login", json={
        "email": CUSTOMER_EMAIL, "password": CUSTOMER_PASSWORD,
    })
    if r.status_code == 200:
        customer_token = r.json()["access_token"]
        record_pass("Login test customer")
    else:
        # Register
        r = await client.post(f"{BASE}/auth/register", json={
            "name": CUSTOMER_NAME,
            "email": CUSTOMER_EMAIL,
            "password": CUSTOMER_PASSWORD,
            "role": "customer",
        })
        if r.status_code == 201:
            customer_token = r.json()["access_token"]
            record_pass("Register + login test customer")
        else:
            record_fail("Register/login customer", f"HTTP {r.status_code}: {r.text[:200]}")
            return

    if not customer_token:
        record_fail("Cart flow", "No customer token")
        return

    # First clear the cart to start fresh
    await client.delete(f"{BASE}/cart", headers=auth_header(customer_token))

    # Fetch all products to find valid sizes
    r_all = await client.get(f"{BASE}/products", params={"limit": 100})
    all_prods = r_all.json().get("products", [])
    products_by_id = {(p.get("_id") or p.get("id")): p for p in all_prods}

    # 6b. Add a product from Pawan's store (use first available size)
    if pawan_product:
        p_data = products_by_id.get(pawan_product, {})
        p_sizes = p_data.get("sizes", [])
        p_size = p_sizes[0]["size"] if p_sizes else "M"
        r = await client.post(f"{BASE}/cart/items", json={
            "product_id": pawan_product,
            "size": p_size,
            "quantity": 1,
        }, headers=auth_header(customer_token))
        if r.status_code == 201:
            record_pass(f"Add Pawan's product ({pawan_product}, size={p_size}) to cart")
        else:
            record_fail("Add Pawan product to cart", f"HTTP {r.status_code}: {r.text[:200]}")
    else:
        record_fail("Add Pawan product to cart", "No Pawan product available")

    # 6c. Add a product from Saurabh's store (use first available size)
    if saurabh_product:
        s_data = products_by_id.get(saurabh_product, {})
        s_sizes = s_data.get("sizes", [])
        s_size = s_sizes[0]["size"] if s_sizes else "L"
        r = await client.post(f"{BASE}/cart/items", json={
            "product_id": saurabh_product,
            "size": s_size,
            "quantity": 1,
        }, headers=auth_header(customer_token))
        if r.status_code == 201:
            record_pass(f"Add Saurabh's product ({saurabh_product}, size={s_size}) to cart")
        else:
            record_fail("Add Saurabh product to cart", f"HTTP {r.status_code}: {r.text[:200]}")
    else:
        record_fail("Add Saurabh product to cart", "No Saurabh product available")

    # 6d. GET /cart -> verify both products are in the cart
    r = await client.get(f"{BASE}/cart", headers=auth_header(customer_token))
    if r.status_code == 200:
        cart = r.json()
        items = cart.get("items", [])
        cart_product_ids = {item.get("product_id") for item in items}
        has_pawan_product = pawan_product in cart_product_ids if pawan_product else False
        has_saurabh_product = saurabh_product in cart_product_ids if saurabh_product else False
        if has_pawan_product and has_saurabh_product:
            record_pass(f"Cart contains products from BOTH retailers ({len(items)} items)")
        else:
            record_fail(
                "Cart multi-retailer check",
                f"Pawan={has_pawan_product}, Saurabh={has_saurabh_product}, items={cart_product_ids}"
            )
    else:
        record_fail("GET /cart", f"HTTP {r.status_code}")

    # 6e. Clear cart
    r = await client.delete(f"{BASE}/cart", headers=auth_header(customer_token))
    if r.status_code == 200:
        cart = r.json()
        if cart.get("total_items") == 0:
            record_pass("Clear cart -> total_items=0")
        else:
            record_fail("Clear cart", f"total_items={cart.get('total_items')}")
    else:
        record_fail("Clear cart", f"HTTP {r.status_code}")


# ============================================================
# 7. CROSS-RETAILER VERIFICATION
# ============================================================

async def test_cross_retailer(client: httpx.AsyncClient):
    print("\n--- 7. Cross-retailer Verification ---")

    # 7a. Products list shows products from both retailers
    r = await client.get(f"{BASE}/products")
    if r.status_code == 200:
        products = r.json().get("products", [])
        retailer_ids = set()
        for p in products:
            rid = p.get("retailer_id")
            if rid:
                retailer_ids.add(rid)
        if PAWAN_RETAILER_ID in retailer_ids and SAURABH_RETAILER_ID in retailer_ids:
            record_pass(f"Products list shows products from both retailers ({len(retailer_ids)} retailers total)")
        else:
            record_fail("Products multi-retailer", f"Retailer IDs found: {retailer_ids}")
    else:
        record_fail("Products list", f"HTTP {r.status_code}")

    # 7b. Models list shows models from both retailers
    r = await client.get(f"{BASE}/models")
    if r.status_code == 200:
        models = r.json().get("models", [])
        retailer_ids = set()
        for m in models:
            rid = m.get("retailer_id")
            if rid:
                retailer_ids.add(rid)
        if PAWAN_RETAILER_ID in retailer_ids and SAURABH_RETAILER_ID in retailer_ids:
            record_pass(f"Models list shows models from both retailers ({len(retailer_ids)} retailers total)")
        else:
            record_fail("Models multi-retailer", f"Retailer IDs found: {retailer_ids}")
    else:
        record_fail("Models list", f"HTTP {r.status_code}")

    # 7c. Customer can view products from any retailer
    if customer_token:
        r = await client.get(f"{BASE}/products", headers=auth_header(customer_token))
        if r.status_code == 200:
            total_auth = r.json().get("total", 0)
            r2 = await client.get(f"{BASE}/products")
            total_no_auth = r2.json().get("total", 0)
            if total_auth == total_no_auth and total_auth > 0:
                record_pass(f"Customer sees all products (auth={total_auth}, no-auth={total_no_auth})")
            else:
                record_fail("Customer product visibility", f"auth={total_auth}, no-auth={total_no_auth}")
        else:
            record_fail("Customer product access", f"HTTP {r.status_code}")
    else:
        record_fail("Customer product visibility", "No customer token")


# ============================================================
# MAIN
# ============================================================

async def main():
    print("=" * 65)
    print("FitView AI — Production Flow Test Suite")
    print("=" * 65)

    # Health check
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            r = await client.get(HEALTH_URL)
            if r.status_code == 200:
                print(f"\nHealth check: OK ({r.json()})")
            else:
                print(f"\nHealth check: WARNING HTTP {r.status_code}")
        except Exception as e:
            print(f"\nHealth check: FAILED ({e})")
            print("Backend may not be running. Aborting.")
            return 1

    async with httpx.AsyncClient(timeout=60.0) as client:
        # 1. Auth
        await test_auth_flow(client)

        # 2. Products
        result = await test_products_flow(client)
        pawan_product = result[0] if result else None
        saurabh_product = result[1] if result else None

        # 3. Models
        await test_models_flow(client)

        # 4. Analytics (Pawan)
        await test_analytics_pawan(client)

        # 5. Analytics (Saurabh)
        await test_analytics_saurabh(client)

        # 6. Cart
        await test_cart_flow(client, pawan_product, saurabh_product)

        # 7. Cross-retailer
        await test_cross_retailer(client)

    # Summary
    total = RESULTS["passed"] + RESULTS["failed"]
    print("\n" + "=" * 65)
    print(f"RESULTS: {RESULTS['passed']} PASSED, {RESULTS['failed']} FAILED (out of {total})")
    print("=" * 65)

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
    sys.exit(exit_code)
