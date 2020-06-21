import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";

import { Container } from "typedi";
import { exit } from "process";

import { MetadataKeys } from "./metadataKeys";
import { ControllerMetadata } from "./decorators/Controller";
import { HTTPMethodMetadata, HTTPMethod } from "./decorators/HttpMethods";
import { RequestParamMetadata } from "./decorators/Param";
import { Context } from "./context";
import { transformAndValidate } from "./helpers/transformAndValidate";

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
      this.initMiddlewares(app);
      this.initControllers(controllers);
    } catch (error) {
      console.error(error);
      exit(1);
    }
  }

  private initMiddlewares(app: express.Application) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
  }

  private initControllers(controllers: any[]) {
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

  private initRoutes(controller: any, metadata: ControllerMetadata) {
    const router = express.Router(metadata.options);
    const arrHttpMethodMetada: HTTPMethodMetadata[] =
      Reflect.getMetadata(MetadataKeys.httpMethod, controller) ?? [];

    Container.set(controller, new controller());

    arrHttpMethodMetada.map((mehtodMetadata) => {
      const handler = this.initRequestHandler(controller, mehtodMetadata);
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

  private initRequestHandler(controller: any, metadata: HTTPMethodMetadata) {
    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const _controller: any = Container.get(controller);
        const _method = _controller[metadata.propertyKey];

        let arrParamMetada: RequestParamMetadata[] =
          Reflect.getOwnMetadata(
            MetadataKeys.param,
            controller,
            metadata.propertyKey
          ) || [];

        let args: any[] = [];

        await Promise.all(
          arrParamMetada.map(async (paramMetadata) => {
            switch (paramMetadata.paramType) {
              case "body":
                args[paramMetadata.index] = await transformAndValidate(
                  paramMetadata.type,
                  req.body,
                  {
                    transformer: paramMetadata.classTransform
                      ? paramMetadata.classTransform
                      : void 0,
                    validator: paramMetadata.validatorOptions,
                  }
                );
                break;
              case "param":
                if (paramMetadata.name) {
                  args[paramMetadata.index] = req.params[paramMetadata.name];
                }
                break;
            }
          })
        );

        metadata.arguments.map((arg, index) => {
          if (arg.name == "Context") {
            const ctx = new Context(req, res, next);
            args[index] = ctx;
          }
        });

        const result = await _method(...args);

        if (result && result.finished) {
          return result;
        }
        res.send(result);

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
