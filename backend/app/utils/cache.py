import json
from typing import Any, Optional

import redis.asyncio as aioredis


async def cache_get(redis: aioredis.Redis, key: str) -> Optional[dict]:
    data = await redis.get(key)
    if data:
        return json.loads(data)
    return None


async def cache_set(
    redis: aioredis.Redis, key: str, value: Any, ttl_seconds: int = 3600
) -> None:
    await redis.set(key, json.dumps(value, default=str), ex=ttl_seconds)


async def cache_delete(redis: aioredis.Redis, key: str) -> None:
    await redis.delete(key)


async def cache_exists(redis: aioredis.Redis, key: str) -> bool:
    return await redis.exists(key) > 0
