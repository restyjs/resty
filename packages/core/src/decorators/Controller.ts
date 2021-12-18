import { MetadataKeys } from "../metadataKeys";
import express from "express";

export interface ControllerMetadata {
  path: string;
  middlewares: express.RequestHandler[];
  options?: express.RouterOptions;
}

export function Controller(
  path: string,
  middlewares: express.RequestHandler[] = [],
  options?: express.RouterOptions
) {
  return function (target: any) {
    // Append / if not exist in path
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    const metadata: ControllerMetadata = {
      path: path,
      middlewares: middlewares,
      options: options,
    };
    Reflect.defineMetadata(MetadataKeys.controller, metadata, target);
  };
}
