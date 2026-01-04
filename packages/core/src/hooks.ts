import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Lifecycle hook context passed to all hooks
 */
export interface HookContext {
    req: Request;
    res: Response;
    /** Controller class name */
    controller?: string;
    /** Method name being called */
    method?: string;
    /** Route path */
    path?: string;
    /** HTTP method */
    httpMethod?: string;
    /** Start time of request */
    startTime: number;
}

/**
 * onRequest hook - called before route handler
 */
export type OnRequestHook = (ctx: HookContext) => void | Promise<void>;

/**
 * onResponse hook - called after route handler
 */
export type OnResponseHook = (
    ctx: HookContext,
    result: unknown
) => void | Promise<void>;

/**
 * onError hook - called when an error occurs
 */
export type OnErrorHook = (
    ctx: HookContext,
    error: Error
) => void | Promise<void>;

/**
 * Lifecycle hooks configuration
 */
export interface LifecycleHooks {
    onRequest?: OnRequestHook[];
    onResponse?: OnResponseHook[];
    onError?: OnErrorHook[];
}

/**
 * Create a lifecycle hooks manager
 */
export function createHooksManager(): {
    hooks: LifecycleHooks;
    addOnRequest: (hook: OnRequestHook) => void;
    addOnResponse: (hook: OnResponseHook) => void;
    addOnError: (hook: OnErrorHook) => void;
    runOnRequest: (ctx: HookContext) => Promise<void>;
    runOnResponse: (ctx: HookContext, result: unknown) => Promise<void>;
    runOnError: (ctx: HookContext, error: Error) => Promise<void>;
} {
    const hooks: LifecycleHooks = {
        onRequest: [],
        onResponse: [],
        onError: [],
    };

    return {
        hooks,
        addOnRequest(hook: OnRequestHook) {
            hooks.onRequest?.push(hook);
        },
        addOnResponse(hook: OnResponseHook) {
            hooks.onResponse?.push(hook);
        },
        addOnError(hook: OnErrorHook) {
            hooks.onError?.push(hook);
        },
        async runOnRequest(ctx: HookContext) {
            for (const hook of hooks.onRequest ?? []) {
                await hook(ctx);
            }
        },
        async runOnResponse(ctx: HookContext, result: unknown) {
            for (const hook of hooks.onResponse ?? []) {
                await hook(ctx, result);
            }
        },
        async runOnError(ctx: HookContext, error: Error) {
            for (const hook of hooks.onError ?? []) {
                await hook(ctx, error);
            }
        },
    };
}

/**
 * Request interceptor - can modify request before handler
 */
export type RequestInterceptor = (
    req: Request,
    res: Response
) => Request | Promise<Request>;

/**
 * Response interceptor - can modify response after handler
 */
export type ResponseInterceptor = (
    result: unknown,
    req: Request,
    res: Response
) => unknown | Promise<unknown>;

/**
 * Interceptor configuration
 */
export interface Interceptors {
    request: RequestInterceptor[];
    response: ResponseInterceptor[];
}

/**
 * Create an interceptor manager
 */
export function createInterceptorManager(): {
    interceptors: Interceptors;
    addRequestInterceptor: (interceptor: RequestInterceptor) => void;
    addResponseInterceptor: (interceptor: ResponseInterceptor) => void;
    runRequestInterceptors: (req: Request, res: Response) => Promise<Request>;
    runResponseInterceptors: (
        result: unknown,
        req: Request,
        res: Response
    ) => Promise<unknown>;
} {
    const interceptors: Interceptors = {
        request: [],
        response: [],
    };

    return {
        interceptors,
        addRequestInterceptor(interceptor: RequestInterceptor) {
            interceptors.request.push(interceptor);
        },
        addResponseInterceptor(interceptor: ResponseInterceptor) {
            interceptors.response.push(interceptor);
        },
        async runRequestInterceptors(req: Request, res: Response) {
            let currentReq = req;
            for (const interceptor of interceptors.request) {
                currentReq = await interceptor(currentReq, res);
            }
            return currentReq;
        },
        async runResponseInterceptors(result: unknown, req: Request, res: Response) {
            let currentResult = result;
            for (const interceptor of interceptors.response) {
                currentResult = await interceptor(currentResult, req, res);
            }
            return currentResult;
        },
    };
}

/**
 * Built-in request timing hook
 */
export function requestTimingHook(): OnResponseHook {
    return (ctx, _result) => {
        const duration = Date.now() - ctx.startTime;
        console.log(
            `[${ctx.httpMethod}] ${ctx.path} - ${duration}ms`
        );
    };
}

/**
 * Built-in error logging hook
 */
export function errorLoggingHook(): OnErrorHook {
    return (ctx, error) => {
        console.error(
            `[ERROR] [${ctx.httpMethod}] ${ctx.path}:`,
            error.message
        );
    };
}

/**
 * Create middleware that applies interceptors
 */
export function createInterceptorMiddleware(
    interceptors: Interceptors
): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Run request interceptors
            let modifiedReq = req;
            for (const interceptor of interceptors.request) {
                modifiedReq = await interceptor(modifiedReq, res);
            }
            // Replace req properties if modified
            Object.assign(req, modifiedReq);
            next();
        } catch (error) {
            next(error);
        }
    };
}
