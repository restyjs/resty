import { error } from "console";

export class ValidationError extends Error {
  errors: Object;

  constructor(errors: object) {
    super();
    this.errors = errors;

    if (Array.isArray(errors)) {
      this.message = [
        "failed to validate",
        errors.map((error) => error.property).join(", "),
      ].join(" ");
    }
  }
}
