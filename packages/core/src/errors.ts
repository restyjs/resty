/**
 * Base exception class for all Resty errors
 */
export class Exception extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    status = 500,
    options?: { code?: string; details?: unknown }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      error: this.name,
      message: this.message,
      status: this.status,
    };
    if (this.code) {
      result.code = this.code;
    }
    if (this.details) {
      result.details = this.details;
    }
    return result;
  }
}

/**
 * HTTP Error for general HTTP status responses
 */
export class HTTPError extends Exception {
  constructor(
    message: string,
    status = 500,
    options?: { code?: string; details?: unknown }
  ) {
    super(message, status, options);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends HTTPError {
  constructor(message = "Bad Request", details?: unknown) {
    super(message, 400, { code: "BAD_REQUEST", details });
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends HTTPError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(message, 401, { code: "UNAUTHORIZED", details });
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends HTTPError {
  constructor(message = "Forbidden", details?: unknown) {
    super(message, 403, { code: "FORBIDDEN", details });
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends HTTPError {
  constructor(message = "Not Found", details?: unknown) {
    super(message, 404, { code: "NOT_FOUND", details });
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends HTTPError {
  constructor(message = "Conflict", details?: unknown) {
    super(message, 409, { code: "CONFLICT", details });
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends HTTPError {
  constructor(message = "Validation Failed", details?: unknown) {
    super(message, 422, { code: "VALIDATION_ERROR", details });
  }
}

/**
 * Too Many Requests Error (429)
 */
export class TooManyRequestsError extends HTTPError {
  constructor(message = "Too Many Requests", retryAfter?: number) {
    super(message, 429, {
      code: "RATE_LIMIT_EXCEEDED",
      details: retryAfter ? { retryAfter } : undefined,
    });
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends HTTPError {
  constructor(message = "Internal Server Error") {
    super(message, 500, { code: "INTERNAL_ERROR" });
  }
}
