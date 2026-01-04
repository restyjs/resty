import { MetadataKeys } from "../metadataKeys";
import { RequestParamMetadata } from "./Param";

/**
 * Extract the request body and inject it as a parameter
 *
 * @example
 * ```typescript
 * @Post("/users")
 * create(@Body() user: CreateUserDto) {
 *   return this.userService.create(user);
 * }
 * ```
 */
export function Body(): ParameterDecorator {
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
      paramType: "body",
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
