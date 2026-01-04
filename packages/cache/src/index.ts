import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Cache store interface
 */
export interface CacheStore {
    /** Get a cached value */
    get<T>(key: string): Promise<T | null>;
    /** Set a cached value */
    set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
    /** Delete a cached value */
    del(key: string): Promise<void>;
    /** Check if key exists */
    has(key: string): Promise<boolean>;
    /** Clear all cached values */
    clear(): Promise<void>;
    /** Get all keys matching a pattern */
    keys(pattern: string): Promise<string[]>;
}

/**
 * In-memory cache store
 */
export class MemoryCache implements CacheStore {
    private readonly store = new Map<string, { value: unknown; expiresAt: number | null }>();

    async get<T>(key: string): Promise<T | null> {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            this.store.delete(key);
            return null;
        }

        return entry.value as T;
    }

    async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
        this.store.set(key, {
            value,
            expiresAt: ttlMs ? Date.now() + ttlMs : null,
        });
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
    }

    async has(key: string): Promise<boolean> {
        const value = await this.get(key);
        return value !== null;
    }

    async clear(): Promise<void> {
        this.store.clear();
    }

    async keys(pattern: string): Promise<string[]> {
        const regex = new RegExp(pattern.replace(/\*/g, ".*"));
        return Array.from(this.store.keys()).filter((key) => regex.test(key));
    }
}

/**
 * Redis cache store
 */
export class RedisCache implements CacheStore {
    private redis: import("ioredis").Redis | null = null;
    private readonly prefix: string;

    constructor(options: {
        redis: import("ioredis").Redis;
        prefix?: string;
    }) {
        this.redis = options.redis;
        this.prefix = options.prefix ?? "resty:cache:";
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.redis) return null;
        const value = await this.redis.get(this.prefix + key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }

    async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
        if (!this.redis) return;
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        if (ttlMs) {
            await this.redis.psetex(this.prefix + key, ttlMs, serialized);
        } else {
            await this.redis.set(this.prefix + key, serialized);
        }
    }

    async del(key: string): Promise<void> {
        if (!this.redis) return;
        await this.redis.del(this.prefix + key);
    }

    async has(key: string): Promise<boolean> {
        if (!this.redis) return false;
        return (await this.redis.exists(this.prefix + key)) === 1;
    }

    async clear(): Promise<void> {
        if (!this.redis) return;
        const keys = await this.redis.keys(this.prefix + "*");
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }

    async keys(pattern: string): Promise<string[]> {
        if (!this.redis) return [];
        const keys = await this.redis.keys(this.prefix + pattern);
        return keys.map((k) => k.replace(this.prefix, ""));
    }
}

/**
 * Cache options
 */
export interface CacheOptions {
    /** Time-to-live in milliseconds */
    ttlMs?: number;
    /** Cache key generator */
    keyGenerator?: (req: Request) => string;
    /** Condition to cache response */
    condition?: (req: Request, res: Response) => boolean;
    /** Cache store */
    store?: CacheStore;
}

/**
 * Default cache instance
 */
let defaultCache: CacheStore = new MemoryCache();

/**
 * Set the default cache store
 */
export function setDefaultCache(store: CacheStore): void {
    defaultCache = store;
}

/**
 * Get the default cache store
 */
export function getDefaultCache(): CacheStore {
    return defaultCache;
}

/**
 * Create response caching middleware
 *
 * @example
 * ```typescript
 * import { cache } from "@restyjs/cache";
 *
 * @Controller("/api")
 * class ApiController {
 *   @Get("/expensive")
 *   @Cache({ ttlMs: 60000 }) // Cache for 1 minute
 *   async expensiveOperation() {
 *     return await computeExpensiveData();
 *   }
 * }
 * ```
 */
export function cache(options: CacheOptions = {}): RequestHandler {
    const {
        ttlMs = 60000,
        keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
        condition = () => true,
        store = defaultCache,
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== "GET") {
            return next();
        }

        const key = keyGenerator(req);

        try {
            const cached = await store.get<{ body: unknown; headers: Record<string, string> }>(key);
            if (cached) {
                for (const [header, value] of Object.entries(cached.headers)) {
                    res.setHeader(header, value);
                }
                res.setHeader("X-Cache", "HIT");
                return res.json(cached.body);
            }

            // Override res.json to cache the response
            const originalJson = res.json.bind(res);
            res.json = function (body: unknown) {
                if (condition(req, res) && res.statusCode >= 200 && res.statusCode < 300) {
                    const headersToCache: Record<string, string> = {};
                    const cacheControlHeaders = ["content-type", "etag"];
                    for (const header of cacheControlHeaders) {
                        const value = res.getHeader(header);
                        if (value) {
                            headersToCache[header] = String(value);
                        }
                    }
                    store.set(key, { body, headers: headersToCache }, ttlMs).catch(() => { });
                }
                res.setHeader("X-Cache", "MISS");
                return originalJson(body);
            };

            next();
        } catch {
            next();
        }
    };
}

/**
 * Cache decorator for methods
 */
export function Cache(options: CacheOptions = {}): MethodDecorator {
    return function (_target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const {
            ttlMs = 60000,
            store = defaultCache,
        } = options;

        descriptor.value = async function (...args: unknown[]) {
            const key = `method:${String(propertyKey)}:${JSON.stringify(args)}`;

            const cached = await store.get(key);
            if (cached !== null) {
                return cached;
            }

            const result = await originalMethod.apply(this, args);
            await store.set(key, result, ttlMs);
            return result;
        };

        return descriptor;
    };
}

/**
 * Invalidate cache entries matching a pattern
 */
export async function invalidateCache(pattern: string, store: CacheStore = defaultCache): Promise<void> {
    const keys = await store.keys(pattern);
    await Promise.all(keys.map((key) => store.del(key)));
}
