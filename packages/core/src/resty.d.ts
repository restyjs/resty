import "reflect-metadata";
import express from "express";
interface Options {
    app?: express.Application;
    controllers: any[];
    middlewares?: express.RequestHandler[];
    postMiddlewares?: express.RequestHandler[];
    bodyParser?: boolean;
    handleErrors?: boolean;
}
export declare function resty(options: Options): express.Application;
export {};
