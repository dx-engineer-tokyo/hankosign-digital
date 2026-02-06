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

export async function setCache(key: string, value: any, expirationSeconds?: number) {
  const client = await getRedisClient();
  const stringValue = JSON.stringify(value);
  
  if (expirationSeconds) {
    await client.setEx(key, expirationSeconds, stringValue);
  } else {
    await client.set(key, stringValue);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  const value = await client.get(key);
  
  if (!value) return null;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function deleteCache(key: string) {
  const client = await getRedisClient();
  await client.del(key);
}

export async function clearCachePattern(pattern: string) {
  const client = await getRedisClient();
  const keys = await client.keys(pattern);
  
  if (keys.length > 0) {
    await client.del(keys);
  }
}
