import express from "express";
export declare enum HTTPMethod {
    get = "get",
    post = "post",
    put = "put",
    delete = "delete",
    patch = "patch",
    options = "options",
    head = "head"
}
export interface HTTPMethodMetadata {
    path: string;
    method: HTTPMethod;
    middlewares: express.RequestHandler[];
    propertyKey: string;
    arguments: any[];
}
export declare function Get(path: string, middlewares?: express.RequestHandler[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function Post(path: string, middlewares?: express.RequestHandler[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function Put(path: string, middlewares?: express.RequestHandler[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function Delete(path: string, middlewares?: express.RequestHandler[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function Patch(path: string, middlewares?: express.RequestHandler[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function Options(path: string, middlewares?: express.RequestHandler[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function Head(path: string, middlewares?: express.RequestHandler[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
