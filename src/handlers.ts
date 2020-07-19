import express from "express";
import { HTTPError, ValidationError } from "./errors";

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
  if (err instanceof ValidationError) {
    res.status(400);
    res.json({
      error: err,
    });
    return;
  } else if (err instanceof HTTPError) {
    res.status(err.statusCode);
    res.json({
      error: err,
    });
    return;
  }

  res.status(500);
  res.json({
    error: {
      statusCode: 500,
      message: err.message ? err.message : err,
    },
  });
};
