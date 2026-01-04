import { MetadataKeys } from "../metadataKeys";
import { RequestParamMetadata } from "./Param";

/**
 * Extract a query string parameter
 *
 * @example
 * ```typescript
 * @Get("/search")
 * search(@Query("q") query: string, @Query("limit") limit?: string) {
 *   return this.searchService.search(query, Number(limit) || 10);
 * }
 * ```
 */
export function Query(name: string): ParameterDecorator {
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
      paramType: "query",
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
 * Extract all query string parameters
 *
 * @example
 * ```typescript
 * @Get("/search")
 * search(@Queries() queries: Record<string, string>) {
 *   return this.searchService.search(queries);
 * }
 * ```
 */
export function Queries(): ParameterDecorator {
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
      paramType: "queries",
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
