from typing import Optional

from app.core.config import settings

_redis = None


async def get_redis():
    global _redis
    if _redis is not None:
        return _redis
    if not settings.REDIS_URL:
        return None
    try:
        import redis.asyncio as redis
        _redis = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
        return _redis
    except Exception:
        return None


async def incr_with_ttl(key: str, ttl_seconds: int) -> int:
    r = await get_redis()
    if not r:
        return 0
    async with r.pipeline() as pipe:
        await pipe.incr(key)
        await pipe.expire(key, ttl_seconds)
        res = await pipe.execute()
    return int(res[0])

