import type { Request, Response, RequestHandler } from "express";
import type { Server } from "http";

/**
 * Health check status
 */
export type HealthStatus = "healthy" | "degraded" | "unhealthy";

/**
 * Health check result
 */
export interface HealthCheckResult {
    status: HealthStatus;
    timestamp: string;
    uptime: number;
    checks?: Record<string, {
        status: HealthStatus;
        message?: string;
        latency?: number;
    }>;
}

/**
 * Health check function type
 */
export type HealthCheck = () => Promise<{ status: HealthStatus; message?: string }>;

/**
 * Health check configuration
 */
export interface HealthCheckConfig {
    /** Path for health endpoint (default: /health) */
    path?: string;
    /** Path for readiness endpoint (default: /ready) */
    readyPath?: string;
    /** Path for liveness endpoint (default: /live) */
    livePath?: string;
    /** Additional checks to run */
    checks?: Record<string, HealthCheck>;
    /** Include detailed checks in response */
    detailed?: boolean;
}

/**
 * Create health check middleware
 *
 * @example
 * ```typescript
 * const app = resty({
 *   middlewares: [
 *     healthCheck({
 *       checks: {
 *         database: async () => {
 *           await db.query('SELECT 1');
 *           return { status: 'healthy' };
 *         },
 *         redis: async () => {
 *           await redis.ping();
 *           return { status: 'healthy' };
 *         }
 *       }
 *     })
 *   ],
 *   controllers: [...]
 * });
 * ```
 */
export function healthCheck(config: HealthCheckConfig = {}): RequestHandler {
    const {
        path = "/health",
        checks = {},
        detailed = false,
    } = config;

    const startTime = Date.now();

    return async (req: Request, res: Response, next: () => void) => {
        if (req.path !== path) {
            return next();
        }

        const result: HealthCheckResult = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - startTime) / 1000),
        };

        if (detailed && Object.keys(checks).length > 0) {
            result.checks = {};

            for (const [name, check] of Object.entries(checks)) {
                const checkStart = Date.now();
                try {
                    const checkResult = await check();
                    result.checks[name] = {
                        ...checkResult,
                        latency: Date.now() - checkStart,
                    };
                    if (checkResult.status === "unhealthy") {
                        result.status = "unhealthy";
                    } else if (checkResult.status === "degraded" && result.status !== "unhealthy") {
                        result.status = "degraded";
                    }
                } catch (error) {
                    result.checks[name] = {
                        status: "unhealthy",
                        message: error instanceof Error ? error.message : "Unknown error",
                        latency: Date.now() - checkStart,
                    };
                    result.status = "unhealthy";
                }
            }
        }

        const statusCode = result.status === "healthy" ? 200 : result.status === "degraded" ? 200 : 503;
        res.status(statusCode).json(result);
    };
}

/**
 * Create liveness probe endpoint (simple check if service is running)
 */
export function livenessProbe(path = "/live"): RequestHandler {
    return (req: Request, res: Response, next: () => void) => {
        if (req.path !== path) return next();
        res.status(200).json({ status: "ok" });
    };
}

/**
 * Create readiness probe endpoint
 */
export function readinessProbe(
    path = "/ready",
    check?: () => Promise<boolean>
): RequestHandler {
    return async (req: Request, res: Response, next: () => void) => {
        if (req.path !== path) return next();

        if (check) {
            try {
                const ready = await check();
                if (ready) {
                    res.status(200).json({ status: "ready" });
                } else {
                    res.status(503).json({ status: "not ready" });
                }
            } catch {
                res.status(503).json({ status: "not ready" });
            }
        } else {
            res.status(200).json({ status: "ready" });
        }
    };
}

/**
 * Graceful shutdown options
 */
export interface GracefulShutdownOptions {
    /** Timeout before force shutdown (ms) */
    timeout?: number;
    /** Cleanup functions to run before shutdown */
    onShutdown?: Array<() => Promise<void>>;
    /** Signals to listen for */
    signals?: NodeJS.Signals[];
    /** Logger function */
    logger?: (message: string) => void;
}

/**
 * Enable graceful shutdown for the server
 *
 * @example
 * ```typescript
 * const server = app.listen(3000);
 * 
 * gracefulShutdown(server, {
 *   timeout: 30000,
 *   onShutdown: [
 *     () => database.close(),
 *     () => redis.quit(),
 *   ]
 * });
 * ```
 */
export function gracefulShutdown(
    server: Server,
    options: GracefulShutdownOptions = {}
): void {
    const {
        timeout = 30000,
        onShutdown = [],
        signals = ["SIGTERM", "SIGINT"],
        logger = console.log,
    } = options;

    let isShuttingDown = false;

    const shutdown = async (signal: string) => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        logger(`[resty] Received ${signal}, starting graceful shutdown...`);

        // Stop accepting new connections
        server.close(() => {
            logger("[resty] Server closed, no longer accepting connections");
        });

        // Run cleanup functions
        const shutdownPromises = onShutdown.map(async (fn, index) => {
            try {
                await fn();
                logger(`[resty] Cleanup task ${index + 1} completed`);
            } catch (error) {
                logger(`[resty] Cleanup task ${index + 1} failed: ${error}`);
            }
        });

        // Wait for cleanup with timeout
        const timeoutPromise = new Promise<void>((resolve) => {
            setTimeout(() => {
                logger("[resty] Shutdown timeout reached, forcing exit");
                resolve();
            }, timeout);
        });

        await Promise.race([
            Promise.all(shutdownPromises),
            timeoutPromise,
        ]);

        logger("[resty] Graceful shutdown complete");
        process.exit(0);
    };

    for (const signal of signals) {
        process.on(signal, () => shutdown(signal));
    }
}

/**
 * Middleware to reject requests during shutdown
 */
export function shutdownMiddleware(): {
    middleware: RequestHandler;
    startShutdown: () => void;
} {
    let isShuttingDown = false;

    return {
        middleware: (_req: Request, res: Response, next: () => void) => {
            if (isShuttingDown) {
                res.status(503).json({ error: "Service is shutting down" });
                return;
            }
            next();
        },
        startShutdown: () => {
            isShuttingDown = true;
        },
    };
}
