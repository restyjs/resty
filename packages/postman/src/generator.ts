// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types.d.ts" />
import { Collection, Item, ItemGroup } from "postman-collection";
import { MetadataKeys } from "@restyjs/core";
import "reflect-metadata";

export interface PostmanGeneratorOptions {
    name: string;
    version?: string;
    baseUrl?: string;
    controllers: unknown[];
}

export class PostmanGenerator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public generate(options: PostmanGeneratorOptions): any {
        const collection = new Collection({
            info: {
                name: options.name,
                version: options.version || "1.0.0",
                schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
            },
        });

        // Set a global variable for base URL if provided
        if (options.baseUrl) {
            collection.variables.add({
                key: "baseUrl",
                value: options.baseUrl,
                type: "string",
            });
        }

        // Iterate over controllers to create folders defined as ItemGroup
        for (const controller of options.controllers) {
            const controllerMetadata = Reflect.getMetadata(
                MetadataKeys.controller,
                controller as object
            );

            if (!controllerMetadata) {
                continue;
            }

            const folder = new ItemGroup({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name: (controller as any).name || "Controller",
            });
            // Add description if available (future improvement)

            const methodsMetadata = Reflect.getMetadata(
                MetadataKeys.httpMethod,
                controller as object
            ) || [];

            // Create items for each route
            for (const method of methodsMetadata) {
                // Construct the full URL path
                // Resty paths: /users/:id -> Postman paths: {{baseUrl}}/users/:id
                const fullPath = options.baseUrl ? "{{baseUrl}}" : "";

                // Ensure paths are joined correctly with slashes
                const controllerPath = controllerMetadata.path.startsWith("/")
                    ? controllerMetadata.path
                    : `/${controllerMetadata.path}`;

                const methodPath = method.path.startsWith("/")
                    ? method.path
                    : `/${method.path}`;

                // Join paths and clean up double slashes
                let relativePath = `${controllerPath}${methodPath}`.replace(/\/+/g, "/");
                if (relativePath.endsWith("/") && relativePath.length > 1) {
                    relativePath = relativePath.slice(0, -1);
                }

                const url = `${fullPath}${relativePath}`;

                const item = new Item({
                    name: `${method.method.toUpperCase()} ${relativePath}`,
                    request: {
                        method: method.method.toUpperCase(),
                        url: url,
                        header: [], // can be populated from @Header decorators if needed
                        body: {
                            mode: "raw",
                            raw: "",
                            options: {
                                raw: {
                                    language: "json"
                                }
                            }
                        }
                    },
                });

                folder.items.add(item);
            }

            collection.items.add(folder);
        }

        return collection;
    }
}

export function generatePostmanCollection(options: PostmanGeneratorOptions): object {
    const generator = new PostmanGenerator();
    const collection = generator.generate(options);
    return collection.toJSON();
}
