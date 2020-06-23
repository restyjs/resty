"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.HTTPError = void 0;
class HTTPError extends Error {
    constructor(message, statusCode) {
        super();
        this.statusCode = statusCode !== null && statusCode !== void 0 ? statusCode : 500;
        this.message = message;
    }
}
exports.HTTPError = HTTPError;
class ValidationError extends HTTPError {
    constructor(errors) {
        var message = "Bad Request";
        if (Array.isArray(errors)) {
            message = [
                "failed to validate",
                errors.map((error) => error.property).join(", "),
            ].join(" ");
        }
        super(message);
        this.statusCode = 400;
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
