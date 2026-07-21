
Action: file_editor create /app/backend/server.py --file-text "\"\"\"Anime Merchandise Store — FastAPI backend.\"\"\"
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / \".env\")

import os
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    set_auth_cookies,
    clear_auth_cookies,
    get_current_user_from_db,
    decode_token,
)
from seed_data import SEED_PRODUCTS, CATEGORIES, ANIMES

# ---------------- MongoDB ----------------
mongo_url = os.environ[\"MONGO_URL\"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ[\"DB_NAME\"]]

# ---------------- Models ----------------
def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str = \"user\"


class Product(BaseModel):
    id: str
    name: str
    category: str
    anime: str
    price: float
    stock: int
    image: str
    description: str


class CartItemInput(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, le=99)


class CartItem(BaseModel):
    product_id: str
    quantity: int
    name: str
    price: float
    image: str


class CartResponse(BaseModel):
    items: List[CartItem]
    subtotal: float
    total_items: int


class CheckoutInput(BaseModel):
    full_name: str = Field(min_length=1)
    address_line: str = Field(min_length=1)
    city: str = Field(min_length=1)
    postal_code: str = Field(min_length=1)
    country: str = Field(min_length=1)


class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: str


class Order(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    subtotal: float
    shipping: float
    total: float
    status: str
    shipping_address: dict
    created_at: str


# ---------------- App ----------------
app = FastAPI(title=\"Anime Merch API\")
api = APIRouter(prefix=\"/api\")


async def current_user(request: Request) -> dict:
    return await get_current_user_from_db(request, db)


# ---------------- Auth Endpoints ----------------
@api.post(\"/auth/register\", response_model=UserPublic)
async def register(payload: RegisterInput, response: Response):
    email = payload.email.lower()
    existing = await db.users.find_one({\"email\": email})
    if existing:
        raise HTTPException(status_code=400, detail=\"Email already registered\")
    user_id = str(uuid.uuid4())
    doc = {
        \"id\": user_id,
        \"email\": email,
        \"name\": payload.name,
        \"password_hash\": hash_password(payload.password),
        \"role\": \"user\",
        \"created_at\": utcnow_iso(),
    }
    await db.users.insert_one(doc)
    set_auth_cookies(response, create_access_token(user_id, email), create_refresh_token(user_id))
    return UserPublic(id=user_id, email=email, name=payload.name, role=\"user\")


@api.post(\"/auth/login\", response_model=UserPublic)
async def login(payload: LoginInput, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({\"email\": email})
    if not user or not verify_password(payload.password, user[\"password_hash\"]):
        raise HTTPException(status_code=401, detail=\"Invalid email or password\")
    set_auth_cookies(response, create_access_token(user[\"id\"], email), create_refresh_token(user[\"id\"]))
    return UserPublic(id=user[\"id\"], email=user[\"email\"], name=user[\"name\"], role=user.get(\"role\", \"user\"))


@api.post(\"/auth/logout\")
async def logout(response: Response, user: dict = Depends(current_user)):
    clear_auth_cookies(response)
    return {\"message\": \"Logged out\"}


@api.get(\"/auth/me\", response_model=UserPublic)
async def me(user: dict = Depends(current_user)):
    return UserPublic(id=user[\"id\"], email=user[\"email\"], name=user[\"name\"], role=user.get(\"role\", \"user\"))


@api.post(\"/auth/refresh\")
async def refresh(request: Request, response: Response):
    token = request.cookies.get(\"refresh_token\")
    if not token:
        raise HTTPException(status_code=401, detail=\"No refresh token\")
    try:
        payload = decode_token(token)
        if payload.get(\"type\") != \"refresh\":
            raise HTTPException(status_code=401, detail=\"Invalid token type\")
    except Exception:
        raise HTTPException(status_code=401, detail=\"Invalid refresh token\")
    user = await db.users.find_one({\"id\": payload[\"sub\"]})
    if not user:
        raise HTTPException(status_code=401, detail=\"User not found\")
    set_auth_cookies(response, create_access_token(user[\"id\"], user[\"email\"]), create_refresh_token(user[\"id\"]))
    return {\"message\": \"Refreshed\"}


# ---------------- Products ----------------
@api.get(\"/products\", response_model=List[Product])
async def list_products(category: Optional[str] = None, anime: Optional[str] = None, search: Optional[str] = None):
    query: dict = {}
    if category:
        query[\"category\"] = category
    if anime:
        query[\"anime\"] = anime
    if search:
        query[\"name\"] = {\"$regex\": search, \"$options\": \"i\"}
    docs = await db.products.find(query, {\"_id\": 0}).to_list(500)
    return docs


@api.get(\"/products/meta\")
async def products_meta():
    return {\"categories\": CATEGORIES, \"animes\": ANIMES}


@api.get(\"/products/{product_id}\", response_model=Product)
async def get_product(product_id: str):
    doc = await db.products.find_one({\"id\": product_id}, {\"_id\": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=\"Product not found\")
    return doc


# ---------------- Cart ----------------
async def _build_cart_response(items: List[dict]) -> CartResponse:
    if not items:
        return CartResponse(items=[], subtotal=0.0, total_items=0)
    product_ids = [i[\"product_id\"] for i in items]
    products = await db.products.find({\"id\": {\"$in\": product_ids}}, {\"_id\": 0}).to_list(500)
    prod_map = {p[\"id\"]: p for p in products}
    resp_items: List[CartItem] = []
    subtotal = 0.0
    total_qty = 0
    for it in items:
        p = prod_map.get(it[\"product_id\"])
        if not p:
            continue
        resp_items.append(CartItem(
            product_id=p[\"id\"], quantity=it[\"quantity\"], name=p[\"name\"],
            price=p[\"price\"], image=p[\"image\"],
        ))
        subtotal += p[\"price\"] * it[\"quantity\"]
        total_qty += it[\"quantity\"]
    return CartResponse(items=resp_items, subtotal=round(subtotal, 2), total_items=total_qty)


@api.get(\"/cart\", response_model=CartResponse)
async def get_cart(user: dict = Depends(current_user)):
    cart = await db.carts.find_one({\"user_id\": user[\"id\"]}, {\"_id\": 0})
    items = cart[\"items\"] if cart else []
    return await _build_cart_response(items)


@api.post(\"/cart/items\", response_model=CartResponse)
async def add_to_cart(payload: CartItemInput, user: dict = Depends(current_user)):
    product = await db.products.find_one({\"id\": payload.product_id}, {\"_id\": 0})
    if not product:
        raise HTTPException(status_code=404, detail=\"Product not found\")
    cart = await db.carts.find_one({\"user_id\": user[\"id\"]})
    if not cart:
        items = [{\"product_id\": payload.product_id, \"quantity\": payload.quantity}]
        await db.carts.insert_one({\"user_id\": user[\"id\"], \"items\": items, \"updated_at\": utcnow_iso()})
    else:
        items = cart[\"items\"]
        found = False
        for it in items:
            if it[\"product_id\"] == payload.product_id:
                it[\"quantity\"] = min(99, it[\"quantity\"] + payload.quantity)
                found = True
                break
        if not found:
            items.append({\"product_id\": payload.product_id, \"quantity\": payload.quantity})
        await db.carts.update_one({\"user_id\": user[\"id\"]}, {\"$set\": {\"items\": items, \"updated_at\": utcnow_iso()}})
    return await _build_cart_response(items)


@api.put(\"/cart/items/{product_id}\", response_model=CartResponse)
async def update_cart_item(product_id: str, payload: CartItemInput, user: dict = Depends(current_user)):
    cart = await db.carts.find_one({\"user_id\": user[\"id\"]})
    if not cart:
        raise HTTPException(status_code=404, detail=\"Cart is empty\")
    items = cart[\"items\"]
    for it in items:
        if it[\"product_id\"] == product_id:
            it[\"quantity\"] = payload.quantity
            break
    else:
        raise HTTPException(status_code=404, detail=\"Item not in cart\")
    await db.carts.update_one({\"user_id\": user[\"id\"]}, {\"$set\": {\"items\": items, \"updated_at\": utcnow_iso()}})
    return await _build_cart_response(items)


@api.delete(\"/cart/items/{product_id}\", response_model=CartResponse)
async def remove_cart_item(product_id: str, user: dict = Depends(current_user)):
    cart = await db.carts.find_one({\"user_id\": user[\"id\"]})
    if not cart:
        return CartResponse(items=[], subtotal=0.0, total_items=0)
    items = [it for it in cart[\"items\"] if it[\"product_id\"] != product_id]
    await db.carts.update_one({\"user_id\": user[\"id\"]}, {\"$set\": {\"items\": items, \"updated_at\": utcnow_iso()}})
    return await _build_cart_response(items)


@api.delete(\"/cart\", response_model=CartResponse)
async def clear_cart(user: dict = Depends(current_user)):
    await db.carts.update_one(
        {\"user_id\": user[\"id\"]}, {\"$set\": {\"items\": [], \"updated_at\": utcnow_iso()}}, upsert=True,
    )
    return CartResponse(items=[], subtotal=0.0, total_items=0)


# ---------------- Orders (checkout simulation) ----------------
SHIPPING_FLAT = 5.99


@api.post(\"/orders/checkout\", response_model=Order)
async def checkout(payload: CheckoutInput, user: dict = Depends(current_user)):
    cart = await db.carts.find_one({\"user_id\": user[\"id\"]})
    if not cart or not cart.get(\"items\"):
        raise HTTPException(status_code=400, detail=\"Cart is empty\")
    cart_resp = await _build_cart_response(cart[\"items\"])
    if cart_resp.total_items == 0:
        raise HTTPException(status_code=400, detail=\"Cart is empty\")
    order_items = [it.model_dump() for it in cart_resp.items]
    subtotal = cart_resp.subtotal
    total = round(subtotal + SHIPPING_FLAT, 2)
    order_id = str(uuid.uuid4())
    order_doc = {
        \"id\": order_id,
        \"user_id\": user[\"id\"],
        \"items\": order_items,
        \"subtotal\": subtotal,
        \"shipping\": SHIPPING_FLAT,
        \"total\": total,
        \"status\": \"confirmed\",
        \"shipping_address\": payload.model_dump(),
        \"created_at\": utcnow_iso(),
    }
    await db.orders.insert_one(order_doc)
    await db.carts.update_one({\"user_id\": user[\"id\"]}, {\"$set\": {\"items\": [], \"updated_at\": utcnow_iso()}})
    order_doc.pop(\"_id\", None)
    return order_doc


@api.get(\"/orders\", response_model=List[Order])
async def list_orders(user: dict = Depends(current_user)):
    docs = await db.orders.find({\"user_id\": user[\"id\"]}, {\"_id\": 0}).sort(\"created_at\", -1).to_list(200)
    return docs


@api.get(\"/orders/{order_id}\", response_model=Order)
async def get_order(order_id: str, user: dict = Depends(current_user)):
    doc = await db.orders.find_one({\"id\": order_id, \"user_id\": user[\"id\"]}, {\"_id\": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=\"Order not found\")
    return doc


# ---------------- Health ----------------
@api.get(\"/\")
async def root():
    return {\"message\": \"Anime Merch API\", \"status\": \"ok\"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get(\"CORS_ORIGINS\", \"*\").split(\",\"),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

logging.basicConfig(level=logging.INFO, format=\"%(asctime)s - %(name)s - %(levelname)s - %(message)s\")
logger = logging.getLogger(__name__)


# ---------------- Startup: seed products, indexes, admin ----------------
@app.on_event(\"startup\")
async def startup_event():
    await db.users.create_index(\"email\", unique=True)
    await db.products.create_index(\"id\", unique=True)
    await db.orders.create_index(\"user_id\")
    await db.carts.create_index(\"user_id\", unique=True)

    # Seed products idempotently by name
    for p in SEED_PRODUCTS:
        existing = await db.products.find_one({\"name\": p[\"name\"]})
        if not existing:
            doc = {\"id\": str(uuid.uuid4()), **p}
            await db.products.insert_one(doc)
    logger.info(\"Products ensured: %s\", await db.products.count_documents({}))

    # Seed admin
    admin_email = os.environ.get(\"ADMIN_EMAIL\", \"admin@animerch.com\").lower()
    admin_password = os.environ.get(\"ADMIN_PASSWORD\", \"Admin@123\")
    existing_admin = await db.users.find_one({\"email\": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            \"id\": str(uuid.uuid4()),
            \"email\": admin_email,
            \"name\": \"Admin\",
            \"password_hash\": hash_password(admin_password),
            \"role\": \"admin\",
            \"created_at\": utcnow_iso(),
        })
    elif not verify_password(admin_password, existing_admin[\"password_hash\"]):
        await db.users.update_one(
            {\"email\": admin_email},
            {\"$set\": {\"password_hash\": hash_password(admin_password)}},
        )
    logger.info(\"Admin seeded: %s\", admin_email)


@app.on_event(\"shutdown\")
async def shutdown_event():
    client.close()
"
Observation: Overwrite successful: /app/backend/server.py