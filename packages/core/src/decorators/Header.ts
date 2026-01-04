import { MetadataKeys } from "../metadataKeys";
import { RequestParamMetadata } from "./Param";

/**
 * Extract a request header value
 *
 * @example
 * ```typescript
 * @Get("/")
 * handler(@Header("authorization") auth: string) {
 *   return { hasAuth: !!auth };
 * }
 * ```
 */
export function Header(name: string): ParameterDecorator {
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
            paramType: "header",
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
 * Extract all request headers
 *
 * @example
 * ```typescript
 * @Get("/")
 * handler(@Headers() headers: Record<string, string>) {
 *   return { contentType: headers["content-type"] };
 * }
 * ```
 */
export function Headers(): ParameterDecorator {
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
            paramType: "headers",
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
