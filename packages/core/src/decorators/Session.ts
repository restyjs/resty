import { MetadataKeys } from "../metadataKeys";
import { RequestParamMetadata } from "./Param";

/**
 * Extract a session value from the request
 * Requires express-session middleware to be installed
 *
 * @example
 * ```typescript
 * @Get("/profile")
 * getProfile(@Session("userId") userId: string) {
 *   return this.userService.findById(userId);
 * }
 * ```
 */
export function Session(name?: string): ParameterDecorator {
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
            paramType: "session",
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

