import type { RouterOptions, RequestHandler } from "express";
import { MetadataKeys } from "../metadataKeys";

/**
 * Controller metadata stored via reflection
 */
export interface ControllerMetadata {
  path: string;
  middlewares: RequestHandler[];
  options?: RouterOptions;
}

/**
 * Marks a class as a controller that can handle HTTP requests
 *
 * @param path - Base path for all routes in this controller
 * @param middlewares - Optional middleware to apply to all routes
 * @param options - Optional Express router options
 *
 * @example
 * ```typescript
 * @Controller("/users")
 * class UserController {
 *   @Get("/")
 *   list() {
 *     return [];
 *   }
 * }
 * ```
 */
export function Controller(
  path: string,
  middlewares: RequestHandler[] = [],
  options?: RouterOptions
): ClassDecorator {
  return function (target) {
    // Normalize path to always start with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    const metadata: ControllerMetadata = {
      path: normalizedPath,
      middlewares,
      options,
    };

    Reflect.defineMetadata(MetadataKeys.controller, metadata, target);
  };
}
