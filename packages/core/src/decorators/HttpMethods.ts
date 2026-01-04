import type { RequestHandler } from "express";
import { MetadataKeys } from "../metadataKeys";

/**
 * Supported HTTP methods
 */
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

/**
 * Metadata for an HTTP method decorator
 */
export interface HTTPMethodMetadata {
  path: string;
  method: HTTPMethod;
  middlewares: RequestHandler[];
  propertyKey: string;
  arguments: unknown[];
}

/**
 * Creates an HTTP method decorator factory
 */
function createMethodDecorator(
  path: string,
  method: HTTPMethod,
  middlewares: RequestHandler[] = []
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    _descriptor: PropertyDescriptor
  ) {
    const constructor = target.constructor;

    // Get existing method metadata or initialize empty array
    const existingMetadata: HTTPMethodMetadata[] =
      Reflect.getMetadata(MetadataKeys.httpMethod, constructor) ?? [];

    // Normalize path
    const normalizedPath = String(path).startsWith("/") ? path : `/${path}`;

    const metadata: HTTPMethodMetadata = {
      path: normalizedPath,
      method,
      middlewares,
      propertyKey: String(propertyKey),
      arguments: Reflect.getMetadata("design:paramtypes", target, propertyKey) ?? [],
    };

    existingMetadata.push(metadata);
    Reflect.defineMetadata(MetadataKeys.httpMethod, existingMetadata, constructor);
  };
}

/**
 * Handle GET requests
 *
 * @example
 * ```typescript
 * @Get("/users")
 * async getUsers() {
 *   return await User.findAll();
 * }
 * ```
 */
export function Get(path: string, middlewares?: RequestHandler[]): MethodDecorator {
  return createMethodDecorator(path, HTTPMethod.get, middlewares);
}

/**
 * Handle POST requests
 *
 * @example
 * ```typescript
 * @Post("/users")
 * async createUser(@Body() data: CreateUserDto) {
 *   return await User.create(data);
 * }
 * ```
 */
export function Post(path: string, middlewares?: RequestHandler[]): MethodDecorator {
  return createMethodDecorator(path, HTTPMethod.post, middlewares);
}

/**
 * Handle PUT requests
 */
export function Put(path: string, middlewares?: RequestHandler[]): MethodDecorator {
  return createMethodDecorator(path, HTTPMethod.put, middlewares);
}

/**
 * Handle DELETE requests
 */
export function Delete(path: string, middlewares?: RequestHandler[]): MethodDecorator {
  return createMethodDecorator(path, HTTPMethod.delete, middlewares);
}

/**
 * Handle PATCH requests
 */
export function Patch(path: string, middlewares?: RequestHandler[]): MethodDecorator {
  return createMethodDecorator(path, HTTPMethod.patch, middlewares);
}

/**
 * Handle OPTIONS requests
 */
export function Options(path: string, middlewares?: RequestHandler[]): MethodDecorator {
  return createMethodDecorator(path, HTTPMethod.options, middlewares);
}

/**
 * Handle HEAD requests
 */
export function Head(path: string, middlewares?: RequestHandler[]): MethodDecorator {
  return createMethodDecorator(path, HTTPMethod.head, middlewares);
}

/**
 * Handle all HTTP methods
 */
export function All(path: string, middlewares?: RequestHandler[]): MethodDecorator {
  return createMethodDecorator(path, HTTPMethod.all, middlewares);
}
