export class Exception extends Error {
  status: number = 500;
  code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.message = code ? `${code}: ${message}` : message;
    this.status = status;
    this.code = code;
  }
}

export class HTTPError extends Exception {}

export class ValidationError extends Exception {}
