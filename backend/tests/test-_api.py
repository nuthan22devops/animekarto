
Action: file_editor create /app/backend/tests/test_api.py --file-text "\"\"\"Pytest suite for Anime Merch API — auth, products, cart, orders.\"\"\"
import os
import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from motor.motor_asyncio import AsyncIOMotorClient

# Use a dedicated test DB name so we don't touch dev data
os.environ.setdefault(\"DB_NAME\", \"anime_merch_test_db\")
os.environ.setdefault(\"MONGO_URL\", \"mongodb://localhost:27017\")
os.environ.setdefault(\"JWT_SECRET\", \"test-secret-key-for-pytest-only-not-production-use\")
os.environ.setdefault(\"ADMIN_EMAIL\", \"admin@animerch.com\")
os.environ.setdefault(\"ADMIN_PASSWORD\", \"Admin@123\")

from server import app, db  # noqa: E402


@pytest_asyncio.fixture(autouse=True)
async def clean_db():
    \"\"\"Wipe collections that tests touch (leave products intact - seeded).\"\"\"
    await db.users.delete_many({\"role\": {\"$ne\": \"admin\"}})
    await db.carts.delete_many({})
    await db.orders.delete_many({})
    yield
    await db.users.delete_many({\"role\": {\"$ne\": \"admin\"}})
    await db.carts.delete_many({})
    await db.orders.delete_many({})


@pytest_asyncio.fixture
async def client():
    \"\"\"AsyncClient that also triggers FastAPI lifespan (seeds products).\"\"\"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=\"http://test\") as ac:
        # Manually trigger startup event to seed products
        from server import startup_event
        await startup_event()
        yield ac


def _rand_email():
    return f\"user-{uuid.uuid4().hex[:8]}@test.com\"


# ---------------- Auth ----------------
@pytest.mark.asyncio
async def test_register_success(client):
    email = _rand_email()
    r = await client.post(\"/api/auth/register\", json={\"email\": email, \"password\": \"secret123\", \"name\": \"Test User\"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data[\"email\"] == email
    assert data[\"name\"] == \"Test User\"
    assert \"id\" in data
    assert \"access_token\" in r.cookies


@pytest.mark.asyncio
async def test_register_duplicate_rejected(client):
    email = _rand_email()
    await client.post(\"/api/auth/register\", json={\"email\": email, \"password\": \"secret123\", \"name\": \"A\"})
    r = await client.post(\"/api/auth/register\", json={\"email\": email, \"password\": \"secret123\", \"name\": \"B\"})
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_login_and_me(client):
    email = _rand_email()
    await client.post(\"/api/auth/register\", json={\"email\": email, \"password\": \"secret123\", \"name\": \"Test\"})
    # clear cookies to simulate fresh session
    client.cookies.clear()
    r = await client.post(\"/api/auth/login\", json={\"email\": email, \"password\": \"secret123\"})
    assert r.status_code == 200
    r_me = await client.get(\"/api/auth/me\")
    assert r_me.status_code == 200
    assert r_me.json()[\"email\"] == email


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    email = _rand_email()
    await client.post(\"/api/auth/register\", json={\"email\": email, \"password\": \"secret123\", \"name\": \"T\"})
    client.cookies.clear()
    r = await client.post(\"/api/auth/login\", json={\"email\": email, \"password\": \"wrongpass\"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_me_requires_auth(client):
    r = await client.get(\"/api/auth/me\")
    assert r.status_code == 401


# ---------------- Products ----------------
@pytest.mark.asyncio
async def test_list_products(client):
    r = await client.get(\"/api/products\")
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert {\"id\", \"name\", \"category\", \"anime\", \"price\"}.issubset(data[0].keys())


@pytest.mark.asyncio
async def test_filter_products_by_category(client):
    r = await client.get(\"/api/products\", params={\"category\": \"Figures\"})
    assert r.status_code == 200
    data = r.json()
    assert all(p[\"category\"] == \"Figures\" for p in data)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_products_meta(client):
    r = await client.get(\"/api/products/meta\")
    assert r.status_code == 200
    data = r.json()
    assert \"Figures\" in data[\"categories\"]
    assert \"Naruto\" in data[\"animes\"]


@pytest.mark.asyncio
async def test_get_product_not_found(client):
    r = await client.get(\"/api/products/nonexistent-id\")
    assert r.status_code == 404


# ---------------- Cart ----------------
async def _register_and_login(client) -> str:
    email = _rand_email()
    await client.post(\"/api/auth/register\", json={\"email\": email, \"password\": \"secret123\", \"name\": \"Cart User\"})
    return email


@pytest.mark.asyncio
async def test_cart_flow(client):
    await _register_and_login(client)
    # get a product
    plist = (await client.get(\"/api/products\")).json()
    pid = plist[0][\"id\"]

    # add
    r = await client.post(\"/api/cart/items\", json={\"product_id\": pid, \"quantity\": 2})
    assert r.status_code == 200
    cart = r.json()
    assert cart[\"total_items\"] == 2
    assert cart[\"items\"][0][\"product_id\"] == pid

    # add again (should merge)
    r = await client.post(\"/api/cart/items\", json={\"product_id\": pid, \"quantity\": 1})
    assert r.json()[\"total_items\"] == 3

    # update
    r = await client.put(f\"/api/cart/items/{pid}\", json={\"product_id\": pid, \"quantity\": 5})
    assert r.json()[\"total_items\"] == 5

    # delete
    r = await client.delete(f\"/api/cart/items/{pid}\")
    assert r.json()[\"total_items\"] == 0


@pytest.mark.asyncio
async def test_cart_requires_auth(client):
    r = await client.get(\"/api/cart\")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_add_invalid_product(client):
    await _register_and_login(client)
    r = await client.post(\"/api/cart/items\", json={\"product_id\": \"no-such-id\", \"quantity\": 1})
    assert r.status_code == 404


# ---------------- Orders ----------------
@pytest.mark.asyncio
async def test_checkout_flow(client):
    await _register_and_login(client)
    plist = (await client.get(\"/api/products\")).json()
    pid = plist[0][\"id\"]
    await client.post(\"/api/cart/items\", json={\"product_id\": pid, \"quantity\": 2})

    r = await client.post(
        \"/api/orders/checkout\",
        json={
            \"full_name\": \"Test Buyer\",
            \"address_line\": \"1 Konoha Rd\",
            \"city\": \"Tokyo\",
            \"postal_code\": \"10000\",
            \"country\": \"JP\",
        },
    )
    assert r.status_code == 200, r.text
    order = r.json()
    assert order[\"status\"] == \"confirmed\"
    assert order[\"subtotal\"] > 0
    assert order[\"total\"] == round(order[\"subtotal\"] + order[\"shipping\"], 2)

    # cart should be empty after checkout
    cart = (await client.get(\"/api/cart\")).json()
    assert cart[\"total_items\"] == 0

    # order should show in history
    hist = (await client.get(\"/api/orders\")).json()
    assert any(o[\"id\"] == order[\"id\"] for o in hist)


@pytest.mark.asyncio
async def test_checkout_empty_cart(client):
    await _register_and_login(client)
    r = await client.post(
        \"/api/orders/checkout\",
        json={\"full_name\": \"X\", \"address_line\": \"Y\", \"city\": \"Z\", \"postal_code\": \"1\", \"country\": \"JP\"},
    )
    assert r.status_code == 400


# ---------------- Password hashing unit tests ----------------
def test_password_hash_and_verify():
    from auth import hash_password, verify_password
    h = hash_password(\"mypass\")
    assert h != \"mypass\"
    assert h.startswith(\"$2b$\")
    assert verify_password(\"mypass\", h) is True
    assert verify_password(\"wrong\", h) is False


def test_jwt_roundtrip():
    from auth import create_access_token, decode_token
    tok = create_access_token(\"user-123\", \"u@x.com\")
    payload = decode_token(tok)
    assert payload[\"sub\"] == \"user-123\"
    assert payload[\"email\"] == \"u@x.com\"
    assert payload[\"type\"] == \"access\"
"
Observation: Create successful: /app/backend/tests/test_api.py