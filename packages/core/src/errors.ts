export class HTTPError extends Error {
  statusCode: number;

  constructor(message: string, statusCode?: number) {
    super();
    this.statusCode = statusCode ?? 500;
    this.message = message;
  }
}

export class ValidationError extends HTTPError {
  errors: Object;

  constructor(errors: object) {
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
