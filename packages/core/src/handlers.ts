import express from "express";
import { Exception, HTTPError, ValidationError } from "./errors";

export const NotFoundErrorHandler: express.RequestHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const error: Error = new HTTPError("Not Found", 404);
  next(error);
};

export const DefaultErrorHandler: express.ErrorRequestHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (err instanceof Exception) {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  } else {
    next(err);
  }
};
