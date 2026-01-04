/**
 * Response serializer interface
 */
export interface ResponseSerializer<T = unknown, R = unknown> {
    /** Check if this serializer can handle the response */
    canSerialize(value: T): boolean;
    /** Serialize the response */
    serialize(value: T): R | Promise<R>;
}

/**
 * Built-in JSON serializer (handles objects and arrays)
 */
export const jsonSerializer: ResponseSerializer = {
    canSerialize(value: unknown): boolean {
        return typeof value === "object" && value !== null;
    },
    serialize(value: unknown) {
        return value;
    },
};

/**
 * Date serializer - converts dates to ISO strings
 */
export const dateSerializer: ResponseSerializer<Date, string> = {
    canSerialize(value: unknown): value is Date {
        return value instanceof Date;
    },
    serialize(value: Date) {
        return value.toISOString();
    },
};

/**
 * BigInt serializer - converts BigInt to string
 */
export const bigIntSerializer: ResponseSerializer<bigint, string> = {
    canSerialize(value: unknown): value is bigint {
        return typeof value === "bigint";
    },
    serialize(value: bigint) {
        return value.toString();
    },
};

/**
 * Response transformation options
 */
export interface TransformOptions {
    /** Wrap response in an envelope */
    envelope?: boolean;
    /** Envelope key for data */
    dataKey?: string;
    /** Include metadata in response */
    includeMeta?: boolean;
    /** Exclude null values */
    excludeNull?: boolean;
    /** Exclude undefined values */
    excludeUndefined?: boolean;
    /** Custom transformer function */
    transform?: (value: unknown) => unknown;
}

/**
 * Standard API response envelope
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}

/**
 * Wrap response in standard envelope
 */
export function wrapResponse<T>(
    data: T,
    options: { requestId?: string } = {}
): ApiResponse<T> {
    return {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: options.requestId,
        },
    };
}

/**
 * Transform response object, handling nested values
 */
export function transformResponse(
    value: unknown,
    options: TransformOptions = {}
): unknown {
    if (value === null) {
        return options.excludeNull ? undefined : null;
    }

    if (value === undefined) {
        return options.excludeUndefined ? undefined : value;
    }

    // Apply custom transformer
    if (options.transform) {
        value = options.transform(value);
    }

    // Handle Date
    if (value instanceof Date) {
        return value.toISOString();
    }

    // Handle BigInt
    if (typeof value === "bigint") {
        return value.toString();
    }

    // Handle arrays
    if (Array.isArray(value)) {
        return value
            .map((item) => transformResponse(item, options))
            .filter((item) => item !== undefined);
    }

    // Handle objects
    if (typeof value === "object" && value !== null) {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
            const transformed = transformResponse(val, options);
            if (transformed !== undefined || !options.excludeUndefined) {
                result[key] = transformed;
            }
        }
        return result;
    }

    return value;
}

/**
 * Paginated response helper
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Create a paginated response
 */
export function paginate<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / pageSize);
    return {
        items,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

/**
 * Exclude properties from an object
 */
export function exclude<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}

/**
 * Pick properties from an object
 */
export function pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}
