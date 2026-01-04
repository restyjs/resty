import type { RequestHandler } from "express";
import { getAbsoluteFSPath } from "swagger-ui-dist";
import express from "express";
import type { OpenAPISpec, OpenAPIInfo, OpenAPIServer, OpenAPISecurityScheme, OpenAPITag } from "./types";

/**
 * Configuration options for OpenAPI/Swagger
 */
export interface OpenAPIConfig {
    /** API info */
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: OpenAPIInfo["contact"];
    license?: OpenAPIInfo["license"];

    /** Server configuration */
    servers?: OpenAPIServer[];

    /** Tags for grouping operations */
    tags?: OpenAPITag[];

    /** Security schemes */
    securitySchemes?: Record<string, OpenAPISecurityScheme>;

    /** Global security requirements */
    security?: Array<Record<string, string[]>>;
}

/**
 * Build an OpenAPI specification from configuration
 */
export function buildOpenAPISpec(config: OpenAPIConfig): OpenAPISpec {
    const spec: OpenAPISpec = {
        openapi: "3.1.0",
        info: {
            title: config.title,
            version: config.version,
            description: config.description,
            termsOfService: config.termsOfService,
            contact: config.contact,
            license: config.license,
        },
        servers: config.servers,
        paths: {},
        tags: config.tags,
    };

    if (config.securitySchemes || config.security) {
        spec.components = {
            securitySchemes: config.securitySchemes,
        };
        spec.security = config.security;
    }

    return spec;
}

/**
 * Create Swagger UI middleware
 *
 * @param path - The path to serve Swagger UI on (e.g., "/docs")
 * @param specOrUrl - Either an OpenAPI spec object or URL to fetch spec from
 *
 * @example
 * ```typescript
 * import { SwaggerUI } from "@restyjs/openapi";
 *
 * const app = resty({
 *   controllers: [UserController],
 *   postMiddlewares: [
 *     SwaggerUI("/docs", { title: "My API", version: "1.0.0" })
 *   ]
 * });
 * ```
 */
export function SwaggerUI(
    path: string,
    specOrUrl: OpenAPISpec | OpenAPIConfig | string
): RequestHandler[] {
    const swaggerUiPath = getAbsoluteFSPath();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    // Build spec if config provided
    let spec: OpenAPISpec | undefined;
    let specUrl: string | undefined;

    if (typeof specOrUrl === "string") {
        specUrl = specOrUrl;
    } else if ("openapi" in specOrUrl) {
        spec = specOrUrl;
    } else {
        spec = buildOpenAPISpec(specOrUrl);
    }

    // HTML template for Swagger UI
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${spec?.info.title || "API Documentation"}</title>
  <link rel="stylesheet" type="text/css" href="${normalizedPath}/swagger-ui.css" />
  <link rel="icon" type="image/png" href="${normalizedPath}/favicon-32x32.png" sizes="32x32" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${normalizedPath}/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="${normalizedPath}/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        ${spec ? `spec: ${JSON.stringify(spec)},` : `url: "${specUrl}",`}
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true
      });
    };
  </script>
</body>
</html>`;

    const router = express.Router();

    // Serve the HTML page
    router.get("/", (_req, res) => {
        res.type("html").send(html);
    });

    // Serve the OpenAPI spec as JSON
    if (spec) {
        router.get("/openapi.json", (_req, res) => {
            res.json(spec);
        });
    }

    // Serve Swagger UI static files
    router.use(express.static(swaggerUiPath));

    // Return a middleware that mounts the router
    return [
        (req, res, next) => {
            if (req.path.startsWith(normalizedPath)) {
                // Rewrite the URL to remove the prefix for our router
                req.url = req.url.slice(normalizedPath.length) || "/";
                router(req, res, next);
            } else {
                next();
            }
        },
    ];
}

/**
 * Serve raw OpenAPI JSON spec
 */
export function serveOpenAPISpec(
    path: string,
    spec: OpenAPISpec
): RequestHandler {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return (req, res, next) => {
        if (req.path === normalizedPath) {
            res.json(spec);
        } else {
            next();
        }
    };
}
