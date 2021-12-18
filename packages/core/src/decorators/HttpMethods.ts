import { MetadataKeys } from "../metadataKeys";
import express from "express";

export enum HTTPMethod {
  get = "get",
  post = "post",
  put = "put",
  delete = "delete",
  patch = "patch",
  options = "options",
  head = "head",
  all = "all",
}

export interface HTTPMethodMetadata {
  path: string;
  method: HTTPMethod;
  middlewares: express.RequestHandler[];
  propertyKey: string;
  arguments: any[];
}

function httpMethod(
  path: string,
  method: HTTPMethod,
  middlewares: express.RequestHandler[] = []
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    var arrHttpMethodMetada: HTTPMethodMetadata[] =
      Reflect.getMetadata(MetadataKeys.httpMethod, target.constructor) ?? [];

    // Append / if not exist in path
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    const metadata: HTTPMethodMetadata = {
      path,
      method,
      middlewares,
      propertyKey,
      arguments: Reflect.getMetadata("design:paramtypes", target, propertyKey),
    };

    arrHttpMethodMetada.push(metadata);

    Reflect.defineMetadata(
      MetadataKeys.httpMethod,
      arrHttpMethodMetada,
      target.constructor
    );
  };
}

export function Get(path: string, middlewares?: express.RequestHandler[]) {
  return httpMethod(path, HTTPMethod.get, middlewares);
}

export function Post(path: string, middlewares?: express.RequestHandler[]) {
  return httpMethod(path, HTTPMethod.post, middlewares);
}

export function Put(path: string, middlewares?: express.RequestHandler[]) {
  return httpMethod(path, HTTPMethod.put, middlewares);
}

export function Delete(path: string, middlewares?: express.RequestHandler[]) {
  return httpMethod(path, HTTPMethod.delete, middlewares);
}

export function Patch(path: string, middlewares?: express.RequestHandler[]) {
  return httpMethod(path, HTTPMethod.patch, middlewares);
}

export function Options(path: string, middlewares?: express.RequestHandler[]) {
  return httpMethod(path, HTTPMethod.options, middlewares);
}

export function Head(path: string, middlewares?: express.RequestHandler[]) {
  return httpMethod(path, HTTPMethod.head, middlewares);
}

export function All(path: string, middlewares?: express.RequestHandler[]) {
  return httpMethod(path, HTTPMethod.all, middlewares);
}
