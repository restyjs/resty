import { MetadataKeys } from "../metadataKeys";
import { RequestParamMetadata } from "./Param";

/**
 * Extract a cookie value from the request
 * Requires cookie-parser middleware to be installed
 *
 * @example
 * ```typescript
 * @Get("/preferences")
 * getPreferences(@Cookie("theme") theme: string) {
 *   return { theme: theme || "light" };
 * }
 * ```
 */
export function Cookie(name: string): ParameterDecorator {
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
            paramType: "cookie",
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
 * Extract all cookies from the request
 * Requires cookie-parser middleware to be installed
 *
 * @example
 * ```typescript
 * @Get("/session")
 * getSession(@Cookies() cookies: Record<string, string>) {
 *   return { sessionId: cookies.sessionId };
 * }
 * ```
 */
export function Cookies(): ParameterDecorator {
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
            paramType: "cookies",
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
