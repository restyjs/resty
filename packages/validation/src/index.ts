import "reflect-metadata";
import { z, ZodType, ZodError } from "zod";
import { ValidationError } from "@restyjs/core";
import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Metadata key for validation schemas
 */
export const ValidationMetadataKey = Symbol("resty:validation");

/**
 * Validation target (where to validate)
 */
export type ValidationTarget = "body" | "query" | "params";

/**
 * Stored validation metadata
 */
export interface ValidationMetadata {
    target: ValidationTarget;
    schema: ZodType;
    parameterIndex: number;
}

/**
 * Format Zod errors into a user-friendly structure
 */
export function formatZodErrors(error: ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const issue of error.issues) {
        const path = issue.path.join(".") || "_root";
        if (!formatted[path]) {
            formatted[path] = [];
        }
        formatted[path].push(issue.message);
    }

    return formatted;
}

/**
 * Validate and transform request body with a Zod schema
 *
 * @example
 * ```typescript
 * const CreateUserSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 *   name: z.string().min(2)
 * });
 *
 * @Post("/users")
 * create(@ValidateBody(CreateUserSchema) body: z.infer<typeof CreateUserSchema>) {
 *   // body is fully typed and validated!
 *   return this.userService.create(body);
 * }
 * ```
 */
export function ValidateBody<T extends ZodType>(
    schema: T
): ParameterDecorator {
    return function (
        target: object,
        propertyKey: string | symbol | undefined,
        parameterIndex: number
    ) {
        if (propertyKey === undefined) return;

        const existingMetadata: ValidationMetadata[] =
            Reflect.getOwnMetadata(
                ValidationMetadataKey,
                target.constructor,
                propertyKey
            ) ?? [];

        existingMetadata.push({
            target: "body",
            schema,
            parameterIndex,
        });

        Reflect.defineMetadata(
            ValidationMetadataKey,
            existingMetadata,
            target.constructor,
            propertyKey
        );
    };
}

/**
 * Validate and transform query parameters with a Zod schema
 *
 * @example
 * ```typescript
 * const SearchQuerySchema = z.object({
 *   q: z.string().min(1),
 *   page: z.coerce.number().int().positive().default(1),
 *   limit: z.coerce.number().int().min(1).max(100).default(10)
 * });
 *
 * @Get("/search")
 * search(@ValidateQuery(SearchQuerySchema) query: z.infer<typeof SearchQuerySchema>) {
 *   return this.searchService.search(query);
 * }
 * ```
 */
export function ValidateQuery<T extends ZodType>(
    schema: T
): ParameterDecorator {
    return function (
        target: object,
        propertyKey: string | symbol | undefined,
        parameterIndex: number
    ) {
        if (propertyKey === undefined) return;

        const existingMetadata: ValidationMetadata[] =
            Reflect.getOwnMetadata(
                ValidationMetadataKey,
                target.constructor,
                propertyKey
            ) ?? [];

        existingMetadata.push({
            target: "query",
            schema,
            parameterIndex,
        });

        Reflect.defineMetadata(
            ValidationMetadataKey,
            existingMetadata,
            target.constructor,
            propertyKey
        );
    };
}

/**
 * Validate and transform URL parameters with a Zod schema
 *
 * @example
 * ```typescript
 * const UserParamsSchema = z.object({
 *   id: z.string().uuid()
 * });
 *
 * @Get("/users/:id")
 * getUser(@ValidateParams(UserParamsSchema) params: z.infer<typeof UserParamsSchema>) {
 *   return this.userService.findById(params.id);
 * }
 * ```
 */
export function ValidateParams<T extends ZodType>(
    schema: T
): ParameterDecorator {
    return function (
        target: object,
        propertyKey: string | symbol | undefined,
        parameterIndex: number
    ) {
        if (propertyKey === undefined) return;

        const existingMetadata: ValidationMetadata[] =
            Reflect.getOwnMetadata(
                ValidationMetadataKey,
                target.constructor,
                propertyKey
            ) ?? [];

        existingMetadata.push({
            target: "params",
            schema,
            parameterIndex,
        });

        Reflect.defineMetadata(
            ValidationMetadataKey,
            existingMetadata,
            target.constructor,
            propertyKey
        );
    };
}

/**
 * Create validation middleware for a specific schema
 *
 * @example
 * ```typescript
 * const validateUser = validate({
 *   body: CreateUserSchema,
 *   query: PaginationSchema
 * });
 *
 * @Post("/users", [validateUser])
 * create(@Body() body: CreateUserDto) {}
 * ```
 */
export function validate(schemas: {
    body?: ZodType;
    query?: ZodType;
    params?: ZodType;
}): RequestHandler {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                const result = await schemas.body.safeParseAsync(req.body);
                if (!result.success) {
                    throw new ValidationError("Body validation failed", formatZodErrors(result.error));
                }
                req.body = result.data;
            }

            if (schemas.query) {
                const result = await schemas.query.safeParseAsync(req.query);
                if (!result.success) {
                    throw new ValidationError("Query validation failed", formatZodErrors(result.error));
                }
                (req as Request & { query: unknown }).query = result.data;
            }

            if (schemas.params) {
                const result = await schemas.params.safeParseAsync(req.params);
                if (!result.success) {
                    throw new ValidationError("Params validation failed", formatZodErrors(result.error));
                }
                (req as Request & { params: unknown }).params = result.data;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

// Re-export Zod for convenience
export { z, ZodType, ZodError };
