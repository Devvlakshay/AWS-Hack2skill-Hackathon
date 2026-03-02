import json
import logging
from typing import Any, Optional
from redis.asyncio import Redis, from_url
from app.core.config import settings

logger = logging.getLogger(__name__)

_redis: Redis | None = None


async def connect_redis():
    global _redis
    try:
        _redis = await from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        await _redis.ping()
        logger.info("Connected to Redis")
    except Exception as e:
        logger.warning(f"Redis connection failed (running without cache): {e}")
        _redis = None


async def close_redis():
    global _redis
    if _redis:
        await _redis.aclose()
        logger.info("Disconnected from Redis")


def get_redis() -> Redis | None:
    return _redis


async def cache_get(key: str) -> Optional[Any]:
    if not _redis:
        return None
    try:
        val = await _redis.get(key)
        return json.loads(val) if val else None
    except Exception as e:
        logger.warning(f"Redis get error for {key}: {e}")
        return None


async def cache_set(key: str, value: Any, ttl: int = 3600) -> bool:
    if not _redis:
        return False
    try:
        await _redis.setex(key, ttl, json.dumps(value, default=str))
        return True
    except Exception as e:
        logger.warning(f"Redis set error for {key}: {e}")
        return False


async def cache_delete(key: str) -> bool:
    if not _redis:
        return False
    try:
        await _redis.delete(key)
        return True
    except Exception as e:
        logger.warning(f"Redis delete error for {key}: {e}")
        return False


async def cache_delete_pattern(pattern: str) -> int:
    if not _redis:
        return 0
    try:
        keys = await _redis.keys(pattern)
        if keys:
            return await _redis.delete(*keys)
        return 0
    except Exception as e:
        logger.warning(f"Redis pattern delete error: {e}")
        return 0
