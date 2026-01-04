/**
 * OpenAPI 3.1 Specification Types
 */

export interface OpenAPIInfo {
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: {
        name?: string;
        url?: string;
        email?: string;
    };
    license?: {
        name: string;
        url?: string;
    };
}

export interface OpenAPIServer {
    url: string;
    description?: string;
    variables?: Record<
        string,
        {
            default: string;
            enum?: string[];
            description?: string;
        }
    >;
}

export interface OpenAPITag {
    name: string;
    description?: string;
    externalDocs?: {
        description?: string;
        url: string;
    };
}

export interface OpenAPISchema {
    type?: string;
    format?: string;
    items?: OpenAPISchema;
    properties?: Record<string, OpenAPISchema>;
    required?: string[];
    enum?: unknown[];
    default?: unknown;
    description?: string;
    example?: unknown;
    nullable?: boolean;
    $ref?: string;
    allOf?: OpenAPISchema[];
    oneOf?: OpenAPISchema[];
    anyOf?: OpenAPISchema[];
}

export interface OpenAPIParameter {
    name: string;
    in: "query" | "header" | "path" | "cookie";
    required?: boolean;
    schema?: OpenAPISchema;
    description?: string;
    example?: unknown;
}

export interface OpenAPIRequestBody {
    description?: string;
    required?: boolean;
    content: Record<
        string,
        {
            schema?: OpenAPISchema;
            example?: unknown;
            examples?: Record<string, { value: unknown }>;
        }
    >;
}

export interface OpenAPIResponse {
    description: string;
    content?: Record<
        string,
        {
            schema?: OpenAPISchema;
            example?: unknown;
        }
    >;
    headers?: Record<string, { schema?: OpenAPISchema; description?: string }>;
}

export interface OpenAPIOperation {
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: OpenAPIParameter[];
    requestBody?: OpenAPIRequestBody;
    responses: Record<string, OpenAPIResponse>;
    security?: Array<Record<string, string[]>>;
    deprecated?: boolean;
}

export interface OpenAPIPathItem {
    get?: OpenAPIOperation;
    post?: OpenAPIOperation;
    put?: OpenAPIOperation;
    delete?: OpenAPIOperation;
    patch?: OpenAPIOperation;
    options?: OpenAPIOperation;
    head?: OpenAPIOperation;
    trace?: OpenAPIOperation;
}

export interface OpenAPISecurityScheme {
    type: "apiKey" | "http" | "oauth2" | "openIdConnect";
    name?: string;
    in?: "query" | "header" | "cookie";
    scheme?: string;
    bearerFormat?: string;
    flows?: {
        implicit?: {
            authorizationUrl: string;
            scopes: Record<string, string>;
        };
        password?: {
            tokenUrl: string;
            scopes: Record<string, string>;
        };
        clientCredentials?: {
            tokenUrl: string;
            scopes: Record<string, string>;
        };
        authorizationCode?: {
            authorizationUrl: string;
            tokenUrl: string;
            scopes: Record<string, string>;
        };
    };
    openIdConnectUrl?: string;
}

export interface OpenAPIComponents {
    schemas?: Record<string, OpenAPISchema>;
    securitySchemes?: Record<string, OpenAPISecurityScheme>;
    parameters?: Record<string, OpenAPIParameter>;
    requestBodies?: Record<string, OpenAPIRequestBody>;
    responses?: Record<string, OpenAPIResponse>;
}

export interface OpenAPISpec {
    openapi: "3.1.0";
    info: OpenAPIInfo;
    servers?: OpenAPIServer[];
    paths: Record<string, OpenAPIPathItem>;
    components?: OpenAPIComponents;
    security?: Array<Record<string, string[]>>;
    tags?: OpenAPITag[];
}
