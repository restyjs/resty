import "reflect-metadata";

/**
 * Metadata keys for OpenAPI decorators
 */
export const OpenAPIMetadataKeys = {
    operation: Symbol("openapi:operation"),
    response: Symbol("openapi:response"),
    tags: Symbol("openapi:tags"),
    body: Symbol("openapi:body"),
    param: Symbol("openapi:param"),
    summary: Symbol("openapi:summary"),
    deprecated: Symbol("openapi:deprecated"),
    security: Symbol("openapi:security"),
} as const;

/**
 * Mark an operation with OpenAPI metadata
 */
export interface ApiOperationOptions {
    operationId?: string;
    summary?: string;
    description?: string;
    deprecated?: boolean;
}

/**
 * Decorator to add operation metadata to a route
 *
 * @example
 * ```typescript
 * @Get("/users")
 * @ApiOperation({ summary: "Get all users", operationId: "getUsers" })
 * async getUsers() {}
 * ```
 */
export function ApiOperation(options: ApiOperationOptions): MethodDecorator {
    return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(
            OpenAPIMetadataKeys.operation,
            options,
            target.constructor,
            propertyKey
        );
    };
}

/**
 * Add tags to group operations
 *
 * @example
 * ```typescript
 * @Controller("/users")
 * @ApiTags("Users", "Authentication")
 * class UserController {}
 * ```
 */
export function ApiTags(...tags: string[]): ClassDecorator & MethodDecorator {
    return function (target: object, propertyKey?: string | symbol, _descriptor?: PropertyDescriptor) {
        if (propertyKey) {
            // Method decorator
            Reflect.defineMetadata(
                OpenAPIMetadataKeys.tags,
                tags,
                (target as object).constructor,
                propertyKey
            );
        } else {
            // Class decorator
            Reflect.defineMetadata(OpenAPIMetadataKeys.tags, tags, target);
        }
    } as ClassDecorator & MethodDecorator;
}

/**
 * Response metadata options
 */
export interface ApiResponseOptions {
    status: number;
    description: string;
    type?: unknown;
    isArray?: boolean;
}

/**
 * Document a possible response
 *
 * @example
 * ```typescript
 * @Get("/users/:id")
 * @ApiResponse({ status: 200, description: "User found", type: UserDto })
 * @ApiResponse({ status: 404, description: "User not found" })
 * async getUser(@Param("id") id: string) {}
 * ```
 */
export function ApiResponse(options: ApiResponseOptions): MethodDecorator {
    return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
        const existingResponses: ApiResponseOptions[] =
            Reflect.getMetadata(
                OpenAPIMetadataKeys.response,
                target.constructor,
                propertyKey
            ) ?? [];

        existingResponses.push(options);

        Reflect.defineMetadata(
            OpenAPIMetadataKeys.response,
            existingResponses,
            target.constructor,
            propertyKey
        );
    };
}

/**
 * Shorthand for 200 OK response
 */
export function ApiOkResponse(description: string, type?: unknown): MethodDecorator {
    return ApiResponse({ status: 200, description, type });
}

/**
 * Shorthand for 201 Created response
 */
export function ApiCreatedResponse(description: string, type?: unknown): MethodDecorator {
    return ApiResponse({ status: 201, description, type });
}

/**
 * Shorthand for 204 No Content response
 */
export function ApiNoContentResponse(description: string): MethodDecorator {
    return ApiResponse({ status: 204, description });
}

/**
 * Shorthand for 400 Bad Request response
 */
export function ApiBadRequestResponse(description = "Bad Request"): MethodDecorator {
    return ApiResponse({ status: 400, description });
}

/**
 * Shorthand for 401 Unauthorized response
 */
export function ApiUnauthorizedResponse(description = "Unauthorized"): MethodDecorator {
    return ApiResponse({ status: 401, description });
}

/**
 * Shorthand for 403 Forbidden response
 */
export function ApiForbiddenResponse(description = "Forbidden"): MethodDecorator {
    return ApiResponse({ status: 403, description });
}

/**
 * Shorthand for 404 Not Found response
 */
export function ApiNotFoundResponse(description = "Not Found"): MethodDecorator {
    return ApiResponse({ status: 404, description });
}

/**
 * Mark an operation as deprecated
 */
export function ApiDeprecated(): MethodDecorator {
    return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(
            OpenAPIMetadataKeys.deprecated,
            true,
            target.constructor,
            propertyKey
        );
    };
}

/**
 * Add security requirements to an operation
 *
 * @example
 * ```typescript
 * @Get("/protected")
 * @ApiSecurity("bearerAuth")
 * async protectedRoute() {}
 * ```
 */
export function ApiSecurity(...securitySchemes: string[]): MethodDecorator {
    return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
        const security = securitySchemes.map((scheme) => ({ [scheme]: [] }));
        Reflect.defineMetadata(
            OpenAPIMetadataKeys.security,
            security,
            target.constructor,
            propertyKey
        );
    };
}

/**
 * Shorthand for Bearer token authentication
 */
export function ApiBearerAuth(): MethodDecorator {
    return ApiSecurity("bearerAuth");
}
