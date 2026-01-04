import type { Request, Response, NextFunction, RequestHandler } from "express";
import { TooManyRequestsError } from "@restyjs/core";

/**
 * Rate limit store interface
 */
export interface RateLimitStore {
    /** Increment the counter for a key */
    increment(key: string): Promise<{ count: number; resetTime: number }>;
    /** Reset the counter for a key */
    reset(key: string): Promise<void>;
    /** Get remaining attempts */
    get(key: string): Promise<{ count: number; resetTime: number } | null>;
}

/**
 * Rate limit options
 */
export interface RateLimitOptions {
    /** Maximum requests per window */
    max: number;
    /** Time window in milliseconds */
    windowMs: number;
    /** Error message when rate limited */
    message?: string;
    /** Key generator function */
    keyGenerator?: (req: Request) => string;
    /** Skip function to bypass rate limiting */
    skip?: (req: Request) => boolean | Promise<boolean>;
    /** Store for rate limit data */
    store?: RateLimitStore;
    /** Include rate limit headers in response */
    headers?: boolean;
    /** Handler when rate limit is exceeded */
    onLimitReached?: (req: Request, res: Response) => void;
}

/**
 * In-memory rate limit store
 */
export class MemoryStore implements RateLimitStore {
    private readonly store = new Map<string, { count: number; resetTime: number }>();
    private readonly windowMs: number;

    constructor(windowMs: number) {
        this.windowMs = windowMs;
        // Clean up expired entries periodically
        setInterval(() => this.cleanup(), windowMs);
    }

    async increment(key: string): Promise<{ count: number; resetTime: number }> {
        const now = Date.now();
        const existing = this.store.get(key);

        if (existing && existing.resetTime > now) {
            existing.count++;
            return existing;
        }

        const entry = { count: 1, resetTime: now + this.windowMs };
        this.store.set(key, entry);
        return entry;
    }

    async reset(key: string): Promise<void> {
        this.store.delete(key);
    }

    async get(key: string): Promise<{ count: number; resetTime: number } | null> {
        const entry = this.store.get(key);
        if (!entry || entry.resetTime <= Date.now()) {
            return null;
        }
        return entry;
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, value] of this.store.entries()) {
            if (value.resetTime <= now) {
                this.store.delete(key);
            }
        }
    }
}

/**
 * Redis rate limit store
 */
export class RedisStore implements RateLimitStore {
    private redis: import("ioredis").Redis | null = null;
    private readonly prefix: string;
    private readonly windowMs: number;

    constructor(options: {
        redis: import("ioredis").Redis;
        prefix?: string;
        windowMs: number;
    }) {
        this.redis = options.redis;
        this.prefix = options.prefix ?? "resty:ratelimit:";
        this.windowMs = options.windowMs;
    }

    async increment(key: string): Promise<{ count: number; resetTime: number }> {
        if (!this.redis) throw new Error("Redis not connected");

        const redisKey = this.prefix + key;
        const now = Date.now();
        const windowSec = Math.ceil(this.windowMs / 1000);

        const count = await this.redis.incr(redisKey);
        if (count === 1) {
            await this.redis.expire(redisKey, windowSec);
        }

        const ttl = await this.redis.ttl(redisKey);
        const resetTime = now + ttl * 1000;

        return { count, resetTime };
    }

    async reset(key: string): Promise<void> {
        if (!this.redis) return;
        await this.redis.del(this.prefix + key);
    }

    async get(key: string): Promise<{ count: number; resetTime: number } | null> {
        if (!this.redis) return null;

        const redisKey = this.prefix + key;
        const count = await this.redis.get(redisKey);
        if (!count) return null;

        const ttl = await this.redis.ttl(redisKey);
        return {
            count: parseInt(count, 10),
            resetTime: Date.now() + ttl * 1000,
        };
    }
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(req: Request): string {
    return (
        (req.ip ?? req.socket?.remoteAddress ?? "unknown")
    );
}

/**
 * Create rate limit middleware
 *
 * @example
 * ```typescript
 * import { rateLimit } from "@restyjs/rate-limit";
 *
 * // 100 requests per 15 minutes
 * const limiter = rateLimit({
 *   max: 100,
 *   windowMs: 15 * 60 * 1000,
 * });
 *
 * const app = resty({
 *   middlewares: [limiter],
 *   controllers: [MyController],
 * });
 * ```
 */
export function rateLimit(options: RateLimitOptions): RequestHandler {
    const {
        max,
        windowMs,
        message = "Too many requests, please try again later.",
        keyGenerator = defaultKeyGenerator,
        skip,
        store = new MemoryStore(windowMs),
        headers = true,
        onLimitReached,
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if should skip
            if (skip && (await skip(req))) {
                return next();
            }

            const key = keyGenerator(req);
            const { count, resetTime } = await store.increment(key);
            const remaining = Math.max(0, max - count);

            // Set rate limit headers
            if (headers) {
                res.setHeader("X-RateLimit-Limit", max);
                res.setHeader("X-RateLimit-Remaining", remaining);
                res.setHeader("X-RateLimit-Reset", Math.ceil(resetTime / 1000));
            }

            if (count > max) {
                if (headers) {
                    res.setHeader("Retry-After", Math.ceil((resetTime - Date.now()) / 1000));
                }

                if (onLimitReached) {
                    onLimitReached(req, res);
                }

                throw new TooManyRequestsError(message);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Create a stricter rate limiter for sensitive endpoints
 */
export function strictRateLimit(options: Partial<RateLimitOptions> = {}): RequestHandler {
    return rateLimit({
        max: 5,
        windowMs: 60 * 1000, // 1 minute
        message: "Too many attempts, please try again later.",
        ...options,
    });
}

/**
 * Create a lenient rate limiter for public endpoints
 */
export function publicRateLimit(options: Partial<RateLimitOptions> = {}): RequestHandler {
    return rateLimit({
        max: 1000,
        windowMs: 15 * 60 * 1000, // 15 minutes
        ...options,
    });
}

/**
 * Skip rate limiting for authenticated users
 */
export function skipIfAuthenticated(req: Request): boolean {
    return !!(req as Request & { user?: unknown }).user;
}
