import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { MetadataKeys } from "./metadataKeys";
import { exit } from "process";
import { ControllerMetadata } from "./decorators/Controller";
import { HTTPMethodMetadata, HTTPMethod } from "./decorators/HttpMethods";

interface Options {
  app: express.Application;
  controllers: any[];
}

class Application {
  constructor(
    private readonly app: express.Application,
    private readonly controllers: any[]
  ) {
    try {
      this.initControllers(controllers);
    } catch (error) {
      console.error(error);
      exit(1);
    }
  }

  initControllers(controllers: any[]) {
    controllers.map((controller) => {
      const metadata: ControllerMetadata = Reflect.getMetadata(
        MetadataKeys.controller,
        controller
      );
      if (metadata == null) {
        // Make more useful error message like you've forgot to add @Controller or something ...
        throw Error(`${controller.name} metadata not found`);
      }
      this.initRoutes(controller, metadata);
    });
  }

  initRoutes(controller: any, metadata: ControllerMetadata) {
    const router = express.Router(metadata.options);
    const arrHttpMethodMetada: HTTPMethodMetadata[] =
      Reflect.getMetadata(MetadataKeys.httpMethod, controller) ?? [];

    const object = new controller();

    arrHttpMethodMetada.map((mehtodMetadata) => {
      const handler = this.initRequestHandler(object, mehtodMetadata);
      const middlewares = [
        ...metadata.middlewares,
        ...mehtodMetadata.middlewares,
      ];
      switch (mehtodMetadata.method) {
        case HTTPMethod.get:
          router.get(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.post:
          router.post(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.put:
          router.put(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.delete:
          router.delete(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.patch:
          router.patch(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.options:
          router.options(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.head:
          router.head(mehtodMetadata.path, middlewares, handler);
          break;

        default:
          throw Error(`${mehtodMetadata.method} method not valid`);
          break;
      }
    });

    this.app.use(metadata.path, router);
  }

  initRequestHandler(controller: any, metadata: HTTPMethodMetadata) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await controller[metadata.propertyKey](req, res, next);
        if (response && response.finished) {
          return response;
        }
        res.send(response);
        next();
        return;
      } catch (error) {
        next(error);
        return;
      }
    };
  }
}

export function resty(options: Partial<Options>): express.Application {
  const expressApplication = options.app ?? express();
  const restyApplication = new Application(
    expressApplication,
    options.controllers ?? []
  );
  Container.set("resty:application", restyApplication);
  return expressApplication;
}
