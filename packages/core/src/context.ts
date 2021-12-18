import express from "express";

export class Context {
  req: express.Request;
  res: express.Response;
  next: express.NextFunction;

  constructor(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    this.req = req;
    this.res = res;
    this.next = next;
  }
}
