import supertest from "supertest";
import { resty, DefaultErrorHandler, NotFoundErrorHandler } from "@restyjs/core";
import type { Application } from "express";
import type { RestyOptions } from "@restyjs/core";

/**
 * Test application options
 */
export interface TestAppOptions extends Omit<RestyOptions, "controllers"> {
    controllers: RestyOptions["controllers"];
}

/**
 * Create a test application instance
 *
 * @example
 * ```typescript
 * import { createTestApp, request } from "@restyjs/testing";
 *
 * const app = createTestApp({
 *   controllers: [UserController],
 * });
 *
 * describe("UserController", () => {
 *   it("should return users", async () => {
 *     const res = await request(app).get("/users");
 *     expect(res.status).toBe(200);
 *   });
 * });
 * ```
 */
export function createTestApp(options: TestAppOptions): Application {
    return resty({
        ...options,
        postMiddlewares: [
            ...(options.postMiddlewares ?? []),
            NotFoundErrorHandler,
            DefaultErrorHandler,
        ],
    });
}

/**
 * Create a supertest request for testing
 *
 * @example
 * ```typescript
 * const res = await request(app)
 *   .post("/users")
 *   .send({ email: "test@example.com" })
 *   .expect(201);
 * ```
 */
export function request(app: Application) {
    return supertest(app);
}

/**
 * Test helper to create mock request objects
 */
export interface MockRequest {
    body?: unknown;
    query?: Record<string, string>;
    params?: Record<string, string>;
    headers?: Record<string, string>;
    method?: string;
    path?: string;
}

/**
 * Create a mock request object for unit testing
 *
 * @example
 * ```typescript
 * const req = mockRequest({
 *   body: { email: "test@example.com" },
 *   headers: { authorization: "Bearer token" }
 * });
 * ```
 */
export function mockRequest(options: MockRequest = {}): MockRequest & {
    get: (name: string) => string | undefined;
} {
    return {
        body: options.body ?? {},
        query: options.query ?? {},
        params: options.params ?? {},
        headers: options.headers ?? {},
        method: options.method ?? "GET",
        path: options.path ?? "/",
        get(name: string) {
            return this.headers?.[name.toLowerCase()];
        },
    };
}

/**
 * Test helper to create mock response objects
 */
export interface MockResponse {
    statusCode: number;
    body: unknown;
    headers: Record<string, string>;
}

/**
 * Create a mock response object for unit testing
 *
 * @example
 * ```typescript
 * const res = mockResponse();
 * await handler(mockRequest(), res, () => {});
 * expect(res.statusCode).toBe(200);
 * ```
 */
export function mockResponse(): MockResponse & {
    status: (code: number) => MockResponse;
    json: (data: unknown) => MockResponse;
    send: (data: unknown) => MockResponse;
    setHeader: (name: string, value: string) => MockResponse;
} {
    const response: MockResponse = {
        statusCode: 200,
        body: null,
        headers: {},
    };

    return {
        ...response,
        status(code: number) {
            response.statusCode = code;
            return this;
        },
        json(data: unknown) {
            response.body = data;
            return this;
        },
        send(data: unknown) {
            response.body = data;
            return this;
        },
        setHeader(name: string, value: string) {
            response.headers[name] = value;
            return this;
        },
    };
}

export type { Application };
