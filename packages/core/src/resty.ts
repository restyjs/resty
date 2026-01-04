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
import { Logger } from "./logger";
import { createHooksManager } from "./hooks";
import type { CorsOptions } from "cors";
import type { HelmetOptions } from "helmet";
import type { CompressionOptions } from "compression";

type Middleware = RequestHandler | ErrorRequestHandler;

/**
 * Configuration options for creating a Resty application
 */
export interface RestyOptions {
  // ... existing options ...
  cors?: boolean | CorsOptions;
  helmet?: boolean | HelmetOptions;
  compression?: boolean | CompressionOptions;

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
  /** Enable access logging (morgan) */
  logger?: boolean;
  /** View engine */
  viewEngine?: string;
  /** Views directory */
  views?: string;
  /** Assets directory */
  assets?: string | { prefix?: string; dir: string };
  /** Container implementation */
  container?: typeof Container;
  /** Lifecycle hooks */
  hooks?: {
    onRequest?: Array<(req: Request, res: Response) => void | Promise<void>>;
    onResponse?: Array<(req: Request, res: Response, result: unknown) => void | Promise<void>>;
    onError?: Array<(error: Error, req: Request, res: Response) => void | Promise<void>>;
  };
  /** Response interceptors - transform response before sending */
  responseInterceptors?: Array<(result: unknown, req: Request, res: Response) => unknown | Promise<unknown>>;
}

interface InternalHooks {
  onRequest: Array<(req: Request, res: Response) => void | Promise<void>>;
  onResponse: Array<(req: Request, res: Response, result: unknown) => void | Promise<void>>;
  onError: Array<(error: Error, req: Request, res: Response) => void | Promise<void>>;
}

class Application {
  public logger: Logger;
  private readonly hooks: InternalHooks;

  constructor(
    private readonly app: ExpressApplication,
    private readonly router: Router,
    private readonly controllers: unknown[],
    private readonly providers: Provider[],
    private readonly options: RestyOptions
  ) {
    this.logger = new Logger(options.debug || process.env.RESTY_DEBUG === "true");

    this.hooks = {
      onRequest: options.hooks?.onRequest || [],
      onResponse: options.hooks?.onResponse || [],
      onError: options.hooks?.onError || [],
    };

    this.init();
  }

  private async init() {
    this.logger.debug("Initializing Resty application...");

    // Add morgan if requested
    if (this.options.logger) {
      try {
        this.app.use(require("morgan")("dev"));
      } catch (error) {
        this.logger.warn("Morgan logger not found. Install 'morgan' to enable access logging.");
      }
    }

    try {
      // Initialize providers first
      await this.initProviders();

      // View engine setup
      if (this.options.viewEngine) {
        this.app.set("view engine", this.options.viewEngine);
        if (this.options.views) {
          this.app.set("views", this.options.views);
        }
      }

      // Assets setup
      if (this.options.assets) {
        if (typeof this.options.assets === "string") {
          this.app.use("/assets", express.static(this.options.assets));
        } else {
          this.app.use(
            this.options.assets.prefix || "/assets",
            express.static(this.options.assets.dir)
          );
        }
      }

      // Initialize middlewares
      this.initSecurityMiddlewares();
      this.initTrustProxy();
      this.initBodyParser();

      // Add request context middleware
      this.app.use((req, _res, next) => {
        // @ts-ignore
        req.id = Math.random().toString(36).substring(7);
        next();
      });

      this.initPreMiddlewares();

      // Initialize hook manager
      const hookManager = createHooksManager();
      // Register configured hooks
      // Register configured hooks
      this.hooks.onRequest.forEach(h => {
        hookManager.addOnRequest(ctx => h(ctx.req, ctx.res));
      });
      this.hooks.onResponse.forEach(h => {
        hookManager.addOnResponse((ctx, res) => h(ctx.req, ctx.res, res));
      });
      this.hooks.onError.forEach(h => {
        hookManager.addOnError((ctx, err) => h(err, ctx.req, ctx.res));
      });

      // Register request hooks (before controllers)
      this.app.use((req, res, _next) => {
        hookManager.runOnRequest({
          req,
          res,
          startTime: Date.now()
        }).then(() => _next()).catch(_next);
      });

      // Initialize routes and controllers
      await this.initControllers();

      // Initialize post middlewares
      this.initPostMiddlewares();

      // Global error handler
      this.app.use(
        (error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
          this.logger.error(`Error processing request ${req.method} ${req.url}`, error);

          const ctx = {
            req,
            res,
            startTime: (req as any)._startTime || Date.now(),
            httpMethod: req.method,
            path: req.path
          };

          // Execute error hooks
          hookManager.runOnError(ctx, error)
            .then(() => {
              // Default error handling logic if not handled by hooks (i.e. if response not sent)
              if (!res.headersSent) {
                const status = error.status || 500;
                let response: Record<string, unknown>;

                if (typeof error.toJSON === "function") {
                  response = error.toJSON();
                } else {
                  response = {
                    error: error.name || "Internal Server Error",
                    message: error.message,
                    statusCode: status,
                  };
                }

                if (this.logger.debugMode && error.stack) {
                  response.stack = error.stack;
                }

                res.status(status).json(response);
              }
            })
            .catch((err) => {
              this.logger.error("Error in error hooks:", err);
              if (!res.headersSent) {
                res.status(500).json({ error: "Internal Server Error" });
              }
            });
        }
      );

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
      this.logger.debug(`Registering ${this.options.middlewares.length} pre-middlewares`);
      for (const middleware of this.options.middlewares) {
        this.app.use(middleware as RequestHandler);
      }
    }
  }

  private initSecurityMiddlewares(): void {
    // Helmet
    if (this.options.helmet) {
      try {
        const helmet = require("helmet");
        const options = typeof this.options.helmet === "boolean" ? {} : this.options.helmet;
        this.app.use(helmet(options));
        this.logger.debug("Helmet middleware enabled");
      } catch (error) {
        this.logger.warn("Helmet enabled but package not found. Install 'helmet' to use it.");
      }
    }

    // CORS
    if (this.options.cors) {
      try {
        const cors = require("cors");
        const options = typeof this.options.cors === "boolean" ? {} : this.options.cors;
        this.app.use(cors(options));
        this.logger.debug("CORS middleware enabled");
      } catch (error) {
        this.logger.warn("CORS enabled but package not found. Install 'cors' to use it.");
      }
    }

    // Compression
    if (this.options.compression) {
      try {
        const compression = require("compression");
        const options = typeof this.options.compression === "boolean" ? {} : this.options.compression;
        this.app.use(compression(options));
        this.logger.debug("Compression middleware enabled");
      } catch (error) {
        this.logger.warn("Compression enabled but package not found. Install 'compression' to use it.");
      }
    }
  }

  private initPostMiddlewares(): void {
    if (this.options.postMiddlewares) {
      this.logger.debug(`Registering ${this.options.postMiddlewares.length} post-middlewares`);
      for (const middleware of this.options.postMiddlewares) {
        this.app.use(middleware as RequestHandler);
      }
    }
  }

  private async initControllers(): Promise<void> {
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

    this.logger.debug(`Registering controller: ${metadata.path} (${methodsMetadata.length} routes)`);

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
        this.logger.warn(`[resty] Optional provider failed:`, error);
      }
    }
  }

  /**
   * Register lifecycle hooks
   */
  public onRequest(
    hook: (req: Request, res: Response) => void | Promise<void>
  ): void {
    this.hooks.onRequest.push(hook);
  }

  public onResponse(
    hook: (req: Request, res: Response, result: unknown) => void | Promise<void>
  ): void {
    this.hooks.onResponse.push(hook);
  }

  public onError(
    hook: (error: Error, req: Request, res: Response) => void | Promise<void>
  ): void {
    this.hooks.onError.push(hook);
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
