export declare class HTTPError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare class ValidationError extends HTTPError {
    errors: Object;
    constructor(errors: object);
}
