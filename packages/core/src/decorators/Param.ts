import { MetadataKeys } from "../metadataKeys";

/**
 * Types of parameters that can be extracted from requests
 */
export type RequestParamType =
  | "body"
  | "query"
  | "queries"
  | "header"
  | "headers"
  | "file"
  | "files"
  | "param"
  | "params"
  | "session"
  | "cookie"
  | "cookies"
  | "request"
  | "response"
  | "context";

/**
 * Metadata for request parameter decorators
 */
export interface RequestParamMetadata {
  target: object;
  propertyKey: string;
  index: number;
  paramType: RequestParamType;
  type: unknown;
  name?: string;
  parse: boolean;
  required?: boolean;
}

/**
 * Creates a parameter decorator factory for extracting request values
 */
function createParamDecorator(
  paramType: RequestParamType,
  name?: string
): ParameterDecorator {
  return function (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    if (propertyKey === undefined) return;

    const existingMetadata: RequestParamMetadata[] =
      Reflect.getOwnMetadata(
        MetadataKeys.param,
        target.constructor,
        propertyKey
      ) ?? [];

    const paramTypes =
      Reflect.getMetadata("design:paramtypes", target, propertyKey) ?? [];

    const metadata: RequestParamMetadata = {
      target,
      paramType,
      name,
      propertyKey: String(propertyKey),
      index: parameterIndex,
      type: paramTypes[parameterIndex],
      parse: false,
    };

    existingMetadata.push(metadata);

    Reflect.defineMetadata(
      MetadataKeys.param,
      existingMetadata,
      target.constructor,
      propertyKey
    );
  };
}

/**
 * Extract a URL parameter value
 *
 * @example
 * ```typescript
 * @Get("/users/:id")
 * getUser(@Param("id") id: string) {
 *   return this.userService.findById(id);
 * }
 * ```
 */
export function Param(name: string): ParameterDecorator {
  return createParamDecorator("param", name);
}

/**
 * Extract all URL parameters
 *
 * @example
 * ```typescript
 * @Get("/users/:userId/posts/:postId")
 * getPost(@Params() params: { userId: string; postId: string }) {
 *   return this.postService.find(params);
 * }
 * ```
 */
export function Params(): ParameterDecorator {
  return createParamDecorator("params");
}

/**
 * Extract the raw Express Request object
 *
 * @example
 * ```typescript
 * @Get("/info")
 * getInfo(@Req() req: Request) {
 *   return { ip: req.ip, userAgent: req.get("user-agent") };
 * }
 * ```
 */
export function Req(): ParameterDecorator {
  return createParamDecorator("request");
}

/**
 * Extract the raw Express Response object
 *
 * @example
 * ```typescript
 * @Get("/download")
 * download(@Res() res: Response) {
 *   res.download("/path/to/file");
 * }
 * ```
 */
export function Res(): ParameterDecorator {
  return createParamDecorator("response");
}
