# Redis Caching

## What It Is

**Redis** (client 4.6.12) is an in-memory key-value store used for caching in this project. It reduces database load by storing frequently accessed data in memory for fast retrieval.

## Why We Use It

- **Performance**: Sub-millisecond reads vs millisecond database queries
- **Reduced DB load**: Cache common queries to prevent repeated database hits
- **Flexible data**: Stores JSON-serialized values of any structure
- **TTL support**: Automatic expiration of cached data

## How It Works Here

### Client Setup

```typescript
// lib/redis.ts
import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
  }

  return redisClient;
}
```

**Pattern:** Lazy initialization singleton. The client is created on first use and reused for subsequent calls.

### Cache Operations

**Set cache (with optional TTL):**
```typescript
export async function setCache(key: string, value: any, expirationSeconds?: number) {
  const client = await getRedisClient();
  const stringValue = JSON.stringify(value);   // serialize to JSON string

  if (expirationSeconds) {
    await client.setEx(key, expirationSeconds, stringValue);  // SET with EXpiry
  } else {
    await client.set(key, stringValue);                        // SET without expiry
  }
}
```

**Get cache (type-safe with generics):**
```typescript
export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  const value = await client.get(key);

  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;    // graceful handling of corrupt data
  }
}
```

**Delete cache:**
```typescript
export async function deleteCache(key: string) {
  const client = await getRedisClient();
  await client.del(key);
}
```

**Clear by pattern (wildcard delete):**
```typescript
export async function clearCachePattern(pattern: string) {
  const client = await getRedisClient();
  const keys = await client.keys(pattern);    // e.g., 'user:*'

  if (keys.length > 0) {
    await client.del(keys);
  }
}
```

### Usage Examples

```typescript
// Cache user profile for 1 hour
await setCache(`user:${userId}`, userProfile, 3600);

// Retrieve cached profile
const cached = await getCache<UserProfile>(`user:${userId}`);
if (cached) return cached;

// Invalidate when profile updates
await deleteCache(`user:${userId}`);

// Clear all user caches
await clearCachePattern('user:*');
```

## Environment Variables

```
REDIS_URL=redis://localhost:6379     # Default for local development
# Docker shared Redis may use a different port:
REDIS_URL=redis://localhost:6380
```

## Key Files

- `lib/redis.ts` - Redis client and cache helper functions

## Best Practices

1. **Always handle cache misses**: Cache is optional - the app should work without it (query DB on miss)
2. **Set appropriate TTL**: Don't cache forever. Use expiration based on data freshness needs.
3. **Invalidate on write**: When data changes, delete the corresponding cache entry
4. **Consistent key format**: Use `entity:id` pattern (e.g., `user:abc123`, `document:xyz789`)

## Common Pitfalls

1. **Cache stampede**: Multiple concurrent misses all hit the database at once. Consider locking for expensive queries.
2. **Stale data**: Forgetting to invalidate cache after an update shows outdated information
3. **Memory limits**: Redis stores everything in memory. Monitor usage and set `maxmemory` policies.
4. **keys() in production**: `clearCachePattern` uses `KEYS` which blocks Redis on large datasets. Use `SCAN` for production.

## Resources

- [Redis Documentation](https://redis.io/docs/)
- [Node Redis Client](https://github.com/redis/node-redis)
- [Redis Commands Reference](https://redis.io/commands/)
