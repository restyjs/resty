import type { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
import { Exception, NotFoundError } from "./errors";

/**
 * Default 404 Not Found handler
 * Use this as a post-middleware to handle unmatched routes
 */
export const NotFoundErrorHandler: RequestHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(new NotFoundError("The requested resource was not found"));
};

/**
 * Default error handler that formats Exception errors as JSON responses
 * Use this as the last post-middleware
 */
export const DefaultErrorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  // If headers already sent, delegate to Express default error handler
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof Exception) {
    res.status(err.status).json(err.toJSON());
  } else {
    // Log unexpected errors
    console.error("[resty] Unhandled error:", err);

    // In production, don't expose error details
    const isProduction = process.env.NODE_ENV === "production";

    res.status(500).json({
      error: "InternalServerError",
      message: isProduction ? "An unexpected error occurred" : err.message,
      status: 500,
      ...(isProduction ? {} : { stack: err.stack }),
    });
  }
};

/**
 * Request logging middleware for development
 */
export const RequestLogger: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[resty] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};
