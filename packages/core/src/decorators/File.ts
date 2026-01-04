
import { MetadataKeys } from "../metadataKeys";
import { RequestParamMetadata } from "./Param";

/**
 * Extract a single file from the request
 * Requires multer or similar middleware to be installed
 *
 * @example
 * ```typescript
 * @Post("/upload")
 * upload(@File() file: Express.Multer.File) {
 *   return { filename: file.filename };
 * }
 * ```
 */
export function File(name?: string): ParameterDecorator {
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
            paramType: "file",
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
 * Extract multiple files from the request
 * Requires multer or similar middleware to be installed
 *
 * @example
 * ```typescript
 * @Post("/upload-multiple")
 * upload(@Files() files: Express.Multer.File[]) {
 *   return files.map(f => f.filename);
 * }
 * ```
 */
export function Files(name?: string): ParameterDecorator {
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
            paramType: "files",
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
