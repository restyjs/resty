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
import { ValidationError, HTTPError } from "./errors";
import { Provider } from "./provider";

interface Options {
  app?: express.Application;
  router?: express.Router;
  controllers: any[];
  providers?: Provider[];
  middlewares?: express.RequestHandler[];
  postMiddlewares?: express.RequestHandler[];
  bodyParser?: boolean;
  trustProxy?: boolean;
  handleErrors?: boolean;
  routePrefix?: string;
}

class Application {
  constructor(
    private readonly app: express.Application,
    private readonly router: express.Router,
    private readonly controllers: any[],
    private readonly providers: Provider[],
    private readonly middlewares?: express.RequestHandler[],
    private readonly postMiddlewares?: express.RequestHandler[],
    private readonly bodyParser?: boolean,
    private readonly trustProxy?: boolean,
    private readonly handleErrors?: boolean,
    private readonly routePrefix?: string
  ) {
    try {
      // first init providers
      this.initProviders();

      // init middlewares
      this.initTrustProxy(trustProxy);
      this.initBodyParser(bodyParser);
      this.initPreMiddlewares();

      // init routes and controllers
      this.initControllers();

      // init post middlewares
      this.initPostMiddlewares();

      // init error handlers
      this.initErrorHandlers();
    } catch (error) {
      console.error(error);
      exit(1);
    }
  }

  private initTrustProxy(enabled: boolean = false) {
    if (enabled) {
      this.app.enable("trust proxy");
    }
  }

  private initBodyParser(enabled: boolean = true) {
    if (enabled) {
      this.app.use(bodyParser.urlencoded({ extended: false }));
      this.app.use(bodyParser.json());
    }
  }

  private initPreMiddlewares() {
    if (this.middlewares) {
      this.middlewares.forEach((middleware) => this.app.use(middleware));
    }
  }

  private initPostMiddlewares() {
    if (this.postMiddlewares) {
      this.postMiddlewares.forEach((middleware) => this.app.use(middleware));
    }
  }

  private initControllers() {
    this.controllers.map((controller) => {
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

    if (this.routePrefix) {
      let routePrefix = this.routePrefix;
      // Append / if not exist in path
      if (!routePrefix.startsWith("/")) {
        routePrefix = "/" + routePrefix;
      }
      this.app.use(routePrefix, this.router);
    } else {
      this.app.use(this.router);
    }
  }

  private initRoutes(controller: any, metadata: ControllerMetadata) {
    const _router = express.Router(metadata.options);
    const arrHttpMethodMetada: HTTPMethodMetadata[] =
      Reflect.getMetadata(MetadataKeys.httpMethod, controller) ?? [];

    // Container.set(controller, new controller());

    arrHttpMethodMetada.map((mehtodMetadata) => {
      const handler = this.initRequestHandler(controller, mehtodMetadata);
      const middlewares = [
        ...metadata.middlewares,
        ...mehtodMetadata.middlewares,
      ];
      switch (mehtodMetadata.method) {
        case HTTPMethod.get:
          _router.get(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.post:
          _router.post(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.put:
          _router.put(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.delete:
          _router.delete(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.patch:
          _router.patch(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.options:
          _router.options(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.head:
          _router.head(mehtodMetadata.path, middlewares, handler);
          break;

        case HTTPMethod.all:
          _router.all(mehtodMetadata.path, middlewares, handler);
          break;

        default:
          throw Error(`${mehtodMetadata.method} method not valid`);
          break;
      }
    });

    // this.app.use(metadata.path, _router);
    this.router.use(metadata.path, _router);
  }

  private initRequestHandler(controller: any, metadata: HTTPMethodMetadata) {
    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
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
                args[paramMetadata.index] = req.body;
                break;
              case "param":
                if (paramMetadata.name) {
                  args[paramMetadata.index] = req.params[paramMetadata.name];
                }
                break;
              case "query":
                if (paramMetadata.name) {
                  args[paramMetadata.index] = req.query[paramMetadata.name];
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

        const _controller: any = Container.get(controller);
        const result = await _controller[metadata.propertyKey](...args);

        if (result && result.finished) {
          return result;
        }
        return res.send(result);
      } catch (error) {
        next(error);
        return;
      }
    };
  }

  private initErrorHandlers() {
    if (this.handleErrors) {
      this.app.use((req, res, next) => {
        const error: Error = new HTTPError("Not Found", 404);
        next(error);
      });

      this.app.use(
        (
          err: Error,
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          if (err instanceof ValidationError) {
            res.status(400);
            res.json({
              error: err,
            });
            return;
          } else if (err instanceof HTTPError) {
            res.status(err.statusCode);
            res.json({
              error: err,
            });
            return;
          }

          res.status(500);
          res.json({
            error: {
              statusCode: 500,
              message: err.message ? err.message : err,
            },
          });
        }
      );
    }
  }

  initProviders() {
    (async () => {
      await this.providers.map(async (provider) => {
        try {
          await provider.build();
        } catch (error) {
          if (provider.optional) {
            throw error;
          } else {
            console.error(error);
            exit(1);
          }
        }
      });
    })();
  }
}

export function resty(options: Options): express.Application {
  const expressApplication = options.app ?? express();

  const restyApplication = new Application(
    expressApplication,
    options.router ?? express.Router(),
    options.controllers ?? [],
    options.providers ?? [],
    options.middlewares,
    options.postMiddlewares,
    options.bodyParser,
    options.trustProxy,
    options.handleErrors ?? true,
    options.routePrefix
  );

  Container.set("resty:application", restyApplication);

  return expressApplication;
}
