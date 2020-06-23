import express from "express";
export interface ControllerMetadata {
    path: string;
    middlewares: express.RequestHandler[];
    options?: express.RouterOptions;
}
export declare function Controller(path: string, middlewares?: express.RequestHandler[], options?: express.RouterOptions): (target: any) => void;
