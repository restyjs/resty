import express from "express";
export declare class Context {
    req: express.Request;
    res: express.Response;
    next: express.NextFunction;
    constructor(req: express.Request, res: express.Response, next: express.NextFunction);
}
