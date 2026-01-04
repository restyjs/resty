import type { Request, Response, NextFunction } from "express";

/**
 * Typed route handler with proper type inference
 */
export type TypedHandler<
    TParams extends Record<string, string> = Record<string, string>,
    TQuery extends Record<string, string | string[] | undefined> = Record<string, string>,
    TBody = unknown,
    TResponse = unknown
> = (
    req: TypedRequest<TParams, TQuery, TBody>,
    res: TypedResponse<TResponse>,
    next: NextFunction
) => TResponse | Promise<TResponse> | void | Promise<void>;

/**
 * Typed request with proper generics
 */
export interface TypedRequest<
    TParams extends Record<string, string> = Record<string, string>,
    TQuery extends Record<string, string | string[] | undefined> = Record<string, string>,
    TBody = unknown
> extends Request<TParams, any, TBody, TQuery> {
    params: TParams;
    query: TQuery;
    body: TBody;
}

/**
 * Typed response
 */
export interface TypedResponse<TData = unknown> extends Response {
    json(body: TData): this;
}

/**
 * Route handler that returns a typed response
 */
export type RouteHandler<T = unknown> = (
    ...args: unknown[]
) => T | Promise<T>;

/**
 * Extract parameter types from a route path
 * e.g., "/users/:id/posts/:postId" -> { id: string; postId: string }
 */
export type ExtractParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : T extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>;

/**
 * Define a typed controller method
 */
export interface TypedMethod<TParams, TQuery, TBody, TResponse> {
    params?: TParams;
    query?: TQuery;
    body?: TBody;
    response?: TResponse;
}

/**
 * Create a typed handler with full type inference
 *
 * @example
 * ```typescript
 * interface CreateUserBody {
 *   email: string;
 *   name: string;
 * }
 *
 * interface UserResponse {
 *   id: string;
 *   email: string;
 *   name: string;
 * }
 *
 * @Controller("/users")
 * class UserController {
 *   @Post("/")
 *   async create(
 *     @Body() body: CreateUserBody
 *   ): Promise<UserResponse> {
 *     return {
 *       id: "123",
 *       ...body
 *     };
 *   }
 * }
 * ```
 */
export function defineHandler<
    TParams extends Record<string, string> = Record<string, string>,
    TQuery extends Record<string, string | string[] | undefined> = Record<string, string>,
    TBody = unknown,
    TResponse = unknown
>(
    handler: TypedHandler<TParams, TQuery, TBody, TResponse>
): TypedHandler<TParams, TQuery, TBody, TResponse> {
    return handler;
}

/**
 * Infer response type from a controller method
 */
export type InferResponse<T> = T extends (...args: unknown[]) => Promise<infer R>
    ? R
    : T extends (...args: unknown[]) => infer R
    ? R
    : never;

/**
 * Infer parameter types from decorated parameters
 */
export type InferParams<T> = T extends (
    ...args: infer P
) => unknown
    ? P
    : never;

/**
 * JSON serializable types
 */
export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };

/**
 * Make a type JSON-safe (convert Date to string, etc.)
 */
export type JSONSafe<T> = T extends Date
    ? string
    : T extends bigint
    ? string
    : T extends Array<infer U>
    ? Array<JSONSafe<U>>
    : T extends object
    ? { [K in keyof T]: JSONSafe<T[K]> }
    : T;

/**
 * Response wrapper type for API responses
 */
export type ApiResponseType<T> = {
    success: true;
    data: JSONSafe<T>;
    meta?: {
        timestamp: string;
        requestId?: string;
    };
};

/**
 * Error response type
 */
export type ApiErrorType = {
    success: false;
    error: string;
    message: string;
    status: number;
    details?: unknown;
};

/**
 * Union type for all API responses
 */
export type ApiResult<T> = ApiResponseType<T> | ApiErrorType;

/**
 * Paginated list type
 */
export interface PaginatedList<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Query params for pagination
 */
export interface PaginationQuery {
    page?: string;
    pageSize?: string;
    limit?: string;
    offset?: string;
}

/**
 * Common ID parameter
 */
export interface IdParam {
    id: string;
}

/**
 * Common slug parameter
 */
export interface SlugParam {
    slug: string;
}
