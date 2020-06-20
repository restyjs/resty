import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { MetadataKeys } from "./metadataKeys";
import { exit } from "process";
import { ControllerMetadata } from "./decorators/Controller";
import { HTTPMethodMetadata, HTTPMethod } from "./decorators/HttpMethods";
import { RequestParamMetadata } from "./decorators/Param";
import bodyParser from "body-parser";
import { plainToClass, ClassTransformer } from "class-transformer";
import { validateOrReject } from "class-validator";

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
    return async (req: Request, res: Response, next: NextFunction) => {
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

        if (arrParamMetada) {
          const argsPromise = arrParamMetada.map((meta) => {
            switch (meta.paramType) {
              case "body":
                const body = req.body;

                // let object: object;
                // if (typeof body === "string") {
                //   object = JSON.parse(body);
                // } else if (body != null && typeof body === "object") {
                //   object = body;
                // } else {
                //   Promise.reject(
                //     new Error(
                //       "Incorrect object param type! Only string, plain object and array of plain objects are valid."
                //     )
                //   );
                // }

                // const classObject: any = plainToClass(
                //   meta.type,
                //   object,
                //   meta.classTransform ? meta.classTransform : void 0
                // );

                // if (Array.isArray(classObject)) {
                Promise.reject(new Error(`unimplemented`));
                // } else {
                //   return validateOrReject(classObject, meta.validatorOptions);
                // }

                // console.log(meta.index, classObject);
                // args[meta.index] = classObject;

                break;
              default:
                Promise.reject(new Error(`${meta.paramType} not found`));

                break;
            }
          });
        }

        console.log(args);

        const result = await _method(...args); //_method(req, res, next, ...args);
        // const result = await controller[metadata.propertyKey](req, res, next);
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
