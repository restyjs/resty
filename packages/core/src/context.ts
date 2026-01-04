import type { Request, Response, NextFunction } from "express";

/**
 * Context object that wraps Express request, response, and next function
 * for convenient access in route handlers.
 *
 * @example
 * ```typescript
 * @Get("/")
 * handler(ctx: Context) {
 *   ctx.res.json({ message: "Hello" });
 * }
 * ```
 */
export class Context {
  constructor(
    public readonly req: Request,
    public readonly res: Response,
    public readonly next: NextFunction
  ) { }

  /**
   * Get a value from request params
   */
  param(name: string): string | undefined {
    return this.req.params[name];
  }

  /**
   * Get a value from query string
   */
  query(name: string): string | string[] | undefined {
    return this.req.query[name] as string | string[] | undefined;
  }

  /**
   * Get a request header value
   */
  header(name: string): string | undefined {
    return this.req.get(name);
  }

  /**
   * Get the request body
   */
  get body(): unknown {
    return this.req.body;
  }

  /**
   * Send a JSON response
   */
  json(data: unknown, status = 200): Response {
    return this.res.status(status).json(data);
  }

  /**
   * Send a text response
   */
  send(data: string | Buffer, status = 200): Response {
    return this.res.status(status).send(data);
  }

  /**
   * Set response status code
   */
  status(code: number): this {
    this.res.status(code);
    return this;
  }

  /**
   * Set a response header
   */
  setHeader(name: string, value: string): this {
    this.res.setHeader(name, value);
    return this;
  }

  /**
   * Redirect to another URL
   */
  redirect(url: string, status = 302): void {
    this.res.redirect(status, url);
  }
}
