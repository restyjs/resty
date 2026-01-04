// OpenAPI integration for Resty.js

// Types
export type {
    OpenAPISpec,
    OpenAPIInfo,
    OpenAPIServer,
    OpenAPITag,
    OpenAPISchema,
    OpenAPIParameter,
    OpenAPIRequestBody,
    OpenAPIResponse,
    OpenAPIOperation,
    OpenAPIPathItem,
    OpenAPISecurityScheme,
    OpenAPIComponents,
} from "./types";

// Decorators
export {
    ApiOperation,
    ApiTags,
    ApiResponse,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiDeprecated,
    ApiSecurity,
    ApiBearerAuth,
    OpenAPIMetadataKeys,
} from "./decorators";
export type { ApiOperationOptions, ApiResponseOptions } from "./decorators";

// Swagger UI
export {
    SwaggerUI,
    buildOpenAPISpec,
    serveOpenAPISpec,
} from "./swagger-ui";
export type { OpenAPIConfig } from "./swagger-ui";
