import { MetadataKeys } from "../metadataKeys";

/**
 * Set the HTTP status code for a route handler's response
 *
 * @example
 * ```typescript
 * @Post("/users")
 * @HttpCode(201)
 * create(@Body() data: CreateUserDto) {
 *   return this.userService.create(data);
 * }
 * ```
 */
export function HttpCode(statusCode: number): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        _descriptor: PropertyDescriptor
    ) {
        Reflect.defineMetadata(
            MetadataKeys.httpCode,
            statusCode,
            target.constructor,
            propertyKey
        );
    };
}

/**
 * Redirect the request to another URL
 *
 * @example
 * ```typescript
 * @Get("/old-path")
 * @Redirect("/new-path", 301)
 * redirectToNew() {
 *   // Return value is ignored when @Redirect is used
 * }
 * ```
 */
export function Redirect(url: string, statusCode = 302): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        _descriptor: PropertyDescriptor
    ) {
        Reflect.defineMetadata(
            MetadataKeys.redirect,
            { url, statusCode },
            target.constructor,
            propertyKey
        );
    };
}

/**
 * Set response headers for a route handler
 *
 * @example
 * ```typescript
 * @Get("/download")
 * @SetHeader("Content-Disposition", "attachment; filename=file.txt")
 * @SetHeader("Cache-Control", "no-cache")
 * download() {
 *   return fileContents;
 * }
 * ```
 */
export function SetHeader(name: string, value: string): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        _descriptor: PropertyDescriptor
    ) {
        const existingHeaders: Array<{ name: string; value: string }> =
            Reflect.getMetadata(
                MetadataKeys.headers,
                target.constructor,
                propertyKey
            ) ?? [];

        existingHeaders.push({ name, value });

        Reflect.defineMetadata(
            MetadataKeys.headers,
            existingHeaders,
            target.constructor,
            propertyKey
        );
    };
}
