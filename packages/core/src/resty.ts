import "reflect-metadata";
import express, {
  Application as ExpressApplication,
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
} from "express";

import { Container } from "typedi";

import { MetadataKeys } from "./metadataKeys";
import { ControllerMetadata } from "./decorators/Controller";
import { HTTPMethodMetadata, HTTPMethod } from "./decorators/HttpMethods";
import { RequestParamMetadata } from "./decorators/Param";
import { Context } from "./context";
import { Provider } from "./provider";

type Middleware = RequestHandler | ErrorRequestHandler;

/**
 * Configuration options for creating a Resty application
 */
export interface RestyOptions {
  /** Existing Express application instance to use */
  app?: ExpressApplication;
  /** Existing Express router to use */
  router?: Router;
  /** Array of controller classes decorated with @Controller */
  controllers: unknown[];
  /** Array of providers for dependency injection */
  providers?: Provider[];
  /** Middleware to run before route handlers */
  middlewares?: Middleware[];
  /** Middleware to run after route handlers (error handlers, 404, etc.) */
  postMiddlewares?: Middleware[];
  /** Enable/disable body-parser middleware (default: true) */
  bodyParser?: boolean;
  /** Enable trust proxy setting for Express */
  trustProxy?: boolean;
  /** Global route prefix (e.g., "/api/v1") */
  routePrefix?: string;
  /** Enable debug mode for verbose logging */
  debug?: boolean;
}

interface LifecycleHooks {
  onRequest?: (req: Request, res: Response) => void | Promise<void>;
  onResponse?: (req: Request, res: Response) => void | Promise<void>;
  onError?: (error: Error, req: Request, res: Response) => void | Promise<void>;
}

class Application {
  private readonly hooks: LifecycleHooks = {};

  constructor(
    private readonly app: ExpressApplication,
    private readonly router: Router,
    private readonly controllers: unknown[],
    private readonly providers: Provider[],
    private readonly options: RestyOptions
  ) {
    this.initialize();
  }

  private initialize(): void {
    try {
      // Initialize providers first
      this.initProviders();

      // Initialize middlewares
      this.initTrustProxy();
      this.initBodyParser();
      this.initPreMiddlewares();

      // Initialize routes and controllers
      this.initControllers();

      // Initialize post middlewares
      this.initPostMiddlewares();
    } catch (error) {
      console.error("[resty] Initialization error:", error);
      throw error;
    }
  }

  private initTrustProxy(): void {
    if (this.options.trustProxy) {
      this.app.enable("trust proxy");
    }
  }

  private initBodyParser(): void {
    const enabled = this.options.bodyParser ?? true;
    if (enabled) {
      this.app.use(express.urlencoded({ extended: false }));
      this.app.use(express.json());
    }
  }

  private initPreMiddlewares(): void {
    if (this.options.middlewares) {
      for (const middleware of this.options.middlewares) {
        this.app.use(middleware as RequestHandler);
      }
    }
  }

  private initPostMiddlewares(): void {
    if (this.options.postMiddlewares) {
      for (const middleware of this.options.postMiddlewares) {
        this.app.use(middleware as RequestHandler);
      }
    }
  }

  private initControllers(): void {
    for (const controller of this.controllers) {
      const metadata: ControllerMetadata | undefined = Reflect.getMetadata(
        MetadataKeys.controller,
        controller as object
      );

      if (!metadata) {
        const name =
          typeof controller === "function" ? controller.name : "Unknown";
        throw new Error(
          `[resty] Controller "${name}" is missing @Controller decorator. ` +
          `Make sure to add @Controller("/path") to your controller class.`
        );
      }

      this.initRoutes(controller, metadata);
    }

    const prefix = this.normalizePrefix(this.options.routePrefix);
    if (prefix) {
      this.app.use(prefix, this.router);
    } else {
      this.app.use(this.router);
    }
  }

  private normalizePrefix(prefix?: string): string {
    if (!prefix) return "";
    return prefix.startsWith("/") ? prefix : `/${prefix}`;
  }

  private initRoutes(controller: unknown, metadata: ControllerMetadata): void {
    const controllerRouter = express.Router(metadata.options);
    const methodsMetadata: HTTPMethodMetadata[] =
      Reflect.getMetadata(MetadataKeys.httpMethod, controller as object) ?? [];

    for (const methodMetadata of methodsMetadata) {
      const handler = this.createRequestHandler(controller, methodMetadata);
      const middlewares = [
        ...metadata.middlewares,
        ...methodMetadata.middlewares,
      ];

      this.registerRoute(
        controllerRouter,
        methodMetadata.method,
        methodMetadata.path,
        middlewares,
        handler
      );
    }

    this.router.use(metadata.path, controllerRouter);
  }

  private registerRoute(
    router: Router,
    method: HTTPMethod,
    path: string,
    middlewares: RequestHandler[],
    handler: RequestHandler
  ): void {
    const routeMethod = router[method].bind(router) as (
      path: string,
      ...handlers: RequestHandler[]
    ) => void;

    if (routeMethod) {
      routeMethod(path, ...middlewares, handler);
    } else {
      throw new Error(`[resty] Invalid HTTP method: ${method}`);
    }
  }

  private createRequestHandler(
    controller: unknown,
    metadata: HTTPMethodMetadata
  ): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const args = this.resolveArguments(controller, metadata, req, res, next);
        const controllerInstance = Container.get(controller as new () => unknown);
        const method = (controllerInstance as Record<string, unknown>)[
          metadata.propertyKey
        ] as (...args: unknown[]) => unknown;

        const result = await method.apply(controllerInstance, args);

        // Check for custom status code
        const statusCode: number | undefined = Reflect.getMetadata(
          MetadataKeys.httpCode,
          controller as object,
          metadata.propertyKey
        );

        if (statusCode) {
          res.status(statusCode);
        }

        // If response already sent, don't send again
        if (res.headersSent) {
          return;
        }

        // Handle different return types
        if (result === undefined || result === null) {
          res.status(statusCode ?? 204).send();
        } else if (typeof result === "object") {
          res.json(result);
        } else {
          res.send(result);
        }
      } catch (error) {
        next(error);
      }
    };
  }

  private resolveArguments(
    controller: unknown,
    metadata: HTTPMethodMetadata,
    req: Request,
    res: Response,
    next: NextFunction
  ): unknown[] {
    const paramMetadata: RequestParamMetadata[] =
      Reflect.getOwnMetadata(
        MetadataKeys.param,
        controller as object,
        metadata.propertyKey
      ) ?? [];

    const args: unknown[] = [];

    // Resolve decorated parameters
    for (const param of paramMetadata) {
      args[param.index] = this.resolveParam(param, req, res, next);
    }

    // Resolve Context parameter by type
    if (metadata.arguments) {
      for (let i = 0; i < metadata.arguments.length; i++) {
        const arg = metadata.arguments[i] as { name?: string } | undefined;
        if (arg?.name === "Context" && args[i] === undefined) {
          args[i] = new Context(req, res, next);
        }
      }
    }

    return args;
  }

  private resolveParam(
    param: RequestParamMetadata,
    req: Request,
    res: Response,
    next: NextFunction
  ): unknown {
    switch (param.paramType) {
      case "body":
        return req.body;
      case "param":
        return param.name ? req.params[param.name] : req.params;
      case "params":
        return req.params;
      case "query":
        return param.name ? req.query[param.name] : req.query;
      case "queries":
        return req.query;
      case "header":
        return param.name
          ? req.headers[param.name.toLowerCase()]
          : req.headers;
      case "headers":
        return req.headers;
      case "cookie":
        return param.name
          ? (req as unknown as { cookies: Record<string, unknown> }).cookies?.[param.name]
          : (req as unknown as { cookies: Record<string, unknown> }).cookies;
      case "cookies":
        return (req as unknown as { cookies: Record<string, unknown> }).cookies;
      case "request":
        return req;
      case "response":
        return res;
      case "context":
        return new Context(req, res, next);
      default:
        return undefined;
    }
  }

  private async initProviders(): Promise<void> {
    for (const provider of this.providers) {
      try {
        await provider.build();
      } catch (error) {
        if (!provider.optional) {
          throw error;
        }
        console.warn(`[resty] Optional provider failed:`, error);
      }
    }
  }

  /**
   * Register lifecycle hooks
   */
  public onRequest(
    hook: (req: Request, res: Response) => void | Promise<void>
  ): void {
    this.hooks.onRequest = hook;
  }

  public onResponse(
    hook: (req: Request, res: Response) => void | Promise<void>
  ): void {
    this.hooks.onResponse = hook;
  }

  public onError(
    hook: (error: Error, req: Request, res: Response) => void | Promise<void>
  ): void {
    this.hooks.onError = hook;
  }
}

/**
 * Create a new Resty application
 *
 * @example
 * ```typescript
 * import resty, { Controller, Get } from "@restyjs/core";
 *
 * @Controller("/hello")
 * class HelloController {
 *   @Get("/")
 *   index() {
 *     return "Hello World";
 *   }
 * }
 *
 * const app = resty({
 *   controllers: [HelloController],
 * });
 *
 * app.listen(3000);
 * ```
 */
export function resty(options: RestyOptions): ExpressApplication {
  const expressApp = options.app ?? express();
  const router = options.router ?? express.Router();

  const application = new Application(
    expressApp,
    router,
    options.controllers ?? [],
    options.providers ?? [],
    options
  );

  Container.set("resty:application", application);

  return expressApp;
}
