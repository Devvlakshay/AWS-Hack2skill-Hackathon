from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_db = None


async def connect_db():
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGODB_URL)
    _db = _client[settings.MONGODB_DB_NAME]
    await _ensure_indexes()
    logger.info("Connected to MongoDB")


async def close_db():
    global _client
    if _client:
        _client.close()
        logger.info("Disconnected from MongoDB")


def get_db():
    return _db


async def _ensure_indexes():
    db = _db
    # users
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")
    await db.users.create_index("created_at")
    # products
    await db.products.create_index([("retailer_id", ASCENDING), ("is_deleted", ASCENDING)])
    await db.products.create_index([("category", ASCENDING), ("is_deleted", ASCENDING)])
    await db.products.create_index([("price", ASCENDING), ("is_deleted", ASCENDING)])
    await db.products.create_index([("name", TEXT), ("description", TEXT), ("tags", TEXT)])
    await db.products.create_index([("created_at", DESCENDING)])
    # models
    await db.models.create_index([("retailer_id", ASCENDING), ("is_deleted", ASCENDING)])
    await db.models.create_index([("body_type", ASCENDING), ("is_deleted", ASCENDING)])
    await db.models.create_index([("skin_tone", ASCENDING), ("is_deleted", ASCENDING)])
    await db.models.create_index([("usage_count", DESCENDING)])
    # tryon_sessions
    await db.tryon_sessions.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    await db.tryon_sessions.create_index([("retailer_id", ASCENDING), ("created_at", DESCENDING)])
    await db.tryon_sessions.create_index([("product_id", ASCENDING), ("created_at", DESCENDING)])
    await db.tryon_sessions.create_index([("user_id", ASCENDING), ("is_favorite", ASCENDING)])
    await db.tryon_sessions.create_index("expires_at", expireAfterSeconds=0)
    # carts
    await db.carts.create_index("user_id", unique=True)
    # wishlists
    await db.wishlists.create_index([("user_id", ASCENDING), ("added_at", DESCENDING)])
    await db.wishlists.create_index([("user_id", ASCENDING), ("product_id", ASCENDING)], unique=True)
    # analytics_events
    await db.analytics_events.create_index([("event_type", ASCENDING), ("created_at", DESCENDING)])
    await db.analytics_events.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    await db.analytics_events.create_index("product_id")
    logger.info("MongoDB indexes ensured")
